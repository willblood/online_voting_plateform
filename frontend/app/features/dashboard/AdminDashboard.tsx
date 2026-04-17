import { useState } from "react";
import { Link, useNavigate } from "react-router";

interface Props {
  user: { email: string; role: string };
}

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard", active: true },
  { icon: "groups", label: "Électeurs", href: "/admin/voters", active: false },
  { icon: "analytics", label: "Résultats", href: "#", active: false },
  { icon: "calendar_today", label: "Calendrier", href: "#", active: false },
  { icon: "person", label: "Mon profil", href: "#", active: false },
  { icon: "menu_book", label: "Guide électoral", href: "#", active: false },
  { icon: "settings", label: "Settings", href: "#", active: false },
];

const elections = [
  {
    id: 1,
    icon: "how_to_vote",
    iconBg: "#fff7ed",
    iconColor: "#954a00",
    name: "Législatives Nationales 2024",
    date: "05 Dec 2024",
    status: "En cours",
    statusBg: "#80fc98",
    statusColor: "#007432",
    actions: ["edit", "lock"],
  },
  {
    id: 2,
    icon: "groups",
    iconBg: "#f1f5f9",
    iconColor: "#94a3b8",
    name: "Municipales Partielles",
    date: "12 Jan 2025",
    status: "Planifié",
    statusBg: "#ebe8e3",
    statusColor: "#535f74",
    actions: ["edit", "lock"],
  },
  {
    id: 3,
    icon: "verified",
    iconBg: "#f0fdf4",
    iconColor: "#006e2e",
    name: "Sénatoriales 2023",
    date: "15 Sep 2023",
    status: "Terminé",
    statusBg: "#f1f5f9",
    statusColor: "#94a3b8",
    actions: ["visibility"],
  },
];

