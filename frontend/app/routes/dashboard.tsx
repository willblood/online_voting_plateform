import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

const C = {
  void: "#03030c",
  base: "#07071a",
  surface: "#0d0d24",
  elevated: "#13132e",
  border: "#1e1e48",
  gold: "#c8a84b",
  goldBright: "#e8c86a",
  goldDim: "rgba(200,168,75,0.10)",
  text: "#f0f0fc",
  textDim: "#9090c0",
  textMuted: "#404078",
  teal: "#00d4a0",
  red: "#ff3d5c",
};
const F = {
  display: '"Cormorant Garamond", Georgia, serif',
  mono: '"DM Mono", monospace',
  ui: '"Sora", system-ui, sans-serif',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("agora_user");
    if (!raw) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(raw));
  }, [navigate]);

  function logout() {
    localStorage.removeItem("agora_token");
    localStorage.removeItem("agora_user");
    navigate("/login");
  }

  if (!user) return null;

  return (
    <div style={{ background: C.base, color: C.text, minHeight: "100vh", fontFamily: F.ui }}>
      {/* Header */}
      <header
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          background: C.void,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              background: C.gold,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: F.display, fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.12em" }}>
            AGO<span style={{ color: C.gold }}>RA</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.78rem", color: C.text }}>{user.email}</div>
            <div style={{ fontFamily: F.mono, fontSize: "0.6rem", color: C.gold, letterSpacing: "0.1em" }}>
              {user.role}
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: "7px 16px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.textMuted,
              fontFamily: F.ui,
              fontSize: "0.72rem",
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = C.red;
              (e.currentTarget as HTMLElement).style.color = C.red;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = C.border;
              (e.currentTarget as HTMLElement).style.color = C.textMuted;
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 2rem" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ fontFamily: F.mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: "0.75rem" }}>
            Command Center
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: "2.8rem", fontWeight: 400, fontStyle: "italic", margin: 0, color: C.text }}>
            Welcome back, <strong style={{ fontStyle: "normal", fontWeight: 700 }}>{user.email.split("@")[0]}</strong>
          </h1>
        </div>

        {/* Quick action cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1px",
            background: C.border,
            border: `1px solid ${C.border}`,
            marginBottom: "2rem",
          }}
        >
          {[
            { label: "Elections", desc: "Manage & monitor elections", icon: "🗳", href: "#" },
            { label: "Candidates", desc: "Register and view candidates", icon: "👤", href: "#" },
            { label: "Districts", desc: "Geographic management", icon: "🗺", href: "#" },
            { label: "Results", desc: "Enter and publish results", icon: "📊", href: "#" },
            { label: "Users", desc: "Manage platform users", icon: "⚙️", href: "#" },
            { label: "Analytics", desc: "Statistics and reports", icon: "📈", href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                background: C.surface,
                padding: "1.5rem",
                textDecoration: "none",
                display: "block",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.elevated)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = C.surface)}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>{item.icon}</div>
              <div style={{ fontFamily: F.display, fontSize: "1.1rem", fontWeight: 600, color: C.text, marginBottom: "4px" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "0.75rem", color: C.textDim }}>{item.desc}</div>
            </a>
          ))}
        </div>

        {/* Status strip */}
        <div
          style={{
            border: `1px solid ${C.border}`,
            background: C.surface,
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.teal, display: "inline-block" }} />
            <span style={{ fontFamily: F.mono, fontSize: "0.65rem", color: C.teal }}>API Connected</span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: "0.65rem", color: C.textMuted }}>
            Authenticated as <span style={{ color: C.text }}>{user.role}</span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link
              to="/"
              style={{ fontFamily: F.mono, fontSize: "0.62rem", color: C.textMuted, textDecoration: "none" }}
            >
              ← Public site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
