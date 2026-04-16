import { steps } from "./data.js";

export function HowItWorks() {
  return (
    <section className="py-24 px-6 overflow-hidden relative bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="text-secondary font-bold text-sm tracking-[0.2em] uppercase font-label">
            Processus
          </span>
          <h2 className="text-4xl font-display text-on-surface">
            Votre vote en 4 étapes simples
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="relative z-10 group">
              <div className="mb-8 relative">
                <div
                  className="w-20 h-20 text-white rounded-[24px] flex items-center justify-center text-3xl font-display shadow-lg group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: step.bg }}
                >
                  {step.num}
                </div>
                {/* Connector line (hidden on last step and mobile) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-20 w-full h-[2px] bg-gradient-to-r from-primary-container to-secondary -z-10" />
                )}
              </div>
              <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">
                {step.title}
              </h3>
              <p className="text-tertiary leading-relaxed font-body">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
