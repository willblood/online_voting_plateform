import { Link } from "react-router";

export function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto rounded-[40px] overflow-hidden relative bg-gradient-to-br from-primary-container to-primary p-12 lg:p-20 text-center">
        {/* Background blobs */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white organic-blob translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white organic-blob -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl lg:text-5xl font-display text-white max-w-3xl mx-auto leading-tight">
            Prêt à faire entendre votre voix pour la nation ?
          </h2>
          <p className="text-white/80 text-xl max-w-2xl mx-auto font-body">
            Rejoignez des millions d'ivoiriens qui font confiance à la
            technologie pour bâtir un avenir plus transparent.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <Link
              to="/login"
              className="px-10 py-5 bg-white text-primary rounded-full font-bold text-xl shadow-2xl transition-transform hover:-translate-y-1"
            >
              Inscrivez-vous dès aujourd'hui
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
