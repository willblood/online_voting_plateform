import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import AdminSidebar from "./AdminSidebar.js";

interface Props {
  user: { email: string; role: string };
}

interface Party {
  id: string;
  name: string;
  acronym: string;
  logo_url?: string;
  founded_year?: number;
  description?: string;
  _count: { candidates: number };
}

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
function token() { return localStorage.getItem("voti_token") ?? ""; }
function authHeaders() { return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }; }

// ── Create Party Modal ─────────────────────────────────────────────────────────
interface CreatePartyModalProps { onClose: () => void; onSuccess: () => void; }

function CreatePartyModal({ onClose, onSuccess }: CreatePartyModalProps) {
  const [form, setForm] = useState({
    name: "", acronym: "", logo_url: "", founded_year: "", description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    if (field === "acronym") value = value.toUpperCase();
    setForm(p => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = { name: form.name.trim(), acronym: form.acronym.trim() };
      if (form.logo_url.trim()) body.logo_url = form.logo_url.trim();
      if (form.founded_year) body.founded_year = parseInt(form.founded_year, 10);
      if (form.description.trim()) body.description = form.description.trim();

      const res = await fetch(`${API}/parties`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
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
      <aside style={{ position: "fixed", top: 0, right: 0, width: "520px", height: "100vh", background: "#ffffff", zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-12px 0 48px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "2rem", borderBottom: "1px solid #ebe8e3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#954a00", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>Nouveau Parti</p>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#1c1c19", margin: "4px 0 0" }}>Créer un parti politique</h2>
          </div>
          <button onClick={onClose} style={{ background: "#f6f3ee", border: "none", borderRadius: "12px", padding: "10px", cursor: "pointer" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#535f74" }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && <div style={{ padding: "12px 16px", background: "#ffdad6", borderRadius: "12px", color: "#ba1a1a", fontSize: "0.875rem", fontWeight: 600 }}>{error}</div>}

          <div>
            <label style={labelStyle}>Nom complet du parti *</label>
            <input required value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} placeholder="ex: Rassemblement des Houphouëtistes" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Acronyme *</label>
              <input required value={form.acronym} onChange={e => set("acronym", e.target.value)} style={inputStyle} placeholder="ex: RHDP" />
            </div>
            <div>
              <label style={labelStyle}>Année de fondation</label>
              <input type="number" min="1800" max={new Date().getFullYear()} value={form.founded_year} onChange={e => set("founded_year", e.target.value)} style={inputStyle} placeholder="ex: 1994" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>URL du logo</label>
            <input value={form.logo_url} onChange={e => set("logo_url", e.target.value)} style={inputStyle} placeholder="https://…" />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="Courte description du parti…" />
          </div>
        </form>

        <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid #ebe8e3", display: "flex", gap: "12px" }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: "14px", background: "#f6f3ee", border: "none", borderRadius: "12px", color: "#535f74", fontFamily: "Manrope, sans-serif", fontWeight: 700, cursor: "pointer" }}>
            Annuler
          </button>
          <button
            type="submit" disabled={loading}
            onClick={e => { const form = (e.currentTarget.closest("aside") as HTMLElement)?.querySelector("form") as HTMLFormElement; form?.requestSubmit(); }}
            style={{ flex: 2, padding: "14px", background: loading ? "#ccc" : "#f77f00", border: "none", borderRadius: "12px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? "Création…" : (<><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>Créer le parti</>)}
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminPartyManagement({ user }: Props) {
  const location = useLocation();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/parties`);
      if (res.ok) setParties(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 4000); }

  async function removeParty(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`${API}/parties/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok && res.status !== 204) { const d = await res.json(); throw new Error(d.message ?? "Erreur"); }
      showToast("Parti supprimé");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <AdminSidebar user={user} activePath={location.pathname} />

      {showCreate && (
        <CreatePartyModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); showToast("Parti créé avec succès"); load(); }} />
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
              Partis Politiques
            </h2>
            <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>Gérez les partis politiques enregistrés sur la plateforme.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 28px", background: "#f77f00", border: "none", borderRadius: "9999px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem", boxShadow: "0 8px 24px rgba(247,127,0,0.25)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
            Créer un parti
          </button>
        </header>

        {/* Stats */}
        <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem 2rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem", position: "relative", zIndex: 10 }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#954a00" }}>flag</span>
          </div>
          <div>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Total partis enregistrés</p>
            <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#1c1c19", margin: 0, lineHeight: 1 }}>{loading ? "…" : parties.length}</p>
          </div>
        </div>

        {/* Table */}
        <section style={{ position: "relative", zIndex: 10 }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 12px 32px rgba(10,22,40,0.06)", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#535f74" }}>Chargement…</div>
            ) : parties.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#535f74" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "1rem", color: "#ebe8e3" }}>flag</span>
                Aucun parti enregistré. Cliquez sur "Créer un parti" pour commencer.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f6f3ee" }}>
                      {["Acronyme", "Nom", "Fondé en", "Candidats", "Actions"].map((h, i) => (
                        <th key={h} style={{ padding: "1rem 1.5rem", fontSize: "0.65rem", fontWeight: 800, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: i >= 3 ? "center" : "left", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parties.map(party => (
                      <PartyRow
                        key={party.id} party={party}
                        isConfirming={confirmDelete === party.id}
                        isDeleting={deleting && confirmDelete === party.id}
                        onConfirm={() => setConfirmDelete(party.id)}
                        onCancel={() => setConfirmDelete(null)}
                        onDelete={() => removeParty(party.id)}
                      />
                    ))}
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

function PartyRow({ party, isConfirming, isDeleting, onConfirm, onCancel, onDelete }: {
  party: Party; isConfirming: boolean; isDeleting: boolean;
  onConfirm: () => void; onCancel: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hasCandidates = party._count.candidates > 0;

  return (
    <tr
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ borderBottom: "1px solid #ebe8e3", background: hovered ? "rgba(246,243,238,0.5)" : "transparent", transition: "background 0.15s" }}
    >
      <td style={{ padding: "1rem 1.5rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#954a00", background: "#fff7ed", padding: "4px 12px", borderRadius: "9999px" }}>
          {party.acronym}
        </span>
      </td>
      <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: "#1c1c19" }}>{party.name}</td>
      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#535f74", fontWeight: 600 }}>
        {party.founded_year ?? "—"}
      </td>
      <td style={{ padding: "1rem 1.5rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 700, color: "#1c1c19" }}>
        {party._count.candidates}
      </td>
      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
        {isConfirming ? (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
            <button onClick={onCancel} style={{ padding: "6px 14px", background: "#f6f3ee", border: "none", borderRadius: "8px", color: "#535f74", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
              Annuler
            </button>
            <button onClick={onDelete} disabled={isDeleting} style={{ padding: "6px 14px", background: "#ba1a1a", border: "none", borderRadius: "8px", color: "#ffffff", fontWeight: 700, fontSize: "0.75rem", cursor: isDeleting ? "not-allowed" : "pointer" }}>
              {isDeleting ? "…" : "Confirmer"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={hasCandidates ? undefined : onConfirm}
              disabled={hasCandidates}
              title={hasCandidates ? "Ce parti a des candidats et ne peut pas être supprimé" : "Supprimer"}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "transparent", border: `1px solid ${hasCandidates ? "#ebe8e3" : "#ffdad6"}`, borderRadius: "8px", color: hasCandidates ? "#94a3b8" : "#ba1a1a", fontWeight: 700, fontSize: "0.75rem", cursor: hasCandidates ? "not-allowed" : "pointer" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>delete</span>
              Supprimer
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
