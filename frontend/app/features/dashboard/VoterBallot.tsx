import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import VoterSidebar from "./VoterSidebar.js";

interface Props {
  electionId: string;
  user: { email: string; role: string; first_name?: string; last_name?: string };
}

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  photo_url?: string;
  biography?: string;
  party?: { name: string; acronym: string; logo_url?: string };
}

interface ElectionDetail {
  id: string;
  title: string;
  type: string;
  status: string;
  geographic_scope: string;
  start_time: string;
  end_time: string;
  can_vote: boolean;
  already_voted: boolean;
  candidates: Candidate[];
}

const TYPE_LABELS: Record<string, string> = {
  PRESIDENTIELLE: "Présidentielle",
  LEGISLATIVES: "Législatives",
  REGIONALES: "Régionales",
  MUNICIPALES: "Municipales",
  REFERENDUM: "Référendum",
};

const SCOPE_LABELS: Record<string, string> = {
  NATIONAL: "National",
  REGIONAL: "Régional",
  DEPARTEMENTAL: "Départemental",
  COMMUNAL: "Communal",
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const token = () => localStorage.getItem("voti_token") ?? "";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

type Step = "select" | "confirm" | "success";

export default function VoterBallot({ electionId, user }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [receiptCode, setReceiptCode] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/elections/${electionId}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res.ok) throw new Error("Impossible de charger cette élection.");
        setElection(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [electionId]);

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelected(candidate);
    setSubmitError("");
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API}/elections/${electionId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ candidate_id: selected.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Erreur lors de l'enregistrement du vote.");
      setReceiptCode(data.receipt_code ?? "");
      setStep("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif" }}>
        <VoterSidebar user={user} activePath={location.pathname} />
        <main style={{ marginLeft: "256px", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <p style={{ color: "#535f74", fontWeight: 600 }}>Chargement…</p>
        </main>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif" }}>
        <VoterSidebar user={user} activePath={location.pathname} />
        <main style={{ marginLeft: "256px", padding: "2rem" }}>
          <div style={{ padding: "2rem", background: "#ffdad6", borderRadius: "16px", color: "#ba1a1a", fontWeight: 600 }}>
            {error || "Élection introuvable."}
          </div>
        </main>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
        <VoterSidebar user={user} activePath={location.pathname} />
        <main style={{ marginLeft: "256px", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "3rem", boxShadow: "0 4px 32px rgba(10,22,40,0.08)", maxWidth: "520px", width: "100%", textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#006e2e" }}>verified</span>
            </div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 0.75rem", letterSpacing: "-0.02em" }}>
              Vote enregistré !
            </h2>
            <p style={{ color: "#535f74", fontWeight: 500, lineHeight: 1.7, margin: "0 0 2rem" }}>
              Votre vote a été enregistré avec succès et de façon sécurisée.
            </p>

            {receiptCode && (
              <div style={{ background: "#fff3cd", border: "1px solid #f5c842", borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "2rem", textAlign: "left" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7a5c00", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>
                  Code de reçu
                </p>
                <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.875rem", fontWeight: 600, color: "#1c1c19", margin: 0, wordBreak: "break-all" }}>
                  {receiptCode}
                </p>
              </div>
            )}

            <button
              onClick={() => navigate("/elections")}
              style={{ width: "100%", padding: "14px", background: "#006e2e", border: "none", borderRadius: "14px", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
            >
              Retour à mes élections
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ background: "#fcf9f4", minHeight: "100vh", fontFamily: "Manrope, sans-serif", color: "#1c1c19" }}>
      <VoterSidebar user={user} activePath={location.pathname} />

      <main style={{ marginLeft: "256px", padding: "2rem", minHeight: "100vh" }}>

        {/* Header */}
        <header style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => navigate("/elections")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#535f74", fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", padding: "0 0 1rem", marginBottom: "0.5rem" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
            Retour aux élections
          </button>
          <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#006e2e", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
            Bulletin de Vote
          </span>
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            {election.title}
          </h2>
        </header>

        {/* Election info card */}
        <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 16px rgba(10,22,40,0.05)", marginBottom: "2rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#954a00", background: "#fff7ed", padding: "4px 12px", borderRadius: "9999px" }}>
            {TYPE_LABELS[election.type] ?? election.type}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: 700, color: "#007432", background: "#f0fdf4", padding: "4px 12px", borderRadius: "9999px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#007432", display: "inline-block" }} />
            En cours
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#535f74" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>location_on</span>
            {SCOPE_LABELS[election.geographic_scope] ?? election.geographic_scope}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#535f74" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span>
            {fmtDateTime(election.start_time)} → {fmtDateTime(election.end_time)}
          </span>
        </div>

        {/* Already voted guard */}
        {election.already_voted && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "1.25rem 1.5rem", background: "#f0fdf4", borderRadius: "16px", border: "1px solid #bbf7d0", marginBottom: "2rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#006e2e" }}>verified</span>
            <div>
              <p style={{ fontWeight: 700, color: "#006e2e", margin: "0 0 2px" }}>Vous avez déjà voté</p>
              <p style={{ fontSize: "0.85rem", color: "#535f74", margin: 0 }}>Votre vote pour cette élection a bien été enregistré.</p>
            </div>
          </div>
        )}

        {/* Cannot vote guard */}
        {!election.can_vote && !election.already_voted && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "1.25rem 1.5rem", background: "#f6f3ee", borderRadius: "16px", border: "1px solid #e2ddd6", marginBottom: "2rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#94a3b8" }}>schedule</span>
            <div>
              <p style={{ fontWeight: 700, color: "#535f74", margin: "0 0 2px" }}>Ce vote n'est pas encore ouvert</p>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>La période de vote n'a pas encore commencé.</p>
            </div>
          </div>
        )}

        {/* Confirmation panel */}
        {step === "confirm" && selected && (
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "2rem", boxShadow: "0 8px 32px rgba(10,22,40,0.10)", marginBottom: "2rem", maxWidth: "520px", border: "2px solid #006e2e" }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 1rem" }}>
              Confirmer votre vote
            </h3>
            <p style={{ color: "#535f74", fontWeight: 500, lineHeight: 1.7, margin: "0 0 1.5rem" }}>
              Vous êtes sur le point de voter pour{" "}
              <strong style={{ color: "#1c1c19" }}>{selected.first_name} {selected.last_name}</strong>
              {selected.party && (
                <> (<span style={{ color: "#006e2e" }}>{selected.party.name}</span>)</>
              )}.
              {" "}Cette action est <strong>irréversible</strong>.
            </p>

            {submitError && (
              <div style={{ padding: "12px 16px", background: "#ffdad6", borderRadius: "12px", color: "#ba1a1a", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem" }}>
                {submitError}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => { setStep("select"); setSubmitError(""); }}
                disabled={submitting}
                style={{ flex: 1, padding: "13px", border: "1.5px solid #dde5ec", borderRadius: "14px", background: "#ffffff", color: "#535f74", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                style={{ flex: 2, padding: "13px", border: "none", borderRadius: "14px", background: submitting ? "#e8954a" : "#f77f00", color: "#ffffff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: submitting ? "not-allowed" : "pointer", boxShadow: "0 4px 12px rgba(247,127,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {submitting ? (
                  <>
                    <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#ffffff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>how_to_vote</span>
                    Confirmer mon vote
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Candidate grid — only when can vote and not yet voted */}
        {election.can_vote && !election.already_voted && (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#1c1c19", margin: "0 0 4px" }}>
                Choisissez votre candidat
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#535f74", margin: 0 }}>
                {election.candidates.length} candidat{election.candidates.length !== 1 ? "s" : ""} en lice. Cliquez sur un candidat pour voter.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
              {election.candidates.map(c => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  isSelected={selected?.id === c.id && step === "confirm"}
                  isHovered={hoveredId === c.id}
                  onHover={setHoveredId}
                  onSelect={handleSelectCandidate}
                />
              ))}
            </div>
          </>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </main>
    </div>
  );
}

function CandidateCard({
  candidate,
  isSelected,
  isHovered,
  onHover,
  onSelect,
}: {
  candidate: Candidate;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (c: Candidate) => void;
}) {
  const initials = `${candidate.first_name[0] ?? ""}${candidate.last_name[0] ?? ""}`.toUpperCase();
  const highlighted = isSelected || isHovered;

  return (
    <div
      onClick={() => onSelect(candidate)}
      onMouseEnter={() => onHover(candidate.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "1.5rem",
        boxShadow: highlighted ? "0 8px 24px rgba(0,110,46,0.15)" : "0 4px 16px rgba(10,22,40,0.05)",
        border: `2px solid ${isSelected ? "#006e2e" : isHovered ? "rgba(0,110,46,0.4)" : "transparent"}`,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column" as const,
        gap: "1rem",
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
      }}
    >
      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {candidate.photo_url ? (
          <img
            src={candidate.photo_url}
            alt={`${candidate.first_name} ${candidate.last_name}`}
            style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #f6f3ee" }}
          />
        ) : (
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: isSelected ? "#006e2e" : "#f6f3ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s ease" }}>
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: isSelected ? "#ffffff" : "#535f74" }}>
              {initials}
            </span>
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1rem", color: "#1c1c19", margin: "0 0 3px", lineHeight: 1.2 }}>
            {candidate.first_name} {candidate.last_name}
          </p>
          {candidate.party && (
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#006e2e", background: "#f0fdf4", padding: "2px 8px", borderRadius: "9999px", whiteSpace: "nowrap" as const }}>
              {candidate.party.acronym ?? candidate.party.name}
            </span>
          )}
        </div>
      </div>

      {/* Party full name */}
      {candidate.party && (
        <p style={{ fontSize: "0.8rem", color: "#535f74", margin: 0, fontWeight: 500 }}>
          {candidate.party.name}
        </p>
      )}

      {/* Biography snippet */}
      {candidate.biography && (
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
          {candidate.biography.slice(0, 120)}{candidate.biography.length > 120 ? "…" : ""}
        </p>
      )}

      {/* Vote indicator */}
      <div style={{ borderTop: "1px solid #f6f3ee", paddingTop: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        {isSelected ? (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#006e2e" }}>check_circle</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#006e2e" }}>Sélectionné</span>
          </>
        ) : (
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: isHovered ? "#006e2e" : "#94a3b8" }}>
            {isHovered ? "Cliquer pour sélectionner" : "Voter pour ce candidat"}
          </span>
        )}
      </div>
    </div>
  );
}
