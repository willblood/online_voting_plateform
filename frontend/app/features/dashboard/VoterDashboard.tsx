import { useNavigate } from "react-router";

interface Props {
  user: { email: string; role: string; first_name?: string; last_name?: string };
}

const navItems = [
  { icon: "dashboard", label: "Dashboard", active: true },
  { icon: "how_to_vote", label: "Voter", active: false },
  { icon: "analytics", label: "Résultats", active: false },
  { icon: "calendar_today", label: "Calendrier", active: false },
  { icon: "person", label: "Mon profil", active: false },
  { icon: "menu_book", label: "Guide électoral", active: false },
  { icon: "settings", label: "Settings", active: false },
];

export default function VoterDashboard({ user }: Props) {
  const navigate = useNavigate();

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.email.split("@")[0];

  const initials =
    user.first_name && user.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user.email[0].toUpperCase();

  function logout() {
    localStorage.removeItem("voti_token");
    localStorage.removeItem("voti_user");
    localStorage.removeItem("agora_token");
    localStorage.removeItem("agora_user");
    navigate("/login");
  }

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>

      {/* ── Sidebar ── */}
      <aside style={{ position: "fixed", left: 0, top: 0, width: "256px", height: "100vh", background: "#020617", display: "flex", flexDirection: "column", padding: "2rem 0", zIndex: 40, boxShadow: "4px 0 24px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "0 1.5rem", marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>VOTI CI</h1>
          <p style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, margin: "4px 0 0", letterSpacing: "0.05em" }}>Plateforme Électorale</p>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 24px",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
                ...(item.active
                  ? { background: "rgba(249,115,22,0.1)", color: "#f97316", borderRight: "4px solid #f97316" }
                  : { color: "#94a3b8", borderRight: "4px solid transparent" }),
              }}
              onMouseEnter={(e) => { if (!item.active) { (e.currentTarget as HTMLElement).style.background = "#0f172a"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; } }}
              onMouseLeave={(e) => { if (!item.active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; } }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div style={{ padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#0f172a", borderRadius: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#006e2e", border: "2px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#ffffff", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1rem" }}>
              {initials}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ color: "#ffffff", fontSize: "0.875rem", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
              <p style={{ color: "#64748b", fontSize: "0.7rem", margin: 0 }}>Électeur</p>
            </div>
            <button onClick={logout} title="Se déconnecter" style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex", padding: "4px", transition: "color 0.15s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f97316")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#475569")}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
            </button>
          </div>
        </div>
      </aside>

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
            Bienvenue, {user.first_name ?? displayName} 👋
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
            { icon: "how_to_vote", label: "Élections à venir", value: "—", bg: "#fff7ed", iconColor: "#954a00" },
            { icon: "location_on", label: "Bureau de vote", value: "Voir profil", bg: "#f0fdf4", iconColor: "#006e2e" },
            { icon: "calendar_today", label: "Prochain scrutin", value: "—", bg: "#eff6ff", iconColor: "#1d4ed8" },
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

        {/* Info notice */}
        <div style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 12px 32px rgba(10,22,40,0.06)", padding: "3rem", textAlign: "center", position: "relative", zIndex: 10 }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #006e2e, #80fc98)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "#fff" }}>ballot</span>
          </div>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 0.75rem" }}>
            Aucune élection en cours
          </h3>
          <p style={{ color: "#535f74", maxWidth: "420px", margin: "0 auto", lineHeight: 1.7 }}>
            Les élections disponibles apparaîtront ici lorsqu'elles seront ouvertes. Vous serez notifié dès qu'un scrutin est lancé.
          </p>
        </div>
      </main>
    </div>
  );
}
