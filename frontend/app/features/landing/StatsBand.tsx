import { stats } from "./data.js";

export function StatsBand() {
  return (
    <div className="bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className={`${stat.color} text-4xl font-display mb-1`}>
              {stat.value}
            </p>
            <p className="text-slate-400 font-label text-xs uppercase tracking-widest">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
