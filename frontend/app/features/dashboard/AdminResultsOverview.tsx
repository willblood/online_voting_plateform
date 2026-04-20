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
  geographic_scope: string;
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

// ── Mini donut for vote breakdown ─────────────────────────────────────────────
function DonutChart({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#ebe8e3" strokeWidth="6" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round"
        transform="rotate(-90 26 26)" />
      <text x="26" y="30" textAnchor="middle" style={{ fontSize: "10px", fontWeight: 800, fill: "#1c1c19", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export default function AdminResultsOverview({ user }: Props) {
  const location = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, eRes] = await Promise.all([
        fetch(`${API}/elections/stats`, { headers: authHeaders() }),
        fetch(`${API}/elections`, { headers: authHeaders() }),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (eRes.ok) setElections(await eRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const withResults = elections.filter(e => ["EN_COURS", "CLOS", "PUBLIE"].includes(e.status));
  const filtered = filter === "ALL" ? withResults : withResults.filter(e => e.status === filter);
  const turnoutPct = stats
    ? stats.voters.active > 0 ? ((stats.votes_cast / stats.voters.active) * 100) : 0
    : 0;

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <AdminSidebar user={user} activePath={location.pathname} />

      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh", position: "relative" }}>
        {/* Decorative blob */}
        <svg style={{ position: "absolute", top: "-5%", right: "-3%", width: "320px", height: "320px", opacity: 0.05, color: "#954a00", pointerEvents: "none" }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,77.3,-44.7C85.4,-31.3,90.5,-15.7,89.2,-0.8C87.8,14.2,80,28.4,70.1,40.4C60.2,52.4,48.2,62.2,34.7,69.5C21.2,76.8,6.2,81.6,-9.3,80.1C-24.8,78.6,-40.8,70.8,-54.3,60.1C-67.8,49.4,-78.8,35.8,-83.4,20.4C-88,5.1,-86.2,-12.1,-79.6,-27.2C-73,-42.3,-61.6,-55.3,-48.2,-62.5C-34.8,-69.7,-17.4,-71.1,-0.8,-69.7C15.8,-68.3,31.3,-64,44.7,-76.4Z" fill="currentColor" transform="translate(100 100)" />
        </svg>

        {/* Header */}
        <header style={{ marginBottom: "2.5rem", position: "relative", zIndex: 10 }}>
          <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#954a00", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
            Administration
          </span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2.25rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                Résultats & Analytiques
              </h2>
              <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>
                Vue statistique de toutes les élections avec résultats disponibles.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={load} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", background: "#ffffff", border: "1px solid rgba(222,193,175,0.4)", borderRadius: "9999px", color: "#954a00", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>refresh</span>
                Actualiser
              </button>
              <Link to="/results" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", background: "#1c1c19", borderRadius: "9999px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>open_in_new</span>
                Vue publique
              </Link>
            </div>
          </div>
        </header>

        {/* KPI cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          {[
            { label: "Votes Exprimés", value: stats?.votes_cast.toLocaleString("fr-FR") ?? "—", icon: "how_to_vote", bg: "#fff7ed", iconColor: "#954a00" },
            { label: "Résultats Publiés", value: stats?.elections.publie ?? "—", icon: "verified", bg: "#eff6ff", iconColor: "#1d4ed8" },
            { label: "En cours", value: stats?.elections.en_cours ?? "—", icon: "play_circle", bg: "#f0fdf4", iconColor: "#006e2e" },
            { label: "Clôturées", value: stats?.elections.clos ?? "—", icon: "lock", bg: "#fdf4ff", iconColor: "#7c3aed" },
          ].map(card => (
            <div key={card.label} style={{ background: "#ffffff", borderRadius: "18px", padding: "1.25rem 1.5rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "26px", color: card.iconColor }}>{card.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{card.label}</p>
                <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#1c1c19", margin: 0, lineHeight: 1 }}>
                  {loading ? "…" : card.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Participation + status breakdown */}
        <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          {/* Participation arc */}
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "2rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 1.5rem" }}>
              Participation Agrégée (votes / électeurs actifs)
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "3.5rem", fontWeight: 800, color: "#954a00", lineHeight: 1, marginBottom: "12px" }}>
                  {loading ? "…" : <>{turnoutPct.toFixed(1)}<span style={{ fontSize: "1.75rem" }}>%</span></>}
                </div>
                <div style={{ width: "100%", height: "12px", background: "#ebe8e3", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: `${turnoutPct}%`, height: "100%", background: "linear-gradient(to right, #954a00, #f77f00)", borderRadius: "9999px", transition: "width 0.6s" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem 2rem", flexShrink: 0, textAlign: "right" }}>
                {[
                  { label: "Électeurs actifs", value: stats?.voters.active.toLocaleString("fr-FR") ?? "—" },
                  { label: "Votes totaux", value: stats?.votes_cast.toLocaleString("fr-FR") ?? "—" },
                  { label: "Inscrits totaux", value: stats?.voters.total.toLocaleString("fr-FR") ?? "—" },
                  { label: "Partis", value: stats?.parties ?? "—" },
                ].map(row => (
                  <div key={row.label}>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>{row.label}</p>
                    <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#1c1c19", margin: 0 }}>{loading ? "…" : row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Elections by status donut cluster */}
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem 2rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 1.25rem" }}>
              Répartition par Statut
            </p>
            {loading || !stats ? (
              <p style={{ color: "#94a3b8" }}>Chargement…</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                {[
                  { key: "en_cours", label: "En cours", color: "#006e2e" },
                  { key: "publie",   label: "Publiés",  color: "#1d4ed8" },
                  { key: "clos",     label: "Clos",     color: "#ba1a1a" },
                  { key: "ouvert",   label: "Ouverts",  color: "#7a5c00" },
                ].map(({ key, label, color }) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <DonutChart value={stats.elections[key as keyof typeof stats.elections] as number} max={stats.elections.total} color={color} />
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", margin: 0, textAlign: "center" }}>{label}</p>
                    <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#1c1c19", margin: 0 }}>
                      {stats.elections[key as keyof typeof stats.elections]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Elections with results table */}
        <section style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", overflow: "hidden", position: "relative", zIndex: 10 }}>
          <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #ebe8e3", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.125rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>
              Élections avec résultats
            </h3>
            <div style={{ display: "flex", gap: "6px" }}>
              {["ALL", "EN_COURS", "CLOS", "PUBLIE"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{ padding: "5px 14px", borderRadius: "9999px", border: "none", background: filter === s ? "#1c1c19" : "#f6f3ee", color: filter === s ? "#ffffff" : "#535f74", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", transition: "background 0.15s" }}
                >
                  {s === "ALL" ? "Toutes" : (STATUS_META[s]?.label ?? s)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#535f74" }}>Chargement…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "1rem", color: "#ebe8e3" }}>analytics</span>
              Aucune élection avec résultats.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f6f3ee" }}>
                  {["Élection", "Type", "Statut", "Votes", "Candidats", "Actions"].map((h, i) => (
                    <th key={h} style={{ padding: "0.875rem 1.5rem", fontSize: "0.6rem", fontWeight: 800, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: i >= 3 ? "center" : "left", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(el => {
                  const meta = STATUS_META[el.status] ?? { label: el.status, bg: "#ebe8e3", color: "#535f74" };
                  return (
                    <tr key={el.id} style={{ borderBottom: "1px solid #ebe8e3" }}>
                      <td style={{ padding: "1rem 1.5rem", maxWidth: "260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#954a00" }}>how_to_vote</span>
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: "#1c1c19", fontSize: "0.875rem", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{el.title}</p>
                            <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: 0 }}>{fmtDate(el.end_time)}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#954a00", background: "#fff7ed", padding: "2px 8px", borderRadius: "9999px" }}>
                          {TYPE_LABELS[el.type] ?? el.type}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: "#1c1c19" }}>
                          {el._count.votes.toLocaleString("fr-FR")}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: "#1c1c19" }}>
                          {el._count.candidates}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <Link
                          to={`/dashboard/elections/${el.id}/results`}
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "#f77f00", borderRadius: "9999px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.72rem", textDecoration: "none" }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>bar_chart</span>
                          Analyser
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
