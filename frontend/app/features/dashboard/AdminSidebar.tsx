import { Link, useNavigate } from "react-router";

interface Props {
  user: { email: string; role?: string };
  activePath: string;
}

const navItems = [
  { icon: "dashboard",      label: "Dashboard",      href: "/dashboard" },
  { icon: "how_to_vote",    label: "Élections",      href: "/dashboard/elections" },
  { icon: "groups",         label: "Électeurs",      href: "/dashboard/users" },
  { icon: "flag",           label: "Partis",         href: "/dashboard/parties" },
  { icon: "analytics",      label: "Résultats",      href: "/dashboard/results" },
  { icon: "calendar_today", label: "Calendrier",     href: "#" },
  { icon: "person",         label: "Mon profil",     href: "#" },
  { icon: "settings",       label: "Settings",       href: "#" },
];

export default function AdminSidebar({ user, activePath }: Props) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("voti_token");
    localStorage.removeItem("voti_user");
    localStorage.removeItem("agora_token");
    localStorage.removeItem("agora_user");
    navigate("/login");
  }

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "256px",
        height: "100vh",
        background: "#020617",
        display: "flex",
        flexDirection: "column",
        padding: "2rem 0",
        zIndex: 40,
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "0 1.5rem", marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          VOTI CI
        </h1>
        <p style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, margin: "4px 0 0", letterSpacing: "0.05em" }}>
          Plateforme Électorale
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive =
            item.href !== "#" &&
            (item.href === "/dashboard"
              ? activePath === "/dashboard"
              : activePath.startsWith(item.href));
          return (
            <Link
              key={item.label}
              to={item.href}
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
                ...(isActive
                  ? { background: "rgba(249,115,22,0.1)", color: "#f97316", borderRight: "4px solid #f97316" }
                  : { color: "#94a3b8", borderRight: "4px solid transparent" }),
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "#0f172a";
                  (e.currentTarget as HTMLElement).style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                }
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div style={{ padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#0f172a", borderRadius: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#954a00",
              border: "2px solid #1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#ffffff",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            {user.email[0].toUpperCase()}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ color: "#ffffff", fontSize: "0.875rem", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email.split("@")[0]}
            </p>
            <p style={{ color: "#64748b", fontSize: "0.7rem", margin: 0 }}>Administrateur</p>
          </div>
          <button
            onClick={logout}
            title="Se déconnecter"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex", padding: "4px", transition: "color 0.15s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f97316")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#475569")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
