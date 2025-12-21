// src/App.jsx
import React, { useEffect, useState } from "react";

import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import ProcessPage from "./pages/ProcessPage";
import UsageBillingPage from "./pages/UsageBillingPage";
import HelpPage from "./pages/HelpPage";
import PlansPage from "./pages/PlansPage";
import PaymentPage from "./pages/PaymentPage";
import PasswordPage from "./pages/PasswordPage";
import AdminPage from "./pages/AdminPage";

import {
  getPlans,
  register as apiRegister,
  login as apiLogin,
  createGuestSession,
  getAccountSummary,
  changePassword,
  downgradeToStandard,
  checkoutPlan,
  getJobs,
  uploadJob,
} from "./api/client";

function App() {
  const [view, setView] = useState("dashboard"); // dashboard | login | register | account | process | usage | plans | help | payment
  const [previousView, setPreviousView] = useState("dashboard"); // track where user came from
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [account, setAccount] = useState(null);
  const [accountError, setAccountError] = useState("");
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [guestToken, setGuestToken] = useState(() => {
    // Load guest token from localStorage
    return localStorage.getItem("guestToken");
  });

  // Load plans once
  useEffect(() => {
    (async () => {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch (err) {
        console.error(err);
        setMessage(err.message || "Nu am putut încărca planurile.");
      }
    })();
  }, []);

  // Load account + jobs when needed
  useEffect(() => {
    if (
      !user ||
      (view !== "account" &&
        view !== "process" &&
        view !== "usage" &&
        view !== "payment")
    )
      return;

    (async () => {
      try {
        setAccountError("");
        const acc = await getAccountSummary(user.id);
        setAccount(acc);

        const js = await getJobs(user.id);
        setJobs(js);
      } catch (err) {
        console.error(err);
        setAccount(null);
        setAccountError(err.message || "Nu am putut încărca datele contului.");
      }
    })();
  }, [user, view]);

  const navigate = (nextView) => {
    if (nextView === "logout") {
      handleLogout();
      return;
    }
    setMessage("");
    setView(nextView);
  };

  const handleLogout = () => {
    setGuestToken(null);
    localStorage.removeItem("guestToken");
    setUser(null);
    setAccount(null);
    setJobs([]);
    setMessage("");
    setSelectedPlanId(null);
    setView("dashboard");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const form = new FormData(e.target);
      const email = form.get("email");
      const password = form.get("password");
      const data = await apiLogin(email, password);
      console.log("Login response:", data); // DEBUG
      setUser({ id: data.id, email: data.email, role: data.role, createdAt: data.createdAt });
      setView("process");
    } catch (err) {
      setMessage(err.message || "Eroare la autentificare.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const form = new FormData(e.target);
      const email = form.get("email");
      const password = form.get("password");
      const data = await apiRegister(email, password);
      setUser({ id: data.id, email: data.email, role: data.role, createdAt: data.createdAt });
      setView("process");
    } catch (err) {
      setMessage(err.message || "Eroare la înregistrare.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSession = async () => {
    setMessage("");
    setLoading(true);
    try {
      const data = await createGuestSession();
      setGuestToken(data.guestToken);
      localStorage.setItem("guestToken", data.guestToken);
      localStorage.setItem("guestExpiresAt", data.expiresAt);
      setUser({ isGuest: true, email: null });
      setView("process");
    } catch (err) {
      setMessage(err.message || "Eroare la creare sesiune guest.");
    } finally {
      setLoading(false);
    }
  };

  // pornește flow-ul de upgrade -> mergem în pagina de plată
  const startUpgrade = (planId) => {
    if (!user) {
      setView("login");
      return;
    }
    setMessage("");
    setPreviousView(view); // save current view BEFORE going to payment
    setSelectedPlanId(planId);
    setView("payment");
  };

  // confirmă plata => simulăm delay + apel la API
  const handleConfirmPayment = async (paymentData) => {
    if (!user || !selectedPlanId) return;
    setMessage("");
    setLoading(true);
    try {
      // simulăm 3 secunde de procesare
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const res = await checkoutPlan(user.id, selectedPlanId, paymentData);
      setMessage(res.message || "Plan actualizat.");

      const acc = await getAccountSummary(user.id);
      setAccount(acc);
      setSelectedPlanId(null);
      setView("account");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Eroare la upgrade.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!user && !guestToken) {
      setView("login");
      return;
    }
    setMessage("");
    setLoading(true);
    try {
      // Use guestToken if guest, otherwise use user.id
      const identifier = guestToken || user.id;
      const job = await uploadJob(identifier, file);
      setJobs((prev) => [job, ...prev]);
      setMessage("Fișier procesat (simulat).");
      
      // Only fetch account summary if authenticated user
      if (user?.id) {
        const acc = await getAccountSummary(user.id);
        setAccount(acc);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Eroare la procesare.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    if (!user) return;
    setMessage("");
    try {
      const res = await changePassword(user.id, currentPassword, newPassword);
      setMessage(res.message || "Parola a fost schimbată.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Nu s-a putut schimba parola.");
    }
  };

  const handleDowngrade = async () => {
    if (!user) return;
    setMessage("");
    setLoading(true);
    try {
      const res = await downgradeToStandard(user.id);
      setMessage(res.message || "Ai revenit la Standard.");
      const acc = await getAccountSummary(user.id);
      setAccount(acc);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Nu am putut reveni la Standard.");
    } finally {
      setLoading(false);
    }
  };

  // --------- ROUTER simplu ---------

  if (view === "login") {
    return (
      <LoginPage
        loading={loading}
        message={message}
        onLogin={handleLogin}
        onGoRegister={() => navigate("register")}
        onGoDashboard={() => navigate("dashboard")}
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterPage
        loading={loading}
        message={message}
        onRegister={handleRegister}
        onGoLogin={() => navigate("login")}
        onGoDashboard={() => navigate("dashboard")}
      />
    );
  }

  if (view === "account") {
    return (
      <AccountPage
        user={user}
        account={account}
        accountError={accountError}
        plans={plans}
        message={message}
        onNavigate={navigate}
        onLogout={handleLogout}
        onUpgrade={startUpgrade}
        onChangePassword={handleChangePassword}
        onDowngrade={handleDowngrade}
      />
    );
  }

  if (view === "usage") {
    return (
      <UsageBillingPage
        user={user}
        account={account}
        accountError={accountError}
        plans={plans}
        jobs={jobs}
        message={message}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
    );
  }

  if (view === "plans") {
    return (
      <PlansPage
        user={user}
        account={account}
        plans={plans}
        message={message}
        onNavigate={navigate}
        onLogout={handleLogout}
        onUpgrade={startUpgrade}
      />
    );
  }

  if (view === "help") {
    return (
      <HelpPage
        user={user}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
    );
  }

  if (view === "payment") {
    return (
      <PaymentPage
        user={user}
        plans={plans}
        selectedPlanId={selectedPlanId}
        loading={loading}
        message={message}
        onNavigate={navigate}
        onLogout={handleLogout}
        onConfirm={handleConfirmPayment}
        onCancel={() => {
          setSelectedPlanId(null);
          setMessage("");
          setView(previousView); // go back to where user came from
        }}
      />
    );
  }

  if (view === "process") {
    return (
      <ProcessPage
        user={user}
        guestToken={guestToken}
        jobs={jobs}
        message={message}
        loading={loading}
        onNavigate={navigate}
        onLogout={handleLogout}
        onUpload={handleUpload}
      />
    );
  }

  if (view === "password") {
    return (
      <PasswordPage
        user={user}
        loading={loading}
        message={message}
        onNavigate={navigate}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
      />
    );
  }

  if (view === "guest") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center space-y-6">
            <div className="text-5xl">🎬</div>
            <h1 className="text-2xl font-bold text-white">Utilizare ca Guest</h1>
            <p className="text-gray-300 text-sm">
              Poți procesa până la <span className="font-semibold text-cyan-400">1 fișier pe zi</span> fără a crea un cont. 
              Sesiunea expira în 24 de ore.
            </p>
            <button
              onClick={handleGuestSession}
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-semibold hover:from-cyan-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Se încarcă..." : "✓ Pornește sesiune guest"}
            </button>
            <button
              onClick={() => navigate("dashboard")}
              className="w-full px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition-all duration-200"
            >
              ← Înapoi
            </button>
            {message && (
              <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  if (view === "admin") {
    return (
      <AdminPage
        user={user}
        onNavigate={navigate}
        onLogout={() => {
          handleLogout();
          navigate("dashboard");
        }}
      />
    );
  }

  return (
    <DashboardPage
      user={user}
      plans={plans}
      message={message}
      onNavigate={navigate}
      onUpgrade={startUpgrade}
    />
  );
}

export default App;
