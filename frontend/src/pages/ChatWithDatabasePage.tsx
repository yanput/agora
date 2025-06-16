import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatWithDatabasePage = () => {
  const [messages, setMessages] = useState([
    { from: 'system', text: 'Witaj! Zadaj pytanie.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scientists, setScientists] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Funkcja do ładowania danych naukowców z API
  const fetchScientists = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/v1/researchers?page=${pageNumber}`);
      const { results, total, page: currentPage, limit } = response.data;

      setScientists(results);
      setTotalPages(Math.ceil(total / limit)); // Obliczamy łączną liczbę stron
      setPage(currentPage); // Ustawiamy bieżącą stronę
    } catch (error) {
      console.error('Błąd podczas ładowania naukowców:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ładowanie danych naukowców przy montowaniu komponentu
  useEffect(() => {
    fetchScientists(page); // Ładujemy dane naukowców dla bieżącej strony
  }, [page]); // Każdorazowo, gdy zmienia się strona, ładujemy dane na nowo

  // Funkcja wysyłania wiadomości w czacie
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
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

      const botMessage = {
        from: 'system',
        text: response.data.response,  // Odpowiedź z API
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

  // Funkcja do zmiany strony
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage); // Zmieniamy aktualną stronę
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-3 bg-white font-mono text-gray-900 flex">
      {/* Lewa kolumna: Czat */}
      <aside className="w-1/3 bg-gray-50 p-3 rounded-lg flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Czat</h2>
        <div className="flex-grow overflow-y-auto mb-3 space-y-2 border border-gray-300 rounded p-3 text-sm">
          {messages.map((msg, idx) => (
            <p
              key={idx}
              className={`p-1 rounded max-w-[80%] ${msg.from === 'user' ? 'bg-blue-100 self-end text-right' : 'bg-gray-200 self-start'}`}
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

      {/* Prawa kolumna: Baza naukowców */}
      <main className="w-2/3 flex flex-col gap-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Baza Naukowców AGORA</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow mb-4">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ORCID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Imię i Nazwisko</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Jednostka akademicka</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dyscyplina</th>
                </tr>
              </thead>
              <tbody>
                {scientists.map((scientist: any) => (
                  <tr key={scientist.orcid_id}>
                    <td className="px-6 py-4 text-sm text-gray-800">{scientist.orcid_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{scientist.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{scientist.current_affiliation || 'Brak'}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{scientist.field || 'Brak'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginacja */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              className="bg-gray-300 px-4 py-2 text-sm rounded-md"
              disabled={page <= 1}
            >
              Poprzednia
            </button>
            <span className="text-sm text-gray-600">Strona {page} z {totalPages}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              className="bg-gray-300 px-4 py-2 text-sm rounded-md"
              disabled={page >= totalPages}
            >
              Następna
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ChatWithDatabasePage;
