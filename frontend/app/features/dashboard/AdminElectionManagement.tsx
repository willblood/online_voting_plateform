import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import AdminSidebar from "./AdminSidebar.js";

interface Props {
  user: { email: string; role: string };
}

interface ScopeItem { id: string; name: string; }

interface Election {
  id: string;
  title: string;
  type: string;
  status: string;
  geographic_scope: string;
  start_time: string;
  end_time: string;
  _count: { candidates: number; votes: number };
}

const TYPE_LABELS: Record<string, string> = {
  PRESIDENTIELLE: "Présidentielle",
  LEGISLATIVES: "Législatives",
  REGIONALES: "Régionales",
  MUNICIPALES: "Municipales",
  REFERENDUM: "Référendum",
};

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  BROUILLON: { label: "Brouillon",  bg: "#ebe8e3", color: "#535f74" },
  OUVERT:    { label: "Ouvert",     bg: "#fff3cd", color: "#7a5c00" },
  EN_COURS:  { label: "En cours",   bg: "#80fc98", color: "#007432" },
  CLOS:      { label: "Clos",       bg: "#ffdad6", color: "#ba1a1a" },
  PUBLIE:    { label: "Publié",     bg: "#eff6ff", color: "#1d4ed8" },
};

const STATUS_NEXT: Record<string, { next: string; label: string }> = {
  BROUILLON: { next: "OUVERT",   label: "Ouvrir" },
  OUVERT:    { next: "EN_COURS", label: "Démarrer" },
  EN_COURS:  { next: "CLOS",    label: "Clôturer" },
  CLOS:      { next: "PUBLIE",  label: "Publier" },
};

const SCOPE_LABELS: Record<string, string> = {
  NATIONAL: "National", REGIONAL: "Régional",
  DEPARTEMENTAL: "Départemental", COMMUNAL: "Communal",
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
function token() { return localStorage.getItem("voti_token") ?? ""; }
function authHeaders() { return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }; }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Create Election Modal ─────────────────────────────────────────────────────
interface CreateElectionModalProps { onClose: () => void; onSuccess: () => void; }

