import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Connexion | VOTI CI" },
    { name: "description", content: "Accédez à votre espace sécurisé VOTI CI." },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let data: { access_token?: string; user?: { role?: string }; message?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError("Réponse inattendue du serveur. Veuillez réessayer.");
        return;
      }
      if (!res.ok) {
        setError(data?.message ?? "Identifiants incorrects. Veuillez vérifier vos informations.");
        return;
      }
      localStorage.setItem("voti_token", data.access_token!);
      localStorage.setItem("voti_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      setError("Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "Manrope, sans-serif",
        background: "#fcf9f4",
        color: "#1c1c19",
      }}
    >
      {/* ── Left panel: dark navy branding ── */}
      <section
        style={{
          flex: "0 0 50%",
          background: "#0A1628",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "5rem",
        }}
        className="hidden lg:flex"
      >
        {/* Glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-10%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(247,127,0,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-10%",
            width: "800px",
            height: "800px",
            background: "radial-gradient(circle, rgba(0,110,46,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "480px" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              marginBottom: "2rem",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#80fc98",
                display: "inline-block",
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              Institution Digitalisée
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "clamp(2.5rem, 4vw, 3.75rem)",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 1.5rem",
            }}
          >
            L'excellence électorale{" "}
            <span style={{ color: "#f77f00" }}>à votre portée.</span>
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "1.1rem",
              lineHeight: 1.7,
              maxWidth: "400px",
              margin: "0 0 3rem",
            }}
          >
            Accédez à votre espace sécurisé pour participer au futur de la nation ivoirienne.
            Transparence, intégrité et innovation.
          </p>

          {/* Stats strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {[
              { val: "8.2M", label: "Électeurs inscrits" },
              { val: "22", label: "Districts" },
              { val: "847", label: "Communes" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  padding: "1.25rem 1rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "#ffffff",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#64748b",
                    marginTop: "4px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Right panel: login form ── */}
      <section
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#fcf9f4",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {/* Mobile logo */}
          <div style={{ marginBottom: "2.5rem" }} className="lg:hidden">
            <Link to="/" style={{ textDecoration: "none" }}>
              <span
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#1c1c19",
                  letterSpacing: "-0.02em",
                }}
              >
                VOTI CI
              </span>
            </Link>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "2rem",
                fontWeight: 800,
                color: "#1c1c19",
                margin: "0 0 0.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              Bonjour à nouveau
            </h2>
            <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>
              Veuillez entrer vos identifiants pour continuer.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "#ffdad6",
                border: "1px solid rgba(186,26,26,0.2)",
                borderRadius: "12px",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#ba1a1a", fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>
                error
              </span>
              <span style={{ fontSize: "0.82rem", color: "#ba1a1a", lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#574335",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Adresse Email
              </label>
              <div style={{ position: "relative" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#95a0b8",
                    fontSize: "20px",
                    pointerEvents: "none",
                  }}
                >
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.ci"
                  autoComplete="email"
                  disabled={loading}
                  required
                  style={{
                    width: "100%",
                    padding: "16px 16px 16px 48px",
                    background: "#ebe8e3",
                    border: "none",
                    borderRadius: "12px",
                    color: "#1c1c19",
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "background 0.2s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.background = "#e5e2dd")}
                  onBlur={(e) => (e.currentTarget.style.background = "#ebe8e3")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  htmlFor="password"
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#574335",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#954a00",
                    cursor: "pointer",
                    fontFamily: "Manrope, sans-serif",
                  }}
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#95a0b8",
                    fontSize: "20px",
                    pointerEvents: "none",
                  }}
                >
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                  style={{
                    width: "100%",
                    padding: "16px 48px 16px 48px",
                    background: "#ebe8e3",
                    border: "none",
                    borderRadius: "12px",
                    color: "#1c1c19",
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "background 0.2s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.background = "#e5e2dd")}
                  onBlur={(e) => (e.currentTarget.style.background = "#ebe8e3")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "#95a0b8",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#574335",
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#954a00", cursor: "pointer" }}
              />
              Rester connecté
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                width: "100%",
                padding: "16px",
                background:
                  loading || !email || !password
                    ? "#ebe8e3"
                    : "linear-gradient(to right, #954a00, #f77f00)",
                border: "none",
                borderRadius: "9999px",
                color: loading || !email || !password ? "#95a0b8" : "#ffffff",
                fontFamily: "Manrope, sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: loading || !email || !password ? "not-allowed" : "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow:
                  loading || !email || !password
                    ? "none"
                    : "0 8px 24px rgba(149,74,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                if (!btn.disabled) btn.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                if (!btn.disabled) btn.style.transform = "translateY(0)";
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    style={{ animation: "spin-slow 1s linear infinite" }}
                  >
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <path d="M16 9a7 7 0 0 0-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Connexion en cours…
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#535f74", fontWeight: 500 }}>
            Vous n'avez pas de compte ?{" "}
            <Link
              to="/"
              style={{ color: "#954a00", fontWeight: 700, textDecoration: "none" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.textDecoration = "underline")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.textDecoration = "none")}
            >
              Créer un profil
            </Link>
          </p>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              margin: "1.5rem 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#e5e2dd" }} />
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#95a0b8",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Ou continuer avec
            </span>
            <div style={{ flex: 1, height: "1px", background: "#e5e2dd" }} />
          </div>

          {/* Alternative login */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { icon: "fingerprint", label: "Biométrie" },
              { icon: "badge", label: "ID National" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid #dec1af",
                  borderRadius: "12px",
                  color: "#1c1c19",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f6f3ee")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
