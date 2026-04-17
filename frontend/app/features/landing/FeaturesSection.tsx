import { features, type Feature } from "./data.js";

interface FeatureCardProps {
  readonly feature: Feature;
}

function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <div
      className={`bg-white p-8 rounded-[24px] hover:shadow-xl transition-all duration-300 border-b-4 border-transparent ${feature.hoverBorder}`}
    >
      <div
        className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center mb-6`}
      >
        <span className={`material-symbols-outlined ${feature.iconColor} text-3xl`}>
          {feature.icon}
        </span>
      </div>
      <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">
        {feature.title}
      </h3>
      <p className="text-tertiary leading-relaxed font-body">{feature.desc}</p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="text-primary font-bold text-sm tracking-[0.2em] uppercase font-label">
            Nos Atouts
          </span>
          <h2 className="text-4xl font-display text-on-surface">
            Une technologie au service de la démocratie
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
