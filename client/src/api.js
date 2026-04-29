const BASE = import.meta.env.VITE_API_URL || "";

export async function fetchLatest() {
  const r = await fetch(`${BASE}/api/latest`);
  return r.json();
}

export async function saveBill(data) {
  const r = await fetch(`${BASE}/api/bills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function fetchAllBills() {
  const r = await fetch(`${BASE}/api/bills`);
  return r.json();
}

export async function updateLatestReadings(updates) {
  const r = await fetch(`${BASE}/api/latest`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return r.json();
}
