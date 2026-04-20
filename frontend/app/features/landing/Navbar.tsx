import { useState, useEffect } from "react";
import { Link } from "react-router";
import { navLinks } from "./data.js";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200"
          : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
        {/* Logo */}
        <div className="text-2xl font-black tracking-tighter text-slate-900 font-headline">
          VOTI CI
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => {
            const cls = `font-headline font-medium text-sm tracking-tight transition-all duration-300 hover:opacity-80 ${
              i === 0
                ? "text-primary-container font-bold border-b-2 border-primary-container pb-1"
                : "text-slate-600 hover:text-primary-container"
            }`;
            return link.href.startsWith("/") ? (
              <Link key={link.label} to={link.href} className={cls}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className={cls}>
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-6 py-2.5 bg-primary-container text-white rounded-full font-bold shadow-lg transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
          >
            Connexion
          </Link>
        </div>
      </div>
    </nav>
  );
}
