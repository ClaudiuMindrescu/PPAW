// src/pages/ProcessPage.jsx
import React, { useState } from "react";
import Header from "../components/Header";

export default function ProcessPage({
  user,
  guestToken,
  jobs,
  message,
  loading,
  onNavigate,
  onLogout,
  onUpload,
}) {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    await onUpload(file);
    setFile(null);
    e.target.reset();
  };

  // Allow both authenticated users and guests with token
  if (!user && !guestToken) {
    onNavigate("login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

        {/* Upload Section */}
        <section className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
          <h3 className="text-lg font-bold text-white mb-1">📤 Încarcă fișier audio</h3>
          <p className="text-gray-400 text-sm mb-6">Selectează un fișier audio pentru a-l procesa</p>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                <div className="text-3xl mb-2">🎵</div>
                <div className="text-white font-semibold">
                  {file ? `✓ ${file.name}` : "Click pentru a selecta un fișier audio"}
                </div>
                <div className="text-gray-400 text-sm mt-1">sau trage și eliberează</div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-semibold hover:from-cyan-700 hover:to-purple-700 transition disabled:opacity-50"
              disabled={loading || !file}
            >
              {loading ? "⏳ Se procesează..." : "🚀 Procesează"}
            </button>
          </form>

          {message && (
            <div className="mt-4 text-sm text-emerald-400 bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-3 py-2">
              ✓ {message}
            </div>
          )}
        </section>

        {/* Jobs History */}
        <section className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
          <h3 className="text-lg font-bold text-white mb-1">📋 Ultimele joburi</h3>
          <p className="text-gray-400 text-sm mb-6">Istoricul fișierelor tale procesate</p>

          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-400">Nu ai joburi încă. Încarc fișierul tău első!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((j) => (
                <div key={j.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-white">{j.inputPath}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Job #{j.id} • {new Date(j.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        j.status === "done"
                          ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                          : j.status === "processing"
                          ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/50"
                          : "bg-red-500/30 text-red-300 border border-red-500/50"
                      }`}
                    >
                      {j.status === "done" ? "✓ Gata" : j.status === "processing" ? "⏳ În curs" : "✗ Eșec"}
                    </span>
                  </div>

                  {j.status === "done" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="px-3 py-2 rounded-lg bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs font-medium hover:bg-purple-600/50 transition">
                        🎤 Descarcă vocal
                      </button>
                      <button className="px-3 py-2 rounded-lg bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 text-xs font-medium hover:bg-cyan-600/50 transition">
                        🎸 Descarcă backing
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
