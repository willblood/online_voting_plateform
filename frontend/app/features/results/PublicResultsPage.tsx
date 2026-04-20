import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const TYPE_LABELS: Record<string, string> = {
  PRESIDENTIELLE: "Présidentielle",
  LEGISLATIVES: "Législatives",
  REGIONALES: "Régionales",
  MUNICIPALES: "Municipales",
  REFERENDUM: "Référendum",
};

interface CandidateResult {
  candidate_id: string;
  first_name: string;
  last_name: string;
  party: { name: string; acronym: string } | null;
  votes_count: number;
  registered_voters: number;
  turnout_percentage: number;
}

interface RegionBreakdown {
  region_id: string;
  region_name: string;
  candidates: CandidateResult[];
}

interface PublicElection {
  id: string;
  title: string;
  type: string;
  updated_at: string;
  total_votes: number;
  registered_voters: number;
  national_results: CandidateResult[];
  regional_breakdown: RegionBreakdown[];
}

// ── Participation Gauge ───────────────────────────────────────────────────────

function ParticipationGauge({ totalVotes, registeredVoters }: { totalVotes: number; registeredVoters: number }) {
  const pct = registeredVoters > 0 ? Math.min((totalVotes / registeredVoters) * 100, 100) : 0;
  const r = 40;
  const cx = 50;
  const cy = 52;
  const circumference = Math.PI * r;
  const filled = (pct / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem 1rem 0.5rem" }}>
      <svg viewBox="0 0 100 58" style={{ width: "140px", overflow: "visible" }}>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#ebe8e3"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#954a00" />
            <stop offset="100%" stopColor="#f77f00" />
          </linearGradient>
        </defs>
        <text x={cx} y={cy - 2} textAnchor="middle" style={{ fontSize: "14px", fontWeight: 800, fill: "#1c1c19", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          {pct.toFixed(1)}%
        </text>
      </svg>
      <p style={{ margin: "4px 0 0", fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Participation
      </p>
      {registeredVoters > 0 && (
        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
          {totalVotes.toLocaleString("fr-FR")} / {registeredVoters.toLocaleString("fr-FR")}
        </p>
      )}
    </div>
  );
}

// ── Candidate Bar ─────────────────────────────────────────────────────────────

function CandidateBar({ result, totalVotes, isLeader }: { result: CandidateResult; totalVotes: number; isLeader: boolean }) {
  const pct = totalVotes > 0 ? (result.votes_count / totalVotes) * 100 : 0;

  return (
    <div style={{ marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
          background: isLeader ? "linear-gradient(135deg, #954a00, #f77f00)" : "#ebe8e3",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isLeader ? "#ffffff" : "#535f74",
          fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "0.8rem",
        }}>
          {result.first_name[0]}{result.last_name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
            <span style={{ fontWeight: 700, color: "#1c1c19", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {result.first_name} {result.last_name}
            </span>
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, color: isLeader ? "#954a00" : "#535f74", fontSize: "0.875rem", flexShrink: 0, marginLeft: "8px" }}>
              {pct.toFixed(1)}%
            </span>
          </div>
          {result.party && (
            <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>
              {result.party.acronym}
            </span>
          )}
        </div>
      </div>
      <div style={{ height: "8px", background: "#f6f3ee", borderRadius: "9999px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: isLeader ? "linear-gradient(to right, #954a00, #f77f00)" : "#c8d0de",
          borderRadius: "9999px",
          transition: "width 0.6s ease",
        }} />
      </div>
      <p style={{ margin: "3px 0 0", fontSize: "0.7rem", color: "#94a3b8", textAlign: "right" }}>
        {result.votes_count.toLocaleString("fr-FR")} voix
      </p>
    </div>
  );
}

// ── Regional Breakdown ────────────────────────────────────────────────────────

function RegionalBreakdown({ regions }: { regions: RegionBreakdown[] }) {
  return (
    <details style={{ marginTop: "1.5rem" }}>
      <summary style={{
        cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: "8px",
        padding: "10px 16px", background: "#f6f3ee", borderRadius: "12px",
        fontFamily: "Manrope, sans-serif", fontWeight: 700, color: "#535f74", fontSize: "0.875rem",
        userSelect: "none",
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#954a00" }}>map</span>
        Résultats par Région ({regions.length} région{regions.length > 1 ? "s" : ""})
        <span className="material-symbols-outlined" style={{ fontSize: "18px", marginLeft: "auto" }}>expand_more</span>
      </summary>
      <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {regions.map((region) => {
          const regionTotal = region.candidates.reduce((s, c) => s + c.votes_count, 0);
          const sorted = [...region.candidates].sort((a, b) => b.votes_count - a.votes_count);
          return (
            <div key={region.region_id} style={{ background: "#ffffff", borderRadius: "16px", padding: "1.25rem", border: "1px solid #ebe8e3" }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#954a00", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
                {region.region_name}
              </p>
              {sorted.map((c, i) => (
                <CandidateBar key={c.candidate_id} result={c} totalVotes={regionTotal} isLeader={i === 0} />
              ))}
            </div>
          );
        })}
      </div>
    </details>
  );
}

// ── Election Result Card ──────────────────────────────────────────────────────

function ElectionResultCard({ election }: { election: PublicElection }) {
  const sorted = [...election.national_results].sort((a, b) => b.votes_count - a.votes_count);

  return (
    <div style={{
      background: "#ffffff", borderRadius: "24px",
      boxShadow: "0 12px 32px rgba(10,22,40,0.06)",
      overflow: "hidden", marginBottom: "2rem",
    }}>
      {/* Card header */}
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #ebe8e3", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", background: "#fff7ed", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 800, color: "#954a00", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            {TYPE_LABELS[election.type] ?? election.type}
          </span>
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.375rem", fontWeight: 800, color: "#1c1c19", margin: 0, letterSpacing: "-0.01em" }}>
            {election.title}
          </h2>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>Mis à jour le</p>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#535f74", margin: 0 }}>
            {new Date(election.updated_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </div>

      <div style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", alignItems: "start" }}>
          <ParticipationGauge totalVotes={election.total_votes} registeredVoters={election.registered_voters} />
          <div>
            <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 1rem" }}>
              Résultats Nationaux
            </p>
            {sorted.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Aucun résultat disponible.</p>
            ) : (
              sorted.map((r, i) => (
                <CandidateBar key={r.candidate_id} result={r} totalVotes={election.total_votes} isLeader={i === 0} />
              ))
            )}
          </div>
        </div>

        {election.regional_breakdown.length > 0 && (
          <RegionalBreakdown regions={election.regional_breakdown} />
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PublicResultsPage() {
  const navigate = useNavigate();
  const [elections, setElections] = useState<PublicElection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/elections/public`)
      .then((r) => {
        if (!r.ok) throw new Error("Impossible de charger les résultats.");
        return r.json() as Promise<PublicElection[]>;
      })
      .then(setElections)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      {/* Top nav */}
      <header style={{ background: "#020617", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.125rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>VOTI CI</span>
          <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>Résultats</span>
        </Link>
        <button
          onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
          Retour
        </button>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem" }}>
        {/* Page header */}
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <span style={{ display: "inline-block", fontSize: "0.65rem", fontWeight: 700, color: "#954a00", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
            Résultats Officiels
          </span>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2.5rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Résultats Électoraux
          </h1>
          <p style={{ color: "#535f74", fontWeight: 500, fontSize: "1rem", margin: 0 }}>
            Résultats certifiés et publiés par la Commission Électorale Nationale
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "6rem 0" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#ebe8e3", display: "block", marginBottom: "1rem" }}>hourglass_empty</span>
            <p style={{ color: "#535f74", fontWeight: 600 }}>Chargement des résultats…</p>
          </div>
        ) : error ? (
          <div style={{ padding: "1.5rem", background: "#ffdad6", borderRadius: "16px", color: "#ba1a1a", fontWeight: 600 }}>
            {error}
          </div>
        ) : elections.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 0" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#ebe8e3", display: "block", marginBottom: "1.5rem" }}>ballot</span>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#1c1c19", margin: "0 0 8px" }}>
              Aucun résultat disponible
            </h2>
            <p style={{ color: "#535f74" }}>Les résultats seront publiés après certification officielle.</p>
          </div>
        ) : (
          elections.map((el) => <ElectionResultCard key={el.id} election={el} />)
        )}
      </main>
    </div>
  );
}
