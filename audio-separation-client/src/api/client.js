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

export async function uploadJob(userId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/jobs/upload?userId=${userId}`, {
    method: "POST",
    body: formData,
  });

  return handleJsonResponse(res, "Nu am putut procesa fișierul.");
}
