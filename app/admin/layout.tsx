import { getCurrentProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Administration Prime Ciné", default: "Administration" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login?next=/admin");
  if (!["moderator", "admin", "super_admin"].includes(profile.role)) redirect("/");

  return (
    <div className="flex bg-void">
      <AdminSidebar role={profile.role} />
      <div className="flex-1 min-w-0">
        <AdminMobileNav role={profile.role} />
        {children}
      </div>
    </div>
  );
}
