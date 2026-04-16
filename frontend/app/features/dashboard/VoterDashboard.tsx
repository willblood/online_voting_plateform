import { useState } from "react";
import { useNavigate } from "react-router";

interface Props {
  user: { email: string; role: string };
}

const communes = [
  "Abidjan - Cocody",
  "Abidjan - Plateau",
  "Abidjan - Yopougon",
  "Yamoussoukro",
  "Bouaké",
  "San Pedro",
];

const bureaux = [
  "EPP Cocody Centre",
  "Lycée Sainte Marie",
  "Collège Jean Mermoz",
];

const navItems = [
  { icon: "dashboard", label: "Dashboard" },
  { icon: "how_to_vote", label: "Voter" },
  { icon: "analytics", label: "Résultats" },
  { icon: "calendar_today", label: "Calendrier" },
  { icon: "person", label: "Mon profil", active: true },
  { icon: "menu_book", label: "Guide électoral" },
  { icon: "settings", label: "Settings" },
];

export default function VoterDashboard({ user }: Props) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [commune, setCommune] = useState("");
  const [bureau, setBureau] = useState("");
  const [saved, setSaved] = useState(false);

  function logout() {
    localStorage.removeItem("voti_token");
    localStorage.removeItem("voti_user");
    localStorage.removeItem("agora_token");
    localStorage.removeItem("agora_user");
    navigate("/login");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

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
                background: "#006e2e",
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
              <p style={{ color: "#64748b", fontSize: "0.7rem", margin: 0 }}>Électeur</p>
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
      <main
        style={{
          marginLeft: "256px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background blobs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "-5%",
            width: "384px",
            height: "384px",
            background: "rgba(247,127,0,0.06)",
            borderRadius: "50%",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "-5%",
            width: "384px",
            height: "384px",
            background: "rgba(128,252,152,0.08)",
            borderRadius: "50%",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        {/* Profile card */}
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            background: "#ffffff",
            borderRadius: "24px",
            boxShadow: "0 12px 32px rgba(10,22,40,0.06)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Decorative top wave */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "#f77f00",
              opacity: 0.05,
              clipPath: "polygon(43% 0%, 100% 0%, 100% 45%, 79% 34%, 58% 46%, 40% 32%, 24% 42%, 0% 28%, 0% 0%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "#006e2e",
              opacity: 0.04,
              clipPath: "polygon(0% 100%, 0% 64%, 18% 74%, 39% 62%, 58% 75%, 78% 61%, 100% 72%, 100% 100%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", padding: "3rem", zIndex: 1 }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <span
                style={{
                  display: "inline-block",
                  background: "#80fc98",
                  color: "#007432",
                  padding: "4px 16px",
                  borderRadius: "9999px",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                Mon Profil Électoral
              </span>
              <h1
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#1c1c19",
                  margin: "0 0 0.75rem",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                Informations Personnelles
              </h1>
              <p style={{ color: "#574335", fontSize: "0.875rem", maxWidth: "320px", margin: "0 auto", lineHeight: 1.6 }}>
                Veuillez compléter votre profil électoral pour finaliser votre inscription.
              </p>
            </div>

            {/* Success message */}
            {saved && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "#80fc98",
                  border: "1px solid rgba(0,110,46,0.2)",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#007432", fontSize: "18px" }}>check_circle</span>
                <span style={{ fontSize: "0.875rem", color: "#007432", fontWeight: 600 }}>
                  Profil mis à jour avec succès !
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Name row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "#574335",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Koffi"
                    style={{
                      width: "100%",
                      height: "56px",
                      padding: "0 20px",
                      background: "#ebe8e3",
                      border: "none",
                      borderRadius: "12px",
                      color: "#1c1c19",
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "background 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "#e5e2dd";
                      e.currentTarget.style.boxShadow = "0 0 0 2px rgba(149,74,0,0.2)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "#ebe8e3";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "#574335",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Nom de famille
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: Kouassi"
                    style={{
                      width: "100%",
                      height: "56px",
                      padding: "0 20px",
                      background: "#ebe8e3",
                      border: "none",
                      borderRadius: "12px",
                      color: "#1c1c19",
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "background 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "#e5e2dd";
                      e.currentTarget.style.boxShadow = "0 0 0 2px rgba(149,74,0,0.2)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "#ebe8e3";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Birth date */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#574335",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  style={{
                    width: "100%",
                    height: "56px",
                    padding: "0 20px",
                    background: "#ebe8e3",
                    border: "none",
                    borderRadius: "12px",
                    color: "#1c1c19",
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "background 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = "#e5e2dd";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(149,74,0,0.2)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = "#ebe8e3";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Commune */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#574335",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Commune
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    style={{
                      width: "100%",
                      height: "56px",
                      padding: "0 48px 0 20px",
                      background: "#ebe8e3",
                      border: "none",
                      borderRadius: "12px",
                      color: commune ? "#1c1c19" : "#95a0b8",
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "0.9rem",
                      outline: "none",
                      appearance: "none",
                      boxSizing: "border-box",
                      transition: "background 0.2s",
                      cursor: "pointer",
                    }}
                    onFocus={(e) => (e.currentTarget.style.background = "#e5e2dd")}
                    onBlur={(e) => (e.currentTarget.style.background = "#ebe8e3")}
                  >
                    <option value="" disabled>Sélectionnez votre commune</option>
                    {communes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#574335",
                      fontSize: "20px",
                      pointerEvents: "none",
                    }}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {/* Bureau de vote */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#574335",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Bureau de vote
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={bureau}
                    onChange={(e) => setBureau(e.target.value)}
                    style={{
                      width: "100%",
                      height: "56px",
                      padding: "0 48px 0 20px",
                      background: "#ebe8e3",
                      border: "none",
                      borderRadius: "12px",
                      color: bureau ? "#1c1c19" : "#95a0b8",
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "0.9rem",
                      outline: "none",
                      appearance: "none",
                      boxSizing: "border-box",
                      transition: "background 0.2s",
                      cursor: "pointer",
                    }}
                    onFocus={(e) => (e.currentTarget.style.background = "#e5e2dd")}
                    onBlur={(e) => (e.currentTarget.style.background = "#ebe8e3")}
                  >
                    <option value="" disabled>Choisissez un centre</option>
                    {bureaux.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#574335",
                      fontSize: "20px",
                      pointerEvents: "none",
                    }}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div style={{ paddingTop: "8px" }}>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    height: "56px",
                    background: "#f77f00",
                    border: "none",
                    borderRadius: "9999px",
                    color: "#ffffff",
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(247,127,0,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "transform 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#954a00";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#f77f00";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  Enregistrer mon profil
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Terms */}
            <div
              style={{
                marginTop: "2rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid #e5e2dd",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "0.75rem", color: "#95a0b8", margin: 0 }}>
                En cliquant sur Enregistrer, vous acceptez nos{" "}
                <a href="#" style={{ color: "#954a00", textDecoration: "none" }}>
                  Conditions d'Utilisation
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
