"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film } from "lucide-react";
import AdminSidebarLinks from "./AdminSidebarLinks";

export default function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col border-r border-white/10 bg-surface min-h-screen sticky top-0">
      <div className="flex h-20 items-center gap-2 px-6 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-prime">
          <Film size={16} className="text-bone" />
        </div>
        <div>
          <p className="font-display text-base font-semibold text-bone leading-none">Prime Ciné</p>
          <p className="text-[11px] text-mist mt-0.5">Espace administration</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <AdminSidebarLinks role={role} pathname={pathname} />
      </nav>
    </aside>
  );
}
