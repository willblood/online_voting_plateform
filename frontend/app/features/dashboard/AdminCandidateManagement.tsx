import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import AdminSidebar from "./AdminSidebar.js";

interface Props {
  user: { email: string; role: string };
  electionId: string;
}

interface Party { id: string; name: string; acronym: string; }

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  photo_url?: string;
  biography?: string;
  party?: { id: string; name: string; acronym: string } | null;
}

interface ElectionDetail {
  id: string;
  title: string;
  type: string;
  status: string;
  candidates: Candidate[];
}

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  BROUILLON: { label: "Brouillon",  bg: "#ebe8e3", color: "#535f74" },
  OUVERT:    { label: "Ouvert",     bg: "#fff3cd", color: "#7a5c00" },
  EN_COURS:  { label: "En cours",   bg: "#80fc98", color: "#007432" },
  CLOS:      { label: "Clos",       bg: "#ffdad6", color: "#ba1a1a" },
  PUBLIE:    { label: "Publié",     bg: "#eff6ff", color: "#1d4ed8" },
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
function token() { return localStorage.getItem("voti_token") ?? ""; }
function authHeaders() { return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }; }

// ── Add Candidate Modal ────────────────────────────────────────────────────────
interface AddCandidateModalProps { electionId: string; parties: Party[]; onClose: () => void; onSuccess: () => void; }

