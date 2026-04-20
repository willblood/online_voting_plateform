import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import AdminSidebar from "./AdminSidebar.js";

interface Props {
  user: { email: string; role: string };
  electionId: string;
}

interface ResultRow {
  id: string;
  scope: string;
  scope_id: string | null;
  votes_count: number;
  registered_voters: number;
  turnout_percentage: string;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    party: { name: string; acronym: string } | null;
  };
}

interface ElectionMeta {
  id: string;
  title: string;
  status: string;
  geographic_scope: string;
}

interface Region { id: string; name: string; }

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  BROUILLON: { label: "Brouillon", bg: "#ebe8e3", color: "#535f74" },
  OUVERT:    { label: "Ouvert",    bg: "#fff3cd", color: "#7a5c00" },
  EN_COURS:  { label: "En cours",  bg: "#80fc98", color: "#007432" },
  CLOS:      { label: "Clos",      bg: "#ffdad6", color: "#ba1a1a" },
  PUBLIE:    { label: "Publié",    bg: "#eff6ff", color: "#1d4ed8" },
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
function token() { return localStorage.getItem("voti_token") ?? ""; }
function authHeaders() { return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }; }

// ── Candidate Bar ─────────────────────────────────────────────────────────────

function CandidateBar({ row, totalVotes, isLeader }: { row: ResultRow; totalVotes: number; isLeader: boolean }) {
  const pct = totalVotes > 0 ? (row.votes_count / totalVotes) * 100 : 0;
  const c = row.candidate;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
          background: isLeader ? "linear-gradient(135deg, #954a00, #f77f00)" : "#ebe8e3",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isLeader ? "#ffffff" : "#535f74",
          fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "0.875rem",
        }}>
          {c.first_name[0]}{c.last_name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontWeight: 700, color: "#1c1c19", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.first_name} {c.last_name}
            </span>
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, color: isLeader ? "#954a00" : "#535f74", flexShrink: 0, marginLeft: "12px" }}>
              {pct.toFixed(1)}%
            </span>
          </div>
          {c.party && <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>{c.party.acronym}</span>}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: "#1c1c19", margin: 0, fontSize: "0.9rem" }}>
            {row.votes_count.toLocaleString("fr-FR")}
          </p>
          <p style={{ fontSize: "0.65rem", color: "#94a3b8", margin: 0 }}>voix</p>
        </div>
      </div>
      <div style={{ height: "10px", background: "#f6f3ee", borderRadius: "9999px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: isLeader ? "linear-gradient(to right, #954a00, #f77f00)" : "#c8d0de",
          borderRadius: "9999px", transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminElectionResults({ user, electionId }: Props) {
  const location = useLocation();
  const [election, setElection] = useState<ElectionMeta | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [resData, regData] = await Promise.all([
        fetch(`${API}/elections/${electionId}/results`, { headers: authHeaders() }).then(r => {
          if (!r.ok) throw new Error("Résultats inaccessibles.");
          return r.json() as Promise<{ election: ElectionMeta; results: ResultRow[] }>;
        }),
        fetch(`${API}/geography/regions`, { headers: authHeaders() }).then(r =>
          r.ok ? (r.json() as Promise<Region[]>) : Promise.resolve([])
        ),
      ]);
      setElection(resData.election);
      setResults(resData.results);
      setRegions(regData);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => { load(); }, [load]);

  const regionMap = new Map(regions.map(r => [r.id, r.name]));

  // Derive national results
  const nationalRows = results
    .filter(r => r.scope === "NATIONAL" && !r.scope_id)
    .sort((a, b) => b.votes_count - a.votes_count);

  const nationalTotal = nationalRows.reduce((s, r) => s + r.votes_count, 0);
  const registeredVoters = nationalRows[0]?.registered_voters ?? 0;
  const turnoutPct = registeredVoters > 0 ? ((nationalTotal / registeredVoters) * 100).toFixed(1) : "0.0";

  // Group regional results
  const regionalMap = new Map<string, ResultRow[]>();
  for (const r of results) {
    if (r.scope === "REGIONAL" && r.scope_id) {
      if (!regionalMap.has(r.scope_id)) regionalMap.set(r.scope_id, []);
      regionalMap.get(r.scope_id)!.push(r);
    }
  }

  const statusMeta = election ? (STATUS_META[election.status] ?? { label: election.status, bg: "#ebe8e3", color: "#535f74" }) : null;
  const isLive = election?.status === "EN_COURS";

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <AdminSidebar user={user} activePath={location.pathname} />

      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh" }}>
        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>
          <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}>Dashboard</Link>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
          <Link to="/dashboard/elections" style={{ color: "#94a3b8", textDecoration: "none" }}>Élections</Link>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
          <Link to={`/dashboard/elections/${electionId}`} style={{ color: "#94a3b8", textDecoration: "none" }}>{election?.title ?? "…"}</Link>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
          <span style={{ color: "#1c1c19", fontWeight: 600 }}>Résultats</span>
        </nav>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#535f74" }}>Chargement…</div>
        ) : loadError ? (
          <div style={{ padding: "1.5rem", background: "#ffdad6", borderRadius: "12px", color: "#ba1a1a", fontWeight: 600 }}>{loadError}</div>
        ) : election ? (
          <>
            {/* Header */}
            <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  {statusMeta && (
                    <span style={{ padding: "3px 12px", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 800, background: statusMeta.bg, color: statusMeta.color }}>
                      {statusMeta.label}
                    </span>
                  )}
                  {isLive && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 12px", borderRadius: "9999px", background: "#80fc98", color: "#007432", fontSize: "0.65rem", fontWeight: 800 }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#006e2e", display: "inline-block" }} />
                      EN DIRECT
                    </span>
                  )}
                </div>
                <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                  {election.title}
                </h1>
                <p style={{ color: "#535f74", margin: 0, fontSize: "0.875rem" }}>Résultats — vue administrateur</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={load}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#ffffff", border: "1px solid rgba(222,193,175,0.4)", borderRadius: "9999px", color: "#954a00", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>refresh</span>
                  Actualiser
                </button>
                <Link
                  to={`/dashboard/elections/${electionId}`}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#1c1c19", borderRadius: "9999px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>settings</span>
                  Gérer
                </Link>
              </div>
            </header>

            {/* Summary cards */}
            <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
              {[
                { label: "Votes Exprimés", value: nationalTotal.toLocaleString("fr-FR"), icon: "how_to_vote", bg: "#fff7ed", iconColor: "#954a00" },
                { label: "Inscrits", value: registeredVoters.toLocaleString("fr-FR"), icon: "groups", bg: "#f1f5f9", iconColor: "#535f74" },
                { label: "Participation", value: `${turnoutPct}%`, icon: "percent", bg: "#f0fdf4", iconColor: "#006e2e" },
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
            </section>

            {/* National results */}
            <section style={{ background: "#ffffff", borderRadius: "24px", padding: "2rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", marginBottom: "2rem" }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 1.5rem" }}>
                Résultats Nationaux
              </p>
              {nationalRows.length === 0 ? (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>Aucun résultat national disponible.</p>
              ) : (
                nationalRows.map((r, i) => (
                  <CandidateBar key={r.id} row={r} totalVotes={nationalTotal} isLeader={i === 0} />
                ))
              )}
            </section>

            {/* Regional breakdown */}
            {regionalMap.size > 0 && (
              <section style={{ background: "#ffffff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 16px rgba(10,22,40,0.05)" }}>
                <details>
                  <summary style={{ cursor: "pointer", listStyle: "none", padding: "1.5rem 2rem", display: "flex", alignItems: "center", gap: "10px", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#1c1c19", borderBottom: "1px solid #ebe8e3", userSelect: "none" }}>
                    <span className="material-symbols-outlined" style={{ color: "#954a00", fontSize: "20px" }}>map</span>
                    Résultats par Région ({regionalMap.size})
                    <span className="material-symbols-outlined" style={{ fontSize: "20px", marginLeft: "auto", color: "#94a3b8" }}>expand_more</span>
                  </summary>
                  <div style={{ padding: "1.5rem 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                    {[...regionalMap.entries()].map(([scopeId, rows]) => {
                      const regionTotal = rows.reduce((s, r) => s + r.votes_count, 0);
                      const sorted = [...rows].sort((a, b) => b.votes_count - a.votes_count);
                      return (
                        <div key={scopeId} style={{ background: "#f6f3ee", borderRadius: "16px", padding: "1.25rem" }}>
                          <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#954a00", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 1rem" }}>
                            {regionMap.get(scopeId) ?? scopeId}
                          </p>
                          {sorted.map((r, i) => (
                            <CandidateBar key={r.id} row={r} totalVotes={regionTotal} isLeader={i === 0} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </details>
              </section>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
