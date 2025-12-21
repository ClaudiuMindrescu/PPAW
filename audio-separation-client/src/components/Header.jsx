import React, { useState } from "react";

export default function Header({ user, onNavigate, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.email?.[0]?.toUpperCase() ?? "?";

  const handleAvatarClick = () => {
    setMenuOpen((open) => !open);
  };

  const goAccount = () => {
    setMenuOpen(false);
    onNavigate("account");
  };

  const goPlans = () => {
    setMenuOpen(false);
    onNavigate("plans");
  };

  const goUsageBilling = () => {
    setMenuOpen(false);
    onNavigate("usage");
  };

  const goHelp = () => {
    setMenuOpen(false);
    onNavigate("help");
  };

  const goAdmin = () => {
    setMenuOpen(false);
    onNavigate("admin");
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="flex items-center justify-between mb-8 px-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 sticky top-0 z-40">
      {/* Logo + nume */}
      <div
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onNavigate("dashboard")}
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-purple-500/50">
          🎵
        </div>
        <div className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          AudioSplit
        </div>
      </div>

      {/* Navigație + cont */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate("dashboard")}
          type="button"
          className="text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200"
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => onNavigate("process")}
          type="button"
          className="text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200"
        >
          🎬 Process
        </button>

        {user ? (
          // Avatar + dropdown
          <div className="relative">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold border border-white/30 hover:border-white/50 focus:outline-none transition-all duration-200 shadow-lg shadow-purple-500/30"
            >
              {initials}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/50 py-2 text-sm z-50">
                <div className="px-4 py-3 border-b border-purple-500/30 text-xs text-purple-300 font-semibold">
                  👤 {user.email || "Guest"}
                </div>
                <button
                  type="button"
                  onClick={goAccount}
                  className="w-full text-left px-4 py-2.5 text-gray-100 hover:bg-purple-600/40 hover:text-white transition-colors duration-150"
                >
                  ⚙️ Account
                </button>
                <button
                  type="button"
                  onClick={goPlans}
                  className="w-full text-left px-4 py-2.5 text-gray-100 hover:bg-purple-600/40 hover:text-white transition-colors duration-150"
                >
                  💎 Plans
                </button>
                <button
                  type="button"
                  onClick={goUsageBilling}
                  className="w-full text-left px-4 py-2.5 text-gray-100 hover:bg-purple-600/40 hover:text-white transition-colors duration-150"
                >
                  📊 Usage &amp; Billing
                </button>
                <button
                  type="button"
                  onClick={goHelp}
                  className="w-full text-left px-4 py-2.5 text-gray-100 hover:bg-purple-600/40 hover:text-white transition-colors duration-150"
                >
                  ❓ Help
                </button>
                <button
                  type="button"
                  onClick={goAdmin}
                  className="w-full text-left px-4 py-2.5 text-gray-100 hover:bg-purple-600/40 hover:text-white transition-colors duration-150"
                >
                  🛠️ Admin
                </button>
                <div className="border-t border-purple-500/30 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-2.5 text-red-300 hover:bg-red-600/40 hover:text-red-100 transition-colors duration-150 rounded-lg m-1"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Guest: Login + Creează cont + Încearcă fără cont
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200"
            >
              🔐 Login
            </button>
            <button
              type="button"
              onClick={() => onNavigate("register")}
              className="text-sm px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-purple-500/50"
            >
              ✨ Creează cont
            </button>
            <button
              type="button"
              onClick={() => onNavigate("guest")}
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-200 border border-cyan-400/50 hover:border-cyan-300/50 rounded-lg px-3 py-2"
            >
              🎬 Încearcă fără cont
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
