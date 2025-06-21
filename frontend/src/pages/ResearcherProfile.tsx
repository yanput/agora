import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Message {
  from: 'user' | 'system';
  text: string;
}

interface Researcher {
  first_name: string;
  last_name: string;
  current_affiliation: string | null;
  field: string | null;
  country: string | null;
  orcid_id: string;
}

interface ContactData {
  email: string | null;
}

interface Publication {
  title: string;
  doi: string | null;
  year: string | null;
}

const countryCodes: { [key: string]: string } = {
  SO: 'Somalia',
  PL: 'Polska',
  US: 'Stany Zjednoczone',
  GB: 'Wielka Brytania',
  IN: 'Indie',
  PK: 'Pakistan',
  IR: 'Iran',
};

const ResearcherProfile = () => {
  const { orcidId } = useParams<{ orcidId: string }>();


  const [messages, setMessages] = useState<Message[]>([
    { from: 'system', text: 'Cześć! Zadaj pytanie.' },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [researcher, setResearcher] = useState<Researcher | null>(null);
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [orcid, setOrcid] = useState<string>(orcidId || '');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orcidId) {
      setOrcid(orcidId);
      fetchResearcherData(orcidId);
    }
  }, [orcidId]);

  const fetchResearcherData = async (orcidToSearch?: string) => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/v1/researchers/?';

      if (orcidToSearch) {
        url += `orcid=${orcidToSearch}`;
      } else if (orcid.trim()) {
        url += `orcid=${orcid.trim()}`;
      } else if (firstName.trim() || lastName.trim()) {
        url += `name=${firstName.trim()} ${lastName.trim()}`;
      } else {
        setError('Wprowadź ORCID lub imię/nazwisko.');
        setLoading(false);
        return;
      }

      const response = await axios.get(url);

      if (response.data.results && response.data.results.length > 0) {
        const researcherData = response.data.results[0];
        setResearcher({
          first_name: researcherData.first_name || '',
          last_name: researcherData.last_name || '',
          current_affiliation: researcherData.current_affiliation || null,
          field: researcherData.field || null,
          country: researcherData.country || null,
          orcid_id: researcherData.orcid_id || '',
        });
        setError(null);

        fetchResearcherContactData(researcherData.id);
        fetchResearcherPublications(researcherData.id);
        fetchResearcherCountry(researcherData.id);
      } else {
        setError('Dane nie zostały znalezione. Proszę sprawdzić parametry wyszukiwania.');
        setResearcher(null);
        setContactData(null);
        setPublications([]);
      }
    } catch (error) {
      console.error('Błąd przy pobieraniu danych badacza', error);
      setError('Wystąpił błąd podczas ładowania danych.');
      setResearcher(null);
      setContactData(null);
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResearcherContactData = async (id: string) => {
    try {
      const response = await axios.get(`/api/v1/researchers/contact/${id}`);
      setContactData(response.data);
    } catch (error) {
      console.error('Błąd przy pobieraniu danych kontaktowych', error);
      setError('Nie udało się pobrać danych kontaktowych badacza.');
      setContactData(null);
    }
  };

  const fetchResearcherPublications = async (id: string) => {
    try {
      const response = await axios.get(`/api/v1/researchers/publications/${id}`);
      if (response.data.results) {
        setPublications(response.data.results);
      } else {
        setPublications([]);
      }
    } catch (error) {
      console.error('Błąd przy pobieraniu publikacji', error);
      setError('Nie udało się pobrać publikacji badacza.');
      setPublications([]);
    }
  };

  const fetchResearcherCountry = async (id: string) => {
    try {
      const response = await axios.get(`/api/v1/researchers/${id}`);
      setResearcher((prevState) =>
        prevState ? { ...prevState, country: response.data.country } : prevState
      );
    } catch (error) {
      console.error('Błąd przy pobieraniu kraju', error);
      setError('Nie udało się pobrać kraju badacza.');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { from: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const requestData = {
      prompt: input,
      model: 'gpt-4o',
      temperature: 1,
      use_web_search: false,
    };

    try {
      const response = await axios.post('http://150.254.78.131:8000/query', requestData, {
        headers: { 'Content-Type': 'application/json' },
      });

      const botMessage: Message = {
        from: 'system',
        text: response.data.response,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { from: 'system', text: 'Wystąpił błąd podczas komunikacji z API.' },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Обработка поиска по кнопке
  const handleSearchSubmit = () => {
    fetchResearcherData();
  };

  // Код страны в имя
  const getCountryName = (code: string) => {
    return countryCodes[code] || code || 'Nieznany kraj';
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-3 bg-white font-mono text-gray-900 flex">
      {/* Левый столбец: чат */}
      <aside className="w-1/3 bg-gray-50 p-3 rounded-lg flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Czat</h2>
        <div className="flex-grow overflow-y-auto mb-3 space-y-2 border border-gray-300 rounded p-3 text-sm">
          {messages.map((msg, idx) => (
            <p
              key={idx}
              className={`p-1 rounded max-w-[80%] ${
                msg.from === 'user' ? 'bg-blue-100 self-end text-right' : 'bg-gray-200 self-start'
              }`}
            >
              {msg.text}
            </p>
          ))}
          {loading && <p className="italic text-gray-500">Piszę...</p>}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Napisz wiadomość..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow border border-gray-300 rounded px-2 py-1 focus:outline-none text-sm"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            Wyślij
          </button>
        </div>
      </aside>

      {/* Правый столбец: профиль, контактные данные и публикации */}
      <main className="w-2/3 flex flex-row gap-6">
        <section className="flex-1 overflow-y-auto max-h-screen flex flex-col">
          <div className="mb-4">
            <label className="block font-bold text-sm mb-2">Wprowadź ORCID</label>
            <input
              type="text"
              value={orcid}
              onChange={(e) => setOrcid(e.target.value)}
              className="border border-gray-300 rounded p-1 w-2/4"
              placeholder="ORCID"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-2">Imię</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border border-gray-300 rounded p-1 w-2/4"
              placeholder="Imię"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-2">Nazwisko</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-gray-300 rounded p-1 w-2/4"
              placeholder="Nazwisko"
            />
          </div>

          <button
            onClick={handleSearchSubmit}
            className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Pobierz dane
          </button>

          {error && <p className="text-red-600">{error}</p>}

          <h1 className="text-3xl font-bold mb-6 leading-tight">
            {researcher
              ? `prof. hab. ${researcher.first_name} ${researcher.last_name}`
              : 'Ładowanie...'}
          </h1>

          <div className="flex items-start gap-4 mb-8 text-sm">
            <div className="leading-relaxed space-y-2">
              <p>{researcher ? `🏫 ${researcher.current_affiliation}` : 'Ładowanie...'}</p>
              <p>💻 {researcher ? researcher.field || 'Brak danych' : 'Ładowanie...'}</p>
              <p>🌍 {researcher ? getCountryName(researcher.country || '') : 'Ładowanie...'}</p>
            </div>

            <div className="ml-auto self-center">
              <a
                href={researcher ? `https://orcid.org/${researcher.orcid_id}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline font-semibold text-sm"
              >
                Profil ORCID
              </a>
            </div>
          </div>
        </section>

        <section className="w-1/3 flex flex-col gap-6">
          <section className="bg-gray-50 p-3 rounded-lg">
            <h2 className="font-bold text-lg mb-2">Kontakt</h2>
            <p className="leading-relaxed text-sm">
              📧 {contactData ? contactData.email : 'Ładowanie...'}
              <br />
              🏫 {researcher ? researcher.current_affiliation : 'Ładowanie...'}
            </p>
          </section>

          <section className="p-3">
            <h2 className="font-bold text-lg mb-4">Publikacje</h2>
            {publications.length > 0 ? (
              <ul className="space-y-2">
                {publications.map((pub, idx) => (
                  <li key={idx} className="bg-gray-100 p-2 rounded-md">
                    <h3 className="font-semibold text-sm">{pub.title}</h3>
                    <p className="text-xs">{pub.doi ? pub.doi : 'DOI nie podano'}</p>
                    <p className="text-xs">{pub.year ? pub.year : 'Rok nie podano'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">Brak publikacji dla tego badacza.</p>
            )}
          </section>
        </section>
      </main>
    </div>
  );
};

export default ResearcherProfile;
