import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import VoterSidebar from "./VoterSidebar.js";

interface Props {
  user: { email: string; role: string; first_name?: string; last_name?: string };
}

interface ElectionItem {
  id: string;
  title: string;
  type: string;
  status: string;
  geographic_scope: string;
  scope?: { name: string } | null;
  start_time: string;
  end_time: string;
  candidates_count: number;
  votes_count: number;
  can_vote: boolean;
  already_voted: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  PRESIDENTIELLE: "Présidentielle",
  LEGISLATIVES: "Législatives",
  REGIONALES: "Régionales",
  MUNICIPALES: "Municipales",
  REFERENDUM: "Référendum",
};

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  OUVERT:   { label: "Ouvert",    bg: "#fff3cd", color: "#7a5c00" },
  EN_COURS: { label: "En cours",  bg: "#80fc98", color: "#007432" },
};

const SCOPE_LABELS: Record<string, string> = {
  NATIONAL: "National", REGIONAL: "Régional",
  DEPARTEMENTAL: "Départemental", COMMUNAL: "Communal",
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
function token() { return localStorage.getItem("voti_token") ?? ""; }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function VoterElections({ user }: Props) {
  const location = useLocation();
  const [elections, setElections] = useState<ElectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "EN_COURS" | "OUVERT">("ALL");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/elections`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res.ok) throw new Error("Impossible de charger les élections.");
        setElections(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = elections.filter(el => {
    const q = search.toLowerCase();
    const matchSearch = !q || el.title.toLowerCase().includes(q) || TYPE_LABELS[el.type]?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || el.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const enCours = elections.filter(e => e.status === "EN_COURS").length;
  const ouvert = elections.filter(e => e.status === "OUVERT").length;

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <VoterSidebar user={user} activePath={location.pathname} />

      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh", position: "relative" }}>
        <svg style={{ position: "absolute", top: "-5%", right: "-3%", width: "380px", height: "380px", opacity: 0.05, color: "#006e2e", pointerEvents: "none" }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,77.3,-44.7C85.4,-31.3,90.5,-15.7,89.2,-0.8C87.8,14.2,80,28.4,70.1,40.4C60.2,52.4,48.2,62.2,34.7,69.5C21.2,76.8,6.2,81.6,-9.3,80.1C-24.8,78.6,-40.8,70.8,-54.3,60.1C-67.8,49.4,-78.8,35.8,-83.4,20.4C-88,5.1,-86.2,-12.1,-79.6,-27.2C-73,-42.3,-61.6,-55.3,-48.2,-62.5C-34.8,-69.7,-17.4,-71.1,-0.8,-69.7C15.8,-68.3,31.3,-64,44.7,-76.4Z" fill="currentColor" transform="translate(100 100)" />
        </svg>

        {/* Header */}
        <header style={{ marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#006e2e", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
            Espace Électeur
          </span>
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2.25rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Mes Élections
          </h2>
          <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>
            Consultez les élections disponibles dans votre zone géographique.
          </p>
        </header>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          {[
            { label: "Total disponibles", value: elections.length, icon: "ballot", bg: "#fff7ed", iconColor: "#954a00" },
            { label: "En cours", value: enCours, icon: "play_circle", bg: "#f0fdf4", iconColor: "#006e2e" },
            { label: "Ouvertes bientôt", value: ouvert, icon: "schedule", bg: "#fff3cd", iconColor: "#7a5c00" },
          ].map(c => (
            <div key={c.label} style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem 1.5rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px", color: c.iconColor }}>{c.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{c.label}</p>
                <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#1c1c19", margin: 0, lineHeight: 1 }}>{loading ? "…" : c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", position: "relative", zIndex: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "20px", color: "#94a3b8" }}>search</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une élection…"
              style={{ width: "100%", padding: "13px 16px 13px 44px", background: "#ffffff", border: "1px solid rgba(222,193,175,0.4)", borderRadius: "14px", color: "#1c1c19", fontFamily: "Manrope, sans-serif", fontSize: "0.875rem", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["ALL", "EN_COURS", "OUVERT"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{ padding: "12px 20px", border: "none", borderRadius: "14px", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", background: statusFilter === s ? "#1c1c19" : "#ffffff", color: statusFilter === s ? "#fcf9f4" : "#535f74", boxShadow: statusFilter === s ? "none" : "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                {s === "ALL" ? "Toutes" : s === "EN_COURS" ? "En cours" : "Ouvertes"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#535f74" }}>Chargement…</div>
        ) : error ? (
          <div style={{ padding: "2rem", background: "#ffdad6", borderRadius: "16px", color: "#ba1a1a", fontWeight: 600 }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "4rem", textAlign: "center", boxShadow: "0 12px 32px rgba(10,22,40,0.06)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "1rem", color: "#ebe8e3" }}>ballot</span>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, color: "#1c1c19", margin: "0 0 0.5rem" }}>Aucune élection disponible</h3>
            <p style={{ color: "#535f74", maxWidth: "380px", margin: "0 auto", lineHeight: 1.7 }}>
              {search || statusFilter !== "ALL" ? "Aucun résultat pour ces critères." : "Les élections disponibles dans votre zone apparaîtront ici."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
            {filtered.map(el => <ElectionCard key={el.id} el={el} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function ElectionCard({ el }: { el: ElectionItem }) {
  const statusMeta = STATUS_META[el.status];

  return (
    <div style={{ background: "#ffffff", borderRadius: "24px", padding: "2rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#954a00" }}>how_to_vote</span>
          </div>
          <div>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#954a00", background: "#fff7ed", padding: "2px 8px", borderRadius: "9999px" }}>
              {TYPE_LABELS[el.type] ?? el.type}
            </span>
          </div>
        </div>
        {statusMeta && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, background: statusMeta.bg, color: statusMeta.color }}>
            {el.status === "EN_COURS" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#007432", display: "inline-block", animation: "pulse-dot 2s infinite" }} />}
            {statusMeta.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.125rem", fontWeight: 800, color: "#1c1c19", margin: 0, lineHeight: 1.3 }}>
        {el.title}
      </h3>

      {/* Meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#535f74" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>location_on</span>
          {SCOPE_LABELS[el.geographic_scope] ?? el.geographic_scope}
          {el.scope && ` — ${el.scope.name}`}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#535f74" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span>
          {fmtDateTime(el.start_time)} → {fmtDate(el.end_time)}
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "#535f74" }}>
            <strong style={{ color: "#1c1c19" }}>{el.candidates_count}</strong> candidat{el.candidates_count !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: "0.8rem", color: "#535f74" }}>
            <strong style={{ color: "#1c1c19" }}>{el.votes_count}</strong> vote{el.votes_count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Action */}
      <div style={{ borderTop: "1px solid #f6f3ee", paddingTop: "1rem" }}>
        {el.already_voted ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#f0fdf4", borderRadius: "12px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#006e2e" }}>verified</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#006e2e" }}>Vous avez déjà voté</span>
          </div>
        ) : el.can_vote ? (
          <button
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", background: "#f77f00", border: "none", borderRadius: "12px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(247,127,0,0.3)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>how_to_vote</span>
            Voter maintenant
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#f6f3ee", borderRadius: "12px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#94a3b8" }}>schedule</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#535f74" }}>
              Ouvre le {fmtDate(el.start_time)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
