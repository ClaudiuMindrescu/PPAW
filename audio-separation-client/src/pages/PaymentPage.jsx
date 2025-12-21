// src/pages/PaymentPage.jsx
import React, { useState } from "react";
import Header from "../components/Header";

export default function PaymentPage({
  user,
  plans,
  selectedPlanId,
  loading,
  message,
  onNavigate,
  onLogout,
  onConfirm,
  onCancel,
}) {
  if (!user || !selectedPlanId) {
    onNavigate("dashboard");
    return null;
  }

  const plan = plans.find((p) => p.id === selectedPlanId);
  if (!plan) {
    onNavigate("plans");
    return null;
  }

  const [form, setForm] = useState({
    fullName: user.email,
    cardNumber: "4111 1111 1111 1111",
    expiry: "12/30",
    cvv: "123",
  });

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onConfirm(form);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-6 space-y-4">
          <h1 className="text-3xl font-bold text-white">💳 Confirmă plata</h1>
          <p className="text-sm text-gray-300">
            Ești pe cale să faci upgrade la planul{" "}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{plan.name}</span> (
            {plan.price} {plan.currency} / lună). Aceasta este doar o
            simulare pentru proiectul de master – datele de card nu sunt
            trimise nicăieri real.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Info plan */}
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-lg rounded-2xl p-4 text-sm space-y-2">
              <div className="font-semibold text-white text-lg">⭐ {plan.name}</div>
              <div className="text-xs text-gray-300">
                📊 {plan.dailyLimit} fișiere / zi
              </div>
              <div className="text-xs text-gray-300">
                💰 {plan.price} {plan.currency} / lună
              </div>
              <p className="text-xs text-gray-400 mt-2">
                După confirmare, planul tău va fi actualizat, iar limita
                zilnică va fi ajustată conform noului abonament.
              </p>
            </div>

            {/* Card form (simulat) */}
            <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs text-gray-300 mb-2">
                  Nume pe card (simulat)
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 backdrop-blur"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-2">Număr card</label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 backdrop-blur"
                  value={form.cardNumber}
                  onChange={handleChange("cardNumber")}
                  required
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-300 mb-2">Expirare</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 backdrop-blur"
                    value={form.expiry}
                    onChange={handleChange("expiry")}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-300 mb-2">CVV</label>
                  <input
                    type="password"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 backdrop-blur"
                    value={form.cvv}
                    onChange={handleChange("cvv")}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3 py-2.5 text-xs rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-200 font-semibold"
                  disabled={loading}
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Se procesează plata..." : "✓ Confirmă plata"}
                </button>
              </div>
            </form>
          </div>

          <p className="text-xs text-gray-500">
            ℹ️ Fluxul de plată este complet simulat. Poți explica asta
            clar la prezentare: focusul proiectului este pe managementul
            planurilor și al limitelor zilnice, nu pe integrarea reală cu un
            procesator de plăți.
          </p>

          {message && (
            <div className="text-sm text-emerald-300 bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-3 py-2.5 backdrop-blur">
              ✓ {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
