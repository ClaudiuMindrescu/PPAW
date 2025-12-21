// src/pages/PlansPage.jsx
import React from "react";
import Header from "../components/Header";

const PLAN_DETAILS = {
  Standard: {
    tagline: "Perfect pentru teste și utilizare ocazională.",
    features: [
      "1 fișier procesat pe zi",
      "Acces la procesarea standard (simulată)",
      "Fără cost lunar",
    ],
  },
  Silver: {
    tagline: "Pentru utilizatori mai activi care procesează constant.",
    features: [
      "3 fișiere procesate pe zi",
      "Procesare prioritară față de planul Standard (simulat)",
      "Istoric extins al fișierelor procesate",
    ],
  },
  Gold: {
    tagline: "Pentru power users și workflow-uri intensive.",
    features: [
      "5 fișiere procesate pe zi",
      "Prioritate maximă la procesare (simulată)",
      "Monitorizare completă a utilizării și facturării",
    ],
  },
};

export default function PlansPage({
  user,
  account,
  plans,
  message,
  onNavigate,
  onLogout,
  onUpgrade,
}) {
  const currentPlanId = account?.plan?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Planuri și <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">abonamente</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Alege planul care se potrivește cel mai bine nevoilor tale. Toate planurile includ procesare real de separare audio cu limite zilnice.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          {plans.map((p, idx) => {
            const details = PLAN_DETAILS[p.name] ?? {
              tagline: "Plan personalizat.",
              features: [],
            };
            const isCurrent = currentPlanId === p.id;
            const isHighlight = p.name === "Gold";

            return (
              <div
                key={p.id}
                className={`relative rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between ${
                  isHighlight
                    ? "md:scale-105 bg-gradient-to-br from-purple-600/50 to-purple-900/50 border-purple-400/50 shadow-2xl shadow-purple-500/30"
                    : "bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/40 hover:bg-white/20"
                }`}
              >
                {isHighlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                    ⭐ RECOMANDAT
                  </div>
                )}

                <div>
                  <div className={`text-xs uppercase tracking-widest font-bold mb-2 ${isHighlight ? "text-purple-200" : "text-gray-400"}`}>
                    {p.name === "Gold"
                      ? "💎 Pro"
                      : p.name === "Silver"
                      ? "🌟 Popular"
                      : "⚡ Basic"}
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${isHighlight ? "text-white" : "text-white"}`}>
                    {p.name}
                  </h2>
                  <div className={`text-4xl font-bold mb-1 ${isHighlight ? "text-white" : "text-white"}`}>
                    {p.price}{" "}
                    <span className={`text-lg font-normal ${isHighlight ? "text-purple-200" : "text-gray-400"}`}>
                      {p.currency}/lună
                    </span>
                  </div>
                  <div className={`text-sm mb-4 ${isHighlight ? "text-purple-200" : "text-gray-400"}`}>
                    {p.dailyLimit} fișier{p.dailyLimit !== 1 ? "e" : ""} / zi
                  </div>
                  <p className={`text-sm mb-4 ${isHighlight ? "text-purple-100" : "text-gray-300"}`}>
                    {details.tagline}
                  </p>

                  {details.features.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {details.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className={`text-lg ${isHighlight ? "text-purple-300" : "text-purple-400"}`}>
                            ✓
                          </span>
                          <span className={isHighlight ? "text-purple-100" : "text-gray-300"}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6">
                  {isCurrent ? (
                    <button
                      type="button"
                      className={`w-full text-sm px-4 py-3 rounded-lg font-semibold border ${
                        isHighlight
                          ? "border-purple-300/50 text-purple-200 bg-purple-500/20"
                          : "border-white/30 text-gray-300 bg-white/10"
                      } cursor-default`}
                    >
                      ✓ Planul tău actual
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpgrade(p.id)}
                      className={`w-full text-sm px-4 py-3 rounded-lg font-semibold transition-all ${
                        isHighlight
                          ? "bg-white text-purple-700 hover:bg-gray-100 shadow-lg"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      }`}
                    >
                      {user ? "🚀 Upgrade" : "Alege planul"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {message && (
          <div className="text-sm text-emerald-400 bg-emerald-500/20 border border-emerald-500/50 rounded-xl px-4 py-3 text-center">
            ✓ {message}
          </div>
        )}
      </div>
    </div>
  );
}
