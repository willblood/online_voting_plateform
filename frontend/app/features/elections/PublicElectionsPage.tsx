import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const TYPE_LABELS: Record<string, string> = {
  PRESIDENTIELLE: "Présidentielle", LEGISLATIVES: "Législatives",
  REGIONALES: "Régionales", MUNICIPALES: "Municipales", REFERENDUM: "Référendum",
};

const SCOPE_LABELS: Record<string, string> = {
  NATIONAL: "National", REGIONAL: "Régional",
  DEPARTEMENTAL: "Départemental", COMMUNAL: "Communal",
};

type Tab = "EN_COURS" | "OUVERT" | "PUBLIE";

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  party: { name: string; acronym: string } | null;
  votes_count: number | null;
  registered_voters: number | null;
  turnout_percentage: number | null;
}

interface BrowseElection {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string | null;
  geographic_scope: string;
  scope_name: string | null;
  start_time: string;
  end_time: string;
  round: number;
  updated_at: string;
  total_votes: number;
  candidates: Candidate[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

// ── Candidate Row (no results) ────────────────────────────────────────────────

function CandidateChip({ c }: { c: Candidate }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", background: "#f6f3ee", borderRadius: "12px" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #1e293b, #334155)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>
        {c.first_name[0]}{c.last_name[0]}
      </div>
      <div>
        <p style={{ fontWeight: 700, color: "#1c1c19", fontSize: "0.8rem", margin: 0 }}>
          {c.first_name} {c.last_name}
        </p>
        {c.party && <p style={{ fontSize: "0.65rem", color: "#94a3b8", margin: 0 }}>{c.party.acronym}</p>}
      </div>
    </div>
  );
}

// ── Candidate Result Bar (PUBLIE) ─────────────────────────────────────────────

function ResultBar({ c, totalVotes, isLeader }: { c: Candidate; totalVotes: number; isLeader: boolean }) {
  const pct = totalVotes > 0 && c.votes_count != null ? (c.votes_count / totalVotes) * 100 : 0;
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0, background: isLeader ? "linear-gradient(135deg, #954a00, #f77f00)" : "#ebe8e3", display: "flex", alignItems: "center", justifyContent: "center", color: isLeader ? "#fff" : "#535f74", fontSize: "0.7rem", fontWeight: 800 }}>
          {c.first_name[0]}{c.last_name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#1c1c19", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.first_name} {c.last_name}
            </span>
            <span style={{ fontWeight: 800, fontSize: "0.8rem", color: isLeader ? "#954a00" : "#535f74", flexShrink: 0, marginLeft: "8px" }}>
              {pct.toFixed(1)}%
            </span>
          </div>
          {c.party && <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{c.party.acronym}</span>}
        </div>
      </div>
      <div style={{ height: "6px", background: "#f6f3ee", borderRadius: "9999px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: isLeader ? "linear-gradient(to right, #954a00, #f77f00)" : "#c8d0de", borderRadius: "9999px" }} />
      </div>
    </div>
  );
}

// ── Election Card ─────────────────────────────────────────────────────────────

function ElectionCard({ el }: { el: BrowseElection }) {
  const [expanded, setExpanded] = useState(false);
  const isLive = el.status === "EN_COURS";
  const isPublished = el.status === "PUBLIE";
  const totalVotes = el.candidates.reduce((s, c) => s + (c.votes_count ?? 0), 0);
  const sortedCandidates = isPublished
    ? [...el.candidates].sort((a, b) => (b.votes_count ?? 0) - (a.votes_count ?? 0))
    : el.candidates;

  const turnout = el.candidates[0]?.registered_voters != null && el.candidates[0].registered_voters > 0
    ? ((totalVotes / el.candidates[0].registered_voters) * 100).toFixed(1)
    : null;

  return (
    <div style={{ background: "#ffffff", borderRadius: "20px", boxShadow: "0 4px 20px rgba(10,22,40,0.06)", overflow: "hidden", border: isLive ? "2px solid #80fc98" : "1px solid transparent", transition: "box-shadow 0.2s" }}>
      {/* Card header */}
      <div style={{ padding: "1.5rem", borderBottom: "1px solid #f6f3ee" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
              <span style={{ padding: "2px 10px", background: "#fff7ed", borderRadius: "9999px", fontSize: "0.6rem", fontWeight: 800, color: "#954a00", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {TYPE_LABELS[el.type] ?? el.type}
              </span>
              {el.scope_name && (
                <span style={{ padding: "2px 10px", background: "#f1f5f9", borderRadius: "9999px", fontSize: "0.6rem", fontWeight: 700, color: "#535f74" }}>
                  {el.scope_name}
                </span>
              )}
              {isLive && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 10px", background: "#80fc98", borderRadius: "9999px", fontSize: "0.6rem", fontWeight: 800, color: "#007432" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#006e2e" }} />
                  EN DIRECT
                </span>
              )}
            </div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              {el.title}
            </h3>
            <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>calendar_today</span>
                {fmtDate(el.start_time)} → {fmtDate(el.end_time)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>person</span>
                {el.candidates.length} candidat{el.candidates.length !== 1 ? "s" : ""}
              </span>
              {isLive && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#007432" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>how_to_vote</span>
                  {el.total_votes.toLocaleString("fr-FR")} votes
                </span>
              )}
              {isPublished && turnout && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#954a00" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>percent</span>
                  {turnout}% participation
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: expanded ? "#1c1c19" : "#f6f3ee", border: "none", borderRadius: "9999px", color: expanded ? "#ffffff" : "#535f74", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", flexShrink: 0, transition: "background 0.15s" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              {isPublished ? "bar_chart" : "people"}
            </span>
            {expanded ? "Réduire" : (isPublished ? "Résultats" : "Candidats")}
          </button>
        </div>

        {el.description && (
          <p style={{ marginTop: "10px", fontSize: "0.8rem", color: "#535f74", lineHeight: 1.6, margin: "8px 0 0" }}>
            {el.description}
          </p>
        )}
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div style={{ padding: "1.25rem 1.5rem", background: "#fafaf8" }}>
          {isPublished ? (
            <>
              <p style={{ fontSize: "0.6rem", fontWeight: 800, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
                Résultats Nationaux Officiels
              </p>
              {sortedCandidates.map((c, i) => (
                <ResultBar key={c.id} c={c} totalVotes={totalVotes} isLeader={i === 0} />
              ))}
              <p style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: "8px", textAlign: "right" }}>
                Mis à jour le {new Date(el.updated_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: "0.6rem", fontWeight: 800, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
                Candidats ({el.candidates.length})
              </p>
              {el.candidates.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Aucun candidat enregistré.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
                  {el.candidates.map(c => <CandidateChip key={c.id} c={c} />)}
                </div>
              )}
              {el.round > 1 && (
                <p style={{ marginTop: "10px", fontSize: "0.7rem", color: "#94a3b8" }}>Tour {el.round}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Status Section ────────────────────────────────────────────────────────────

function StatusSection({ elections, tab }: { elections: BrowseElection[]; tab: Tab }) {
  if (elections.length === 0) return null;

  const titles: Record<Tab, string> = {
    EN_COURS: "Élections en cours",
    OUVERT: "Ouvertes au dépôt de candidatures",
    PUBLIE: "Résultats Publiés",
  };
  const icons: Record<Tab, string> = {
    EN_COURS: "play_circle", OUVERT: "lock_open", PUBLIE: "verified",
  };
  const colors: Record<Tab, string> = {
    EN_COURS: "#006e2e", OUVERT: "#7a5c00", PUBLIE: "#1d4ed8",
  };

  return (
    <section style={{ marginBottom: "3rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "22px", color: colors[tab] }}>{icons[tab]}</span>
        <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "#1c1c19", margin: 0 }}>
          {titles[tab]}
        </h2>
        <span style={{ padding: "2px 10px", background: "#f6f3ee", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, color: "#535f74" }}>
          {elections.length}
        </span>
      </div>
      <div style={{ display: "grid", gap: "1rem" }}>
        {elections.map(el => <ElectionCard key={el.id} el={el} />)}
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PublicElectionsPage() {
  const navigate = useNavigate();
  const [elections, setElections] = useState<BrowseElection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab | "ALL">("ALL");

  useEffect(() => {
    fetch(`${API}/elections/browse`)
      .then(r => { if (!r.ok) throw new Error("Impossible de charger les élections."); return r.json() as Promise<BrowseElection[]>; })
      .then(data => {
        setElections(data);
        if (data.some(e => e.status === "EN_COURS")) setActiveTab("EN_COURS");
        else if (data.some(e => e.status === "OUVERT")) setActiveTab("OUVERT");
        else setActiveTab("PUBLIE");
      })
      .catch(e => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const byCours = elections.filter(e => e.status === "EN_COURS");
  const byOuvert = elections.filter(e => e.status === "OUVERT");
  const byPublie = elections.filter(e => e.status === "PUBLIE");

  const tabs: { key: Tab | "ALL"; label: string; count: number }[] = (
    [
      { key: "ALL" as const,      label: "Toutes",    count: elections.length },
      { key: "EN_COURS" as const, label: "En cours",  count: byCours.length },
      { key: "OUVERT" as const,   label: "Ouvert",    count: byOuvert.length },
      { key: "PUBLIE" as const,   label: "Résultats", count: byPublie.length },
    ] as { key: Tab | "ALL"; label: string; count: number }[]
  ).filter(t => t.key === "ALL" || t.count > 0);

  const visible = activeTab === "ALL" ? elections : elections.filter(e => e.status === activeTab);

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      {/* Top nav */}
      <header style={{ background: "#020617", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.125rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>VOTI CI</span>
          <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>Élections</span>
        </Link>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link to="/results" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>analytics</span>
            Résultats
          </Link>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>arrow_back</span>
            Retour
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "3rem 2rem" }}>
        {/* Page header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <span style={{ display: "inline-block", fontSize: "0.65rem", fontWeight: 700, color: "#954a00", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "10px" }}>
            Plateforme Électorale
          </span>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2.25rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Élections
          </h1>
          <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>
            Consultez les élections en cours, ouvertes et les résultats certifiés.
          </p>
        </div>

        {/* Tabs */}
        {!loading && !error && elections.length > 0 && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "2rem", flexWrap: "wrap" }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 18px", borderRadius: "9999px", border: "none",
                  background: activeTab === t.key ? "#1c1c19" : "#ffffff",
                  color: activeTab === t.key ? "#ffffff" : "#535f74",
                  fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.8rem",
                  cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "background 0.15s",
                }}
              >
                {t.label}
                <span style={{ padding: "1px 6px", borderRadius: "9999px", background: activeTab === t.key ? "rgba(255,255,255,0.15)" : "#f6f3ee", fontSize: "0.65rem", fontWeight: 800, color: activeTab === t.key ? "#ffffff" : "#94a3b8" }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "6rem 0" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#ebe8e3", display: "block", marginBottom: "1rem" }}>hourglass_empty</span>
            <p style={{ color: "#535f74", fontWeight: 600 }}>Chargement…</p>
          </div>
        ) : error ? (
          <div style={{ padding: "1.5rem", background: "#ffdad6", borderRadius: "16px", color: "#ba1a1a", fontWeight: 600 }}>{error}</div>
        ) : elections.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 0" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#ebe8e3", display: "block", marginBottom: "1.5rem" }}>how_to_vote</span>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#1c1c19", margin: "0 0 8px" }}>Aucune élection disponible</h2>
            <p style={{ color: "#535f74" }}>Revenez bientôt pour consulter les prochaines élections.</p>
          </div>
        ) : activeTab === "ALL" ? (
          <>
            <StatusSection elections={byCours} tab="EN_COURS" />
            <StatusSection elections={byOuvert} tab="OUVERT" />
            <StatusSection elections={byPublie} tab="PUBLIE" />
          </>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {visible.map(el => <ElectionCard key={el.id} el={el} />)}
          </div>
        )}
      </main>
    </div>
  );
}
