// src/api/client.js
const API_BASE = "http://localhost:5222/api";

async function handleJsonResponse(res, defaultError) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || defaultError);
  }
  if (res.status === 204) return null;
  return await res.json();
}

export async function getPlans() {
  const res = await fetch(`${API_BASE}/plans`);
  return handleJsonResponse(res, "Nu am putut încărca planurile.");
}

export async function register(email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleJsonResponse(res, "Eroare la înregistrare.");
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleJsonResponse(res, "Eroare la autentificare.");
}

export async function createGuestSession() {
  const res = await fetch(`${API_BASE}/auth/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handleJsonResponse(res, "Eroare la creare sesiune guest.");
}

export async function getAccountSummary(userId) {
  const res = await fetch(`${API_BASE}/account/summary?userId=${userId}`);
  return handleJsonResponse(res, "Nu am putut încărca datele contului.");
}

export async function changePassword(userId, currentPassword, newPassword) {
  const res = await fetch(`${API_BASE}/account/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, currentPassword, newPassword }),
  });
  return handleJsonResponse(res, "Nu s-a putut schimba parola.");
}

export async function downgradeToStandard(userId) {
  const res = await fetch(`${API_BASE}/account/downgrade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return handleJsonResponse(res, "Nu am putut reveni la Standard.");
}

export async function checkoutPlan(userId, planId, payment) {
  const res = await fetch(`${API_BASE}/billing/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      planId,
      fullName: payment.fullName,
      cardNumber: payment.cardNumber,
      expiry: payment.expiry,
      cvv: payment.cvv,
    }),
  });
  return handleJsonResponse(res, "Nu am putut face upgrade-ul.");
}

export async function getJobs(userId) {
  const res = await fetch(`${API_BASE}/jobs?userId=${userId}`);
  return handleJsonResponse(res, "Nu am putut încărca joburile.");
}

export async function uploadJob(userIdOrGuestToken, file) {
  const formData = new FormData();
  formData.append("file", file);

  // Check if it's a guest token (string) or user ID (number)
  const isGuest = typeof userIdOrGuestToken === "string";
  const queryParam = isGuest 
    ? `guestToken=${userIdOrGuestToken}`
    : `userId=${userIdOrGuestToken}`;

  const res = await fetch(`${API_BASE}/jobs/upload?${queryParam}`, {
    method: "POST",
    body: formData,
  });

  return handleJsonResponse(res, "Nu am putut procesa fișierul.");
}

// Admin functions - Users
export async function getUsers(userId) {
  const res = await fetch(`${API_BASE}/admin/users?userId=${userId}`);
  return handleJsonResponse(res, "Nu am putut încărca utilizatorii.");
}

export async function createUser(userId, email, password, role = "User") {
  const res = await fetch(`${API_BASE}/admin/users?userId=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  return handleJsonResponse(res, "Nu am putut crea utilizatorul.");
}

export async function updateUser(userId, id, email, password, role) {
  const res = await fetch(`${API_BASE}/admin/users/${id}?userId=${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  return handleJsonResponse(res, "Nu am putut actualiza utilizatorul.");
}

export async function deleteUser(userId, id) {
  const res = await fetch(`${API_BASE}/admin/users/${id}?userId=${userId}`, {
    method: "DELETE",
  });
  return handleJsonResponse(res, "Nu am putut șterge utilizatorul.");
}

// Admin functions - Guest Identities
export async function getGuestIdentities(userId) {
  const res = await fetch(`${API_BASE}/admin/guest-identities?userId=${userId}`);
  return handleJsonResponse(res, "Nu am putut încărca guest identities.");
}

export async function deleteGuestIdentity(userId, id) {
  const res = await fetch(`${API_BASE}/admin/guest-identities/${id}?userId=${userId}`, {
    method: "DELETE",
  });
  return handleJsonResponse(res, "Nu am putut șterge guest identity.");
}

// Admin functions - Audio Jobs
export async function getAudioJobs(userId) {
  const res = await fetch(`${API_BASE}/admin/audio-jobs?userId=${userId}`);
  return handleJsonResponse(res, "Nu am putut încărca joburile audio.");
}

export async function deleteAudioJob(userId, id) {
  const res = await fetch(`${API_BASE}/admin/audio-jobs/${id}?userId=${userId}`, {
    method: "DELETE",
  });
  return handleJsonResponse(res, "Nu am putut șterge jobul audio.");
}

// Admin functions - SQL Executor
export async function executeSql(userId, sql) {
  const res = await fetch(`${API_BASE}/admin/execute-sql?userId=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  return handleJsonResponse(res, "Eroare la executarea SQL.");
}

export async function recreateGuestTable(userId) {
  const res = await fetch(`${API_BASE}/admin/recreate-guest-table?userId=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handleJsonResponse(res, "Nu am putut recrea tabelul.");
}
