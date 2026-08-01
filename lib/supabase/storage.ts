"use client";

import { createClient } from "@/lib/supabase/client";

export type UploadBucket = "posters" | "backdrops" | "thumbnails" | "avatars" | "videos";

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Uploads a file to a Supabase Storage bucket and returns its public URL.
 * Videos can be large, so this reports progress via XHR (the supabase-js
 * client itself doesn't expose upload progress yet).
 */
export function uploadToBucket(
  bucket: UploadBucket,
  file: File,
  onProgress?: (p: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("x-upsert", "true");
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({ loaded: e.loaded, total: e.total, percent: Math.round((e.loaded / e.total) * 100) });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
          resolve(publicUrlData.publicUrl);
        } else {
          reject(new Error(`Échec du téléversement (${xhr.status}): ${xhr.responseText}`));
        }
      };
      xhr.onerror = () => reject(new Error("Erreur réseau pendant le téléversement."));
      xhr.send(file);
    });
  });
}

export function isVideoFile(file: File) {
  return file.type.startsWith("video/");
}

export function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
