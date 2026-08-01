"use client";

import { useState, useTransition } from "react";
import { upsertTitleAction } from "@/lib/supabase/admin-actions";
import FileUploadField from "@/components/admin/FileUploadField";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface Genre {
  id: string;
  name: string;
}

interface TitleFormProps {
  mode: "movie" | "series";
  genres: Genre[];
  initial?: any; // row shape from getTitleForAdmin()
}

export default function TitleForm({ mode, genres, initial }: TitleFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectedGenreIds: string[] = (initial?.title_genres ?? []).map((tg: any) => tg.genre_id);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await upsertTitleAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8 max-w-3xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="type" value={mode} />

      {error && (
        <p className="rounded-md border border-prime/40 bg-prime/10 px-3 py-2 text-sm text-prime-light" role="alert">{error}</p>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-mist">Informations principales</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Titre *">
            <input name="title" required defaultValue={initial?.title} className={inputClass} />
          </Field>
          <Field label="Titre original">
            <input name="originalTitle" defaultValue={initial?.original_title ?? ""} className={inputClass} />
          </Field>
        </div>

        <Field label="Slug (laisser vide pour générer automatiquement)">
          <input name="slug" defaultValue={initial?.slug ?? ""} placeholder="mon-super-film" className={inputClass} />
        </Field>

        <Field label="Résumé court (affiché dans le hero et les vignettes)">
          <textarea name="shortSynopsis" defaultValue={initial?.short_synopsis ?? ""} rows={2} className={inputClass} />
        </Field>

        <Field label="Synopsis complet *">
          <textarea name="synopsis" required defaultValue={initial?.synopsis ?? ""} rows={4} className={inputClass} />
        </Field>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-bone">
            <input type="checkbox" name="isOriginal" defaultChecked={initial?.is_original} className="accent-prime" />
            Prime Ciné Original
          </label>
          <label className="flex items-center gap-2 text-sm text-bone">
            <input type="checkbox" name="isPublished" defaultChecked={initial?.is_published ?? true} className="accent-prime" />
            Publié (visible sur le site)
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-mist">Genres</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <label
              key={g.id}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-bone has-[:checked]:border-prime has-[:checked]:bg-prime/15 has-[:checked]:text-prime cursor-pointer"
            >
              <input
                type="checkbox"
                name="genreIds"
                value={g.id}
                defaultChecked={selectedGenreIds.includes(g.id)}
                className="accent-prime"
              />
              {g.name}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-mist">Médias</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileUploadField bucket="posters" name="posterUrl" label="Affiche (portrait)" accept="image/*" defaultValue={initial?.poster_url} />
          <FileUploadField bucket="backdrops" name="backdropUrl" label="Image de fond (paysage)" accept="image/*" defaultValue={initial?.backdrop_url} />
        </div>
        <Field label="URL de la bande-annonce (YouTube, Vimeo, etc.)">
          <input name="trailerUrl" defaultValue={initial?.trailer_url ?? ""} className={inputClass} />
        </Field>
        {mode === "movie" && (
          <FileUploadField bucket="videos" name="videoUrl" label="Fichier vidéo du film" accept="video/*" defaultValue={initial?.video_url} />
        )}
        {mode === "series" && (
          <p className="text-xs text-mist">
            Les vidéos d&apos;une série se téléversent par épisode, dans l&apos;éditeur d&apos;épisodes une fois la
            série enregistrée.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-mist">Détails</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Classification">
            <input name="ageRating" defaultValue={initial?.age_rating ?? "Tous publics"} className={inputClass} />
          </Field>
          <Field label="Année de sortie">
            <input name="releaseYear" type="number" defaultValue={initial?.release_year ?? ""} className={inputClass} />
          </Field>
          <Field label="Date de sortie">
            <input name="releaseDate" type="date" defaultValue={initial?.release_date ?? ""} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {mode === "movie" && (
            <Field label="Durée (minutes)">
              <input name="durationMinutes" type="number" defaultValue={initial?.duration_minutes ?? ""} className={inputClass} />
            </Field>
          )}
          <Field label={mode === "movie" ? "Libellé durée (ex: 1h 45min)" : "Libellé (ex: 2 saisons)"}>
            <input name="durationLabel" defaultValue={initial?.duration_label ?? ""} className={inputClass} />
          </Field>
          <Field label="Réalisateur">
            <input name="director" defaultValue={initial?.director ?? ""} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Langue">
            <input name="language" defaultValue={initial?.language ?? "Français"} className={inputClass} />
          </Field>
          <Field label="Pays">
            <input name="country" defaultValue={initial?.country ?? "Cameroun"} className={inputClass} />
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : initial?.id ? "Enregistrer les modifications" : "Créer le titre"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-mist">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-white/15 bg-elevated px-3 py-2.5 text-sm text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none";
