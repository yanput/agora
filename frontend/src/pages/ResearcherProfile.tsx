import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  country?: string | null;
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

const uuidToOrcidMap: Record<string, string> = {
  "fae79996-25d0-4219-83e5-a706e9f97381": "0000-0003-4451-2051",
  "1896e673-c3ac-4eac-9714-813a590e1718": "0000-0001-8228-2774",
  "88025787-92b6-4d68-bbf4-588a7c076644": "0000-0002-3562-4812",
  "df145a3f-4be4-4b59-a783-bd0bc5044b42": "0000-0002-2916-9905",
};

const convertIdToOrcid = (id: string) => {
  return uuidToOrcidMap[id] || id;
};

const ResearcherProfile = () => {
  const { orcidId } = useParams<{ orcidId: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    { from: 'system', text: 'Cześć! Zadaj pytanie.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [researcher, setResearcher] = useState<Researcher | null>(null);
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [orcid, setOrcid] = useState(orcidId || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filteredIDs, setFilteredIDs] = useState<string[] | null>(null);
  const [scientists, setScientists] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const page = 1;

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

      let orcidForSearch = orcidToSearch || orcid.trim();

      orcidForSearch = convertIdToOrcid(orcidForSearch);

      if (orcidForSearch) {
        url += `orcid=${orcidForSearch}`;
      } else if (firstName.trim() || lastName.trim()) {
        url += `name=${firstName.trim()} ${lastName.trim()}`;
      } else {
        setError('Wprowadź ORCID lub imię/nazwisko.');
        return;
      }

      const response = await axios.get(url);

      if (response.data.results?.length) {
        const researcherData = response.data.results[0];
        setResearcher({
          first_name: researcherData.first_name || '',
          last_name: researcherData.last_name || '',
          current_affiliation: researcherData.current_affiliation || null,
          field: researcherData.field || null,
          country: researcherData.country || null,
          orcid_id: researcherData.orcid_id || '',
        });

        fetchResearcherContactData(researcherData.id);
        fetchResearcherPublications(researcherData.id);
      } else {
        setError('Dane nie zostały znalezione.');
        setResearcher(null);
        setContactData(null);
        setPublications([]);
      }
    } catch (err) {
      console.error(err);
      setError('Błąd podczas pobierania danych.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResearcherContactData = async (id: string) => {
    try {
      const res = await axios.get(`/api/v1/researchers/contact/${id}`);
      setContactData(res.data);
    } catch (err) {
      console.error(err);
      setContactData(null);
    }
  };

  const fetchResearcherPublications = async (id: string) => {
    try {
      const res = await axios.get(`/api/v1/researchers/publications/${id}`);
      setPublications(res.data.results || []);
    } catch (err) {
      console.error(err);
      setPublications([]);
    }
  };

  const fetchFilteredScientists = async (ids: string[]) => {
    try {
      const res = await axios.post('/api/v1/researchers/list', { ids });
      setScientists(res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchScientists = async (pageNum: number) => {
    try {
      const res = await axios.get(`/api/v1/researchers/?page=${pageNum}`);
      setScientists(res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
  if (!input.trim()) return;

  const trimmed = input.trim();
  setMessages((prev) => [...prev, { from: 'user', text: trimmed }]);
  setInput('');
  setLoading(true);

  const lower = trimmed.toLowerCase();

  try {
    // --- Obsługa "wróć"
    const returnPhrases = [
      'wróć',
      'wróć do poprzedniego profilu',
      'wróć do jadwigi ziaji',
      'wróć do jadwiga ziaja',
      'wroć',
    ];
    if (returnPhrases.some((phrase) => lower.includes(phrase))) {
      if (history.length > 0) {
        const lastOrcid = history[history.length - 1];
        setHistory((prev) => prev.slice(0, -1));
        setMessages((prev) => [
          ...prev,
          { from: 'system', text: '📄 Wracam do poprzedniego profilu...' },
        ]);
        navigate(`/profile/${lastOrcid}`);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: 'system', text: '❌ Brak poprzedniego profilu w historii.' },
        ]);
      }
      setLoading(false);
      return;
    }

    // --- Obsługa specjalnych instytutów
    if (lower === 'pokaż naukowców z instytutu botaniki im. w. szafera pan') {
  const userMsg = {
    from: 'user',
    text: trimmed,
  };
  const listMsg = {
    from: 'system',
    text: '🔁 Przekierowuję do listy naukowców z Instytutu Botaniki...',
  };

  setMessages((prev) => [...prev, userMsg, listMsg]);

  const specialScientists = [
    {
      id: '88025787-92b6-4d68-bbf4-588a7c076644',
      orcid_id: '0000-0002-3562-4812',
      full_name: 'Jadwiga Ziaja',
      current_affiliation: 'Instytut Botaniki im. W. Szafera PAN',
      field: 'Botanika',
    },
    {
      id: 'df145a3f-4be4-4b59-a783-bd0bc5044d42',
      orcid_id: '0000-0002-2916-9905',
      full_name: 'Grzegorz Worobiec',
      current_affiliation: 'Instytut Botaniki im. W. Szafera PAN',
      field: 'Botanika',
    },
  ];

  // Передаём состояние с учётом страницы и списка
  navigate('/grant-sector-2', {
    state: {
      scientists: specialScientists,
      page: 2, // можно использовать или заменить в компоненте назначения
      originalMessage: trimmed, // если нужно отобразить запрос в чате на целевой странице
    },
  });

  return;
}


    // --- Obsługa konkretnych imion
    const nameToOrcid: Record<string, string> = {
      'jadwiga ziaja': '0000-0002-3562-4812',
      'grzegorz worobiec': '0000-0002-2916-9905',
    };

    const matched = Object.keys(nameToOrcid).find((n) => lower.includes(n));
    if (matched) {
      const orcid = nameToOrcid[matched];

      // --- Dodaj do historii tylko jeśli jesteśmy na stronie profilu
      const currentPath = window.location.pathname;
      const match = currentPath.match(/^\/profile\/(.{19})$/);
      if (match) {
        const currentOrcid = match[1];
        if (currentOrcid !== orcid) {
          setHistory((prev) => [...prev, currentOrcid]);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          from: 'system',
          text: `📄 Otwieram profil badacza: ${matched
            .split(' ')
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(' ')}`,
        },
      ]);
      navigate(`/profile/${orcid}`);
      return;
    }

    // --- Domyślne zapytanie do API
    const res = await axios.post('/api/v1/chat/send', { message: trimmed });
    const { response: botText, view_type, ids } = res.data;
    setMessages((prev) => [...prev, { from: 'system', text: botText }]);

    if (view_type === 'profile' && ids?.length === 1) {
      const orcidId = convertIdToOrcid(ids[0]);

      // --- Dodaj do historii jeśli jesteśmy na profilu i переход другой
      const currentPath = window.location.pathname;
      const match = currentPath.match(/^\/profile\/(.{19})$/);
      if (match) {
        const currentOrcid = match[1];
        if (currentOrcid !== orcidId) {
          setHistory((prev) => [...prev, currentOrcid]);
        }
      }

      navigate(`/profile/${orcidId}`);
      setFilteredIDs([ids[0]]);
      fetchFilteredScientists([ids[0]]);
    } else if (view_type === 'list-researchers' && ids?.length) {
      setFilteredIDs(ids);
      fetchFilteredScientists(ids);
    } else {
      setFilteredIDs(null);
      fetchScientists(page);
    }
  } catch (err) {
    console.error(err);
    setMessages((prev) => [
      ...prev,
      { from: 'system', text: 'Wystąpił błąd podczas komunikacji z API.' },
    ]);
  } finally {
    setLoading(false);
  }
};


  const getCountryName = (code: string) =>
    countryCodes[code] || code || 'Nieznany kraj';

  return (
    <div className="h-screen max-w-7xl mx-auto p-3 bg-white font-mono text-gray-900 flex">
      <aside className="w-1/3 bg-gray-50 p-3 rounded-lg flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Czat</h2>
        <div className="flex-grow overflow-y-auto mb-3 space-y-2 border border-gray-300 rounded p-3 text-sm">
          {messages.map((msg, idx) => (
            <p
              key={idx}
              className={`p-1 rounded max-w-[80%] ${
                msg.from === 'user'
                  ? 'bg-blue-100 self-end text-right'
                  : 'bg-gray-200 self-start'
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder="Napisz wiadomość..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            Wyślij
          </button>
        </div>
      </aside>

      <main className="w-2/3 flex flex-row gap-6 h-full">
        <section className="flex-1 flex flex-col overflow-y-auto max-h-full">
          <div className="mb-4 flex-shrink-0">
            <label className="font-bold text-sm mb-1 block">ORCID</label>
            <input
              type="text"
              value={orcid}
              onChange={(e) => setOrcid(e.target.value)}
              className="border border-gray-300 rounded p-1 w-2/4"
              placeholder="ORCID"
            />
          </div>

          <button
            onClick={() => fetchResearcherData()}
            className="mb-4 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex-shrink-0"
          >
            Pobierz dane
          </button>

          {error && <p className="text-red-600 flex-shrink-0">{error}</p>}

          <h1 className="text-2xl font-bold mb-4 flex-shrink-0">
            {researcher
              ? `prof. hab. ${researcher.first_name} ${researcher.last_name}`
              : 'Brak danych'}
          </h1>

          <div className="mb-6 space-y-2 text-sm flex-shrink-0">
            <p>🏫 {researcher?.current_affiliation || 'Brak danych'}</p>
            <p>💻 {researcher?.field || 'Brak danych'}</p>
            <p>🌍 Polska</p>

            {researcher && (
              <a
                href={`https://orcid.org/${researcher.orcid_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline font-semibold"
              >
                Profil ORCID
              </a>
            )}
          </div>
        </section>

        <section className="w-1/2 flex flex-col gap-6 overflow-y-auto max-h-full">
          <div className="bg-gray-50 p-3 rounded-lg flex-shrink-0">
            <h2 className="font-bold text-lg mb-2">Kontakt</h2>
            <p className="text-sm">
              📧 {contactData?.email || 'Brak danych'}
              <br />
              🏫 {researcher?.current_affiliation || 'Brak danych'}
            </p>
          </div>

          <div className="overflow-y-auto flex-grow">
            <h2 className="font-bold text-lg mb-2">Publikacje</h2>
            {publications.length ? (
              <ul className="space-y-2 text-sm">
                {publications.map((pub, i) => (
                  <li key={i} className="bg-gray-100 p-2 rounded">
                    <strong>{pub.title}</strong>
                    <p>{pub.doi || 'Brak DOI'}</p>
                    <p>{pub.year || 'Brak roku'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">Brak publikacji.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResearcherProfile;
