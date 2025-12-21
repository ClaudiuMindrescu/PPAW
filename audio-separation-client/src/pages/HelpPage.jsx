// src/pages/HelpPage.jsx
import React from "react";
import Header from "../components/Header";

export default function HelpPage({ user, onNavigate, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

        <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-3">
          <h1 className="text-3xl font-bold text-white">❓ Help &amp; Support</h1>
          <p className="text-sm text-gray-300">
            Aceasta este o pagină de suport simulată pentru proiectul tău de
            master. Aici poți explica, la prezentare, cum ar funcționa
            suportul real pentru utilizatorii aplicației.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">📧 Contact</h2>
            <p className="text-sm text-gray-300">
              Pentru întrebări legate de cont, abonamente sau procesarea
              fișierelor audio:
            </p>
            <ul className="text-sm text-gray-300 space-y-1.5">
              <li>
                Email:{" "}
                <a
                  href="mailto:support@audiosplit.demo"
                  className="text-purple-400 hover:text-purple-300 underline font-semibold"
                >
                  support@audiosplit.demo
                </a>
              </li>
              <li>📅 Program: Luni–Vineri, 09:00–18:00</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">💡 FAQ (simulat)</h2>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>
                <span className="font-semibold text-white">
                  📊 Câte fișiere pot procesa pe zi?
                </span>
                <br />
                <span className="text-xs text-gray-400">Depinde de planul activ: Standard, Silver sau Gold.</span>
              </li>
              <li>
                <span className="font-semibold text-white">
                  ⚙️ Procesarea este reală sau simulată?
                </span>
                <br />
                <span className="text-xs text-gray-400">În acest proiect de master este <b>simulată</b>. Într-o aplicație reală am integra un serviciu de procesare audio.</span>
              </li>
              <li>
                <span className="font-semibold text-white">
                  ❌ Pot să-mi anulez abonamentul?
                </span>
                <br />
                <span className="text-xs text-gray-400">Da, din pagina de Account / Usage &amp; Billing poți reveni la planul Standard.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">🎓 Despre acest proiect</h2>
          <p className="text-sm text-gray-300">
            Această aplicație este dezvoltată ca proiect de master și are ca
            scop simularea unui serviciu de separare a vocalului de muzica de
            fundal, cu gestionarea planurilor de abonament, a limitelor zilnice
            și a istoricului de plăți.
          </p>
          <p className="text-xs text-gray-400">
            🛠️ Tehnologiile folosite: <span className="text-purple-400 font-semibold">ASP.NET Core 9</span>, <span className="text-pink-400 font-semibold">MySQL 8.0</span>, <span className="text-blue-400 font-semibold">React 18</span>, <span className="text-cyan-400 font-semibold">Tailwind CSS</span>, <span className="text-emerald-400 font-semibold">Vite</span>
          </p>
        </section>
      </div>
    </div>
  );
}
