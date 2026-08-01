"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import AdminSidebarLinks from "./AdminSidebarLinks";

export default function AdminMobileNav({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden sticky top-0 z-40 border-b border-white/10 bg-surface">
      <div className="flex h-14 items-center justify-between px-4">
        <span className="font-display text-sm font-semibold text-bone">Administration</span>
        <button onClick={() => setOpen((o) => !o)} className="text-bone" aria-label="Menu admin">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 px-3 py-3">
          <AdminSidebarLinks role={role} pathname={pathname} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
