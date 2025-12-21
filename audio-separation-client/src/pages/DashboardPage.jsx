// src/pages/DashboardPage.jsx
import React from "react";
import Header from "../components/Header";

export default function DashboardPage({ user, plans, message, onNavigate, onUpgrade }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 delay-4000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        <Header user={user} onNavigate={onNavigate} onLogout={() => onNavigate("logout")} />

        <section className="text-center space-y-6">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/50 backdrop-blur">
            <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">✨ Separare Profesională</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Separare <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">vocal / instrumental</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Încarcă un fișier audio, iar aplicația noastră simulează separarea
            în track-uri vocale și instrumental. Limita de fișiere procesate pe zi depinde
            de planul tău.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white text-center">Planuri disponibile</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p, idx) => (
              <div
                key={p.id}
                className={`group relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  idx === 2
                    ? "md:scale-105 bg-gradient-to-br from-purple-600 to-purple-900 border border-purple-400 shadow-2xl shadow-purple-500/50"
                    : "bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 backdrop-blur-xl"
                }`}
              >
                <div>
                  <div className={`text-sm font-semibold ${idx === 2 ? "text-purple-200" : "text-gray-400"}`}>
                    {p.name}
                  </div>
                  <div className={`text-4xl font-bold my-2 ${idx === 2 ? "text-white" : "text-white"}`}>
                    {p.price}{" "}
                    <span className={`text-lg font-normal ${idx === 2 ? "text-purple-200" : "text-gray-400"}`}>
                      {p.currency}
                    </span>
                  </div>
                  <div className={`text-sm ${idx === 2 ? "text-purple-200" : "text-gray-400"}`}>
                    Limită: {p.dailyLimit} fișier(e) / zi
                  </div>
                  {idx === 2 && <div className="text-xs text-yellow-300 mt-2">⭐ Recomandat</div>}
                </div>
                <div>
                  {user ? (
                    <button
                      onClick={() => onUpgrade(p.id)}
                      className={`mt-4 w-full px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                        idx === 2
                          ? "bg-white text-purple-600 hover:bg-purple-50 shadow-lg"
                          : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                      }`}
                    >
                      Alege {p.name}
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate("register")}
                      className={`mt-4 w-full px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                        idx === 2
                          ? "bg-white text-purple-600 hover:bg-purple-50 shadow-lg"
                          : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                      }`}
                    >
                      Începe cu {p.name}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {message && (
          <div className="text-sm text-center text-green-400 bg-green-500/20 border border-green-500/50 backdrop-blur rounded-xl px-4 py-3">
            ✓ {message}
          </div>
        )}
      </div>
    </div>
  );
}
