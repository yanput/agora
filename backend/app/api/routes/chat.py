import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChatWithDatabasePage = () => {
  const [messages, setMessages] = useState([{ from: 'system', text: 'Witaj! Zadaj pytanie.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scientists, setScientists] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredIDs, setFilteredIDs] = useState<string[] | null>(null);

  const navigate = useNavigate();

  const fetchScientists = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/researchers/?page=${pageNumber}`);
      const { results, total, page: currentPage, limit } = response.data;

      setScientists(results);
      setTotalPages(Math.ceil(total / limit));
      setPage(currentPage);
    } catch (error) {
      console.error('Błąd podczas ładowania naukowców:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredScientists = async (ids: string[]) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/researchers/by-ids`, {
        params: { ids: ids.join(',') },
      });
      setScientists(response.data);
    } catch (error) {
      console.error('Błąd przy filtrowaniu naukowców:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!filteredIDs) {
      fetchScientists(page);
    }
  }, [page, filteredIDs]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const trimmedInput = input.trim();
    const userMessage = { from: 'user', text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Отправляем запрос на backend API
      const response = await axios.post('/api/v1/chat/send', { message: trimmedInput });
      const { response: botText, view_type, ids } = response.data;

      const botMessage = { from: 'system', text: botText };
      setMessages((prev) => [...prev, botMessage]);

      if (view_type === 'profile' && ids?.length === 1) {
        // Переходим на страницу профиля
        navigate(`/profile/${ids[0]}`);
        setFilteredIDs(ids);
        fetchFilteredScientists(ids);
      } else if (view_type === 'list-researchers' && ids?.length) {
        setFilteredIDs(ids);
        fetchFilteredScientists(ids);
      } else {
        setFilteredIDs(null);
        fetchScientists(page);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { from: 'system', text: 'Wystąpił błąd podczas komunikacji z API.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-3 bg-white font-mono text-gray-900 flex">
      {/* Chat */}
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

      {/* Tabela */}
      <main className="w-2/3 flex flex-col gap-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Baza Naukowców AGORA</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow mb-4">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    ORCID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Imię i Nazwisko
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Jednostka akademicka
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Dyscyplina
                  </th>
                </tr>
              </thead>
              <tbody>
                {scientists.map((scientist: any) => (
                  <tr key={scientist.orcid_id}>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <a
                        href={`/profile/${scientist.orcid_id}`}
                        className="text-green-600 underline hover:text-green-800"
                      >
                        {scientist.orcid_id}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{scientist.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {scientist.current_affiliation || 'Brak'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{scientist.field || 'Brak'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!filteredIDs && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                className="bg-gray-300 px-4 py-2 text-sm rounded-md"
                disabled={page <= 1}
              >
                Poprzednia
              </button>
              <span className="text-sm text-gray-600">
                Strona {page} z {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                className="bg-gray-300 px-4 py-2 text-sm rounded-md"
                disabled={page >= totalPages}
              >
                Następna
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ChatWithDatabasePage;с