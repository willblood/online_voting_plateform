import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import AdminSidebar from "./AdminSidebar.js";

interface Props {
  user: { email: string; role: string };
  electionId: string;
}

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  party?: { name: string; acronym: string } | null;
  photo_url?: string | null;
}

interface Election {
  id: string;
  title: string;
  type: string;
  status: string;
  geographic_scope: string;
  start_time: string;
  end_time: string;
  description?: string | null;
  candidates: Candidate[];
  _count: { votes: number };
}

const TYPE_LABELS: Record<string, string> = {
  PRESIDENTIELLE: "Présidentielle", LEGISLATIVES: "Législatives",
  REGIONALES: "Régionales", MUNICIPALES: "Municipales", REFERENDUM: "Référendum",
};

const SCOPE_LABELS: Record<string, string> = {
  NATIONAL: "National", REGIONAL: "Régional",
  DEPARTEMENTAL: "Départemental", COMMUNAL: "Communal",
};

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  BROUILLON: { label: "Brouillon", bg: "#ebe8e3", color: "#535f74" },
  OUVERT:    { label: "Ouvert",    bg: "#fff3cd", color: "#7a5c00" },
  EN_COURS:  { label: "En cours",  bg: "#80fc98", color: "#007432" },
  CLOS:      { label: "Clos",      bg: "#ffdad6", color: "#ba1a1a" },
  PUBLIE:    { label: "Publié",    bg: "#eff6ff", color: "#1d4ed8" },
};

const STATUS_ORDER = ["BROUILLON", "OUVERT", "EN_COURS", "CLOS", "PUBLIE"];
const STATUS_NEXT: Record<string, { next: string; label: string }> = {
  BROUILLON: { next: "OUVERT",   label: "Ouvrir" },
  OUVERT:    { next: "EN_COURS", label: "Démarrer" },
  EN_COURS:  { next: "CLOS",    label: "Clôturer" },
  CLOS:      { next: "PUBLIE",  label: "Publier" },
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
function token() { return localStorage.getItem("voti_token") ?? ""; }
function authHeaders() { return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }; }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

// ── Lifecycle Stepper ─────────────────────────────────────────────────────────

