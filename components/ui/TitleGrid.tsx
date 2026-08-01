import { Title } from "@/lib/types";
import MovieCard from "@/components/ui/MovieCard";

export default function TitleGrid({ titles, emptyMessage }: { titles: Title[]; emptyMessage: string }) {
  if (titles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-mist">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 px-4 md:px-10">
      {titles.map((title) => (
        <div key={title.id} className="w-full [&>div]:w-full">
          <MovieCard title={title} />
        </div>
      ))}
    </div>
  );
}
