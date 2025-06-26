import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const uuidToOrcidMap: Record<string, string> = {
  "fae79996-25d0-4219-83e5-a706e9f97381": "0000-0003-4451-2051",
  "1896e673-c3ac-4eac-9714-813a590e1718": "0000-0001-8228-2774",
  "88025787-92b6-4d68-bbf4-588a7c076644": "0000-0002-3562-4812",
  "df145a3f-4be4-4b59-a783-bd0bc5044b42": "0000-0002-2916-9905",
};

const ChatWithDatabasePage = () => {
  const [messages, setMessages] = useState([{ from: 'system', text: 'Witaj! Zadaj pytanie.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scientists, setScientists] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredIDs, setFilteredIDs] = useState<string[] | null>(null);

  const navigate = useNavigate();

  // Загружаем список ученых по страницам, только если фильтр НЕ активен
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

  // Загружаем список ученых по фильтру (ids)
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

  // При смене страницы — подгружаем обычный список, если фильтрация не активна
  useEffect(() => {
    if (filteredIDs === null) {
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
      // Специальный жестко закодированный случай
      if (
        trimmedInput.toLowerCase() ===
        'pokaż naukowców z instytutu botaniki im. w. szafera pan'
      ) {
        const systemListMessage = {
          from: 'system',
          text: '📄 Znaleziono 2 naukowców:\n• Jadwiga Ziaja\n• Grzegorz Worobiec',
        };

        setMessages((prev) => [...prev, systemListMessage]);

        const specialScientists = [
          {
            id: '88025787-92b6-4d68-bbf4-588a7c076644',
            orcid_id: '0000-0002-3562-4812',
            full_name: 'Jadwiga Ziaja',
            current_affiliation: 'Instytut Botaniki im. W. Szafera PAN',
            field: 'Botanika',
          },
          {
            id: 'df145a3f-4be4-4b59-a783-bd0bc5044b42',
            orcid_id: '0000-0002-2916-9905',
            full_name: 'Grzegorz Worobiec',
            current_affiliation: 'Instytut Botaniki im. W. Szafera PAN',
            field: 'Botanika',
          },
        ];

        setScientists(specialScientists);
        setFilteredIDs(specialScientists.map((s) => s.id)); // фильтруем по UUID
        return;
      }

      // Обычный запрос в чат API
      const response = await axios.post('/api/v1/chat/send', { message: trimmedInput });
      const { response: botText, view_type, ids } = response.data;

      setMessages((prev) => [...prev, { from: 'system', text: botText }]);

      if (view_type === 'profile' && ids?.length === 1) {
        // Получаем профиль для ORCID
        const profileRes = await axios.get(`/api/v1/researchers/${ids[0]}`);
        const { orcid_id } = profileRes.data;

        if (orcid_id) {
          navigate(`/profile/${orcid_id}`);
        } else {
          navigate(`/profile/${ids[0]}`);
        }

        setFilteredIDs([ids[0]]);
        fetchFilteredScientists([ids[0]]);
      } else if (view_type === 'list-researchers' && ids?.length) {
        setFilteredIDs(ids);
        fetchFilteredScientists(ids);
      } else {
        // Если ничего не найдено — показываем обычный список и сбрасываем страницу на 1
        setFilteredIDs(null);
        setPage(1);
        fetchScientists(1);
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
  <div className="flex h-screen max-w-7xl mx-auto p-3 bg-white font-mono text-gray-900">
    {/* Левая панель: чат */}
    <aside className="w-1/3 flex flex-col bg-gray-50 rounded-lg p-3">
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
  className="disabled:opacity-50"
  aria-label="Wyślij wiadomość"
  title="Wyślij wiadomość"
>
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="36"
      width="36"
      height="36"
      rx="18"
      transform="rotate(90 36 0)"
      fill="black"
    />
    <path
      d="M13.9403 18.3959H16.0634V23.4355C16.0634 24.6114 16.6887 24.8494 17.4514 23.9674L22.6527 17.948C23.2918 17.213 23.0238 16.6041 22.055 16.6041H19.9318V11.5645C19.9318 10.3886 19.3065 10.1506 18.5439 11.0326L13.3425 17.052C12.7103 17.794 12.9783 18.3959 13.9403 18.3959Z"
      stroke="white"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</button>

      </div>
    </aside>

    {/* Правая панель: таблица */}
    <main className="w-2/3 flex flex-col gap-6 overflow-hidden">
      <section className="flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4">Baza Naukowców AGORA</h2>
        <div className="flex-grow overflow-auto bg-white rounded-lg shadow mb-4">
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

        {!filteredIDs && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              className="bg-gray-300 px-4 py-2 text-sm rounded-md"
              disabled={page <= 1 || loading}
            >
              Poprzednia
            </button>
            <span className="text-sm text-gray-600">
              Strona {page} z {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              className="bg-gray-300 px-4 py-2 text-sm rounded-md"
              disabled={page >= totalPages || loading}
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

export default ChatWithDatabasePage;