function LifecycleStepper({ status, onAdvance, advancing }: {
  status: string;
  onAdvance: () => void;
  advancing: boolean;
}) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  const nextInfo = STATUS_NEXT[status];

  return (
    <div style={{ background: "#ffffff", borderRadius: "20px", padding: "2rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
            Cycle de Vie
          </p>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.125rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>
            Statut de l'Élection
          </h3>
        </div>
        {nextInfo && (
          <button
            onClick={onAdvance}
            disabled={advancing}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 24px", background: advancing ? "#ebe8e3" : "#f77f00",
              border: "none", borderRadius: "9999px",
              color: advancing ? "#535f74" : "#ffffff",
              fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.875rem",
              cursor: advancing ? "not-allowed" : "pointer",
              boxShadow: advancing ? "none" : "0 8px 24px rgba(247,127,0,0.25)",
              transition: "background 0.15s",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              {status === "CLOS" ? "verified" : "arrow_forward"}
            </span>
            {advancing ? "En cours…" : nextInfo.label}
          </button>
        )}
      </div>

      {/* Status nodes */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {STATUS_ORDER.map((s, idx) => {
          const isPast = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const meta = STATUS_META[s];
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: idx < STATUS_ORDER.length - 1 ? "1" : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: isCurrent ? "#f77f00" : isPast ? "#006e2e" : "#ebe8e3",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isCurrent ? "0 0 0 4px rgba(247,127,0,0.2)" : "none",
                  transition: "background 0.3s",
                }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize: "18px",
                    color: isCurrent ? "#ffffff" : isPast ? "#ffffff" : "#94a3b8",
                  }}>
                    {isPast ? "check" : isCurrent ? "radio_button_checked" : "radio_button_unchecked"}
                  </span>
                </div>
                <span style={{
                  marginTop: "6px", fontSize: "0.65rem", fontWeight: 700,
                  color: isCurrent ? "#f77f00" : isPast ? "#006e2e" : "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
                }}>
                  {meta.label}
                </span>
              </div>
              {idx < STATUS_ORDER.length - 1 && (
                <div style={{
                  flex: 1, height: "3px", margin: "0 4px",
                  background: idx < currentIdx ? "#006e2e" : "#ebe8e3",
                  borderRadius: "2px", marginBottom: "20px",
                  transition: "background 0.3s",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminElectionDetail({ user, electionId }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [advancing, setAdvancing] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`${API}/elections/${electionId}`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Élection introuvable.");
      setElection(await res.json());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 4000); }

  async function handleAdvance() {
    if (!election) return;
    const info = STATUS_NEXT[election.status];
    if (!info) return;
    if (!confirm(`Passer l'élection à l'état "${info.label}" ?`)) return;
    setAdvancing(true);
    try {
      const res = await fetch(`${API}/elections/${electionId}/status`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status: info.next }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? "Erreur"); }
      showToast(`Élection passée à "${STATUS_META[info.next].label}"`);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erreur");
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <AdminSidebar user={user} activePath={location.pathname} />

      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 200, padding: "14px 20px", background: "#1c1c19", color: "#ffffff", borderRadius: "12px", fontWeight: 600, fontSize: "0.875rem", boxShadow: "0 12px 32px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="material-symbols-outlined" style={{ color: "#80fc98", fontSize: "20px" }}>check_circle</span>
          {toast}
        </div>
      )}

      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh" }}>
        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>
          <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}>Dashboard</Link>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
          <Link to="/dashboard/elections" style={{ color: "#94a3b8", textDecoration: "none" }}>Élections</Link>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
          <span style={{ color: "#1c1c19", fontWeight: 600 }}>{election?.title ?? "…"}</span>
        </nav>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#535f74" }}>Chargement…</div>
        ) : loadError ? (
          <div style={{ padding: "1.5rem", background: "#ffdad6", borderRadius: "12px", color: "#ba1a1a", fontWeight: 600 }}>{loadError}</div>
        ) : election ? (
          <>
            {/* Header */}
            <header style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ padding: "3px 10px", background: "#fff7ed", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 800, color: "#954a00", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {TYPE_LABELS[election.type] ?? election.type}
                    </span>
                    <span style={{ padding: "3px 10px", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 800, background: STATUS_META[election.status]?.bg ?? "#ebe8e3", color: STATUS_META[election.status]?.color ?? "#535f74" }}>
                      {STATUS_META[election.status]?.label ?? election.status}
                    </span>
                  </div>
                  <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                    {election.title}
                  </h1>
                  <p style={{ color: "#535f74", margin: 0, fontSize: "0.875rem" }}>
                    {SCOPE_LABELS[election.geographic_scope] ?? election.geographic_scope} · {fmtDate(election.start_time)} → {fmtDate(election.end_time)}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                  <Link
                    to={`/dashboard/elections/${election.id}/results`}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#ffffff", border: "1px solid rgba(222,193,175,0.4)", borderRadius: "9999px", color: "#954a00", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>analytics</span>
                    Voir les résultats
                  </Link>
                </div>
              </div>
            </header>

            {/* Lifecycle stepper */}
            <LifecycleStepper status={election.status} onAdvance={handleAdvance} advancing={advancing} />

            {/* Stats bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
              {[
                { label: "Candidats", value: election.candidates.length, icon: "person", bg: "#fff7ed", iconColor: "#954a00" },
                { label: "Votes exprimés", value: election._count.votes, icon: "how_to_vote", bg: "#f0fdf4", iconColor: "#006e2e" },
                { label: "Portée", value: SCOPE_LABELS[election.geographic_scope] ?? election.geographic_scope, icon: "public", bg: "#f1f5f9", iconColor: "#535f74" },
              ].map(card => (
                <div key={card.label} style={{ background: "#ffffff", borderRadius: "16px", padding: "1.25rem 1.5rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "24px", color: card.iconColor }}>{card.icon}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{card.label}</p>
                    <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#1c1c19", margin: 0, lineHeight: 1 }}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Candidates section */}
            <section style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", overflow: "hidden" }}>
              <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #ebe8e3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.125rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>
                  Candidats ({election.candidates.length})
                </h3>
                <Link
                  to={`/dashboard/elections/${election.id}/candidates`}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", background: "#f77f00", border: "none", borderRadius: "9999px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>manage_accounts</span>
                  Gérer les candidats
                </Link>
              </div>
              {election.candidates.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "1rem", color: "#ebe8e3" }}>person_off</span>
                  Aucun candidat. {election.status === "BROUILLON" && "Cliquez sur « Gérer les candidats » pour en ajouter."}
                </div>
              ) : (
                <div style={{ padding: "1.5rem 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                  {election.candidates.map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#f6f3ee", borderRadius: "14px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #954a00, #f77f00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "0.875rem", flexShrink: 0 }}>
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <p style={{ fontWeight: 700, color: "#1c1c19", fontSize: "0.875rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.first_name} {c.last_name}
                        </p>
                        {c.party && (
                          <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: 0 }}>{c.party.acronym}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
