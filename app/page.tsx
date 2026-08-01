import Hero from "@/components/home/Hero";
import MovieRow from "@/components/home/MovieRow";
import FilmDivider from "@/components/ui/FilmDivider";
import { getHomeRows, getPublishedTitles, getRecommendedTitles, getCurrentProfile } from "@/lib/supabase/queries";

export default async function HomePage() {
  const [rows, titles, profile] = await Promise.all([getHomeRows(), getPublishedTitles(), getCurrentProfile()]);
  const heroTitles = [titles.find((t) => t.isOriginal) ?? titles[0], ...titles.slice(1, 3)].filter(Boolean) as typeof titles;

  const finalRows = [...rows];
  if (profile) {
    const recommended = await getRecommendedTitles(undefined, 10);
    if (recommended.length > 0) {
      finalRows.push({ id: "recommended", title: "Recommandé pour vous", titles: recommended });
    }
  }

  return (
    <div>
      <Hero titles={heroTitles} />
      <FilmDivider />
      <div className="space-y-6 py-8 md:py-10">
        {finalRows.map((row) => (
          <MovieRow key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}
