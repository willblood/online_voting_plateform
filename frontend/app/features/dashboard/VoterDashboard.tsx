import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import VoterSidebar from "./VoterSidebar.js";

interface Props {
  user: { email: string; role: string; first_name?: string; last_name?: string };
}

interface ElectionItem {
  id: string;
  title: string;
  type: string;
  status: string;
  start_time: string;
  end_time: string;
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
  OUVERT:   { label: "À venir",   bg: "#fff3cd", color: "#7a5c00" },
  EN_COURS: { label: "En cours",  bg: "#80fc98", color: "#007432" },
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function VoterDashboard({ user }: Props) {
  const location = useLocation();
  const [elections, setElections] = useState<ElectionItem[]>([]);
  const [electionsLoading, setElectionsLoading] = useState(true);

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.email.split("@")[0];

  useEffect(() => {
    const token = localStorage.getItem("voti_token") ?? "";
    fetch(`${API}/elections`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((data: ElectionItem[]) => {
        setElections(data.filter(e => e.status === "EN_COURS" || e.status === "OUVERT"));
      })
      .catch(() => {})
      .finally(() => setElectionsLoading(false));
  }, []);

  const activeCount = elections.filter(e => e.status === "EN_COURS").length;
  const upcomingCount = elections.filter(e => e.status === "OUVERT").length;
  const previewElections = elections.slice(0, 3);

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <VoterSidebar user={user} activePath={location.pathname} />

      {/* ── Main ── */}
      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh", position: "relative" }}>
        {/* Background blob */}
        <svg style={{ position: "absolute", top: "-5%", right: "-3%", width: "380px", height: "380px", opacity: 0.05, color: "#006e2e", pointerEvents: "none" }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,77.3,-44.7C85.4,-31.3,90.5,-15.7,89.2,-0.8C87.8,14.2,80,28.4,70.1,40.4C60.2,52.4,48.2,62.2,34.7,69.5C21.2,76.8,6.2,81.6,-9.3,80.1C-24.8,78.6,-40.8,70.8,-54.3,60.1C-67.8,49.4,-78.8,35.8,-83.4,20.4C-88,5.1,-86.2,-12.1,-79.6,-27.2C-73,-42.3,-61.6,-55.3,-48.2,-62.5C-34.8,-69.7,-17.4,-71.1,-0.8,-69.7C15.8,-68.3,31.3,-64,44.7,-76.4Z" fill="currentColor" transform="translate(100 100)" />
        </svg>

        {/* Welcome header */}
        <header style={{ marginBottom: "3rem", position: "relative", zIndex: 10 }}>
          <span style={{ display: "block", fontFamily: "Manrope, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "#006e2e", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
            Espace Électeur
          </span>
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2.25rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Bienvenue, {user.first_name ?? displayName}
          </h2>
          <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>
            Votre inscription est confirmée. Consultez vos informations électorales ci-dessous.
          </p>
        </header>

        {/* Status banner */}
        <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem 2rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem", position: "relative", zIndex: 10 }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#006e2e" }}>verified_user</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>Statut du compte</p>
            <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1rem", fontWeight: 800, color: "#1c1c19", margin: 0 }}>Inscrit et vérifié</p>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 16px", borderRadius: "9999px", background: "#80fc98", color: "#007432", fontSize: "0.75rem", fontWeight: 700 }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#007432", display: "inline-block" }} />
            ACTIF
          </span>
        </div>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          {[
            { icon: "how_to_vote", label: "En cours", value: electionsLoading ? "…" : String(activeCount), bg: "#f0fdf4", iconColor: "#006e2e" },
            { icon: "schedule", label: "À venir", value: electionsLoading ? "…" : String(upcomingCount), bg: "#fff7ed", iconColor: "#954a00" },
            { icon: "ballot", label: "Total disponibles", value: electionsLoading ? "…" : String(elections.length), bg: "#eff6ff", iconColor: "#1d4ed8" },
          ].map((card) => (
            <div key={card.label} style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px", color: card.iconColor }}>{card.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>{card.label}</p>
                <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#1c1c19", margin: 0, lineHeight: 1 }}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Elections preview */}
        <div style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 12px 32px rgba(10,22,40,0.06)", overflow: "hidden", position: "relative", zIndex: 10 }}>
          <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #ebe8e3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.125rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>
              Mes élections disponibles
            </h3>
            <Link to="/elections" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 700, color: "#f77f00", textDecoration: "none" }}>
              Voir toutes
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
            </Link>
          </div>

          {electionsLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#535f74" }}>Chargement…</div>
          ) : previewElections.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", display: "block", marginBottom: "0.75rem", color: "#ebe8e3" }}>ballot</span>
              <p style={{ color: "#535f74", fontWeight: 600, margin: 0 }}>Aucune élection disponible pour le moment.</p>
            </div>
          ) : (
            <div>
              {previewElections.map((el, idx) => {
                const meta = STATUS_META[el.status];
                return (
                  <div
                    key={el.id}
                    style={{ padding: "1.25rem 2rem", borderBottom: idx < previewElections.length - 1 ? "1px solid #f6f3ee" : "none", display: "flex", alignItems: "center", gap: "1rem" }}
                  >
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "#954a00" }}>how_to_vote</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: "#1c1c19", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {el.title}
                      </p>
                      <p style={{ fontSize: "0.775rem", color: "#535f74", margin: 0, fontWeight: 500 }}>
                        {TYPE_LABELS[el.type] ?? el.type} · {fmtDate(el.start_time)} → {fmtDate(el.end_time)}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                      {meta && (
                        <span style={{ padding: "3px 10px", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                      )}
                      {el.already_voted ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 700, color: "#006e2e" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>verified</span>
                          Voté
                        </span>
                      ) : el.can_vote ? (
                        <Link
                          to={`/elections/${el.id}/vote`}
                          style={{ padding: "6px 14px", background: "#f77f00", borderRadius: "9999px", color: "#fff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.75rem", textDecoration: "none" }}
                        >
                          Voter
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
