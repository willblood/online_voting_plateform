import { useLocation } from "react-router";
import VoterSidebar from "./VoterSidebar.js";

interface Props {
  user: { email: string; role: string; first_name?: string; last_name?: string };
}

export default function VoterDashboard({ user }: Props) {
  const location = useLocation();

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.email.split("@")[0];

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
            { icon: "how_to_vote", label: "Élections à venir", value: "—", bg: "#fff7ed", iconColor: "#954a00", href: "/elections" },
            { icon: "location_on", label: "Bureau de vote", value: "Voir profil", bg: "#f0fdf4", iconColor: "#006e2e", href: "#" },
            { icon: "calendar_today", label: "Prochain scrutin", value: "—", bg: "#eff6ff", iconColor: "#1d4ed8", href: "#" },
          ].map((card) => (
            <div key={card.label} style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px", color: card.iconColor }}>{card.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>{card.label}</p>
                <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "#1c1c19", margin: 0 }}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to elections */}
        <div style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 12px 32px rgba(10,22,40,0.06)", padding: "3rem", textAlign: "center", position: "relative", zIndex: 10 }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #006e2e, #80fc98)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "#fff" }}>ballot</span>
          </div>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 0.75rem" }}>
            Consultez vos élections
          </h3>
          <p style={{ color: "#535f74", maxWidth: "420px", margin: "0 auto 1.5rem", lineHeight: 1.7 }}>
            Les élections disponibles pour votre région sont accessibles depuis votre espace Mes Élections.
          </p>
          <a
            href="/elections"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", background: "#f77f00", borderRadius: "9999px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", boxShadow: "0 8px 24px rgba(247,127,0,0.25)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>how_to_vote</span>
            Mes Élections
          </a>
        </div>
      </main>
    </div>
  );
}
