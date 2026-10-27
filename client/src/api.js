const BASE = import.meta.env.VITE_API_URL || "";

// Server se error aaye (500 etc.) to chupchap aage na badho, error throw karo
async function request(path, options) {
  const r = await fetch(`${BASE}${path}`, options);
  let data = null;
  try { data = await r.json(); } catch { /* empty body */ }
  if (!r.ok) throw new Error(data?.error || `Server error ${r.status}`);
  return data;
}

export function fetchLatest() {
  return request("/api/latest");
}

export function saveBill(data) {
  return request("/api/bills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function fetchAllBills() {
  return request("/api/bills");
}
