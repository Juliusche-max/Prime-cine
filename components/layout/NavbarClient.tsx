"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, ChevronDown, Menu, X, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/supabase/auth-actions";

interface NavbarClientProps {
  isAuthenticated: boolean;
  initials: string;
  displayName: string;
  role: string | null;
}

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/movies", label: "Films" },
  { href: "/series", label: "Séries" },
  { href: "/zero-couple", label: "Zéro Couple" },
  { href: "/categories", label: "Catégories" },
  { href: "/my-list", label: "Ma Liste" },
];

export default function NavbarClient({ isAuthenticated, initials, displayName, role }: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-300",
        scrolled ? "bg-void/95 backdrop-blur-md shadow-lg shadow-black/40" : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <div className="mx-auto flex h-16 md:h-20 max-w-[1800px] items-center justify-between px-4 md:px-10">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Prime Ciné - Accueil">
            <motion.div
              initial={{ rotate: -8, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ rotate: -6, scale: 1.05 }}
              className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded bg-prime"
            >
              <Film size={18} className="text-bone" strokeWidth={2.4} />
            </motion.div>
            <span className="font-display text-xl md:text-2xl font-semibold tracking-tight text-bone">
              Prime <span className="text-prime">Ciné</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-mist hover:text-bone transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden sm:flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  autoFocus
                  type="text"
                  placeholder="Titres, genres, acteurs..."
                  className="mr-2 rounded-md border border-mist/30 bg-black/60 px-3 py-1.5 text-sm text-bone placeholder:text-mist focus:border-prime focus:outline-none"
                />
              )}
            </AnimatePresence>
            <button
              aria-label="Rechercher"
              onClick={() => setSearchOpen((s) => !s)}
              className="text-bone hover:text-prime transition-colors"
            >
              <Search size={20} />
            </button>
          </div>

          <Link href="/search" className="sm:hidden text-bone" aria-label="Rechercher">
            <Search size={20} />
          </Link>

          <button aria-label="Notifications" className="relative text-bone hover:text-prime transition-colors">
            <Bell size={20} />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-prime text-[9px] font-bold text-white">
              3
            </span>
          </button>

          {isAuthenticated ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-1.5"
                aria-label="Profil utilisateur"
                aria-expanded={profileOpen}
              >
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-prime to-gold flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
                <ChevronDown size={14} className={cn("text-mist transition-transform", profileOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-11 w-56 rounded-md border border-white/10 bg-surface shadow-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-bone truncate">{displayName}</p>
                      {role && role !== "user" && (
                        <p className="text-[11px] uppercase tracking-wide text-prime mt-0.5">{role.replace("_", " ")}</p>
                      )}
                    </div>
                    <Link href="/profile" className="block px-4 py-2.5 text-sm text-bone hover:bg-elevated">Mon profil</Link>
                    <Link href="/continue-watching" className="block px-4 py-2.5 text-sm text-bone hover:bg-elevated">Reprendre la lecture</Link>
                    <Link href="/history" className="block px-4 py-2.5 text-sm text-bone hover:bg-elevated">Historique</Link>
                    <Link href="/settings" className="block px-4 py-2.5 text-sm text-bone hover:bg-elevated">Paramètres</Link>
                    {role && ["moderator", "admin", "super_admin"].includes(role) && (
                      <Link href="/admin" className="block px-4 py-2.5 text-sm text-gold hover:bg-elevated">Tableau de bord admin</Link>
                    )}
                    <div className="h-px bg-white/10" />
                    <form action={signOutAction}>
                      <button type="submit" className="w-full text-left px-4 py-2.5 text-sm text-mist hover:bg-elevated hover:text-bone">
                        Se déconnecter
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-bone hover:text-prime transition-colors">
                Connexion
              </Link>
              <Link href="/register">
                <span className="rounded-md bg-prime px-4 py-1.5 text-sm font-semibold text-white hover:bg-prime-light transition-colors">
                  S&apos;inscrire
                </span>
              </Link>
            </div>
          )}

          <button
            className="lg:hidden text-bone"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-void/98 border-t border-white/10"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded px-2 py-2.5 text-base text-bone hover:bg-elevated"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-1" />
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded px-2 py-2.5 text-base text-bone hover:bg-elevated">Mon profil</Link>
                  <Link href="/settings" onClick={() => setMobileOpen(false)} className="rounded px-2 py-2.5 text-base text-bone hover:bg-elevated">Paramètres</Link>
                  <form action={signOutAction}>
                    <button type="submit" className="w-full text-left rounded px-2 py-2.5 text-base text-mist hover:bg-elevated hover:text-bone">Se déconnecter</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded px-2 py-2.5 text-base text-bone hover:bg-elevated">Connexion</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded px-2 py-2.5 text-base text-prime font-semibold hover:bg-elevated">S&apos;inscrire</Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
