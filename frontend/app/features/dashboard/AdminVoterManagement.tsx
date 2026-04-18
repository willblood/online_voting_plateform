import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router";
import AdminSidebar from "./AdminSidebar.js";

interface Props {
  user: { email: string; role: string };
}

interface Departement {
  id: string;
  name: string;
  region: { name: string };
}

interface Commune {
  id: string;
  name: string;
}

interface BureauDeVote {
  id: string;
  name: string;
  address?: string;
}

interface Voter {
  id: string;
  national_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  status: "PENDING_OTP" | "ACTIVE" | "SUSPENDED";
  commune_id: string;
  bureau_de_vote_id?: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  PENDING_OTP: "En attente",
  SUSPENDED: "Suspendu",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: "#80fc98", color: "#007432" },
  PENDING_OTP: { bg: "#fff3cd", color: "#7a5c00" },
  SUSPENDED: { bg: "#ffdad6", color: "#ba1a1a" },
};

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Sanitization & Validation ───────────────────────────────────────────────

/** Strip HTML tags, JS protocols, and event-handler patterns to prevent XSS. */
function sanitize(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")           // strip HTML tags
    .replace(/javascript\s*:/gi, "")   // strip JS protocol
    .replace(/on\w+\s*=/gi, "")        // strip inline event handlers (onclick=…)
    .replace(/--/g, "")                // strip SQL comment sequences
    .replace(/[;'"\\]/g, "")           // strip SQL-dangerous chars from free text
    .trim();
}

/** Sanitize but keep chars valid for names (accents, hyphens, apostrophes). */
function sanitizeName(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/[<>;\\]/g, "")
    .trim();
}

const NATIONAL_ID_RE = /^CI\d{10}$/;
const PHONE_RE       = /^\+225\d{10}$/;
const EMAIL_RE       = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE        = /^[a-zA-ZÀ-ÿ'\- ]{2,50}$/;
const PASSWORD_RE    = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

function isAtLeast18(dateStr: string): boolean {
  if (!dateStr) return false;
  const dob   = new Date(dateStr);
  const limit = new Date(dob.getFullYear() + 18, dob.getMonth(), dob.getDate());
  return new Date() >= limit;
}

type FieldErrors = Partial<Record<string, string>>;

function validateRegisterForm(form: {
  national_id: string; first_name: string; last_name: string;
  date_of_birth: string; phone_number: string; email: string;
  password: string; commune_id: string;
}): FieldErrors {
  const errs: FieldErrors = {};
  if (!NATIONAL_ID_RE.test(form.national_id))
    errs.national_id = "Format invalide. Doit commencer par CI suivi de 10 chiffres (ex : CI0012345678)";
  if (!NAME_RE.test(form.first_name))
    errs.first_name = "Prénom invalide (2–50 lettres, tirets et apostrophes autorisés)";
  if (!NAME_RE.test(form.last_name))
    errs.last_name = "Nom invalide (2–50 lettres, tirets et apostrophes autorisés)";
  if (!form.date_of_birth)
    errs.date_of_birth = "La date de naissance est requise";
  else if (!isAtLeast18(form.date_of_birth))
    errs.date_of_birth = "L'électeur doit avoir au moins 18 ans";
  if (!EMAIL_RE.test(form.email))
    errs.email = "Adresse email invalide";
  if (!PHONE_RE.test(form.phone_number))
    errs.phone_number = "Format invalide. Ex : +22507XXXXXXXX (10 chiffres après +225)";
  if (!form.commune_id)
    errs.commune_id = "Veuillez sélectionner une commune";
  if (!PASSWORD_RE.test(form.password))
    errs.password = "Min. 8 caractères avec majuscule, minuscule, chiffre et symbole (!@#$…)";
  return errs;
}

function validateUpdateForm(fields: {
  first_name: string; last_name: string; phone: string;
}): FieldErrors {
  const errs: FieldErrors = {};
  if (!NAME_RE.test(fields.first_name))
    errs.first_name = "Prénom invalide (2–50 lettres, tirets et apostrophes autorisés)";
  if (!NAME_RE.test(fields.last_name))
    errs.last_name = "Nom invalide (2–50 lettres, tirets et apostrophes autorisés)";
  if (fields.phone && !PHONE_RE.test(fields.phone))
    errs.phone = "Format invalide. Ex : +22507XXXXXXXX";
  return errs;
}

/** Inline field error display */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: "0.7rem", color: "#ba1a1a", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
      <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>error</span>
      {msg}
    </p>
  );
}

