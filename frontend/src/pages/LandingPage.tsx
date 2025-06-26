import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const questions = [
  {
    id: 1,
    icon: '🎓',
    text: 'Znajdź naukowca po numerze orcid',
    link: '/profile/0',
  },
  {
    id: 2,
    icon: '⚙️',
    text: 'Pokaż naukowców z Polski!"',
    link: '/grant-sector-2',
  },
  {
    id: 3,
    icon: '📄',
    text: 'Pokaż mi stronę projektu "System klasyfikacji danych rozmytych"',
    link: '#',
  },
  {
    id: 4,
    icon: '📚',
    text: 'Jakie są najczęściej cytowane prace naukowe profesora Patryka Żywicy?',
    link: '#',
  },
];

const LandingPage = () => {
  const [messages, setMessages] = useState([
    { from: 'system', text: 'Witaj! Zadaj pytanie.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Отправка сообщения в чат
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

  return (
    <div className="min-h-screen bg-gray-50 font-mono p-12 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            <span className="mr-2">✨</span>
            AGORA of acceleration services
          </h1>
          <p className="text-gray-600 text-base max-w-xl mx-auto leading-relaxed">
            Szukasz informacji o grantach, projektach lub pracownikach naukowych? <br />
            Angora to inteligentna platforma, która pomoże Ci znaleźć wszystko szybko i bez zbędnego szukania.
          </p>
        </div>

        {/* Поисковая строка */}
        <div className="max-w-xl mx-auto mb-4 relative">
          <input
            type="text"
            placeholder="Szukam..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="w-full border border-gray-300 rounded-full px-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 text-xl select-none">
            ✨
          </span>
          <button
            onClick={sendMessage}
            disabled={loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full px-4 py-2 text-sm hover:bg-gray-900 disabled:opacity-50"
          >
            🔍
          </button>
        </div>

        {/* История сообщений чат-бота */}
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-4 mb-10 h-48 overflow-y-auto space-y-2 text-sm">
          {messages.map((msg, idx) => (
            <p
              key={idx}
              className={`p-2 rounded max-w-[80%] ${
                msg.from === 'user' ? 'bg-blue-100 self-end text-right ml-auto' : 'bg-gray-200 self-start mr-auto'
              }`}
            >
              {msg.text}
            </p>
          ))}
          {loading && <p className="italic text-gray-500">Piszę...</p>}
        </div>

        {/* Карточки с вопросами */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          {questions.map(({ id, icon, text, link }) => (
            <div
              key={id}
              className="bg-gray-100 rounded-lg shadow p-4 max-w-[250px] min-w-[220px] flex flex-col justify-between text-center"
            >
              <div className="text-sm text-gray-800 mb-2">
                <span className="mr-2">{icon}</span>
                <span className="font-mono">{text}</span>
              </div>

              {/* Переход на другую страницу */}
              <Link to={link} className="text-blue-600 text-xs underline">
                Zapytaj o tym ✨
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Футер */}
      <footer className="text-center text-xs text-gray-400 mt-8">
        Copyright Angora © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default LandingPage;
