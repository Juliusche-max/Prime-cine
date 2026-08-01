"use client";

import { useState, useTransition } from "react";
import { upsertEpisodeAction, deleteEpisodeAction } from "@/lib/supabase/admin-actions";
import FileUploadField from "@/components/admin/FileUploadField";
import DeleteButton from "@/components/admin/DeleteButton";
import Button from "@/components/ui/Button";
import { Plus, Pencil, X, Film } from "lucide-react";

interface EpisodeRow {
  id: string;
  season_number: number;
  episode_number: number;
  title: string;
  synopsis: string;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  video_url?: string | null;
  release_date: string | null;
}

export default function EpisodeManager({ titleId, episodes }: { titleId: string; episodes: EpisodeRow[] }) {
  const [editing, setEditing] = useState<EpisodeRow | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await upsertEpisodeAction(formData);
      if (result?.error) setError(result.error);
      else setEditing(null);
    });
  }

  const sorted = [...episodes].sort((a, b) => a.season_number - b.season_number || a.episode_number - b.episode_number);

  return (
    <div className="rounded-lg border border-white/10 bg-surface">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h3 className="font-semibold text-bone">Épisodes ({episodes.length})</h3>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus size={14} /> Ajouter un épisode
        </Button>
      </div>

      {editing && (
        <div className="border-b border-white/10 bg-elevated/40 p-5">
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="titleId" value={titleId} />
            {editing !== "new" && <input type="hidden" name="id" value={editing.id} />}

            {error && <p className="text-sm text-prime-light" role="alert">{error}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <LabeledInput label="Saison" name="seasonNumber" type="number" defaultValue={editing !== "new" ? editing.season_number : 1} />
              <LabeledInput label="Épisode n°" name="episodeNumber" type="number" defaultValue={editing !== "new" ? editing.episode_number : episodes.length + 1} />
              <LabeledInput label="Durée (min)" name="durationMinutes" type="number" defaultValue={editing !== "new" ? editing.duration_minutes ?? "" : ""} />
              <LabeledInput label="Date de sortie" name="releaseDate" type="date" defaultValue={editing !== "new" ? editing.release_date ?? "" : ""} />
            </div>

            <LabeledInput label="Titre de l'épisode" name="title" defaultValue={editing !== "new" ? editing.title : ""} required />

            <div>
              <label className="mb-1.5 block text-sm text-mist">Synopsis</label>
              <textarea
                name="synopsis"
                rows={2}
                defaultValue={editing !== "new" ? editing.synopsis : ""}
                className="w-full rounded-md border border-white/15 bg-elevated px-3 py-2 text-sm text-bone focus:border-prime focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileUploadField bucket="thumbnails" name="thumbnailUrl" label="Miniature" accept="image/*" defaultValue={editing !== "new" ? editing.thumbnail_url : null} />
              <FileUploadField bucket="videos" name="videoUrl" label="Fichier vidéo" accept="video/*" defaultValue={editing !== "new" ? editing.video_url : null} />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Enregistrement..." : "Enregistrer l'épisode"}
              </Button>
              <button type="button" onClick={() => setEditing(null)} className="flex items-center gap-1 text-sm text-mist hover:text-bone">
                <X size={14} /> Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-white/5">
        {sorted.map((ep) => (
          <div key={ep.id} className="flex items-center gap-4 px-5 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-elevated2 text-mist">
              <Film size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-bone truncate">
                S{ep.season_number}E{ep.episode_number} — {ep.title}
              </p>
              <p className="text-xs text-mist">{ep.duration_minutes ? `${ep.duration_minutes} min` : "Durée non renseignée"}</p>
            </div>
            <button onClick={() => setEditing(ep)} className="flex items-center gap-1.5 text-xs text-mist hover:text-bone">
              <Pencil size={13} /> Modifier
            </button>
            <DeleteButton label="Supprimer" onDelete={() => deleteEpisodeAction(ep.id, titleId)} />
          </div>
        ))}
        {sorted.length === 0 && !editing && (
          <p className="px-5 py-8 text-center text-sm text-mist">Aucun épisode. Ajoutez-en un pour commencer.</p>
        )}
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-mist">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-white/15 bg-elevated px-3 py-2 text-sm text-bone focus:border-prime focus:outline-none"
      />
    </div>
  );
}
