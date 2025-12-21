import React, { useState } from "react";
import Header from "../components/Header";

export default function AccountPage({
  user,
  account,
  accountError,
  plans,
  message,
  onNavigate,
  onLogout,
  onUpgrade,
  onChangePassword,
  onDowngrade,
}) {
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);

  if (!user) {
    onNavigate("login");
    return null;
  }

  if (accountError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />
          <div className="mt-6 bg-red-50 border border-red-300 text-red-700 text-sm rounded-2xl px-5 py-4">
            {accountError}
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />
          <div className="mt-8 text-center text-zinc-500 text-sm">Se încarcă datele contului…</div>
        </div>
      </div>
    );
  }

  const { plan, subscription, usage, payments } = account;
  const progressPercent = usage.limit > 0 ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  // Helper: Safe date parsing
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Helper: Check if there's a better plan available
  const hasUpgradableplan = () => {
    if (!plan) return true; // Standard user can always upgrade
    const currentPlanLimit = plan.dailyLimit || 0;
    return plans.some(p => p.dailyLimit > currentPlanLimit);
  };

  // Helper: Format relative time
  const getRelativeTime = (dateString) => {
    const date = parseDate(dateString);
    if (!date) return "Data nu e disponibilă";

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return "acum câteva secunde";
    if (diffMins < 60) return `acum ${diffMins} minut${diffMins > 1 ? "e" : ""}`;
    if (diffHours < 24) return `acum ${diffHours} or${diffHours > 1 ? "e" : "ă"}`;
    if (diffDays < 7) return `acum ${diffDays} zi${diffDays > 1 ? "le" : "ua"}`;
    if (diffWeeks < 4) return `acum ${diffWeeks} săptămân${diffWeeks > 1 ? "i" : "ă"}`;
    if (diffMonths < 12) return `acum ${diffMonths} lun${diffMonths > 1 ? "i" : "ă"}`;

    return `acum ${Math.floor(diffMonths / 12)} an${Math.floor(diffMonths / 12) > 1 ? "i" : ""}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

        {/* Header Section */}
        <div className="mt-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Contul meu</h1>
              <p className="text-gray-400 text-sm mt-2">Gestionează informațiile și setările tale</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {hasUpgradableplan() && (
                <button
                  type="button"
                  onClick={() => onNavigate("plans")}
                  className="px-4 py-2.5 rounded-lg border border-emerald-400/50 bg-gradient-to-r from-emerald-600/20 to-emerald-600/10 text-emerald-300 text-sm font-medium hover:from-emerald-600/30 hover:to-emerald-600/20 transition"
                >
                  ⬆ Upgrade Plan
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(true)}
                className="px-4 py-2.5 rounded-lg border border-white/30 bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition"
              >
                🔐 Schimbă parola
              </button>
              {plan && plan.name !== "Standard" && (
                <button
                  type="button"
                  onClick={() => setShowDowngradeConfirm(true)}
                  className="px-4 py-2.5 rounded-lg border border-red-400/50 bg-red-600/10 text-red-400 text-sm font-medium hover:bg-red-600/20 transition"
                >
                  ↙ Revin la Standard
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* User Info Card */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Informații cont</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</label>
                <p className="text-white font-medium mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Creat</label>
                <p className="text-gray-300 text-sm mt-1">
                  {getRelativeTime(user.createdAt)}
                </p>
                {parseDate(user.createdAt) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {parseDate(user.createdAt).toLocaleDateString("ro-RO", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Plan Card */}
          <div className="bg-gradient-to-br from-purple-600/30 to-purple-900/30 backdrop-blur-xl rounded-2xl border border-purple-400/50 shadow-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Plan activ</h2>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-white">{plan ? plan.name : "Standard"}</p>
                <p className="text-xs text-purple-300 mt-1">Limită zilnică</p>
              </div>
              <div className="pt-3 border-t border-purple-400/30">
                <p className="text-3xl font-bold text-white">{usage?.limit ?? 0}</p>
                <p className="text-xs text-purple-300">fișiere / zi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Utilizare zilnică</h2>
            <span className="text-xs font-medium text-gray-400">
              {usage.used} / {usage.limit}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden border border-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-white">{Math.round(progressPercent)}%</span>
            </div>
            <p className="text-xs text-gray-400">
              {usage.used === usage.limit && usage.limit > 0
                ? "⚠️ Ai atins limita de astăzi. Se resetează la miezul nopții."
                : `✓ Ai mai disponibil ${usage.limit - usage.used} fișier(e) pentru astazi.`}
            </p>
          </div>
        </div>

        {/* Payments History */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Istoric plăți</h2>
          {!payments || payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Nu ai plăți înregistrate.</p>
              <button
                type="button"
                onClick={() => onNavigate("plans")}
                className="mt-3 text-sm text-purple-400 font-medium hover:text-purple-300 transition"
              >
                Explorează planuri →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-0 font-semibold text-gray-400 text-xs">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-400 text-xs">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-400 text-xs">Sumă</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-400 text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="py-3 px-0 text-white">
                        {new Date(p.createdAt).toLocaleDateString("ro-RO")}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {plans.find((x) => x.id === p.planId)?.name ?? "N/A"}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {p.amount} {p.currency}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                            p.status === "paid"
                              ? "bg-emerald-500/30 border border-emerald-500/50 text-emerald-300"
                              : p.status === "pending"
                              ? "bg-yellow-500/30 border border-yellow-500/50 text-yellow-300"
                              : "bg-red-500/30 border border-red-500/50 text-red-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-8 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-sm rounded-2xl px-5 py-4">
            ✓ {message}
          </div>
        )}
      </div>

      {/* Password Change Confirmation Modal */}
      {showPasswordConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 shadow-2xl p-6 max-w-sm w-full">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">🔐 Schimbă parola</h3>
              <p className="text-gray-400 text-sm mt-2">
                Te vom duce la o pagină securizată unde poți introduce parola curentă și cea nouă.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(false)}
                className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordConfirm(false);
                  onNavigate("password");
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition"
              >
                Continuă
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {showDowngradeConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 shadow-2xl p-6 max-w-sm w-full">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">⚠️ Revin la Standard</h3>
              <p className="text-gray-400 text-sm mt-2">
                Ești sigur? Vei pierde beneficiile planului {plan?.name} și limita zilnică va scădea la {plans.find(p => p.name === "Standard")?.dailyLimit || 1} fișier/zi.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
              <button
                type="button"
                onClick={() => setShowDowngradeConfirm(false)}
                className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDowngradeConfirm(false);
                  onDowngrade();
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium hover:from-red-700 hover:to-red-800 transition"
              >
                Da, revin la Standard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}