function CreateElectionModal({ onClose, onSuccess }: CreateElectionModalProps) {
  const [form, setForm] = useState({
    title: "", type: "PRESIDENTIELLE", description: "",
    geographic_scope: "NATIONAL", scope_region_id: "", scope_departement_id: "", scope_commune_id: "",
    start_time: "", end_time: "", round: "1",
  });
  const [regions, setRegions] = useState<ScopeItem[]>([]);
  const [depts, setDepts] = useState<ScopeItem[]>([]);
  const [communes, setCommunes] = useState<ScopeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (form.geographic_scope === "REGIONAL" && regions.length === 0) {
      fetch(`${API}/geography/regions`, { headers: authHeaders() }).then(r => r.json()).then(setRegions).catch(() => {});
    }
    if (form.geographic_scope === "DEPARTEMENTAL" && depts.length === 0) {
      fetch(`${API}/geography/departements`, { headers: authHeaders() }).then(r => r.json()).then(setDepts).catch(() => {});
    }
    if (form.geographic_scope === "COMMUNAL" && communes.length === 0) {
      fetch(`${API}/geography/communes`, { headers: authHeaders() }).then(r => r.json()).then(setCommunes).catch(() => {});
    }
  }, [form.geographic_scope]);

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const start = new Date(form.start_time);
    const end = new Date(form.end_time);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError("Dates invalides.");
      return;
    }
    if (end <= start) {
      setError("La date de fin doit être postérieure à la date de début.");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title.trim(), type: form.type, description: form.description.trim() || undefined,
        geographic_scope: form.geographic_scope,
        start_time: start.toISOString(), end_time: end.toISOString(),
        round: parseInt(form.round, 10) || 1,
      };
      if (form.geographic_scope === "REGIONAL" && form.scope_region_id) body.scope_region_id = form.scope_region_id;
      if (form.geographic_scope === "DEPARTEMENTAL" && form.scope_departement_id) body.scope_departement_id = form.scope_departement_id;
      if (form.geographic_scope === "COMMUNAL" && form.scope_commune_id) body.scope_commune_id = form.scope_commune_id;

      const res = await fetch(`${API}/elections`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? "Erreur"); }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", background: "#f6f3ee", border: "none",
    borderRadius: "12px", color: "#1c1c19", fontFamily: "Manrope, sans-serif",
    fontSize: "0.875rem", fontWeight: 600, outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#535f74",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px",
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }} />
      <aside style={{ position: "fixed", top: 0, right: 0, width: "560px", height: "100vh", background: "#ffffff", zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-12px 0 48px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "2rem", borderBottom: "1px solid #ebe8e3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#954a00", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>Nouvelle Élection</p>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#1c1c19", margin: "4px 0 0" }}>Créer une élection</h2>
          </div>
          <button onClick={onClose} style={{ background: "#f6f3ee", border: "none", borderRadius: "12px", padding: "10px", cursor: "pointer" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#535f74" }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && (
            <div style={{ padding: "12px 16px", background: "#ffdad6", borderRadius: "12px", color: "#ba1a1a", fontSize: "0.875rem", fontWeight: 600 }}>
              {error}
            </div>
          )}

          <div>
            <label style={labelStyle}>Titre de l'élection *</label>
            <input required value={form.title} onChange={e => set("title", e.target.value)} style={inputStyle} placeholder="ex: Élections Présidentielles 2025" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Type *</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tour</label>
              <input type="number" min="1" max="3" value={form.round} onChange={e => set("round", e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Portée géographique *</label>
            <select value={form.geographic_scope} onChange={e => { set("geographic_scope", e.target.value); set("scope_region_id", ""); set("scope_departement_id", ""); set("scope_commune_id", ""); }} style={{ ...inputStyle, appearance: "none" }}>
              {Object.entries(SCOPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          {form.geographic_scope === "REGIONAL" && (
            <div>
              <label style={labelStyle}>Région *</label>
              <select required value={form.scope_region_id} onChange={e => set("scope_region_id", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Sélectionner une région</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          )}
          {form.geographic_scope === "DEPARTEMENTAL" && (
            <div>
              <label style={labelStyle}>Département *</label>
              <select required value={form.scope_departement_id} onChange={e => set("scope_departement_id", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Sélectionner un département</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}
          {form.geographic_scope === "COMMUNAL" && (
            <div>
              <label style={labelStyle}>Commune *</label>
              <select required value={form.scope_commune_id} onChange={e => set("scope_commune_id", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Sélectionner une commune</option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Début *</label>
              <input required type="datetime-local" value={form.start_time} onChange={e => set("start_time", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fin *</label>
              <input required type="datetime-local" value={form.end_time} onChange={e => set("end_time", e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Description facultative..." />
          </div>
        </form>

        <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid #ebe8e3", display: "flex", gap: "12px" }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: "14px", background: "#f6f3ee", border: "none", borderRadius: "12px", color: "#535f74", fontFamily: "Manrope, sans-serif", fontWeight: 700, cursor: "pointer" }}>
            Annuler
          </button>
          <button
            type="submit" disabled={loading}
            onClick={(e) => { const form = (e.currentTarget.closest("aside") as HTMLElement)?.querySelector("form") as HTMLFormElement; form?.requestSubmit(); }}
            style={{ flex: 2, padding: "14px", background: loading ? "#ccc" : "#f77f00", border: "none", borderRadius: "12px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? "Création..." : (<><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>Créer l'élection</>)}
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminElectionManagement({ user }: Props) {
  const location = useLocation();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");
  const [advancing, setAdvancing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`${API}/elections`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Impossible de charger les élections.");
      setElections(await res.json());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 4000); }

  async function advanceStatus(el: Election) {
    const info = STATUS_NEXT[el.status];
    if (!info) return;
    if (!confirm(`Passer "${el.title}" à l'état "${info.label}" ?`)) return;
    setAdvancing(el.id);
    try {
      const res = await fetch(`${API}/elections/${el.id}/status`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status: info.next }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? "Erreur"); }
      showToast(`Élection passée à "${STATUS_META[info.next].label}"`);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur");
    } finally {
      setAdvancing(null);
    }
  }

  const total = elections.length;
  const enCours = elections.filter(e => e.status === "EN_COURS").length;
  const brouillon = elections.filter(e => e.status === "BROUILLON").length;

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <AdminSidebar user={user} activePath={location.pathname} />

      {showCreate && (
        <CreateElectionModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); showToast("Élection créée avec succès"); load(); }} />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 200, padding: "14px 20px", background: "#1c1c19", color: "#ffffff", borderRadius: "12px", fontWeight: 600, fontSize: "0.875rem", boxShadow: "0 12px 32px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="material-symbols-outlined" style={{ color: "#80fc98", fontSize: "20px" }}>check_circle</span>
          {toast}
        </div>
      )}

      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh", position: "relative" }}>
        <svg style={{ position: "absolute", top: "-5%", right: "-3%", width: "380px", height: "380px", opacity: 0.06, color: "#954a00", pointerEvents: "none" }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,77.3,-44.7C85.4,-31.3,90.5,-15.7,89.2,-0.8C87.8,14.2,80,28.4,70.1,40.4C60.2,52.4,48.2,62.2,34.7,69.5C21.2,76.8,6.2,81.6,-9.3,80.1C-24.8,78.6,-40.8,70.8,-54.3,60.1C-67.8,49.4,-78.8,35.8,-83.4,20.4C-88,5.1,-86.2,-12.1,-79.6,-27.2C-73,-42.3,-61.6,-55.3,-48.2,-62.5C-34.8,-69.7,-17.4,-71.1,-0.8,-69.7C15.8,-68.3,31.3,-64,44.7,-76.4Z" fill="currentColor" transform="translate(100 100)" />
        </svg>

        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", position: "relative", zIndex: 10 }}>
          <div>
            <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#954a00", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
              Administration Centrale
            </span>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2.25rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Gestion des Élections
            </h2>
            <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>Créez et gérez le cycle de vie des élections.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 28px", background: "#f77f00", border: "none", borderRadius: "9999px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem", boxShadow: "0 8px 24px rgba(247,127,0,0.25)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
            Nouvelle Élection
          </button>
        </header>

        {/* Stats */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          {[
            { label: "Total élections", value: total, icon: "ballot", bg: "#fff7ed", iconColor: "#954a00" },
            { label: "En cours", value: enCours, icon: "play_circle", bg: "#f0fdf4", iconColor: "#006e2e" },
            { label: "Brouillons", value: brouillon, icon: "draft", bg: "#f1f5f9", iconColor: "#535f74" },
          ].map(card => (
            <div key={card.label} style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px", color: card.iconColor }}>{card.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>{card.label}</p>
                <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#1c1c19", margin: 0, lineHeight: 1 }}>{loading ? "…" : card.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Table */}
        <section style={{ position: "relative", zIndex: 10 }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 12px 32px rgba(10,22,40,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #ebe8e3" }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.125rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>
                Toutes les élections
              </h3>
            </div>

            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#535f74" }}>Chargement…</div>
            ) : loadError ? (
              <div style={{ padding: "2rem", color: "#ba1a1a", background: "#ffdad6", margin: "1.5rem", borderRadius: "12px", fontWeight: 600 }}>{loadError}</div>
            ) : elections.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#535f74" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "1rem", color: "#ebe8e3" }}>ballot</span>
                Aucune élection. Cliquez sur "Nouvelle Élection" pour commencer.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f6f3ee" }}>
                      {["Titre", "Type", "Portée", "Statut", "Dates", "Candidats", "Actions"].map((h, i) => (
                        <th key={h} style={{ padding: "1rem 1.5rem", fontSize: "0.65rem", fontWeight: 800, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: i >= 5 ? "center" : "left", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {elections.map(el => <ElectionRow key={el.id} el={el} onAdvance={advanceStatus} advancing={advancing === el.id} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function ElectionRow({ el, onAdvance, advancing }: { el: Election; onAdvance: (el: Election) => void; advancing: boolean }) {
  const [hovered, setHovered] = useState(false);
  const meta = STATUS_META[el.status] ?? { label: el.status, bg: "#ebe8e3", color: "#535f74" };
  const nextInfo = STATUS_NEXT[el.status];

  return (
    <tr
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ borderBottom: "1px solid #ebe8e3", background: hovered ? "rgba(246,243,238,0.5)" : "transparent", transition: "background 0.15s" }}
    >
      <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: "#1c1c19", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {el.title}
      </td>
      <td style={{ padding: "1rem 1.5rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#954a00", background: "#fff7ed", padding: "3px 10px", borderRadius: "9999px" }}>
          {TYPE_LABELS[el.type] ?? el.type}
        </span>
      </td>
      <td style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", color: "#535f74", fontWeight: 600 }}>
        {SCOPE_LABELS[el.geographic_scope] ?? el.geographic_scope}
      </td>
      <td style={{ padding: "1rem 1.5rem" }}>
        <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </td>
      <td style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", color: "#535f74", whiteSpace: "nowrap" }}>
        {fmtDate(el.start_time)} → {fmtDate(el.end_time)}
      </td>
      <td style={{ padding: "1rem 1.5rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 700, color: "#1c1c19" }}>
        {el._count.candidates}
      </td>
      <td style={{ padding: "1rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <Link
            to={`/admin/elections/${el.id}/candidates`}
            title="Gérer les candidats"
            style={{ padding: "8px", background: "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: "#535f74", display: "flex", alignItems: "center", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#ebe8e3"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>people</span>
          </Link>
          {nextInfo && (
            <button
              onClick={() => onAdvance(el)} disabled={advancing}
              title={nextInfo.label}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: advancing ? "#f6f3ee" : "#1c1c19", border: "none", borderRadius: "9999px", color: advancing ? "#535f74" : "#fcf9f4", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: advancing ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>arrow_forward</span>
              {advancing ? "…" : nextInfo.label}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
