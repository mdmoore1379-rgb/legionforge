const PACKS = [
  { id: "lead", name: "Lead Engine", monthly: 4900, buyer: "Owner-operator service firms", ships: "Inbound + outbound agents, CRM writeback, weekly pipeline." },
  { id: "q2c", name: "Quote-to-Cash", monthly: 6900, buyer: "Trades, field service, MSPs", ships: "Estimate, follow-up, invoice chase, collections agent." },
  { id: "support", name: "Support Desk", monthly: 5900, buyer: "SaaS, ecomm, MSPs", ships: "L1/L2 ticket agent, knowledge base, escalation rules." },
  { id: "recruit", name: "Recruiting Desk", monthly: 7900, buyer: "Agencies and growing SMBs", ships: "Source, screen, schedule, scorecard." },
  { id: "compliance", name: "Compliance Watch", monthly: 8900, buyer: "Healthcare and finance-lite SMBs", ships: "Policy monitor, evidence pack, monthly attestation." },
  { id: "content", name: "Content Factory", monthly: 4400, buyer: "Multi-location local brands", ships: "Weekly content, ads, review replies." },
  { id: "ops", name: "Ops Copilot", monthly: 12900, buyer: "$5–30M companies", ships: "Meetings → tasks → owner chase → exec dashboard." },
  { id: "bundle", name: "Vertical Bundle", monthly: 19900, buyer: "Operators who want two packs + memory", ships: "Two packs, shared memory, named CS." }
];
function money(n) { return "$" + n.toLocaleString("en-US"); }
function renderPackGrid() {
  const el = document.getElementById("pack-grid");
  if (!el) return;
  el.innerHTML = PACKS.map(p => `
    <article class="pack">
      <h3>${p.name}</h3>
      <div class="price">${money(p.monthly)}/mo · ${money(p.monthly * 12)} ACV</div>
      <p>${p.buyer}</p>
      <p>${p.ships}</p>
      <a class="btn btn-sm" href="/configure.html?pack=${p.id}">Select</a>
    </article>
  `).join("");
}
function renderConfigurator() {
  const grid = document.getElementById("config-packs");
  if (!grid) return;
  const params = new URLSearchParams(location.search);
  const pre = params.get("pack");
  grid.innerHTML = PACKS.map(p => `
    <article class="pack ${pre === p.id ? "selected" : ""}" data-id="${p.id}">
      <h3>${p.name}</h3>
      <div class="price">${money(p.monthly)}/mo</div>
      <p>${p.ships}</p>
      <button class="btn btn-sm btn-ghost" type="button" data-id="${p.id}">${pre === p.id ? "Selected" : "Add"}</button>
    </article>
  `).join("");
  const selected = new Set(pre ? [pre] : []);
  const update = () => {
    [...grid.querySelectorAll(".pack")].forEach(card => {
      const on = selected.has(card.dataset.id);
      card.classList.toggle("selected", on);
      card.querySelector("button").textContent = on ? "Selected" : "Add";
    });
    const items = PACKS.filter(p => selected.has(p.id));
    const monthly = items.reduce((s, p) => s + p.monthly, 0);
    document.getElementById("sum-packs").textContent = items.length ? items.map(p => p.name).join(", ") : "None";
    document.getElementById("sum-month").textContent = money(monthly);
    document.getElementById("sum-year").textContent = money(monthly * 12);
    document.getElementById("sum-clock").textContent = items.length ? "14 days from connect" : "Pick a pack";
    window.__config = { packs: items.map(p => p.id), monthly };
  };
  grid.addEventListener("click", e => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    update();
  });
  update();
  document.getElementById("lead-form").addEventListener("submit", async e => {
    e.preventDefault();
    const status = document.getElementById("form-status");
    const fd = new FormData(e.target);
    const payload = {
      name: fd.get("name"), email: fd.get("email"), company: fd.get("company"),
      stack: fd.get("stack"), employees: fd.get("employees"), ...window.__config
    };
    if (!payload.packs || !payload.packs.length) {
      status.className = "err"; status.textContent = "Pick at least one pack."; return;
    }
    status.textContent = "Sending…";
    try {
      const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      status.className = "ok";
      status.textContent = "Clock started. Ref " + data.id;
      e.target.reset();
    } catch (err) {
      status.className = "err";
      status.textContent = "Email start@legionforge.ai with this config: " + JSON.stringify(payload);
    }
  });
}
document.addEventListener("DOMContentLoaded", () => { renderPackGrid(); renderConfigurator(); });
