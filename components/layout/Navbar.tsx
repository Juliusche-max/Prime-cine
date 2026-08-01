import { getCurrentProfile } from "@/lib/supabase/queries";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const profile = await getCurrentProfile();

  const displayName = profile?.full_name || profile?.username || profile?.email || "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((p: string) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <NavbarClient
      isAuthenticated={!!profile}
      initials={initials}
      displayName={displayName}
      role={profile?.role ?? null}
    />
  );
}