export default function AdminDashboard({ user }: Props) {
  const navigate = useNavigate();
  const [region, setRegion] = useState("Toutes les régions");
  const [dept, setDept] = useState("Tous les départements");
  const [commune, setCommune] = useState("Toutes les communes");

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
          {navItems.map((item) => (
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
                ...(item.active
                  ? {
                      background: "rgba(249,115,22,0.1)",
                      color: "#f97316",
                      borderRight: "4px solid #f97316",
                    }
                  : {
                      color: "#94a3b8",
                      borderRight: "4px solid transparent",
                    }),
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  (e.currentTarget as HTMLElement).style.background = "#0f172a";
                  (e.currentTarget as HTMLElement).style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                }
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User card */}
        <div style={{ padding: "0 1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              background: "#0f172a",
              borderRadius: "12px",
            }}
          >
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
              <p
                style={{
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email.split("@")[0]}
              </p>
              <p style={{ color: "#64748b", fontSize: "0.7rem", margin: 0 }}>Administrateur</p>
            </div>
            <button
              onClick={logout}
              title="Se déconnecter"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#475569",
                display: "flex",
                padding: "4px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f97316")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#475569")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh", position: "relative" }}>
        {/* Organic background blobs */}
        <svg
          style={{ position: "absolute", top: "-5%", right: "-3%", width: "380px", height: "380px", opacity: 0.06, color: "#954a00", pointerEvents: "none" }}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,77.3,-44.7C85.4,-31.3,90.5,-15.7,89.2,-0.8C87.8,14.2,80,28.4,70.1,40.4C60.2,52.4,48.2,62.2,34.7,69.5C21.2,76.8,6.2,81.6,-9.3,80.1C-24.8,78.6,-40.8,70.8,-54.3,60.1C-67.8,49.4,-78.8,35.8,-83.4,20.4C-88,5.1,-86.2,-12.1,-79.6,-27.2C-73,-42.3,-61.6,-55.3,-48.2,-62.5C-34.8,-69.7,-17.4,-71.1,-0.8,-69.7C15.8,-68.3,31.3,-64,44.7,-76.4Z" fill="currentColor" transform="translate(100 100)" />
        </svg>

        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "3rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div>
            <span
              style={{
                display: "block",
                fontFamily: "Manrope, sans-serif",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#954a00",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Administration Centrale
            </span>
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "2.25rem",
                fontWeight: 800,
                color: "#1c1c19",
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              Tableau de Bord
            </h2>
            <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>
              Bienvenue, contrôlez l'intégrité et le flux des processus électoraux.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                background: "#ffffff",
                border: "1px solid rgba(222,193,175,0.4)",
                borderRadius: "9999px",
                color: "#954a00",
                fontFamily: "Manrope, sans-serif",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.875rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>download</span>
              Rapport National
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 32px",
                background: "#f77f00",
                border: "none",
                borderRadius: "9999px",
                color: "#ffffff",
                fontFamily: "Manrope, sans-serif",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.875rem",
                boxShadow: "0 8px 24px rgba(247,127,0,0.25)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
              Nouvelle Élection
            </button>
          </div>
        </header>

        {/* ── Stats section ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Participation card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "2rem",
              boxShadow: "0 12px 32px rgba(10,22,40,0.06)",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
              <div>
                <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#1c1c19", margin: "0 0 4px" }}>
                  Participation Nationale
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#535f74", margin: 0 }}>Temps réel — Élections Législatives 2024</p>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 16px",
                  borderRadius: "9999px",
                  background: "#80fc98",
                  color: "#007432",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#006e2e",
                    display: "inline-block",
                    animation: "pulse-dot 2s infinite",
                  }}
                />
                EN DIRECT
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "3rem" }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontSize: "4rem",
                    fontWeight: 800,
                    color: "#954a00",
                    lineHeight: 1,
                    marginBottom: "12px",
                  }}
                >
                  74.8<span style={{ fontSize: "2rem" }}>%</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "16px",
                    background: "#ebe8e3",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "74.8%",
                      height: "100%",
                      background: "linear-gradient(to right, #954a00, #f77f00)",
                      borderRadius: "9999px",
                    }}
                  />
                </div>
                <p style={{ marginTop: "12px", fontSize: "0.8rem", color: "#535f74" }}>
                  <span style={{ color: "#006e2e", fontWeight: 700 }}>+5.2%</span> par rapport aux élections de 2020
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", textAlign: "right", flexShrink: 0 }}>
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Inscrits</p>
                  <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>8.2M</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Votants</p>
                  <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>6.1M</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "2rem",
              boxShadow: "0 12px 32px rgba(10,22,40,0.06)",
              borderLeft: "8px solid #006e2e",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>
              Sécurité des Bureaux
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "12px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "#80fc98",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "#007432" }}>verified_user</span>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    color: "#1c1c19",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  99.2%
                </p>
                <p style={{ color: "#535f74", fontSize: "0.875rem", fontWeight: 500, margin: "4px 0 0" }}>
                  Bureaux Opérationnels
                </p>
              </div>
            </div>
            <p style={{ fontSize: "0.7rem", color: "#95a0b8", fontStyle: "italic", marginTop: "auto" }}>
              Dernière vérification à 14:30 GMT
            </p>
          </div>
        </section>

        {/* ── Geographic filters ── */}
        <section style={{ marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "1.5rem",
              boxShadow: "0 4px 16px rgba(10,22,40,0.04)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                paddingRight: "1.5rem",
                borderRight: "1px solid rgba(222,193,175,0.4)",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#954a00", fontSize: "22px" }}>filter_alt</span>
              <span style={{ fontWeight: 700, color: "#1c1c19" }}>Filtrage Géographique</span>
            </div>
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
              }}
            >
              {[
                {
                  label: "Région",
                  value: region,
                  options: ["Toutes les régions", "Lagunes", "Haut-Sassandra", "Bas-Sassandra"],
                  onChange: setRegion,
                },
                {
                  label: "Département",
                  value: dept,
                  options: ["Tous les départements", "Abidjan", "Yamoussoukro", "Bouaké"],
                  onChange: setDept,
                },
                {
                  label: "Commune",
                  value: commune,
                  options: ["Toutes les communes", "Cocody", "Plateau", "Marcory"],
                  onChange: setCommune,
                },
                {
                  label: "Niveau",
                  value: "National",
                  options: ["National", "International (Diaspora)"],
                  onChange: () => {},
                },
              ].map((filter) => (
                <div key={filter.label} style={{ position: "relative" }}>
                  <label
                    style={{
                      position: "absolute",
                      top: "-9px",
                      left: "12px",
                      padding: "0 4px",
                      background: "#ffffff",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: "#535f74",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      zIndex: 1,
                    }}
                  >
                    {filter.label}
                  </label>
                  <select
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 36px 12px 16px",
                      background: "#f6f3ee",
                      border: "none",
                      borderRadius: "12px",
                      color: "#1c1c19",
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      appearance: "none",
                      outline: "none",
                    }}
                  >
                    {filter.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      fontSize: "18px",
                      pointerEvents: "none",
                    }}
                  >
                    expand_more
                  </span>
                </div>
              ))}
            </div>
            <button
              style={{
                padding: "12px 24px",
                background: "#1c1c19",
                border: "none",
                borderRadius: "12px",
                color: "#fcf9f4",
                fontFamily: "Manrope, sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#2d2d26")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1c1c19")}
            >
              Appliquer
            </button>
          </div>
        </section>

        {/* ── Elections table ── */}
        <section style={{ position: "relative", zIndex: 10 }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              boxShadow: "0 12px 32px rgba(10,22,40,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "2rem",
                borderBottom: "1px solid #ebe8e3",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#1c1c19",
                  margin: 0,
                }}
              >
                Gestion des Élections
              </h3>
              <span
                style={{
                  padding: "4px 16px",
                  borderRadius: "9999px",
                  background: "#ebe8e3",
                  color: "#535f74",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                2023–2025
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f6f3ee" }}>
                    {["Nom de l'Élection", "Date Prévue", "Statut", "Actions"].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: "1rem 2rem",
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          color: "#535f74",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          textAlign: i === 3 ? "right" : "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {elections.map((el) => (
                    <ElectionRow key={el.id} election={el} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                padding: "1.25rem 2rem",
                background: "rgba(246,243,238,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #ebe8e3",
              }}
            >
              <p style={{ fontSize: "0.8rem", color: "#535f74", margin: 0 }}>
                Affichage de 1–3 sur 12 élections
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                {["chevron_left", "1", "2", "chevron_right"].map((item, i) => (
                  <button
                    key={i}
                    style={{
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "12px",
                      border: item === "1" ? "none" : "1px solid rgba(222,193,175,0.4)",
                      background: item === "1" ? "#954a00" : "#ffffff",
                      color: item === "1" ? "#ffffff" : "#535f74",
                      fontFamily: "Manrope, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    {item === "chevron_left" || item === "chevron_right" ? (
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{item}</span>
                    ) : (
                      item
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ElectionRow({ election }: { election: (typeof elections)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: "1px solid #ebe8e3",
        background: hovered ? "rgba(246,243,238,0.5)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <td style={{ padding: "1.25rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: election.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ color: election.iconColor, fontSize: "20px" }}>
              {election.icon}
            </span>
          </div>
          <span style={{ fontWeight: 700, color: "#1c1c19" }}>{election.name}</span>
        </div>
      </td>
      <td style={{ padding: "1.25rem 2rem", fontSize: "0.875rem", fontWeight: 500, color: "#535f74" }}>
        {election.date}
      </td>
      <td style={{ padding: "1.25rem 2rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 12px",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            background: election.statusBg,
            color: election.statusColor,
          }}
        >
          {election.status}
        </span>
      </td>
      <td style={{ padding: "1.25rem 2rem", textAlign: "right" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.15s",
          }}
        >
          {election.actions.map((action) => (
            <button
              key={action}
              title={action}
              style={{
                padding: "8px",
                background: "transparent",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#535f74",
                display: "flex",
                alignItems: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#ebe8e3")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{action}</span>
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
}
