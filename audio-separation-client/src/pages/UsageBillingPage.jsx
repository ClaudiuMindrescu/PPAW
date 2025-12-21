// src/pages/UsageBillingPage.jsx
import React from "react";
import Header from "../components/Header";

export default function UsageBillingPage({
  user,
  account,
  accountError,
  plans,
  jobs,
  message,
  onNavigate,
  onLogout,
}) {
  if (!user) {
    onNavigate("login");
    return null;
  }

  if (accountError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-4">
          <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded-xl px-4 py-3 backdrop-blur">
            ❌ {accountError}
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />
          <div className="text-sm text-gray-400 animate-pulse">
            ⏳ Se încarcă datele de utilizare și facturare…
          </div>
        </div>
      </div>
    );
  }

  const { plan, subscription, usage, payments } = account;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

        {/* Usage + plan activ */}
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Usage card */}
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">📊 Utilizare zilnică</h3>
            <p className="text-sm text-gray-300">
              Astăzi ai procesat{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {usage.used} / {usage.limit}
              </span>{" "}
              fișiere.
            </p>
            <div className="w-full h-2.5 rounded-full bg-white/10 border border-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{
                  width: `${
                    usage.limit > 0
                      ? Math.min(100, (usage.used / usage.limit) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400">
              Limita depinde de planul tău activ. La epuizare nu mai poți
              procesa fișiere în ziua respectivă.
            </p>
          </div>

          {/* Plan summary card */}
          <div className="w-full md:w-64 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">⭐ Plan activ</h3>
            {plan ? (
              <div className="text-sm space-y-1.5">
                <div className="font-semibold text-white">{plan.name}</div>
                <div className="text-xs text-gray-300">
                  📈 Limită: {plan.dailyLimit} fișiere / zi
                </div>
                <div className="text-xs text-gray-300">
                  💰 Cost: {plan.price} {plan.currency} / lună
                </div>
                <div className="text-xs text-gray-300">
                  📅 Expiră:{" "}
                  {subscription && subscription.expiresAt
                    ? new Date(subscription.expiresAt).toLocaleDateString()
                    : "Nu expiră (Standard)"}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">❌ Nu există plan activ.</div>
            )}
            <button
              type="button"
              onClick={() => onNavigate("plans")}
              className="mt-3 w-full text-xs px-3 py-2.5 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-200 font-semibold"
            >
              👁️ Vezi toate planurile
            </button>
          </div>
        </div>

        {/* Istoric plăți */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">💳 Istoric plăți</h3>
          {!payments || payments.length === 0 ? (
            <div className="text-sm text-gray-400">
              📭 Nu ai plăți înregistrate încă.
            </div>
          ) : (
            <div className="text-sm overflow-x-auto">
              <table className="min-w-full">
                <thead className="text-xs text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="py-2.5 pr-4 text-left">📅 Data</th>
                    <th className="py-2.5 pr-4 text-left">📦 Plan</th>
                    <th className="py-2.5 pr-4 text-left">💰 Sumă</th>
                    <th className="py-2.5 pr-4 text-left">✓ Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-white/10 last:border-0 text-gray-300">
                      <td className="py-2.5 pr-4">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4">
                        {plans.find((x) => x.id === p.planId)?.name ?? "N/A"}
                      </td>
                      <td className="py-2.5 pr-4 font-semibold">
                        {p.amount} {p.currency}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.status === "paid" 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                            : p.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                            : "bg-red-500/20 text-red-300 border border-red-500/50"
                        }`}>
                          {p.status === "paid" ? "✓" : p.status === "pending" ? "⏳" : "✕"} {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Istoric complet fișiere procesate */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            🎵 Toate fișierele procesate
          </h3>
          {!jobs || jobs.length === 0 ? (
            <div className="text-sm text-gray-400">
              📭 Nu ai procesat niciun fișier încă.
            </div>
          ) : (
            <div className="text-sm overflow-x-auto">
              <table className="min-w-full">
                <thead className="text-xs text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="py-2.5 pr-4 text-left">📅 Data</th>
                    <th className="py-2.5 pr-4 text-left">📁 Fișier</th>
                    <th className="py-2.5 pr-4 text-left">✓ Status</th>
                    <th className="py-2.5 pr-4 text-left">📤 Rezultate (simulat)</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-b border-white/10 last:border-0 text-gray-300">
                      <td className="py-2.5 pr-4 text-xs">
                        {new Date(j.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 text-xs font-medium text-gray-200">{j.inputPath}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          j.status === "done" 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                            : j.status === "processing"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                            : "bg-red-500/20 text-red-300 border border-red-500/50"
                        }`}>
                          {j.status === "done" ? "✓" : j.status === "processing" ? "⏳" : "✕"} {j.status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-xs">
                        {j.status === "done" ? (
                          <span className="text-gray-300">
                            {j.outputVocalsPath} / {j.outputInstrumentalPath}
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            În curs sau eșuat (simulat)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {message && (
          <div className="text-sm text-emerald-300 bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-4 py-3 backdrop-blur">
            ✓ {message}
          </div>
        )}
      </div>
    </div>
  );
}
