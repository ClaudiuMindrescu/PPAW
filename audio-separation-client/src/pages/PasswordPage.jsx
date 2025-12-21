import React, { useState } from "react";
import Header from "../components/Header";

export default function PasswordPage({
  user,
  loading,
  message,
  onNavigate,
  onLogout,
  onChangePassword,
}) {
  if (!user) {
    onNavigate("login");
    return null;
  }

  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onChangePassword(form.currentPassword, form.newPassword);
    setForm({ currentPassword: "", newPassword: "" });
    onNavigate("account");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-6">
        <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">🔐 Schimbă parola</h2>
          <p className="text-gray-400 text-sm mb-6">Introdu parola curentă și cea nouă pentru a continua</p>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">Parola curentă</label>
              <input
                type="password"
                required
                value={form.currentPassword}
                onChange={handleChange("currentPassword")}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/20 transition"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">Parola nouă</label>
              <input
                type="password"
                required
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/20 transition"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => onNavigate("account")}
                className="px-4 py-2.5 rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Se salvează..." : "Salvează"}
              </button>
            </div>
            {message && <div className="mt-4 text-sm text-green-400 bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-2">✓ {message}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