// ── Register Modal ──────────────────────────────────────────────────────────
interface RegisterModalProps {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

function RegisterModal({ token, onClose, onSuccess }: RegisterModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    national_id: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone_number: "",
    email: "",
    password: "",
    commune_id: "",
    bureau_de_vote_id: "",
  });
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [bureaux, setBureaux] = useState<BureauDeVote[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [bureauLoading, setBureauLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  function validateField(field: string, value: string) {
    const next = validateRegisterForm({ ...form, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  }

  // Load departments on mount
  useEffect(() => {
    fetch(`${apiUrl}/geography/departements`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Departement[]) => setDepartements(data))
      .catch(() => {});
  }, [apiUrl, token]);

  // Load communes when department changes
  useEffect(() => {
    if (!selectedDeptId) { setCommunes([]); setBureaux([]); set("commune_id", ""); set("bureau_de_vote_id", ""); return; }
    setGeoLoading(true);
    fetch(`${apiUrl}/geography/departements/${selectedDeptId}/communes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Commune[]) => { setCommunes(data); setBureaux([]); set("commune_id", ""); set("bureau_de_vote_id", ""); })
      .catch(() => {})
      .finally(() => setGeoLoading(false));
  }, [selectedDeptId, apiUrl, token]);

  // Load bureaux when commune changes
  useEffect(() => {
    if (!form.commune_id) { setBureaux([]); set("bureau_de_vote_id", ""); return; }
    setBureauLoading(true);
    fetch(`${apiUrl}/geography/communes/${form.commune_id}/bureaux`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: BureauDeVote[]) => { setBureaux(data); set("bureau_de_vote_id", ""); })
      .catch(() => {})
      .finally(() => setBureauLoading(false));
  }, [form.commune_id, apiUrl, token]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const errs = validateRegisterForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
      const body: Record<string, string> = {
        national_id: form.national_id,
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth,
        phone_number: form.phone_number,
        email: form.email,
        password: form.password,
        role: "VOTER",
        commune_id: form.commune_id,
      };
      if (form.bureau_de_vote_id.trim()) body.bureau_de_vote_id = form.bureau_de_vote_id.trim();

      const res = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(data?.message) ? data.message.join(", ") : (data?.message ?? "Erreur lors de l'enregistrement.");
        setError(msg);
        return;
      }
      onSuccess();
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "#f6f3ee",
    border: "1.5px solid #ebe8e3",
    borderRadius: "10px",
    color: "#1c1c19",
    fontFamily: "Manrope, sans-serif",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "#574335",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        background: "rgba(0,0,0,0.45)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "560px",
          height: "100vh",
          background: "#fcf9f4",
          boxShadow: "-24px 0 64px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "2rem",
            borderBottom: "1px solid #ebe8e3",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#1c1c19",
                margin: "0 0 4px",
              }}
            >
              Enregistrer un électeur
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#535f74", margin: 0 }}>
              Créer un nouveau compte électeur
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#ebe8e3",
              border: "none",
              borderRadius: "10px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              color: "#535f74",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          ref={formRef}
          style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "#ffdad6",
                border: "1px solid rgba(186,26,26,0.2)",
                borderRadius: "10px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#ba1a1a", fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>error</span>
              <span style={{ fontSize: "0.82rem", color: "#ba1a1a", lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          {/* National ID — first field, most important */}
          <div>
            <label style={labelStyle}>ID National</label>
            <input
              type="text"
              autoComplete="off"
              inputMode="text"
              style={{ ...inputStyle, ...(errors.national_id ? { borderColor: "#ba1a1a" } : {}) }}
              value={form.national_id}
              onChange={(e) => { let v = sanitize(e.target.value).toUpperCase(); if (v && !v.startsWith("CI")) v = "CI" + v.replace(/^C?I?/, ""); set("national_id", v); if (errors.national_id) validateField("national_id", v); }}
              placeholder="CI0012345678"
              required
              disabled={loading}
              onFocus={(e) => (e.currentTarget.style.borderColor = errors.national_id ? "#ba1a1a" : "#954a00")}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors.national_id ? "#ba1a1a" : "#ebe8e3"; validateField("national_id", form.national_id); }}
            />
            {errors.national_id
              ? <FieldError msg={errors.national_id} />
              : <p style={{ fontSize: "0.7rem", color: "#95a0b8", marginTop: "4px" }}>Format: CI + 10 chiffres (ex: CI0012345678)</p>
            }
          </div>

          {/* Row: first + last name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input
                type="text"
                autoComplete="given-name"
                style={{ ...inputStyle, ...(errors.first_name ? { borderColor: "#ba1a1a" } : {}) }}
                value={form.first_name}
                onChange={(e) => { const v = sanitizeName(e.target.value); set("first_name", v); if (errors.first_name) validateField("first_name", v); }}
                placeholder="Jean"
                required
                disabled={loading}
                onFocus={(e) => (e.currentTarget.style.borderColor = errors.first_name ? "#ba1a1a" : "#954a00")}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.first_name ? "#ba1a1a" : "#ebe8e3"; validateField("first_name", form.first_name); }}
              />
              <FieldError msg={errors.first_name} />
            </div>
            <div>
              <label style={labelStyle}>Nom de famille</label>
              <input
                type="text"
                autoComplete="family-name"
                style={{ ...inputStyle, ...(errors.last_name ? { borderColor: "#ba1a1a" } : {}) }}
                value={form.last_name}
                onChange={(e) => { const v = sanitizeName(e.target.value); set("last_name", v); if (errors.last_name) validateField("last_name", v); }}
                placeholder="Koné"
                required
                disabled={loading}
                onFocus={(e) => (e.currentTarget.style.borderColor = errors.last_name ? "#ba1a1a" : "#954a00")}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.last_name ? "#ba1a1a" : "#ebe8e3"; validateField("last_name", form.last_name); }}
              />
              <FieldError msg={errors.last_name} />
            </div>
          </div>

          {/* Date of birth */}
          <div>
            <label style={labelStyle}>Date de naissance</label>
            <input
              type="date"
              autoComplete="bday"
              style={{ ...inputStyle, ...(errors.date_of_birth ? { borderColor: "#ba1a1a" } : {}) }}
              value={form.date_of_birth}
              onChange={(e) => { set("date_of_birth", e.target.value); if (errors.date_of_birth) validateField("date_of_birth", e.target.value); }}
              required
              disabled={loading}
              onFocus={(e) => (e.currentTarget.style.borderColor = errors.date_of_birth ? "#ba1a1a" : "#954a00")}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors.date_of_birth ? "#ba1a1a" : "#ebe8e3"; validateField("date_of_birth", form.date_of_birth); }}
            />
            <FieldError msg={errors.date_of_birth} />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Adresse Email</label>
            <input
              type="email"
              autoComplete="email"
              style={{ ...inputStyle, ...(errors.email ? { borderColor: "#ba1a1a" } : {}) }}
              value={form.email}
              onChange={(e) => { const v = sanitize(e.target.value); set("email", v); if (errors.email) validateField("email", v); }}
              placeholder="jean.kone@email.ci"
              required
              disabled={loading}
              onFocus={(e) => (e.currentTarget.style.borderColor = errors.email ? "#ba1a1a" : "#954a00")}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? "#ba1a1a" : "#ebe8e3"; validateField("email", form.email); }}
            />
            <FieldError msg={errors.email} />
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input
              type="tel"
              autoComplete="tel"
              style={{ ...inputStyle, ...(errors.phone_number ? { borderColor: "#ba1a1a" } : {}) }}
              value={form.phone_number}
              onChange={(e) => { const v = sanitize(e.target.value); set("phone_number", v); if (errors.phone_number) validateField("phone_number", v); }}
              placeholder="+22507XXXXXXXX"
              required
              disabled={loading}
              onFocus={(e) => (e.currentTarget.style.borderColor = errors.phone_number ? "#ba1a1a" : "#954a00")}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors.phone_number ? "#ba1a1a" : "#ebe8e3"; validateField("phone_number", form.phone_number); }}
            />
            {errors.phone_number
              ? <FieldError msg={errors.phone_number} />
              : <p style={{ fontSize: "0.7rem", color: "#95a0b8", marginTop: "4px" }}>Format: +225XXXXXXXXXX</p>
            }
          </div>

          {/* Département */}
          <div>
            <label style={labelStyle}>Département</label>
            <div style={{ position: "relative" }}>
              <select
                style={{ ...inputStyle, paddingRight: "36px", appearance: "none" }}
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                required
                disabled={loading || departements.length === 0}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#954a00")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebe8e3")}
              >
                <option value="">
                  {departements.length === 0 ? "Chargement…" : "Sélectionner un département"}
                </option>
                {departements.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.region.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "18px", pointerEvents: "none" }}>expand_more</span>
            </div>
          </div>

          {/* Commune */}
          <div>
            <label style={labelStyle}>Commune</label>
            <div style={{ position: "relative" }}>
              <select
                style={{ ...inputStyle, paddingRight: "36px", appearance: "none", ...(errors.commune_id ? { borderColor: "#ba1a1a" } : {}) }}
                value={form.commune_id}
                onChange={(e) => { set("commune_id", e.target.value); if (errors.commune_id) setErrors((prev) => ({ ...prev, commune_id: undefined })); }}
                required
                disabled={loading || !selectedDeptId || geoLoading}
                onFocus={(e) => (e.currentTarget.style.borderColor = errors.commune_id ? "#ba1a1a" : "#954a00")}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.commune_id ? "#ba1a1a" : "#ebe8e3"; if (!form.commune_id) setErrors((prev) => ({ ...prev, commune_id: "Veuillez sélectionner une commune" })); }}
              >
                <option value="">
                  {!selectedDeptId ? "Choisir d'abord un département" : geoLoading ? "Chargement…" : communes.length === 0 ? "Aucune commune" : "Sélectionner une commune"}
                </option>
                {communes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "18px", pointerEvents: "none" }}>expand_more</span>
            </div>
            <FieldError msg={errors.commune_id} />
          </div>

          {/* Bureau de vote */}
          <div>
            <label style={labelStyle}>Bureau de vote</label>
            <div style={{ position: "relative" }}>
              <select
                style={{ ...inputStyle, paddingRight: "36px", appearance: "none" }}
                value={form.bureau_de_vote_id}
                onChange={(e) => set("bureau_de_vote_id", e.target.value)}
                disabled={loading || !form.commune_id || bureauLoading}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#954a00")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebe8e3")}
              >
                <option value="">
                  {!form.commune_id ? "Choisir d'abord une commune" : bureauLoading ? "Chargement…" : bureaux.length === 0 ? "Aucun bureau de vote" : "Sélectionner un bureau (optionnel)"}
                </option>
                {bureaux.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}{b.address ? ` — ${b.address}` : ""}</option>
                ))}
              </select>
              <span className="material-symbols-outlined" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "18px", pointerEvents: "none" }}>expand_more</span>
            </div>
            <p style={{ fontSize: "0.7rem", color: "#95a0b8", marginTop: "4px" }}>Optionnel — peut être assigné ultérieurement</p>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Mot de passe temporaire</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: "48px", ...(errors.password ? { borderColor: "#ba1a1a" } : {}) }}
                value={form.password}
                onChange={(e) => { set("password", e.target.value); if (errors.password) validateField("password", e.target.value); }}
                placeholder="Min. 8 caractères"
                required
                disabled={loading}
                minLength={8}
                onFocus={(e) => (e.currentTarget.style.borderColor = errors.password ? "#ba1a1a" : "#954a00")}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? "#ba1a1a" : "#ebe8e3"; validateField("password", form.password); }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#95a0b8",
                  display: "flex",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => { set("password", generatePassword()); setShowPassword(true); }}
              style={{
                marginTop: "8px",
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#954a00",
                cursor: "pointer",
                fontFamily: "Manrope, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>auto_fix_high</span>
              Générer un mot de passe sécurisé
            </button>
            <FieldError msg={errors.password} />
          </div>
        </form>

        {/* Footer */}
        <div
          style={{
            padding: "1.5rem 2rem",
            borderTop: "1px solid #ebe8e3",
            display: "flex",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px",
              background: "transparent",
              border: "1.5px solid #ebe8e3",
              borderRadius: "9999px",
              color: "#535f74",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => formRef.current?.requestSubmit()}
            style={{
              flex: 2,
              padding: "14px",
              background: loading ? "#ebe8e3" : "linear-gradient(to right, #954a00, #f77f00)",
              border: "none",
              borderRadius: "9999px",
              color: loading ? "#95a0b8" : "#ffffff",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              boxShadow: loading ? "none" : "0 8px 24px rgba(149,74,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin-slow 1s linear infinite" }}>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                  <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Enregistrement…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_add</span>
                Enregistrer l'électeur
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Update Modal ────────────────────────────────────────────────────────────
interface UpdateModalProps {
  voter: Voter;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

function UpdateModal({ voter, token, onClose, onSuccess }: UpdateModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [firstName, setFirstName] = useState(voter.first_name);
  const [lastName, setLastName] = useState(voter.last_name);
  const [phone, setPhone] = useState(voter.phone_number);
  const [status, setStatus] = useState<string>(voter.status);
  const [communeId, setCommuneId] = useState(voter.commune_id);
  const [bureauId, setBureauId] = useState(voter.bureau_de_vote_id ?? "");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [bureaux, setBureaux] = useState<BureauDeVote[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [bureauLoading, setBureauLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  function validateField(field: string, value: string) {
    const next = validateUpdateForm({ first_name: firstName, last_name: lastName, phone, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  }

  // Single sequential init: load everything needed to pre-fill the dropdowns
  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    async function init() {
      // Always load the full department list
      const depts: Departement[] = await fetch(`${apiUrl}/geography/departements`, { headers }).then((r) => r.json());
      setDepartements(depts);

      if (!voter.commune_id) return;

      // Find which department the voter's commune belongs to
      const commune: { departement_id: string } = await fetch(
        `${apiUrl}/geography/communes/${voter.commune_id}`,
        { headers },
      ).then((r) => r.json());
      setSelectedDeptId(commune.departement_id);

      // Load communes for that department (pre-fills the commune list; communeId already set)
      const communeList: Commune[] = await fetch(
        `${apiUrl}/geography/departements/${commune.departement_id}/communes`,
        { headers },
      ).then((r) => r.json());
      setCommunes(communeList);

      // Load bureaux for the voter's commune (pre-fills the bureau list; bureauId already set)
      const bureauList: BureauDeVote[] = await fetch(
        `${apiUrl}/geography/communes/${voter.commune_id}/bureaux`,
        { headers },
      ).then((r) => r.json());
      setBureaux(bureauList);
    }
    init().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // User changed department → reset commune + bureau and load new commune list
  function handleDeptChange(deptId: string) {
    setSelectedDeptId(deptId);
    setCommuneId("");
    setBureauId("");
    setBureaux([]);
    if (!deptId) { setCommunes([]); return; }
    setGeoLoading(true);
    fetch(`${apiUrl}/geography/departements/${deptId}/communes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Commune[]) => setCommunes(data))
      .catch(() => {})
      .finally(() => setGeoLoading(false));
  }

  // User changed commune → reset bureau and load new bureau list
  function handleCommuneChange(cId: string) {
    setCommuneId(cId);
    setBureauId("");
    if (!cId) { setBureaux([]); return; }
    setBureauLoading(true);
    fetch(`${apiUrl}/geography/communes/${cId}/bureaux`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: BureauDeVote[]) => setBureaux(data))
      .catch(() => {})
      .finally(() => setBureauLoading(false));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const errs = validateUpdateForm({ first_name: firstName, last_name: lastName, phone });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
      const body: Record<string, string> = {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        status,
        commune_id: communeId,
      };
      if (bureauId) body.bureau_de_vote_id = bureauId;
      const res = await fetch(`${apiUrl}/users/${voter.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(data?.message) ? data.message.join(", ") : (data?.message ?? "Erreur lors de la mise à jour.");
        setError(msg);
        return;
      }
      onSuccess();
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "#f6f3ee",
    border: "1.5px solid #ebe8e3",
    borderRadius: "10px",
    color: "#1c1c19",
    fontFamily: "Manrope, sans-serif",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "#574335",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        background: "rgba(0,0,0,0.45)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "480px",
          height: "100vh",
          background: "#fcf9f4",
          boxShadow: "-24px 0 64px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "2rem",
            borderBottom: "1px solid #ebe8e3",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#1c1c19",
                margin: "0 0 4px",
              }}
            >
              Modifier l'électeur
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#535f74", margin: 0 }}>
              {voter.first_name} {voter.last_name} — {voter.national_id}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#ebe8e3",
              border: "none",
              borderRadius: "10px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              color: "#535f74",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          ref={formRef}
          style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "#ffdad6",
                border: "1px solid rgba(186,26,26,0.2)",
                borderRadius: "10px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#ba1a1a", fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>error</span>
              <span style={{ fontSize: "0.82rem", color: "#ba1a1a", lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          {/* Read-only identity block */}
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "#f6f3ee",
              borderRadius: "12px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {[
              { label: "ID National", value: voter.national_id },
              { label: "Email", value: voter.email },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#95a0b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{item.label}</p>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1c1c19", margin: 0, wordBreak: "break-all", fontFamily: item.label === "ID National" ? "DM Mono, monospace" : "inherit" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Editable: first + last name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input
                style={{ ...inputStyle, ...(errors.first_name ? { borderColor: "#ba1a1a" } : {}) }}
                value={firstName}
                onChange={(e) => { const v = sanitizeName(e.target.value); setFirstName(v); if (errors.first_name) validateField("first_name", v); }}
                required
                disabled={loading}
                onFocus={(e) => (e.currentTarget.style.borderColor = errors.first_name ? "#ba1a1a" : "#954a00")}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.first_name ? "#ba1a1a" : "#ebe8e3"; validateField("first_name", firstName); }}
              />
              <FieldError msg={errors.first_name} />
            </div>
            <div>
              <label style={labelStyle}>Nom de famille</label>
              <input
                style={{ ...inputStyle, ...(errors.last_name ? { borderColor: "#ba1a1a" } : {}) }}
                value={lastName}
                onChange={(e) => { const v = sanitizeName(e.target.value); setLastName(v); if (errors.last_name) validateField("last_name", v); }}
                required
                disabled={loading}
                onFocus={(e) => (e.currentTarget.style.borderColor = errors.last_name ? "#ba1a1a" : "#954a00")}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.last_name ? "#ba1a1a" : "#ebe8e3"; validateField("last_name", lastName); }}
              />
              <FieldError msg={errors.last_name} />
            </div>
          </div>

          {/* Editable: phone */}
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input
              style={{ ...inputStyle, ...(errors.phone ? { borderColor: "#ba1a1a" } : {}) }}
              value={phone}
              onChange={(e) => { const v = sanitize(e.target.value); setPhone(v); if (errors.phone) validateField("phone", v); }}
              placeholder="+22507XXXXXXXX"
              disabled={loading}
              onFocus={(e) => (e.currentTarget.style.borderColor = errors.phone ? "#ba1a1a" : "#954a00")}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors.phone ? "#ba1a1a" : "#ebe8e3"; validateField("phone", phone); }}
            />
            <FieldError msg={errors.phone} />
          </div>

          {/* Status */}
          <div>
            <label style={labelStyle}>Statut du compte</label>
            <div style={{ position: "relative" }}>
              <select
                style={{ ...inputStyle, paddingRight: "36px", appearance: "none" }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#954a00")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebe8e3")}
              >
                <option value="ACTIVE">Actif</option>
                <option value="PENDING_OTP">En attente OTP</option>
                <option value="SUSPENDED">Suspendu</option>
              </select>
              <span className="material-symbols-outlined" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "18px", pointerEvents: "none" }}>expand_more</span>
            </div>
          </div>

          {/* Département */}
          <div>
            <label style={labelStyle}>Département</label>
            <div style={{ position: "relative" }}>
              <select
                style={{ ...inputStyle, paddingRight: "36px", appearance: "none" }}
                value={selectedDeptId}
                onChange={(e) => handleDeptChange(e.target.value)}
                disabled={loading || departements.length === 0}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#954a00")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebe8e3")}
              >
                <option value="">
                  {departements.length === 0 ? "Chargement…" : "Sélectionner un département"}
                </option>
                {departements.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.region.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "18px", pointerEvents: "none" }}>expand_more</span>
            </div>
          </div>

          {/* Commune */}
          <div>
            <label style={labelStyle}>Commune</label>
            <div style={{ position: "relative" }}>
              <select
                style={{ ...inputStyle, paddingRight: "36px", appearance: "none" }}
                value={communeId}
                onChange={(e) => handleCommuneChange(e.target.value)}
                required
                disabled={loading || !selectedDeptId || geoLoading}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#954a00")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebe8e3")}
              >
                <option value="">
                  {!selectedDeptId ? "Choisir d'abord un département" : geoLoading ? "Chargement…" : communes.length === 0 ? "Aucune commune" : "Sélectionner une commune"}
                </option>
                {communes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "18px", pointerEvents: "none" }}>expand_more</span>
            </div>
          </div>

          {/* Bureau de vote */}
          <div>
            <label style={labelStyle}>Bureau de vote</label>
            <div style={{ position: "relative" }}>
              <select
                style={{ ...inputStyle, paddingRight: "36px", appearance: "none" }}
                value={bureauId}
                onChange={(e) => setBureauId(e.target.value)}
                disabled={loading || !communeId || bureauLoading}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#954a00")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebe8e3")}
              >
                <option value="">
                  {!communeId ? "Choisir d'abord une commune" : bureauLoading ? "Chargement…" : bureaux.length === 0 ? "Aucun bureau de vote" : "Sélectionner un bureau (optionnel)"}
                </option>
                {bureaux.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}{b.address ? ` — ${b.address}` : ""}</option>
                ))}
              </select>
              <span className="material-symbols-outlined" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "18px", pointerEvents: "none" }}>expand_more</span>
            </div>
            <p style={{ fontSize: "0.7rem", color: "#95a0b8", marginTop: "4px" }}>Optionnel</p>
          </div>
        </form>

        {/* Footer */}
        <div
          style={{
            padding: "1.5rem 2rem",
            borderTop: "1px solid #ebe8e3",
            display: "flex",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px",
              background: "transparent",
              border: "1.5px solid #ebe8e3",
              borderRadius: "9999px",
              color: "#535f74",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => formRef.current?.requestSubmit()}
            style={{
              flex: 2,
              padding: "14px",
              background: loading ? "#ebe8e3" : "linear-gradient(to right, #954a00, #f77f00)",
              border: "none",
              borderRadius: "9999px",
              color: loading ? "#95a0b8" : "#ffffff",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              boxShadow: loading ? "none" : "0 8px 24px rgba(149,74,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? "Mise à jour…" : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>save</span>
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Voter Row ───────────────────────────────────────────────────────────────
function VoterRow({ voter, onEdit }: { voter: Voter; onEdit: (v: Voter) => void }) {
  const [hovered, setHovered] = useState(false);
  const status = STATUS_STYLE[voter.status] ?? { bg: "#ebe8e3", color: "#535f74" };

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
      <td style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", fontFamily: "DM Mono, monospace", color: "#535f74", fontWeight: 600 }}>
        {voter.national_id}
      </td>
      <td style={{ padding: "1rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #954a00, #f77f00)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 800,
              fontSize: "0.875rem",
              flexShrink: 0,
            }}
          >
            {voter.first_name[0]?.toUpperCase()}{voter.last_name[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "#1c1c19", fontSize: "0.875rem" }}>
              {voter.first_name} {voter.last_name}
            </p>
          </div>
        </div>
      </td>
      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#535f74" }}>{voter.email}</td>
      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#535f74" }}>{voter.phone_number}</td>
      <td style={{ padding: "1rem 1.5rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 12px",
            borderRadius: "9999px",
            fontSize: "0.72rem",
            fontWeight: 700,
            background: status.bg,
            color: status.color,
          }}
        >
          {STATUS_LABELS[voter.status] ?? voter.status}
        </span>
      </td>
      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.15s",
          }}
        >
          <button
            title="Modifier"
            onClick={() => onEdit(voter)}
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
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AdminVoterManagement({ user }: Props) {
  const location = useLocation();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [editVoter, setEditVoter] = useState<Voter | null>(null);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const token = typeof window !== "undefined" ? localStorage.getItem("voti_token") ?? "" : "";

  const fetchVoters = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
      const res = await fetch(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des électeurs.");
      const data: Voter[] = await res.json();
      setVoters(data.filter((u) => u.role === "VOTER"));
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchVoters(); }, [fetchVoters]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }

  const filtered = voters.filter((v) => {
    const q = search.toLowerCase();
    return (
      !q ||
      v.national_id.toLowerCase().includes(q) ||
      v.first_name.toLowerCase().includes(q) ||
      v.last_name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <AdminSidebar user={user} activePath={location.pathname} />

      {/* ── Main ── */}
      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh", position: "relative" }}>
        {/* Background blob */}
        <svg style={{ position: "absolute", top: "-5%", right: "-3%", width: "380px", height: "380px", opacity: 0.06, color: "#954a00", pointerEvents: "none" }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,77.3,-44.7C85.4,-31.3,90.5,-15.7,89.2,-0.8C87.8,14.2,80,28.4,70.1,40.4C60.2,52.4,48.2,62.2,34.7,69.5C21.2,76.8,6.2,81.6,-9.3,80.1C-24.8,78.6,-40.8,70.8,-54.3,60.1C-67.8,49.4,-78.8,35.8,-83.4,20.4C-88,5.1,-86.2,-12.1,-79.6,-27.2C-73,-42.3,-61.6,-55.3,-48.2,-62.5C-34.8,-69.7,-17.4,-71.1,-0.8,-69.7C15.8,-68.3,31.3,-64,44.7,-76.4Z" fill="currentColor" transform="translate(100 100)" />
        </svg>

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: "2rem",
              right: "2rem",
              zIndex: 200,
              padding: "14px 20px",
              background: "#1c1c19",
              color: "#ffffff",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.875rem",
              boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "#80fc98", fontSize: "20px" }}>check_circle</span>
            {toast}
          </div>
        )}

        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", position: "relative", zIndex: 10 }}>
          <div>
            <span style={{ display: "block", fontFamily: "Manrope, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "#954a00", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
              Administration Centrale
            </span>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2.25rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Gestion des Électeurs
            </h2>
            <p style={{ color: "#535f74", fontWeight: 500, margin: 0 }}>
              Enregistrez et gérez les comptes électeurs de la plateforme.
            </p>
          </div>
          <button
            onClick={() => setShowRegister(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 28px",
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
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>person_add</span>
            Enregistrer un électeur
          </button>
        </header>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          {[
            { label: "Total inscrits", value: voters.length.toString(), icon: "groups", bg: "#fff7ed", iconColor: "#954a00" },
            { label: "Comptes actifs", value: voters.filter((v) => v.status === "ACTIVE").length.toString(), icon: "verified_user", bg: "#f0fdf4", iconColor: "#006e2e" },
            { label: "En attente", value: voters.filter((v) => v.status === "PENDING_OTP").length.toString(), icon: "hourglass_top", bg: "#fffbeb", iconColor: "#7a5c00" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px", color: stat.iconColor }}>{stat.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#535f74", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>{stat.label}</p>
                <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#1c1c19", margin: 0, lineHeight: 1 }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <section style={{ position: "relative", zIndex: 10 }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 12px 32px rgba(10,22,40,0.06)", overflow: "hidden" }}>
            {/* Table header with search */}
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #ebe8e3", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#1c1c19", margin: 0 }}>
                Liste des électeurs
              </h3>
              <div style={{ position: "relative", flex: "0 0 320px" }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#95a0b8", fontSize: "20px", pointerEvents: "none" }}>search</span>
                <input
                  style={{
                    width: "100%",
                    padding: "10px 16px 10px 44px",
                    background: "#f6f3ee",
                    border: "none",
                    borderRadius: "10px",
                    color: "#1c1c19",
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="Rechercher par nom, email, ID…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* Table body */}
            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#535f74" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "40px", display: "block", marginBottom: "12px", opacity: 0.4 }}>pending</span>
                Chargement des électeurs…
              </div>
            ) : fetchError ? (
              <div style={{ padding: "3rem 2rem", display: "flex", alignItems: "center", gap: "12px", color: "#ba1a1a" }}>
                <span className="material-symbols-outlined">error</span>
                {fetchError}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#535f74" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "12px", opacity: 0.3 }}>person_search</span>
                <p style={{ fontWeight: 600, margin: 0 }}>Aucun électeur trouvé</p>
                <p style={{ fontSize: "0.85rem", margin: "4px 0 0" }}>
                  {search ? "Essayez une autre recherche." : "Enregistrez le premier électeur."}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f6f3ee" }}>
                      {["ID National", "Électeur", "Email", "Téléphone", "Statut", "Actions"].map((h, i) => (
                        <th
                          key={h}
                          style={{
                            padding: "1rem 1.5rem",
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            color: "#535f74",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            textAlign: i === 5 ? "right" : "left",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((v) => (
                      <VoterRow key={v.id} voter={v} onEdit={setEditVoter} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div style={{ padding: "1.25rem 2rem", background: "rgba(246,243,238,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #ebe8e3" }}>
                <p style={{ fontSize: "0.8rem", color: "#535f74", margin: 0 }}>
                  Affichage de {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} électeur{filtered.length > 1 ? "s" : ""}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", border: "1px solid rgba(222,193,175,0.4)", background: "#ffffff", color: page === 1 ? "#cbd5e1" : "#535f74", cursor: page === 1 ? "default" : "pointer" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", border: p === page ? "none" : "1px solid rgba(222,193,175,0.4)", background: p === page ? "#954a00" : "#ffffff", color: p === page ? "#ffffff" : "#535f74", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", border: "1px solid rgba(222,193,175,0.4)", background: "#ffffff", color: page === totalPages ? "#cbd5e1" : "#535f74", cursor: page === totalPages ? "default" : "pointer" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      {showRegister && (
        <RegisterModal
          token={token}
          onClose={() => setShowRegister(false)}
          onSuccess={() => {
            setShowRegister(false);
            showToast("Électeur enregistré avec succès !");
            fetchVoters();
          }}
        />
      )}
      {editVoter && (
        <UpdateModal
          voter={editVoter}
          token={token}
          onClose={() => setEditVoter(null)}
          onSuccess={() => {
            setEditVoter(null);
            showToast("Profil électeur mis à jour !");
            fetchVoters();
          }}
        />
      )}
    </div>
  );
}
