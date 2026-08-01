import Link from "next/link";
import { Film, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const columns = [
  {
    title: "Explorer",
    links: [
      { href: "/movies", label: "Films" },
      { href: "/series", label: "Séries" },
      { href: "/zero-couple", label: "Zéro Couple" },
      { href: "/categories", label: "Catégories" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/profile", label: "Mon profil" },
      { href: "/my-list", label: "Ma liste" },
      { href: "/settings", label: "Paramètres" },
      { href: "/pricing", label: "Abonnements" },
    ],
  },
  {
    title: "Prime Ciné",
    links: [
      { href: "/about", label: "À propos" },
      { href: "/contact", label: "Contact" },
      { href: "/pricing", label: "Tarifs" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface">
      <div className="mx-auto max-w-[1800px] px-4 md:px-10 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-prime">
                <Film size={16} className="text-bone" />
              </div>
              <span className="font-display text-lg font-semibold text-bone">
                Prime <span className="text-prime">Ciné</span>
              </span>
            </div>
            <p className="text-sm text-mist max-w-xs leading-relaxed">
              La plateforme de streaming 100% camerounaise. Films, séries, documentaires
              et télé-réalité, racontés par nous, pour nous.
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Réseau social"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-mist hover:border-prime hover:text-prime transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-bone mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-mist hover:text-bone transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="film-divider my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-mist">
          <p>© 2026 Prime Ciné SARL — Douala, Cameroun. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-bone">Confidentialité</Link>
            <Link href="/about" className="hover:text-bone">Conditions d&apos;utilisation</Link>
            <Link href="/contact" className="hover:text-bone">Nous contacter</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
