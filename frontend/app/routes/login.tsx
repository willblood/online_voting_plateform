import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Connexion | VOTI CI" },
    { name: "description", content: "Accédez à votre espace sécurisé VOTI CI." },
  ];
}

// ── OTP input: 6 individual digit boxes ─────────────────────────────────────
function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    const next = (value.split("").concat(Array(6).fill(""))).slice(0, 6);
    next[i] = ch;
    const result = next.join("");
    onChange(result);
    if (ch && i < 5) setTimeout(() => inputs.current[i + 1]?.focus(), 0);
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(digits.padEnd(6, "").slice(0, 6));
    const focusIdx = Math.min(digits.length, 5);
    setTimeout(() => inputs.current[focusIdx]?.focus(), 0);
  }

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: "52px",
            height: "60px",
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 700,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            background: value[i] ? "#1c1c19" : "#ebe8e3",
            color: value[i] ? "#ffffff" : "#1c1c19",
            border: "none",
            borderRadius: "12px",
            outline: "none",
            transition: "background 0.15s, color 0.15s",
            cursor: disabled ? "not-allowed" : "text",
          }}
          onFocus={(e) => { if (!value[i]) e.currentTarget.style.background = "#e5e2dd"; }}
          onBlur={(e) => { if (!value[i]) e.currentTarget.style.background = "#ebe8e3"; }}
        />
      ))}
    </div>
  );
}