function AddCandidateModal({ electionId, parties, onClose, onSuccess }: AddCandidateModalProps) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", party_id: "",
    photo_url: "", biography: "", program_url: "",
    nationality_verified: false, criminal_record_clear: false, age_verified: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        first_name: form.first_name.trim(), last_name: form.last_name.trim(),
        nationality_verified: form.nationality_verified,
        criminal_record_clear: form.criminal_record_clear,
        age_verified: form.age_verified,
      };
      if (form.party_id) body.party_id = form.party_id;
      if (form.photo_url.trim()) body.photo_url = form.photo_url.trim();
      if (form.biography.trim()) body.biography = form.biography.trim();
      if (form.program_url.trim()) body.program_url = form.program_url.trim();

      const res = await fetch(`${API}/elections/${electionId}/candidates`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(body),
      });
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
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#954a00", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>Nouveau Candidat</p>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#1c1c19", margin: "4px 0 0" }}>Ajouter un candidat</h2>
          </div>
          <button onClick={onClose} style={{ background: "#f6f3ee", border: "none", borderRadius: "12px", padding: "10px", cursor: "pointer" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#535f74" }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && <div style={{ padding: "12px 16px", background: "#ffdad6", borderRadius: "12px", color: "#ba1a1a", fontSize: "0.875rem", fontWeight: 600 }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Prénom *</label>
              <input required value={form.first_name} onChange={e => set("first_name", e.target.value)} style={inputStyle} placeholder="Prénom" />
            </div>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input required value={form.last_name} onChange={e => set("last_name", e.target.value)} style={inputStyle} placeholder="Nom" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Parti politique</label>
            <select value={form.party_id} onChange={e => set("party_id", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
              <option value="">Aucun parti (indépendant)</option>
              {parties.map(p => <option key={p.id} value={p.id}>{p.acronym} — {p.name}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>URL Photo</label>
            <input value={form.photo_url} onChange={e => set("photo_url", e.target.value)} style={inputStyle} placeholder="https://…" />
          </div>

          <div>
            <label style={labelStyle}>Biographie</label>
            <textarea value={form.biography} onChange={e => set("biography", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Courte biographie…" />
          </div>

          <div>
            <label style={labelStyle}>URL Programme</label>
            <input value={form.program_url} onChange={e => set("program_url", e.target.value)} style={inputStyle} placeholder="https://…" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Vérifications</label>
            {([
              { field: "nationality_verified", label: "Nationalité vérifiée" },
              { field: "criminal_record_clear", label: "Casier judiciaire vierge" },
              { field: "age_verified", label: "Âge légal vérifié" },
            ] as { field: keyof typeof form; label: string }[]).map(item => (
              <label key={item.field} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, color: "#1c1c19" }}>
                <input
                  type="checkbox" checked={form[item.field] as boolean}
                  onChange={e => set(item.field, e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#f77f00", cursor: "pointer" }}
                />
                {item.label}
              </label>
            ))}
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
            {loading ? "Ajout…" : (<><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_add</span>Ajouter le candidat</>)}
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminCandidateManagement({ user, electionId }: Props) {
  const location = useLocation();
  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [elRes, partyRes] = await Promise.all([
        fetch(`${API}/elections/${electionId}`, { headers: authHeaders() }),
        fetch(`${API}/parties`),
      ]);
      if (!elRes.ok) throw new Error("Impossible de charger les détails de l'élection.");
      setElection(await elRes.json());
      if (partyRes.ok) setParties(await partyRes.json());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 4000); }

  async function removeCandidate(candidateId: string) {
    try {
      const res = await fetch(`${API}/elections/${electionId}/candidates/${candidateId}`, {
        method: "DELETE", headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204) throw new Error("Erreur lors de la suppression");
      showToast("Candidat supprimé");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur");
    } finally {
      setConfirmDelete(null);
    }
  }

  const canEdit = election?.status === "BROUILLON";
  const statusMeta = election ? (STATUS_META[election.status] ?? { label: election.status, bg: "#ebe8e3", color: "#535f74" }) : null;

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <AdminSidebar user={user} activePath={location.pathname} />

      {showAdd && election && (
        <AddCandidateModal
          electionId={electionId} parties={parties}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); showToast("Candidat ajouté"); load(); }}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 200, padding: "14px 20px", background: "#1c1c19", color: "#ffffff", borderRadius: "12px", fontWeight: 600, fontSize: "0.875rem", boxShadow: "0 12px 32px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="material-symbols-outlined" style={{ color: "#80fc98", fontSize: "20px" }}>check_circle</span>
          {toast}
        </div>
      )}

      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh", position: "relative" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2rem", fontSize: "0.875rem", color: "#535f74" }}>
          <Link to="/admin/elections" style={{ color: "#954a00", textDecoration: "none", fontWeight: 700 }}>Élections</Link>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
          <span style={{ fontWeight: 600, color: "#1c1c19" }}>{loading ? "…" : election?.title}</span>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
          <span>Candidats</span>
        </div>

        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
          <div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              {loading ? "Chargement…" : election?.title}
            </h2>
            {statusMeta && (
              <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 14px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, background: statusMeta.bg, color: statusMeta.color }}>
                {statusMeta.label}
              </span>
            )}
          </div>
          {canEdit && (
            <button
              onClick={() => setShowAdd(true)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 28px", background: "#f77f00", border: "none", borderRadius: "9999px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem", boxShadow: "0 8px 24px rgba(247,127,0,0.25)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>person_add</span>
              Ajouter un candidat
            </button>
          )}
        </header>

        {/* Info banner for non-brouillon */}
        {!canEdit && election && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "1rem 1.5rem", background: "#fff3cd", borderRadius: "16px", marginBottom: "2rem", fontSize: "0.875rem", color: "#7a5c00", fontWeight: 600 }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>info</span>
            Les candidats ne peuvent être modifiés qu'en phase Brouillon.
          </div>
        )}

        {/* Candidates grid */}
        {loadError && (
          <div style={{ padding: "1rem 1.5rem", background: "#ffdad6", borderRadius: "16px", color: "#ba1a1a", fontWeight: 600, marginBottom: "1.5rem" }}>{loadError}</div>
        )}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#535f74" }}>Chargement…</div>
        ) : election?.candidates.length === 0 ? (
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "4rem", textAlign: "center", boxShadow: "0 12px 32px rgba(10,22,40,0.06)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "1rem", color: "#ebe8e3" }}>person_off</span>
            <p style={{ color: "#535f74", fontWeight: 600 }}>
              {canEdit ? "Aucun candidat. Cliquez sur 'Ajouter un candidat'." : "Aucun candidat enregistré."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {election?.candidates.map(c => (
              <div key={c.id} style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #954a00, #f77f00)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, color: "#1c1c19", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.first_name} {c.last_name}
                    </p>
                    {c.party ? (
                      <p style={{ fontSize: "0.75rem", color: "#535f74", margin: "2px 0 0", fontWeight: 600 }}>
                        {c.party.acronym} — {c.party.name}
                      </p>
                    ) : (
                      <p style={{ fontSize: "0.75rem", color: "#95a0b8", margin: "2px 0 0" }}>Indépendant</p>
                    )}
                  </div>
                </div>

                {c.biography && (
                  <p style={{ fontSize: "0.8rem", color: "#535f74", margin: 0, lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {c.biography}
                  </p>
                )}

                {canEdit && (
                  <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f6f3ee", paddingTop: "0.75rem" }}>
                    {confirmDelete === c.id ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setConfirmDelete(null)} style={{ padding: "6px 14px", background: "#f6f3ee", border: "none", borderRadius: "8px", color: "#535f74", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
                          Annuler
                        </button>
                        <button onClick={() => removeCandidate(c.id)} style={{ padding: "6px 14px", background: "#ba1a1a", border: "none", borderRadius: "8px", color: "#ffffff", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
                          Confirmer
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(c.id)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "transparent", border: "1px solid #ffdad6", borderRadius: "8px", color: "#ba1a1a", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>delete_forever</span>
                        Supprimer
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
