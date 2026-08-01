"use client";

import { useState, useTransition } from "react";
import { upsertBannerAction } from "@/lib/supabase/admin-actions";
import FileUploadField from "@/components/admin/FileUploadField";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function BannerForm({ initial, titles }: { initial?: any; titles: { id: string; title: string }[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await upsertBannerAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5 max-w-xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {error && <p className="rounded-md border border-prime/40 bg-prime/10 px-3 py-2 text-sm text-prime-light" role="alert">{error}</p>}

      <div>
        <label className="mb-1.5 block text-sm text-mist">Titre principal *</label>
        <input name="heading" required defaultValue={initial?.heading} className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">Sous-titre</label>
        <textarea name="subheading" rows={2} defaultValue={initial?.subheading ?? ""} className={inputClass} />
      </div>

      <FileUploadField bucket="backdrops" name="imageUrl" label="Image de la bannière *" accept="image/*" defaultValue={initial?.image_url} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm text-mist">Libellé du bouton</label>
          <input name="ctaLabel" defaultValue={initial?.cta_label ?? "Regarder"} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-mist">Titre lié (optionnel)</label>
          <select name="titleId" defaultValue={initial?.title_id ?? ""} className={inputClass}>
            <option value="">Aucun</option>
            {titles.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">Lien externe (si pas de titre lié)</label>
        <input name="externalLink" defaultValue={initial?.external_link ?? ""} placeholder="https://..." className={inputClass} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm text-mist">Ordre d&apos;affichage</label>
          <input name="sortOrder" type="number" defaultValue={initial?.sort_order ?? 0} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm text-bone pt-6">
          <input type="checkbox" name="isActive" defaultChecked={initial?.is_active ?? true} className="accent-prime" />
          Bannière active
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer la bannière"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-white/15 bg-elevated px-3 py-2.5 text-sm text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none";