// ── Main Login Component ─────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP step
  const [otpStep, setOtpStep] = useState(false);
  const [nationalId, setNationalId] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  // Auto-submit OTP when all 6 digits are filled
  useEffect(() => {
    if (otp.replace(/\s/g, "").length === 6 && !otpLoading) {
      handleOtpSubmit();
    }
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? "Identifiants incorrects. Veuillez vérifier vos informations.");
        return;
      }

      // Admin / Observer → JWT returned directly
      if (data.access_token) {
        localStorage.setItem("voti_token", data.access_token);
        localStorage.setItem("voti_user", JSON.stringify(data.user));
        navigate("/dashboard");
        return;
      }

      // Voter → OTP challenge
      if (data.requires_otp) {
        setNationalId(data.national_id);
        if (data.__dev_otp) setDevOtp(data.__dev_otp);
        setOtpStep(true);
      }
    } catch {
      setError("Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit() {
    setOtpError("");
    setOtpLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ national_id: nationalId, otp_code: otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOtpError(data?.message ?? "Code invalide. Veuillez réessayer.");
        setOtp("");
        return;
      }
      localStorage.setItem("voti_token", data.access_token);
      localStorage.setItem("voti_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      setOtpError("Impossible de joindre le serveur.");
    } finally {
      setOtpLoading(false);
    }
  }

  const inputBase: React.CSSProperties = {
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
  };

  const labelBase: React.CSSProperties = {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#574335",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Manrope, sans-serif", background: "#fcf9f4", color: "#1c1c19" }}>

      {/* ── Left panel ── */}
      <section
        style={{ flex: "0 0 50%", background: "#0A1628", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem" }}
        className="hidden lg:flex"
      >
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(247,127,0,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(0,110,46,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "480px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "9999px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "2rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#80fc98", display: "inline-block" }} />
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>Institution Digitalisée</span>
          </div>

          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "clamp(2.5rem, 4vw, 3.75rem)", fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 1.5rem" }}>
            L'excellence électorale{" "}
            <span style={{ color: "#f77f00" }}>à votre portée.</span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "400px", margin: "0 0 3rem" }}>
            Accédez à votre espace sécurisé pour participer au futur de la nation ivoirienne. Transparence, intégrité et innovation.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
            {[{ val: "8.2M", label: "Électeurs inscrits" }, { val: "22", label: "Districts" }, { val: "847", label: "Communes" }].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", padding: "1.25rem 1rem", textAlign: "center" }}>
                <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "4px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Right panel ── */}
      <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "#fcf9f4" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          {/* Mobile logo */}
          <div style={{ marginBottom: "2.5rem" }} className="lg:hidden">
            <Link to="/" style={{ textDecoration: "none" }}>
              <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#1c1c19", letterSpacing: "-0.02em" }}>VOTI CI</span>
            </Link>
          </div>

          {/* ── Step 1: credentials ── */}
          {!otpStep && (
            <>
              <div style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>Bonjour à nouveau</h2>
                <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>Veuillez entrer vos identifiants pour continuer.</p>
              </div>

              {error && (
                <div style={{ padding: "12px 16px", background: "#ffdad6", border: "1px solid rgba(186,26,26,0.2)", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span className="material-symbols-outlined" style={{ color: "#ba1a1a", fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>error</span>
                  <span style={{ fontSize: "0.82rem", color: "#ba1a1a", lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Identifier */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="identifier" style={labelBase}>ID National ou Email</label>
                  <div style={{ position: "relative" }}>
                    <span className="material-symbols-outlined" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#95a0b8", fontSize: "20px", pointerEvents: "none" }}>badge</span>
                    <input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="CI0012345678 ou nom@email.ci"
                      disabled={loading}
                      required
                      style={inputBase}
                      onFocus={(e) => (e.currentTarget.style.background = "#e5e2dd")}
                      onBlur={(e) => (e.currentTarget.style.background = "#ebe8e3")}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label htmlFor="password" style={labelBase}>Mot de passe</label>
                    <button type="button" style={{ background: "none", border: "none", padding: 0, fontSize: "0.75rem", fontWeight: 700, color: "#954a00", cursor: "pointer", fontFamily: "Manrope, sans-serif" }}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <span className="material-symbols-outlined" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#95a0b8", fontSize: "20px", pointerEvents: "none" }}>lock</span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={loading}
                      required
                      style={{ ...inputBase, padding: "16px 48px 16px 48px" }}
                      onFocus={(e) => (e.currentTarget.style.background = "#e5e2dd")}
                      onBlur={(e) => (e.currentTarget.style.background = "#ebe8e3")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", padding: 0, cursor: "pointer", color: "#95a0b8", display: "flex", alignItems: "center" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifier || !password}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: loading || !identifier || !password ? "#ebe8e3" : "linear-gradient(to right, #954a00, #f77f00)",
                    border: "none",
                    borderRadius: "9999px",
                    color: loading || !identifier || !password ? "#95a0b8" : "#ffffff",
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: loading || !identifier || !password ? "not-allowed" : "pointer",
                    boxShadow: loading || !identifier || !password ? "none" : "0 8px 24px rgba(149,74,0,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {loading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: "spin-slow 1s linear infinite" }}>
                        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M16 9a7 7 0 0 0-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Connexion en cours…
                    </>
                  ) : "Se connecter"}
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: OTP verification ── */}
          {otpStep && (
            <>
              <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #954a00, #f77f00)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "#fff" }}>sms</span>
                </div>
                <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>Vérification OTP</h2>
                <p style={{ color: "#535f74", fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                  Un code à 6 chiffres a été envoyé sur votre téléphone.
                  <br />
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.85rem", color: "#1c1c19", fontWeight: 700 }}>{nationalId}</span>
                </p>

                {/* Dev OTP hint */}
                {devOtp && (
                  <div style={{ marginTop: "1rem", padding: "10px 16px", background: "#fff7ed", border: "1px solid #f97316", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#f97316" }}>info</span>
                    <span style={{ fontSize: "0.75rem", color: "#7c4a00", fontWeight: 700 }}>Dev: <span style={{ fontFamily: "DM Mono, monospace", letterSpacing: "0.15em" }}>{devOtp}</span></span>
                  </div>
                )}
              </div>

              {otpError && (
                <div style={{ padding: "12px 16px", background: "#ffdad6", border: "1px solid rgba(186,26,26,0.2)", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span className="material-symbols-outlined" style={{ color: "#ba1a1a", fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>error</span>
                  <span style={{ fontSize: "0.82rem", color: "#ba1a1a", lineHeight: 1.5 }}>{otpError}</span>
                </div>
              )}

              <OtpInput value={otp} onChange={setOtp} disabled={otpLoading} />

              <button
                type="button"
                onClick={handleOtpSubmit}
                disabled={otpLoading || otp.replace(/\s/g, "").length < 6}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginTop: "1.5rem",
                  background: otpLoading || otp.length < 6 ? "#ebe8e3" : "linear-gradient(to right, #954a00, #f77f00)",
                  border: "none",
                  borderRadius: "9999px",
                  color: otpLoading || otp.length < 6 ? "#95a0b8" : "#ffffff",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: otpLoading || otp.length < 6 ? "not-allowed" : "pointer",
                  boxShadow: otpLoading || otp.length < 6 ? "none" : "0 8px 24px rgba(149,74,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {otpLoading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: "spin-slow 1s linear infinite" }}>
                      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M16 9a7 7 0 0 0-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Vérification…
                  </>
                ) : "Confirmer le code"}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => { setOtpStep(false); setOtp(""); setOtpError(""); setDevOtp(""); }}
                  style={{ background: "none", border: "none", fontSize: "0.875rem", fontWeight: 700, color: "#535f74", cursor: "pointer", fontFamily: "Manrope, sans-serif", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
                  Retour
                </button>
                <span style={{ color: "#e5e2dd" }}>|</span>
                <button
                  type="button"
                  onClick={async () => {
                    setOtpError("");
                    try {
                      const res = await fetch(`${apiUrl}/auth/resend-otp`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ national_id: nationalId }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (data.__dev_otp) setDevOtp(data.__dev_otp);
                      setOtp("");
                    } catch {
                      setOtpError("Impossible de renvoyer le code.");
                    }
                  }}
                  style={{ background: "none", border: "none", fontSize: "0.875rem", fontWeight: 700, color: "#954a00", cursor: "pointer", fontFamily: "Manrope, sans-serif" }}
                >
                  Renvoyer le code
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
