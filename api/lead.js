const leads = globalThis.__leads || (globalThis.__leads = []);
export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const email = String(body.email || "").trim();
  const packs = Array.isArray(body.packs) ? body.packs : [];
  if (!email || !packs.length) return res.status(400).json({ error: "email and at least one pack required" });
  const id = "LF-" + Date.now().toString(36).toUpperCase();
  const lead = { id, receivedAt: new Date().toISOString(), name: String(body.name || "").slice(0,120), email, company: String(body.company || "").slice(0,160), employees: String(body.employees || ""), stack: String(body.stack || "").slice(0,200), packs, monthly: Number(body.monthly || 0) };
  leads.push(lead);
  if (leads.length > 200) leads.shift();
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ ok: true, id, message: "Day 0 started.", next: ["Connect email / CRM / phone", "Days 2-4 dry-run", "Day 14 invoice if live"], lead });
}
