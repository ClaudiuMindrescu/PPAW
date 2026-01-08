import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import * as api from "../api/client";

export default function AdminPage({ user, onNavigate, onLogout }) {
  if (!user || user.role !== "Admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Acces Refuzat</h1>
          <p className="text-white/60 mb-8">Nu ai permisiune să accesezi această pagină.</p>
          <button
            onClick={() => onNavigate("dashboard")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
          >
            Înapoi la Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [guests, setGuests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [modalData, setModalData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const data = await api.getUsers(user.id);
        console.log("[DEBUG] getUsers response:", data);
        setUsers(data || []);
      } else if (activeTab === "guests") {
        const data = await api.getGuestIdentities(user.id);
        setGuests(data || []);
      } else if (activeTab === "jobs") {
        const data = await api.getAudioJobs(user.id);
        setJobs(data || []);
      }
    } catch (err) {
      alert("Eroare: " + err.message);
    }
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTimeout(() => loadData(), 50);
  };

  // ===== USERS CRUD =====
  const handleAddUser = () => {
    setModalData({ email: "", password: "", role: "User" });
    setModal("createUser");
  };

  const handleEditUser = (u) => {
    setModalData({
      id: u.Id || u.id,
      email: u.Email || u.email,
      password: "********", // placeholder vizual
      role: u.Role || u.role,
      originalPassword: "********" // pentru comparație la salvare
    });
    setModal("editUser");
  };

  const handleSaveUser = async () => {
    try {
      if (!modalData.email) {
        alert("Emailul este obligatoriu!");
        return;
      }
      if (modal === "createUser") {
        if (!modalData.password) {
          alert("Parola este obligatorie la creare!");
          return;
        }
        await api.createUser(user.id, modalData.email, modalData.password, modalData.role);
        alert("Utilizator creat cu succes!");
      } else {
        // Dacă parola nu a fost modificată, trimite string gol (backend nu o schimbă)
        const passwordToSend = (modalData.password && modalData.password !== modalData.originalPassword) ? modalData.password : "";
        await api.updateUser(user.id, modalData.id, modalData.email, passwordToSend, modalData.role);
        alert("Utilizator actualizat cu succes!");
      }
      setModal(null);
      loadData();
    } catch (err) {
      alert("Eroare: " + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi acest utilizator?")) return;
    try {
      await api.deleteUser(user.id, id);
      alert("Utilizator șters cu succes!");
      loadData();
    } catch (err) {
      alert("Eroare: " + err.message);
    }
  };

  // ===== GUESTS CRUD =====
  const handleDeleteGuest = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi această sesiune guest?")) return;
    try {
      await api.deleteGuestIdentity(user.id, id);
      alert("Sesiune ștearsă cu succes!");
      loadData();
    } catch (err) {
      alert("Eroare: " + err.message);
    }
  };

  // ===== JOBS CRUD =====
  const handleDeleteJob = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi acest job?")) return;
    try {
      await api.deleteAudioJob(user.id, id);
      alert("Job șters cu succes!");
      loadData();
    } catch (err) {
      alert("Eroare: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO") + " " + date.toLocaleTimeString("ro-RO").substring(0, 5);
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          {/* Header și Tabs */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🛠️ Panoul Administrării</h1>
            <p className="text-white/60">Gestionar baza de date cu o interfață modernă și ușor de utilizat</p>
          </div>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "users", label: "👥 Utilizatori", icon: "users" },
              { id: "guests", label: "🎭 Sesiuni Guest", icon: "guests" },
              { id: "jobs", label: "🎵 Joburi Audio", icon: "jobs" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Content */}
          {loading ? (
            <div className="text-center text-white/60">Încărcare...</div>
          ) : (
            <>
              {/* USERS TAB */}
              {activeTab === "users" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Utilizatori ({users.length})</h2>
                    <button
                      onClick={handleAddUser}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      ➕ Adaugă Utilizator
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 px-4 text-white/80 font-semibold">ID</th>
                          <th className="text-left py-3 px-4 text-white/80 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 text-white/80 font-semibold">Rol</th>
                          <th className="text-left py-3 px-4 text-white/80 font-semibold">Creat</th>
                          <th className="text-center py-3 px-4 text-white/80 font-semibold">Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.Id || u.id} className="border-b border-white/10 hover:bg-white/5 transition">
                            <td className="py-4 px-4 text-white/70">{u.Id || u.id}</td>
                            <td className="py-4 px-4 text-white">{u.Email || u.email}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${(u.Role || u.role) === "Admin" ? "bg-yellow-500/30 text-yellow-200" : "bg-blue-500/30 text-blue-200"}`}>{u.Role || u.role}</span>
                            </td>
                            <td className="py-4 px-4 text-white/60 text-sm">{formatDate(u.CreatedAt || u.createdAt)}</td>
                            <td className="py-4 px-4 text-center">
                              <button onClick={() => handleEditUser(u)} className="text-blue-400 hover:text-blue-300 mr-3 transition">✏️</button>
                              {(u.Id || u.id) !== user.id && (
                                <button onClick={() => handleDeleteUser(u.Id || u.id)} className="text-red-400 hover:text-red-300 transition">🗑️</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* GUESTS TAB */}
              {activeTab === "guests" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Sesiuni Guest ({guests.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guests.map((g) => (
                      <div key={g.Id} className={`bg-white/5 border rounded-lg p-4 transition ${isExpired(g.ExpiresAt) ? "border-red-500/30" : "border-white/20"}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-white/60 text-xs mb-1">Token:</p>
                            <p className="text-white font-mono text-sm truncate">{g.Token.substring(0, 16)}...</p>
                          </div>
                          {isExpired(g.ExpiresAt) && (
                            <span className="bg-red-500/30 text-red-200 text-xs px-2 py-1 rounded">Expirat</span>
                          )}
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between text-white/60">
                            <span>Creat:</span>
                            <span className="text-white/80">{formatDate(g.CreatedAt)}</span>
                          </div>
                          <div className="flex justify-between text-white/60">
                            <span>Expiră:</span>
                            <span className={isExpired(g.ExpiresAt) ? "text-red-400" : "text-white/80"}>{formatDate(g.ExpiresAt)}</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-white/60">Utilizări Azi:</span>
                              <span className="text-white/80">{g.UsedToday}/{g.DailyLimit}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition" style={{ width: `${(g.UsedToday / g.DailyLimit) * 100}%` }}></div>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteGuest(g.Id)} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-lg transition text-sm font-medium">🗑️ Șterge</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* JOBS TAB */}
              {activeTab === "jobs" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Joburi Audio ({jobs.length})</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 px-4 text-white/80 font-semibold">ID</th>
                          <th className="text-left py-3 px-4 text-white/80 font-semibold">User/Guest</th>
                          <th className="text-left py-3 px-4 text-white/80 font-semibold">Fișier Input</th>
                          <th className="text-left py-3 px-4 text-white/80 font-semibold">Status</th>
                          <th className="text-left py-3 px-4 text-white/80 font-semibold">Creat</th>
                          <th className="text-center py-3 px-4 text-white/80 font-semibold">Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((j) => (
                          <tr key={j.Id} className="border-b border-white/10 hover:bg-white/5 transition">
                            <td className="py-4 px-4 text-white/70">{j.Id}</td>
                            <td className="py-4 px-4 text-white text-sm">{j.UserEmail ? (<span className="bg-blue-500/20 px-2 py-1 rounded text-blue-200">👤 {j.UserEmail}</span>) : (<span className="bg-purple-500/20 px-2 py-1 rounded text-purple-200">🎭 Guest</span>)}</td>
                            <td className="py-4 px-4 text-white/60 text-sm truncate">{j.InputPath}</td>
                            <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${j.Status === "completed" ? "bg-emerald-500/30 text-emerald-200" : j.Status === "processing" ? "bg-blue-500/30 text-blue-200" : j.Status === "failed" ? "bg-red-500/30 text-red-200" : "bg-yellow-500/30 text-yellow-200"}`}>{j.Status}</span></td>
                            <td className="py-4 px-4 text-white/60 text-sm">{formatDate(j.CreatedAt)}</td>
                            <td className="py-4 px-4 text-center"><button onClick={() => handleDeleteJob(j.Id)} className="text-red-400 hover:text-red-300 transition">🗑️</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* MODALS */}
        {(modal === "createUser" || modal === "editUser") && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-4">{modal === "createUser" ? "➕ Adaugă Utilizator" : "✏️ Editează Utilizator"}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
                  <input type="email" value={modalData.email || ""} onChange={(e) => setModalData({ ...modalData, email: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500" placeholder="utilizator@email.com" />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Parola</label>
                  <input type="password" value={modalData.password || ""} onChange={(e) => setModalData({ ...modalData, password: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500" placeholder={modal === "editUser" ? "(lăsați gol dacă nu schimbați)" : "Introduceți parola"} />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Rol</label>
                  <select value={modalData.role || "User"} onChange={(e) => setModalData({ ...modalData, role: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500">
                    <option value="User" className="bg-slate-900">User</option>
                    <option value="Admin" className="bg-slate-900">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setModal(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition">Anulează</button>
                <button onClick={handleSaveUser} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition font-medium">Salvează</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
