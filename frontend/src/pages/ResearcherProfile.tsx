import React, { useState } from 'react';
import axios from 'axios';

const OPENAI_API_KEY = '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'; // Замените на ваш ключ, но не храните так в продакшене!

const ResearcherProfile = () => {
  const [messages, setMessages] = useState([
    { from: 'system', text: 'Cześć! Zadaj pytanie.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
      <aside className="w-1/3 bg-gray-50 p-3 rounded-lg flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Chat</h2>
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

      {/* Правая колонка: профиль */}
      <main className="flex-1 overflow-y-auto max-h-screen flex flex-col">

        {/* Имя профиля сверху */}
        <h1 className="text-3xl font-bold mb-6 leading-tight">prof. hab. Patryk Żywica</h1>

        {/* Фото + контактные данные + ORCID ссылка в одной строке */}
        <div className="flex items-start gap-4 mb-8 text-sm">

          {/* Фото и контактные данные */}
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

          {/* Отдельный блок ORCID справа */}
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

        {/* Нижняя часть — две колонки */}
        <div className="flex gap-6 max-w-4xl flex-grow text-sm">
          {/* Левая колонка — Zainteresowania naukowe */}
          <section className="w-1/2 pr-4 border-r border-gray-300">
            <h2 className="font-bold text-xl mb-3">Zainteresowania naukowe</h2>
            <p className="leading-relaxed">
              Badania nad automatyzacją i sztuczną inteligencją (SI) w platformach low-code
              skupiają się na rozwoju technologii, popularyzacji programowania i rozbudowie funkcji
              predykcyjnych.
            </p>
          </section>

          {/* Правая колонка — остальная контактная информация */}
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
