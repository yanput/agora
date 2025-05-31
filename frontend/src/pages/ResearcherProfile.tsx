import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const OPENAI_API_KEY = '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'; // Замените на ваш ключ!

// Звездочка из вашего SVG
const StarIcon = ({ className }) => (
  <svg
    className={className}
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.9091 4.09091L14.3182 11.5909L21.8182 15L14.3182 18.4091L10.9091 25.9091L7.5 18.4091L0 15L7.5 11.5909L10.9091 4.09091ZM10.9091 10.6773L9.54545 13.6364L6.58636 15L9.54545 16.3636L10.9091 19.3227L12.2727 16.3636L15.2318 15L12.2727 13.6364L10.9091 10.6773ZM24.5455 10.9091L22.8273 7.17273L19.0909 5.45455L22.8273 3.75L24.5455 0L26.25 3.75L30 5.45455L26.25 7.17273L24.5455 10.9091ZM24.5455 30L22.8273 26.2636L19.0909 24.5455L22.8273 22.8409L24.5455 19.0909L26.25 22.8409L30 24.5455L26.25 26.2636L24.5455 30Z"
      fill="url(#paint0_linear_429_1811)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_429_1811"
        x1="0"
        y1="0"
        x2="36.172"
        y2="13.6778"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.158668" stopColor="#F76A4B" />
        <stop offset="0.60652" stopColor="#A24AE7" />
        <stop offset="0.891362" stopColor="#4859F3" />
      </linearGradient>
    </defs>
  </svg>
);

// Иконка молнии для кнопки отправки (оставлена прежней)
const LightningIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ChatMessage = ({ msg }) => {
  const isUser = msg.from === 'user';
  return (
    <div
      className={`flex items-end max-w-[80%] ${
        isUser ? 'justify-end ml-auto' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="flex flex-col items-center mr-2 select-none">
          <StarIcon className="w-6 h-6" />
        </div>
      )}

      <div
        className={`p-2 rounded-lg whitespace-pre-wrap text-sm ${
          isUser
            ? 'bg-blue-100 text-blue-900 rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none shadow-sm'
        }`}
      >
        {msg.text}
      </div>

      {isUser && (
        <div className="flex flex-col items-center ml-2 text-xs text-gray-500 select-none">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            Y
          </div>
          <span>You</span>
        </div>
      )}
    </div>
  );
};

const ResearcherProfile = () => {
  const [messages, setMessages] = useState([
    { from: 'system', text: 'Cześć! Zadaj pytanie.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Jesteś pomocnym asystentem.' },
            ...messages.map((m) => ({
              role: m.from === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
            { role: 'user', content: input },
          ],
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const botMessage = {
        from: 'system',
        text: response.data.choices[0].message.content.trim(),
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
    <div className="min-h-screen max-w-7xl mx-auto p-3 bg-white font-mono text-gray-900 flex gap-4">
      {/* Левая колонка: чат */}
      <aside className="w-1/3 bg-gray-50 p-4 rounded-xl flex flex-col shadow-lg">
        {/* Логотип сверху */}
        <div className="flex justify-center items-center gap-2 text-black font-semibold text-xs mb-4 select-none">
          <StarIcon className="w-5 h-5" />
          <span>AGORA of acceleration services</span>
        </div>

        <div className="flex-grow overflow-y-auto mb-4 space-y-3 px-1">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} msg={msg} />
          ))}
          {loading && (
            <p className="italic text-gray-500 text-center">Piszę...</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Szukam..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
            className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg px-4 flex items-center justify-center"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>
        </div>
      </aside>

      {/* Правая колонка: профиль */}
      <main className="flex-1 overflow-y-auto max-h-screen flex flex-col">
        <h1 className="text-3xl font-bold mb-6 leading-tight">prof. hab. Patryk Żywica</h1>

        <div className="flex items-start gap-4 mb-8 text-sm">
          <div className="flex gap-3 flex-shrink-0">
            <img
              src="/images/patryk-zywica.jpg"
              alt="prof. hab. Patryk Żywica"
              className="rounded-full w-36 h-36 object-cover"
            />
            <div className="leading-relaxed space-y-2">
              <p>🏫 Uniwersytet im. Adama Mickiewicza w Poznaniu</p>
              <p>💻 Informatyka</p>
              <p>🌍 Polska</p>
            </div>
          </div>
          <div className="ml-auto self-center">
            <a
              href="https://orcid.org/0000-0003-3542-8982"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline font-semibold text-sm"
            >
              ORCID Profile
            </a>
          </div>
        </div>

        <div className="flex gap-6 max-w-4xl flex-grow text-sm">
          <section className="w-1/2 pr-4 border-r border-gray-300">
            <h2 className="font-bold text-xl mb-3">Zainteresowania naukowe</h2>
            <p className="leading-relaxed">
              Badania nad automatyzacją i sztuczną inteligencją (SI) w platformach low-code
              skupiają się na rozwoju technologii, popularyzacji programowania i rozbudowie funkcji
              predykcyjnych.
            </p>
          </section>

          <section className="w-1/2 pl-4 space-y-4">
            <article>
              <h2 className="font-bold text-xl mb-2">Kontakt</h2>
              <p>
                📧 patryk.zywica@amu.edu.pl <br />
                📞 +48 61 829 xxxx <br />
                🏫 Uniwersytet im. Adama Mickiewicza w Poznaniu
              </p>
            </article>

            <article>
              <h2 className="font-bold text-xl mb-2">Afiliacje akademickie</h2>
              <p>
                Uniwersytet im. Adama Mickiewicza w Poznaniu <br />
                Wydział: Matematyki i Informatyki <br />
                Stanowisko: Doktor
              </p>
            </article>

            <article>
              <h2 className="font-bold text-xl mb-2">Stopnie i tytuły</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Doktor habilitowany (2024) - nauk inżynieryjno-technicznych / informatyka</li>
                <li>Doktor (2016) - nauk matematycznych / informatyka</li>
              </ul>
            </article>

            <article>
              <h2 className="font-bold text-xl mb-2">Wybrane publikacje</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Implementation of an Artificially Empathetic Robot Swarm (2024) DOI: 1998498</li>
                <li>Partial Order Based Approach to Preference Assessment (2023) DOI: 1998498</li>
                <li>Integracja GPT w platformach no-code - podejście praktyczne (2021) DOI: 1998498</li>
              </ul>
            </article>
          </section>
        </div>

        <footer className="text-center text-xs text-gray-400 mt-10">
          Copyright Angora © 2025
        </footer>
      </main>
    </div>
  );
};

export default ResearcherProfile;
