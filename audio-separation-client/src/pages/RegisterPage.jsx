// src/pages/RegisterPage.jsx
import React from "react";

export default function RegisterPage({ loading, message, onRegister, onGoLogin, onGoDashboard }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">✨ Creează cont</h2>
          <p className="text-gray-400 text-sm mt-2">Alătură-te comunității noastre</p>
        </div>

        <form className="space-y-4" onSubmit={onRegister}>
          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Parolă</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition"
              placeholder="••••••••"
            />
          </div>
          <button
            className="mt-4 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "⏳ Se creează contul..." : "🚀 Creează cont"}
          </button>
        </form>

        {message && <div className="mt-4 text-sm text-red-400 bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2">⚠️ {message}</div>}

        <div className="mt-6 space-y-3 pt-6 border-t border-white/20">
          <p className="text-xs text-gray-400">
            Ai deja cont?{" "}
            <button className="text-blue-400 hover:text-blue-300 font-semibold transition" type="button" onClick={onGoLogin}>
              Login →
            </button>
          </p>
          <p className="text-xs text-gray-400">
            Sau{" "}
            <button className="text-purple-400 hover:text-purple-300 font-semibold transition" type="button" onClick={onGoDashboard}>
              înapoi la Dashboard →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
