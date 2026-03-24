import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AGORA — Election Management Platform" },
    {
      name: "description",
      content:
        "Secure, scalable election management with real-time result aggregation across districts, cities, and municipalities.",
    },
  ];
}

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  void: "#03030c",
  base: "#07071a",
  surface: "#0d0d24",
  elevated: "#13132e",
  border: "#1e1e48",
  borderMid: "#2a2a60",
  gold: "#c8a84b",
  goldBright: "#e8c86a",
  goldDim: "rgba(200,168,75,0.10)",
  goldGlow: "rgba(200,168,75,0.06)",
  text: "#f0f0fc",
  textDim: "#9090c0",
  textMuted: "#404078",
  teal: "#00d4a0",
  tealDim: "rgba(0,212,160,0.10)",
  red: "#ff3d5c",
  blue: "#4a8fff",
};
const F = {
  display: '"Cormorant Garamond", Georgia, serif',
  mono: '"DM Mono", monospace',
  ui: '"Sora", system-ui, sans-serif',
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconGrid = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="1" y="1" width="8" height="8" rx="1" stroke={C.gold} strokeWidth="1.5"/>
    <rect x="13" y="1" width="8" height="8" rx="1" stroke={C.gold} strokeWidth="1.5"/>
    <rect x="1" y="13" width="8" height="8" rx="1" stroke={C.gold} strokeWidth="1.5"/>
    <rect x="13" y="13" width="8" height="8" rx="1" stroke={C.gold} strokeWidth="1.5"/>
  </svg>
);
const IconLayers = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 1L20 6.5V10L11 15.5L2 10V6.5L11 1Z" stroke={C.gold} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 13L11 18.5L20 13" stroke={C.gold} strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);
const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 2L3 5.5V11.5C3 15.5 6.5 19 11 20.5C15.5 19 19 15.5 19 11.5V5.5L11 2Z" stroke={C.gold} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7.5 11L10 13.5L14.5 9" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconMap = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 2C8.24 2 6 4.24 6 7C6 11 11 18 11 18C11 18 16 11 16 7C16 4.24 13.76 2 11 2Z" stroke={C.gold} strokeWidth="1.5"/>
    <circle cx="11" cy="7" r="2" stroke={C.gold} strokeWidth="1.5"/>
    <path d="M4 18H18" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="2" y="13" width="4" height="7" rx="0.5" stroke={C.gold} strokeWidth="1.5"/>
    <rect x="9" y="8" width="4" height="12" rx="0.5" stroke={C.gold} strokeWidth="1.5"/>
    <rect x="16" y="4" width="4" height="16" rx="0.5" stroke={C.gold} strokeWidth="1.5"/>
  </svg>
);
const IconKey = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="8" cy="10" r="5" stroke={C.gold} strokeWidth="1.5"/>
    <path d="M13 10H20M17 10V13" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="10" r="2" fill={C.gold} fillOpacity="0.3"/>
  </svg>
);

// ── Feature data ───────────────────────────────────────────────────────────────
const features = [
  {
    icon: <IconGrid />,
    title: "Multi-Election Management",
    desc: "Run Presidential, Legislative, Municipal, and Referendum elections simultaneously — each fully isolated with independent statistics.",
  },
  {
    icon: <IconLayers />,
    title: "Automatic Aggregation",
    desc: "Results flow from municipality → city → district → national automatically. District and national totals are always live and accurate.",
  },
  {
    icon: <IconShield />,
    title: "Role-Based Access",
    desc: "Three-tier access model: Super Admin governs, Election Admin manages results, Observers view. Every action is permission-checked.",
  },
  {
    icon: <IconMap />,
    title: "Geographic Coverage",
    desc: "Full territorial hierarchy across districts, cities, and municipalities. Population and voter registration data at every level.",
  },
  {
    icon: <IconChart />,
    title: "Analytics & Reporting",
    desc: "Participation rates, candidate percentages, abstention data, and cross-election comparisons — rendered as charts and exportable tables.",
  },
  {
    icon: <IconKey />,
    title: "Secure by Design",
    desc: "JWT authentication, bcrypt password hashing, DTO validation, and audit logging. Every vote is encrypted; every change is tracked.",
  },
];

const steps = [
  {
    num: "01",
    title: "Configure",
    desc: "Create an election, set its type, dates, and status. Register candidates and districts.",
  },
  {
    num: "02",
    title: "Collect",
    desc: "Election Admins enter city-level results as ballots are counted at each precinct.",
  },
  {
    num: "03",
    title: "Aggregate",
    desc: "The system automatically computes district totals and the national result in real time.",
  },
  {
    num: "04",
    title: "Publish",
    desc: "Certify and publish official results. Public users access transparent analytics instantly.",
  },
];

