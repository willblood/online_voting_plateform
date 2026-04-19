import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import AdminSidebar from "./AdminSidebar.js";

interface Props {
  user: { email: string; role: string };
}

interface Stats {
  elections: { total: number; brouillon: number; ouvert: number; en_cours: number; clos: number; publie: number };
  voters: { total: number; active: number };
  parties: number;
  votes_cast: number;
}

interface Election {
  id: string;
  title: string;
  type: string;
  status: string;
  start_time: string;
  end_time: string;
  _count: { candidates: number; votes: number };
}

const TYPE_LABELS: Record<string, string> = {
  PRESIDENTIELLE: "Présidentielle", LEGISLATIVES: "Législatives",
  REGIONALES: "Régionales", MUNICIPALES: "Municipales", REFERENDUM: "Référendum",
};

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
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function ElectionRow({ election }: { election: Election }) {
  const [hovered, setHovered] = useState(false);
  const meta = STATUS_META[election.status] ?? { label: election.status, bg: "#ebe8e3", color: "#535f74" };

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderBottom: "1px solid #ebe8e3", background: hovered ? "rgba(246,243,238,0.5)" : "transparent", transition: "background 0.15s" }}
    >
      <td style={{ padding: "1.25rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ color: "#954a00", fontSize: "20px" }}>how_to_vote</span>
          </div>
          <Link to={`/dashboard/elections/${election.id}`} style={{ fontWeight: 700, color: "#1c1c19", textDecoration: "none" }}>
            {election.title}
          </Link>
        </div>
      </td>
      <td style={{ padding: "1.25rem 2rem", fontSize: "0.875rem", fontWeight: 500, color: "#535f74" }}>
        {fmtDate(election.end_time)}
      </td>
      <td style={{ padding: "1.25rem 2rem" }}>
        <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </td>
      <td style={{ padding: "1.25rem 2rem", textAlign: "right" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
          <Link
            to={`/dashboard/elections/${election.id}`}
            title="Gérer"
            style={{ padding: "8px", background: "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: "#535f74", display: "flex", alignItems: "center", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#ebe8e3"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
          </Link>
          <Link
            to={`/dashboard/elections/${election.id}/results`}
            title="Résultats"
            style={{ padding: "8px", background: "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: "#535f74", display: "flex", alignItems: "center", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#ebe8e3"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>analytics</span>
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default function AdminDashboard({ user }: Props) {
  const location = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingElections, setLoadingElections] = useState(true);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API}/elections/stats`, { headers: authHeaders() });
      if (res.ok) setStats(await res.json());
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadElections = useCallback(async () => {
    setLoadingElections(true);
    try {
      const res = await fetch(`${API}/elections`, { headers: authHeaders() });
      if (res.ok) setElections(await res.json());
    } finally {
      setLoadingElections(false);
    }
  }, []);

  useEffect(() => { loadStats(); loadElections(); }, [loadStats, loadElections]);

  const turnoutPct = stats
    ? stats.voters.active > 0 ? ((stats.votes_cast / stats.voters.active) * 100).toFixed(1) : "0.0"
    : "—";

  const recentElections = elections.slice(0, 5);

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <AdminSidebar user={user} activePath={location.pathname} />

      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh", position: "relative" }}>
        {/* Organic background blob */}
        <svg style={{ position: "absolute", top: "-5%", right: "-3%", width: "380px", height: "380px", opacity: 0.06, color: "#954a00", pointerEvents: "none" }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,77.3,-44.7C85.4,-31.3,90.5,-15.7,89.2,-0.8C87.8,14.2,80,28.4,70.1,40.4C60.2,52.4,48.2,62.2,34.7,69.5C21.2,76.8,6.2,81.6,-9.3,80.1C-24.8,78.6,-40.8,70.8,-54.3,60.1C-67.8,49.4,-78.8,35.8,-83.4,20.4C-88,5.1,-86.2,-12.1,-79.6,-27.2C-73,-42.3,-61.6,-55.3,-48.2,-62.5C-34.8,-69.7,-17.4,-71.1,-0.8,-69.7C15.8,-68.3,31.3,-64,44.7,-76.4Z" fill="currentColor" transform="translate(100 100)" />
        </svg>

        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", position: "relative", zIndex: 10 }}>
          <div>
            <span style={{ display: "block", fontFamily: "Manrope, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "#954a00", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
              Administration Centrale
            </span>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2.25rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Tableau de Bord
            </h2>
            <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>
              Bienvenue, contrôlez l'intégrité et le flux des processus électoraux.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              to="/results"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "#ffffff", border: "1px solid rgba(222,193,175,0.4)", borderRadius: "9999px", color: "#954a00", fontFamily: "Manrope, sans-serif", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", textDecoration: "none" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>analytics</span>
              Résultats Publics
            </Link>
            <Link
              to="/dashboard/elections"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 32px", background: "#f77f00", border: "none", borderRadius: "9999px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem", boxShadow: "0 8px 24px rgba(247,127,0,0.25)", textDecoration: "none" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
              Nouvelle Élection
            </Link>
          </div>
        </header>

        {/* ── Stats cards ── */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          {[
            { label: "Total Élections", value: stats?.elections.total ?? "—", icon: "ballot", bg: "#fff7ed", iconColor: "#954a00" },
            { label: "Élections Actives", value: stats?.elections.en_cours ?? "—", icon: "play_circle", bg: "#f0fdf4", iconColor: "#006e2e" },
            { label: "Électeurs Actifs", value: stats?.voters.active.toLocaleString("fr-FR") ?? "—", icon: "groups", bg: "#f1f5f9", iconColor: "#535f74" },
            { label: "Partis Politiques", value: stats?.parties ?? "—", icon: "flag", bg: "#fdf4ff", iconColor: "#7c3aed" },
          ].map(card => (
            <div key={card.label} style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px", color: card.iconColor }}>{card.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>{card.label}</p>
                <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#1c1c19", margin: 0, lineHeight: 1 }}>
                  {loadingStats ? "…" : card.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Participation + security ── */}
        <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          {/* Participation card */}
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "2rem", boxShadow: "0 12px 32px rgba(10,22,40,0.06)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
              <div>
                <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#1c1c19", margin: "0 0 4px" }}>
                  Participation Globale
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#535f74", margin: 0 }}>Votes exprimés / Électeurs actifs</p>
              </div>
              {stats?.elections.en_cours ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "9999px", background: "#80fc98", color: "#007432", fontSize: "0.7rem", fontWeight: 700 }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#006e2e", display: "inline-block" }} />
                  EN DIRECT
                </span>
              ) : (
                <span style={{ padding: "6px 16px", borderRadius: "9999px", background: "#ebe8e3", color: "#535f74", fontSize: "0.7rem", fontWeight: 700 }}>
                  Agrégé
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "3rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "4rem", fontWeight: 800, color: "#954a00", lineHeight: 1, marginBottom: "12px" }}>
                  {loadingStats ? "…" : <>{turnoutPct}<span style={{ fontSize: "2rem" }}>%</span></>}
                </div>
                <div style={{ width: "100%", height: "16px", background: "#ebe8e3", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: `${parseFloat(turnoutPct) || 0}%`, height: "100%", background: "linear-gradient(to right, #954a00, #f77f00)", borderRadius: "9999px" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", textAlign: "right", flexShrink: 0 }}>
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Électeurs</p>
                  <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>
                    {loadingStats ? "…" : (stats?.voters.active.toLocaleString("fr-FR") ?? "—")}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Votes</p>
                  <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>
                    {loadingStats ? "…" : (stats?.votes_cast.toLocaleString("fr-FR") ?? "—")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Elections by status */}
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "2rem", boxShadow: "0 12px 32px rgba(10,22,40,0.06)" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>
              État des Élections
            </p>
            {loadingStats ? (
              <p style={{ color: "#94a3b8" }}>Chargement…</p>
            ) : stats ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(["en_cours", "ouvert", "brouillon", "clos", "publie"] as const).map(key => {
                  const metaKey = key.toUpperCase();
                  const meta = STATUS_META[metaKey] ?? { label: metaKey, bg: "#ebe8e3", color: "#535f74" };
                  const count = stats.elections[key];
                  return (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                      <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, color: "#1c1c19", fontSize: "1.1rem" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        {/* ── Recent elections table ── */}
        <section style={{ position: "relative", zIndex: 10 }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 12px 32px rgba(10,22,40,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "2rem", borderBottom: "1px solid #ebe8e3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>
                Élections Récentes
              </h3>
              <Link to="/dashboard/elections" style={{ padding: "4px 16px", borderRadius: "9999px", background: "#f77f00", color: "#ffffff", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none" }}>
                Voir tout →
              </Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              {loadingElections ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#535f74" }}>Chargement…</div>
              ) : recentElections.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>Aucune élection.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f6f3ee" }}>
                      {["Nom de l'Élection", "Date de Fin", "Statut", "Actions"].map((h, i) => (
                        <th key={h} style={{ padding: "1rem 2rem", fontSize: "0.65rem", fontWeight: 800, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: i === 3 ? "right" : "left", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentElections.map(el => <ElectionRow key={el.id} election={el} />)}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
