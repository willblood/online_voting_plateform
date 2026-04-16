import { Link } from "react-router";
import { heroAvatarUrls } from "./data.js";

interface CandidateBarProps {
  readonly name: string;
  readonly pct: number;
  readonly barColor: string;
}

function CandidateBar({ name, pct, barColor }: CandidateBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-bold text-on-surface">
        <span>{name}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-surface">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 organic-blob -z-10 translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 organic-blob -z-10 -translate-x-1/4 translate-y-1/4" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text */}
        <div className="space-y-8">
          <h1 className="text-5xl lg:text-7xl font-display text-on-surface leading-[1.1] tracking-tight">
            Votez en toute{" "}
            <span className="text-primary-container">confiance</span>,{" "}
            <span className="text-secondary">partout</span>.
          </h1>

          <p className="text-xl text-tertiary max-w-xl leading-relaxed font-body">
            La plateforme électorale numérique sécurisée qui garantit la
            transparence et l'intégrité de chaque voix en Côte d'Ivoire.
            Simple, rapide et inaltérable.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/login"
              className="px-8 py-4 bg-primary-container text-white rounded-full font-bold text-lg shadow-xl transition-transform hover:-translate-y-1"
            >
              Commencer maintenant
            </Link>
            <button className="px-8 py-4 bg-transparent border-2 border-outline-variant text-primary rounded-full font-bold text-lg transition-transform hover:-translate-y-1">
              Voir la démo
            </button>
          </div>
        </div>

        {/* Right: Election preview card */}
        <div className="relative">
          <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-[0px_12px_32px_rgba(10,22,40,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 organic-blob opacity-50" />

            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-headline font-extrabold text-xl text-on-surface">
                  Législatives 2024
                </h3>
                <span className="text-xs font-label uppercase tracking-widest text-secondary font-bold">
                  En direct · Résultats partiels
                </span>
              </div>
              <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-bold">
                Live
              </div>
            </div>

            <div className="space-y-6">
              <CandidateBar name="Candidat A" pct={42} barColor="bg-primary-container" />
              <CandidateBar name="Candidat B" pct={38} barColor="bg-secondary" />
              <CandidateBar name="Candidat C" pct={20} barColor="bg-tertiary-container" />
            </div>

            <div className="mt-8 pt-6 border-t border-surface-container-high flex items-center justify-between text-tertiary">
              <div className="flex -space-x-2">
                {heroAvatarUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Électeur"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                  +12k
                </div>
              </div>
              <span className="text-sm font-medium">1.2M votes enregistrés</span>
            </div>
          </div>

          {/* Floating verified badge */}
          <div className="absolute -bottom-6 -left-6 bg-secondary-container p-4 rounded-xl shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-secondary-container">
                Identité Vérifiée
              </p>
              <p className="text-[10px] text-on-secondary-container/80">
                Blockchain Sécurisée
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
