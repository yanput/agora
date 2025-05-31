export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl sm:text-4xl font-semibold mb-4">
        ✨ AGORA of acceleration services
      </h1>

      <p className="text-gray-600 max-w-xl mb-6">
        Szukasz informacji o grantach, projektach lub pracownikach naukowych?
        Angora to inteligentna platforma, która pomoże Ci znaleźć wszystko szybko i bez zbędnego szukania.
      </p>

      {/* Search input */}
      <div className="relative w-full max-w-lg mb-8">
        <input
          type="text"
          placeholder="Szukam..."
          className="w-full px-5 py-3 rounded-full shadow outline-none border border-gray-300 focus:ring-2 focus:ring-indigo-500"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xl">🔍</button>
      </div>

      {/* Quick questions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl w-full">
        {[
          "W jakich obszarach badawczych specjalizuje się profesor Patryk Świetlik?",
          "Jakie są zasady aplikowania o grant 'Wspólnota Sektor 9.0'?",
          "Podaj mi stronę projektu z listą wszystkich danych i typów",
          "Jakie są najczęściej pojawiające się recenzje dla tego projektu?"
        ].map((question, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl shadow hover:bg-gray-100 transition cursor-pointer text-sm text-left"
          >
            {question}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-xs text-gray-400">
        Copyright Agora © 2025
      </footer>
    </div>
  );
}