const tickerItems = [
  "4 Active Elections",
  "3.2M Registered Voters",
  "22 Districts",
  "847 Municipalities",
  "128 Candidates",
  "73.1% Avg Turnout",
  "12 Election Admins",
  "Live Results · 24/7",
];

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5rem",
        background: scrolled
          ? "rgba(7,7,26,0.95)"
          : "transparent",
        borderBottom: scrolled
          ? `1px solid ${C.border}`
          : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
        fontFamily: F.ui,
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            background: C.gold,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: "13px",
            color: C.void,
            flexShrink: 0,
          }}
        >
          A
        </div>
        <span
          style={{
            fontFamily: F.display,
            fontSize: "1.2rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: C.text,
          }}
        >
          AGO<span style={{ color: C.gold }}>RA</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "0", alignItems: "center" }}>
        {["Features", "Security", "Results"].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            style={{
              padding: "0 1.1rem",
              height: "64px",
              display: "flex",
              alignItems: "center",
              fontSize: "0.72rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: C.textMuted,
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.textDim)}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.textMuted)}
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTA */}
      <Link
        to="/login"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 20px",
          background: C.goldDim,
          border: `1px solid ${C.gold}`,
          color: C.goldBright,
          fontFamily: F.ui,
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textDecoration: "none",
          transition: "background 0.2s, color 0.2s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = C.gold;
          el.style.color = C.void;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = C.goldDim;
          el.style.color = C.goldBright;
        }}
      >
        Admin Login
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </nav>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        padding: "80px 2.5rem 60px",
        fontFamily: F.ui,
      }}
    >
      {/* Background layers */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 70% 60% at 60% -10%, rgba(200,168,75,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 10% 80%, rgba(74,143,255,0.07) 0%, transparent 60%),
            linear-gradient(rgba(30,30,72,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,30,72,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 56px 56px, 56px 56px",
        }}
      />

      {/* Glow orb */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "5%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,168,75,0.07) 0%, transparent 70%)",
          animation: "glow-pulse 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: "4rem" }}>
        {/* Left: Text */}
        <div style={{ flex: "1 1 55%", position: "relative", zIndex: 1 }}>
          {/* Eyebrow */}
          <div
            className="animate-fade-up-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "2rem",
              padding: "5px 12px 5px 8px",
              background: C.goldDim,
              border: `1px solid rgba(200,168,75,0.25)`,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: C.gold,
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: F.mono,
                fontSize: "0.62rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: C.gold,
              }}
            >
              Election Management Platform · v2026
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up-2"
            style={{
              fontFamily: F.display,
              fontSize: "clamp(3rem, 6vw, 5.5rem)",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: C.text,
              margin: "0 0 1.5rem",
            }}
          >
            Democratic
            <br />
            <strong
              style={{
                fontStyle: "normal",
                fontWeight: 700,
                color: C.gold,
              }}
            >
              Governance,
            </strong>
            <br />
            Perfected.
          </h1>

          {/* Subtext */}
          <p
            className="animate-fade-up-3"
            style={{
              fontSize: "1rem",
              lineHeight: 1.75,
              color: C.textDim,
              maxWidth: "480px",
              margin: "0 0 2.5rem",
            }}
          >
            A secure, multi-level platform for managing elections across
            districts and municipalities — with real-time results aggregation,
            role-based access, and transparent public reporting.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up-4"
            style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
          >
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                background: C.gold,
                color: C.void,
                fontFamily: F.ui,
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textDecoration: "none",
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = C.goldBright;
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = C.gold;
                el.style.transform = "translateY(0)";
              }}
            >
              Access Platform
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <a
              href="#features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.textDim,
                fontFamily: F.ui,
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = C.borderMid;
                el.style.color = C.text;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = C.border;
                el.style.color = C.textDim;
              }}
            >
              Explore Features
            </a>
          </div>

          {/* Trust line */}
          <div
            className="animate-fade-up-5"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: `1px solid ${C.border}`,
            }}
          >
            {[
              { val: "3", label: "Election Types" },
              { val: "22", label: "Districts" },
              { val: "847", label: "Municipalities" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: "1.4rem",
                    fontWeight: 500,
                    color: C.text,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {item.val}
                </span>
                <span style={{ fontSize: "0.7rem", color: C.textMuted, letterSpacing: "0.04em" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Floating data cards */}
        <div
          style={{
            flex: "0 0 auto",
            width: "320px",
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              padding: "1.25rem",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.gold}`,
              animation: "float-card 6s ease-in-out infinite",
              animationDelay: "0s",
            }}
          >
            <div style={{ fontFamily: F.mono, fontSize: "0.58rem", letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: "8px" }}>
              Presidential 2026 · Live
            </div>
            <div style={{ fontFamily: F.mono, fontSize: "1.6rem", fontWeight: 500, color: C.text, letterSpacing: "-0.02em", marginBottom: "4px" }}>
              2,847,391
            </div>
            <div style={{ fontSize: "0.7rem", color: C.textDim }}>votes cast · 73% reporting</div>
            <div style={{ marginTop: "12px", height: "3px", background: C.border, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "73%", background: C.teal }} />
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{
              padding: "1.25rem",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.teal}`,
              marginLeft: "2rem",
              animation: "float-card 6s ease-in-out infinite",
              animationDelay: "1.5s",
            }}
          >
            <div style={{ fontFamily: F.mono, fontSize: "0.58rem", letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: "10px" }}>
              Leading Candidate
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { name: "É. Marchant", pct: "38.3", color: C.teal },
                { name: "V. Holm", pct: "34.7", color: C.red },
                { name: "C. Wren", pct: "27.0", color: C.blue },
              ].map((c) => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flex: 1, height: "2px", background: C.border, position: "relative" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${parseFloat(c.pct) * 2.6}%`, background: c.color }} />
                  </div>
                  <span style={{ fontFamily: F.mono, fontSize: "0.65rem", color: C.textDim, minWidth: "30px", textAlign: "right" }}>
                    {c.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3 */}
          <div
            style={{
              padding: "1rem 1.25rem",
              background: C.elevated,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              animation: "float-card 6s ease-in-out infinite",
              animationDelay: "3s",
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.teal, animation: "pulse-teal 2s infinite", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: F.mono, fontSize: "0.65rem", color: C.teal }}>
                North Capital certified
              </div>
              <div style={{ fontFamily: F.mono, fontSize: "0.58rem", color: C.textMuted }}>
                16 / 22 districts reporting
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "120px",
          background: `linear-gradient(to bottom, transparent, ${C.base})`,
          pointerEvents: "none",
        }}
      />
    </section>
  );
}

// ── Stats Ticker ───────────────────────────────────────────────────────────────
function StatsTicker() {
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div
      style={{
        background: C.gold,
        height: "44px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        borderTop: `1px solid rgba(255,255,255,0.1)`,
        borderBottom: `1px solid rgba(255,255,255,0.1)`,
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          animation: "ticker-scroll 28s linear infinite",
          whiteSpace: "nowrap",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "1.5rem",
              fontFamily: F.mono,
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: C.void,
              padding: "0 2rem",
            }}
          >
            {item}
            <span style={{ opacity: 0.4 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Features ───────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section
      id="features"
      style={{
        padding: "7rem 2.5rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: F.ui,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.gold,
            marginBottom: "1rem",
          }}
        >
          Platform Capabilities
        </div>
        <h2
          style={{
            fontFamily: F.display,
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 400,
            fontStyle: "italic",
            color: C.text,
            margin: 0,
          }}
        >
          Everything you need to run{" "}
          <em style={{ color: C.gold }}>any election</em>
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1px",
          background: C.border,
          border: `1px solid ${C.border}`,
        }}
      >
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.elevated : C.surface,
        padding: "2rem",
        transition: "background 0.2s",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(200,168,75,0.04) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ marginBottom: "1.25rem" }}>{icon}</div>
      <h3
        style={{
          fontFamily: F.display,
          fontSize: "1.25rem",
          fontWeight: 600,
          color: hovered ? C.goldBright : C.text,
          margin: "0 0 0.75rem",
          transition: "color 0.2s",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.82rem",
          lineHeight: 1.7,
          color: C.textDim,
          margin: 0,
        }}
      >
        {desc}
      </p>
    </div>
  );
}

// ── How It Works ───────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section
      style={{
        padding: "6rem 2.5rem",
        background: C.void,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        fontFamily: F.ui,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: "1rem",
            }}
          >
            Workflow
          </div>
          <h2
            style={{
              fontFamily: F.display,
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 400,
              fontStyle: "italic",
              color: C.text,
              margin: 0,
            }}
          >
            From setup to published results
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0",
            position: "relative",
          }}
        >
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: "2rem",
              left: "calc(12.5% + 1rem)",
              right: "calc(12.5% + 1rem)",
              height: "1px",
              background: `linear-gradient(to right, ${C.border}, ${C.gold}, ${C.border})`,
            }}
          />

          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                padding: "0 2rem 2rem",
                textAlign: "center",
                position: "relative",
              }}
            >
              {/* Number circle */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: i === 0 ? C.gold : C.surface,
                  border: `1px solid ${i === 0 ? C.gold : C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  fontFamily: F.mono,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: i === 0 ? C.void : C.textDim,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {step.num}
              </div>
              <h3
                style={{
                  fontFamily: F.display,
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  color: C.text,
                  margin: "0 0 0.75rem",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  lineHeight: 1.65,
                  color: C.textDim,
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Security Strip ─────────────────────────────────────────────────────────────
function SecurityStrip() {
  const badges = [
    { label: "JWT Authentication", detail: "Stateless · 24h expiry" },
    { label: "bcrypt Hashing", detail: "10 salt rounds" },
    { label: "Role-Based Access", detail: "VOTER · ADMIN · OBSERVER" },
    { label: "Input Validation", detail: "DTO whitelisting" },
    { label: "Audit Logging", detail: "Every action tracked" },
  ];

  return (
    <section
      id="security"
      style={{
        padding: "5rem 2.5rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: F.ui,
      }}
    >
      <div
        style={{
          border: `1px solid ${C.border}`,
          background: C.surface,
          padding: "3rem",
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "3rem",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: "1rem",
            }}
          >
            Security
          </div>
          <h2
            style={{
              fontFamily: F.display,
              fontSize: "2.2rem",
              fontWeight: 400,
              fontStyle: "italic",
              color: C.text,
              margin: "0 0 1rem",
              lineHeight: 1.2,
            }}
          >
            Built for trust, designed to scale
          </h2>
          <p style={{ fontSize: "0.82rem", lineHeight: 1.7, color: C.textDim, margin: 0 }}>
            Every layer of the stack is hardened. From encrypted vote storage
            to stateless JWT sessions, security is a core design principle —
            not an afterthought.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: C.border }}>
          {badges.map((b, i) => (
            <div
              key={i}
              style={{
                background: C.elevated,
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: C.teal,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "0.82rem", fontWeight: 500, color: C.text }}>
                  {b.label}
                </span>
              </div>
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: "0.62rem",
                  color: C.textMuted,
                  letterSpacing: "0.04em",
                }}
              >
                {b.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ─────────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section
      style={{
        padding: "5rem 2.5rem",
        background: C.void,
        borderTop: `1px solid ${C.border}`,
        fontFamily: F.ui,
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "inline-block",
          fontFamily: F.mono,
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: "1.5rem",
        }}
      >
        Ready to begin
      </div>
      <h2
        style={{
          fontFamily: F.display,
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          fontWeight: 300,
          fontStyle: "italic",
          color: C.text,
          margin: "0 0 1.5rem",
        }}
      >
        The ballot awaits.
      </h2>
      <p
        style={{
          fontSize: "0.9rem",
          color: C.textDim,
          maxWidth: "400px",
          margin: "0 auto 2.5rem",
          lineHeight: 1.7,
        }}
      >
        Log in to manage your elections, register candidates, and publish
        official results to the public.
      </p>
      <Link
        to="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "16px 36px",
          background: C.gold,
          color: C.void,
          fontFamily: F.ui,
          fontSize: "0.85rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textDecoration: "none",
          transition: "background 0.2s, transform 0.15s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = C.goldBright;
          el.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = C.gold;
          el.style.transform = "translateY(0)";
        }}
      >
        Enter the Platform
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${C.border}`,
        padding: "2rem 2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: F.ui,
        background: C.base,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "22px",
            height: "22px",
            background: C.gold,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: F.display,
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: C.textMuted,
          }}
        >
          AGORA
        </span>
      </div>

      <span
        style={{
          fontFamily: F.mono,
          fontSize: "0.62rem",
          color: C.textMuted,
          letterSpacing: "0.06em",
        }}
      >
        © 2026 · Election Management Platform · All rights reserved
      </span>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        {["Elections", "Districts", "Results", "Analytics"].map((l) => (
          <a
            key={l}
            href="#"
            style={{
              fontFamily: F.mono,
              fontSize: "0.62rem",
              letterSpacing: "0.08em",
              color: C.textMuted,
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.textDim)}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.textMuted)}
          >
            {l}
          </a>
        ))}
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ background: C.base, color: C.text, minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <StatsTicker />
      <Features />
      <HowItWorks />
      <SecurityStrip />
      <CTABanner />
      <Footer />
    </div>
  );
}
