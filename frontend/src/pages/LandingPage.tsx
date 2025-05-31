import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Звездочка из Figma (для использования в заголовке и ссылках)
const StarIcon = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
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

// Иконка поиска из Figma
const SearchIcon = ({ className }) => (
  <svg
    className={className}
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="36" width="36" height="36" rx="18" transform="rotate(90 36 0)" fill="black" />
    <path
      d="M13.9403 18.3959H16.0634V23.4355C16.0634 24.6114 16.6887 24.8494 17.4514 23.9674L22.6527 17.948C23.2918 17.213 23.0238 16.6041 22.055 16.6041H19.9318V11.5645C19.9318 10.3886 19.3065 10.1506 18.5439 11.0326L13.3425 17.052C12.7103 17.794 12.9783 18.3959 13.9403 18.3959Z"
      stroke="white"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Массив вопросов с SVG иконками
const questions = [
  {
    id: 1,
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 14.4996V11.494C17 11.3145 17 11.2248 16.9727 11.1456C16.9485 11.0755 16.9091 11.0117 16.8572 10.9587C16.7986 10.8989 16.7183 10.8587 16.5578 10.7785L12 8.49958M4 9.49958V16.3062C4 16.6781 4 16.8641 4.05802 17.0269C4.10931 17.1708 4.1929 17.3011 4.30238 17.4077C4.42622 17.5283 4.59527 17.6057 4.93335 17.7607L11.3334 20.694C11.5786 20.8064 11.7012 20.8626 11.8289 20.8848C11.9421 20.9045 12.0579 20.9045 12.1711 20.8848C12.2988 20.8626 12.4214 20.8064 12.6666 20.694L19.0666 17.7607C19.4047 17.6057 19.5738 17.5283 19.6976 17.4077C19.8071 17.3011 19.8907 17.1708 19.942 17.0269C20 16.8641 20 16.6781 20 16.3062V9.49958M2 8.49958L11.6422 3.67846C11.7734 3.61287 11.839 3.58008 11.9078 3.56717C11.9687 3.55574 12.0313 3.55574 12.0922 3.56717C12.161 3.58008 12.2266 3.61287 12.3578 3.67846L22 8.49958L12.3578 13.3207C12.2266 13.3863 12.161 13.4191 12.0922 13.432C12.0313 13.4434 11.9687 13.4434 11.9078 13.432C11.839 13.4191 11.7734 13.3863 11.6422 13.3207L2 8.49958Z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    text: 'Pokaż profil Patryka Żywicy',
    link: '/profile/patryk-zywica',
  },
  {
    id: 2,
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.86866 15.4599L7 22L11.5884 19.247C11.7381 19.1572 11.8129 19.1123 11.8928 19.0947C11.9634 19.0792 12.0366 19.0792 12.1072 19.0947C12.1871 19.1123 12.2619 19.1572 12.4116 19.247L17 22L16.1319 15.4571M16.4259 4.24888C16.5803 4.6224 16.8768 4.9193 17.25 5.0743L18.5589 5.61648C18.9325 5.77121 19.2292 6.06799 19.384 6.44154C19.5387 6.81509 19.5387 7.23481 19.384 7.60836L18.8422 8.91635C18.6874 9.29007 18.6872 9.71021 18.8427 10.0837L19.3835 11.3913C19.4602 11.5764 19.4997 11.7747 19.4997 11.975C19.4998 12.1752 19.4603 12.3736 19.3837 12.5586C19.3071 12.7436 19.1947 12.9118 19.0531 13.0534C18.9114 13.195 18.7433 13.3073 18.5582 13.3839L17.2503 13.9256C16.8768 14.0801 16.5799 14.3765 16.4249 14.7498L15.8827 16.0588C15.728 16.4323 15.4312 16.7291 15.0577 16.8838C14.6841 17.0386 14.2644 17.0386 13.8909 16.8838L12.583 16.342C12.2094 16.1877 11.7899 16.188 11.4166 16.3429L10.1077 16.8843C9.73434 17.0387 9.31501 17.0386 8.94178 16.884C8.56854 16.7293 8.27194 16.4329 8.11711 16.0598L7.57479 14.7504C7.42035 14.3769 7.12391 14.08 6.75064 13.925L5.44175 13.3828C5.06838 13.2282 4.77169 12.9316 4.61691 12.5582C4.46213 12.1849 4.46192 11.7654 4.61633 11.3919L5.1581 10.0839C5.31244 9.71035 5.31213 9.29079 5.15722 8.91746L4.61623 7.60759C4.53953 7.42257 4.50003 7.22426 4.5 7.02397C4.49997 6.82369 4.5394 6.62536 4.61604 6.44032C4.69268 6.25529 4.80504 6.08716 4.94668 5.94556C5.08832 5.80396 5.25647 5.69166 5.44152 5.61508L6.74947 5.07329C7.12265 4.91898 7.41936 4.6229 7.57448 4.25004L8.11664 2.94111C8.27136 2.56756 8.56813 2.27078 8.94167 2.11605C9.3152 1.96132 9.7349 1.96132 10.1084 2.11605L11.4164 2.65784C11.7899 2.81218 12.2095 2.81187 12.5828 2.65696L13.8922 2.11689C14.2657 1.96224 14.6853 1.96228 15.0588 2.11697C15.4322 2.27167 15.729 2.56837 15.8837 2.94182L16.426 4.25115L16.4259 4.24888Z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    text: 'Jakie są zasady wnioskowania o grant "Nagroda Sector 2.0"?',
    link: '#',
  },
  {
    id: 3,
    icon: (
      <svg
        width="20"
        height="22"
        viewBox="0 0 20 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 21H10M9 5.25204C9.63924 5.08751 10.3094 5 11 5C15.4183 5 19 8.58172 19 13C19 16.3574 16.9318 19.2317 14 20.4185M3.5 12H7.5C7.96466 12 8.19698 12 8.39018 12.0384C9.18356 12.1962 9.80376 12.8164 9.96157 13.6098C10 13.803 10 14.0353 10 14.5C10 14.9647 10 15.197 9.96157 15.3902C9.80376 16.1836 9.18356 16.8038 8.39018 16.9616C8.19698 17 7.96466 17 7.5 17H3.5C3.03534 17 2.80302 17 2.60982 16.9616C1.81644 16.8038 1.19624 16.1836 1.03843 15.3902C1 15.197 1 14.9647 1 14.5C1 14.0353 1 13.803 1.03843 13.6098C1.19624 12.8164 1.81644 12.1962 2.60982 12.0384C2.80302 12 3.03534 12 3.5 12ZM2 4.5V12H9V4.5C9 2.567 7.433 1 5.5 1C3.567 1 2 2.567 2 4.5Z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    text: 'Pokaż mi stronę projektu "System klasyfikacji danych rozmytych"',
    link: '#',
  },
  {
    id: 4,
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.5 20H5C3.89543 20 3 19.1046 3 18V4C3 2.89543 3.89543 2 5 2H19C20.1046 2 21 2.89543 21 4V18C21 19.1046 20.1046 20 19 20H17.5M12 19C13.6569 19 15 17.6569 15 16C15 14.3431 13.6569 13 12 13C10.3431 13 9 14.3431 9 16C9 17.6569 10.3431 19 12 19ZM12 19L12.0214 18.9998L8.82867 22.1926L6.00024 19.3641L9.01965 16.3447M12 19L15.1928 22.1926L18.0212 19.3641L15.0018 16.3447M9 6H15M7 9.5H17"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    text: 'Jakie są najczęściej cytowane prace naukowe profesora Patryka Żywicy?',
    link: '#',
  },
];

const LandingPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const navigate = useNavigate();

  const checkRedirect = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('patryk żywica') || lowerText.includes('patryk zywica')) {
      navigate('/profile/patryk-zywica');
      return true;
    }
    return false;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (checkRedirect(input)) {
      setInput('');
      return;
    }

    if (!chatVisible) setChatVisible(true);

    const userMessage = { from: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const requestData = {
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
    };

    try {
      const response = await axios.post('http://localhost:4000/api/chat', requestData);

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
    <div className="min-h-screen bg-gray-50 font-mono p-12 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {/* Заголовок */}
        <div className="text-center mb-8 flex justify-center items-center gap-2">
          <StarIcon className="w-6 h-6" />
          <h1 className="text-5xl font-normal text-gray-900">
            AGORA of acceleration services
          </h1>
        </div>
        <p className="text-gray-600 text-base max-w-xl mx-auto leading-relaxed mb-6">
          Szukasz informacji o grantach, projektach lub pracownikach naukowych? <br />
          Angora to inteligentna platforma, która pomoże Ci znaleźć wszystko szybko i bez zbędnego szukania.
        </p>

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
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 select-none">
            <StarIcon className="w-5 h-5" />
          </span>
          <button
            onClick={sendMessage}
            disabled={loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black rounded-full p-1.5 flex items-center justify-center hover:bg-gray-900 disabled:opacity-50"
            aria-label="Search"
          >
            <SearchIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Напис между чатом и блоками */}
        <div className="text-center text-lg font-normal mb-6">
          Możesz spytać
        </div>

        {/* Чат показывается только после первого запроса */}
        {chatVisible && (
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-4 mb-10 h-48 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, idx) => (
              <p
                key={idx}
                className={`p-2 rounded max-w-[80%] ${
                  msg.from === 'user'
                    ? 'bg-blue-100 self-end text-right ml-auto'
                    : 'bg-gray-200 self-start mr-auto'
                }`}
              >
                {msg.text}
              </p>
            ))}
            {loading && <p className="italic text-gray-500">Piszę...</p>}
          </div>
        )}

        {/* Карточки */}
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

              {link.startsWith('/') ? (
                <Link to={link} className="text-blue-600 text-xs underline">
                  Zapytaj o tym <StarIcon className="inline w-4 h-4 ml-1" />
                </Link>
              ) : (
                <a href={link} className="text-blue-600 text-xs underline">
                  Zapytaj o tym <StarIcon className="inline w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Футер */}
      <footer className="absolute bottom-4 w-full text-center text-xs text-gray-400">
        Copyright Angora © 2025
      </footer>
    </div>
  );
};

export default LandingPage;
