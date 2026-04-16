import { footerLegal, footerProduct } from "./data.js";

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 w-full py-16 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <div className="text-2xl font-black text-white font-headline">
            VOTI CI
          </div>
          <p className="text-sm leading-relaxed text-slate-400 font-body">
            Propulser la démocratie ivoirienne dans l'ère numérique avec
            intégrité, transparence et innovation constante.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white hover:bg-primary-container transition-colors"
              aria-label="Site web"
            >
              <span className="material-symbols-outlined text-lg">public</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white hover:bg-primary-container transition-colors"
              aria-label="Réseaux sociaux"
            >
              <span className="material-symbols-outlined text-lg">share</span>
            </a>
          </div>
        </div>

        {/* Produit */}
        <div className="space-y-6">
          <h4 className="text-white font-bold uppercase text-xs tracking-widest font-label">
            Produit
          </h4>
          <ul className="space-y-4 text-sm font-body">
            {footerProduct.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-slate-500 hover:text-orange-400 transition-all duration-200"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Légal */}
        <div className="space-y-6">
          <h4 className="text-white font-bold uppercase text-xs tracking-widest font-label">
            Légal
          </h4>
          <ul className="space-y-4 text-sm font-body">
            {footerLegal.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-slate-500 hover:text-orange-400 transition-all duration-200"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h4 className="text-white font-bold uppercase text-xs tracking-widest font-label">
            Contact
          </h4>
          <ul className="space-y-4 text-sm font-body">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-sm">
                mail
              </span>
              contact@voti.ci
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-sm">
                location_on
              </span>
              Abidjan, Côte d'Ivoire
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-16 pt-8 text-center text-xs text-slate-600 font-body">
        © 2024 VOTI CI. Tous droits réservés. Excellence Électorale en Côte
        d'Ivoire.
      </div>
    </footer>
  );
}
