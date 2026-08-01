"use client";

import { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, Loader2, X, Film, Image as ImageIcon } from "lucide-react";
import { uploadToBucket, formatBytes, UploadBucket } from "@/lib/supabase/storage";
import Image from "next/image";

interface FileUploadFieldProps {
  bucket: UploadBucket;
  name: string;
  label: string;
  accept: "image/*" | "video/*";
  defaultValue?: string | null;
  kind?: "image" | "video";
}

export default function FileUploadField({
  bucket,
  name,
  label,
  accept,
  defaultValue,
  kind = accept === "video/*" ? "video" : "image",
}: FileUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setFileName(`${file.name} (${formatBytes(file.size)})`);
    setProgress(0);
    try {
      const publicUrl = await uploadToBucket(bucket, file, (p) => setProgress(p.percent));
      setUrl(publicUrl);
    } catch (e: any) {
      setError(e.message ?? "Échec du téléversement.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm text-mist">{label}</label>
      <input type="hidden" name={name} value={url} readOnly />

      <div className="rounded-md border border-dashed border-white/20 bg-elevated p-4">
        {url && !fileName && (
          <div className="mb-3 flex items-center gap-3">
            {kind === "image" ? (
              <div className="relative h-16 w-16 overflow-hidden rounded bg-elevated2 shrink-0">
                <Image src={url} alt="" fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded bg-elevated2 shrink-0">
                <Film size={22} className="text-prime" />
              </div>
            )}
            <p className="truncate text-xs text-mist">{url}</p>
          </div>
        )}

        {progress !== null ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-bone">
              <Loader2 size={16} className="animate-spin text-prime" />
              Téléversement en cours... {progress}%
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated2">
              <div className="h-full bg-prime transition-all" style={{ width: `${progress}%` }} />
            </div>
            {fileName && <p className="text-xs text-mist">{fileName}</p>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-void/40 py-2.5 text-sm text-mist hover:border-prime hover:text-bone transition-colors"
          >
            {kind === "image" ? <ImageIcon size={16} /> : <UploadCloud size={16} />}
            {url ? "Remplacer le fichier" : `Téléverser ${kind === "image" ? "une image" : "une vidéo"}`}
          </button>
        )}

        {url && progress === null && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
            <CheckCircle2 size={13} /> Fichier prêt
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setFileName(null);
              }}
              className="ml-auto flex items-center gap-1 text-mist hover:text-prime"
            >
              <X size={13} /> Retirer
            </button>
          </div>
        )}

        {error && <p className="mt-2 text-xs text-prime-light" role="alert">{error}</p>}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      <p className="mt-1 text-[11px] text-mist/70">
        Ou collez une URL directement :{" "}
        <input
          type="text"
          defaultValue={defaultValue ?? ""}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded border border-white/10 bg-void/40 px-2 py-1 text-xs text-bone focus:border-prime focus:outline-none"
        />
      </p>
    </div>
  );
}
