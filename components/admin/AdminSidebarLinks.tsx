"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Film,
  Tv,
  Users,
  CreditCard,
  MessageSquare,
  GalleryHorizontal,
  Bell,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/admin/movies", label: "Films", icon: Film },
  { href: "/admin/series", label: "Séries", icon: Tv },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
  { href: "/admin/comments", label: "Commentaires", icon: MessageSquare },
  { href: "/admin/banners", label: "Bannières", icon: GalleryHorizontal },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

export default function AdminSidebarLinks({
  role,
  pathname,
  onNavigate,
}: {
  role: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-1">
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-prime/15 text-prime" : "text-mist hover:bg-elevated hover:text-bone"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}

      {role === "super_admin" && (
        <Link
          href="/admin/administrators"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/admin/administrators")
              ? "bg-gold/15 text-gold"
              : "text-mist hover:bg-elevated hover:text-gold"
          )}
        >
          <ShieldCheck size={18} />
          Administrateurs
        </Link>
      )}

      <div className="my-2 h-px bg-white/10" />

      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-mist hover:bg-elevated hover:text-bone transition-colors"
      >
        <ArrowLeft size={18} />
        Retour au site
      </Link>
    </div>
  );
}
