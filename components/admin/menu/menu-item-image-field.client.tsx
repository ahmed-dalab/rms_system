"use client";

import { ImageIcon, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

type MenuItemImageFieldProps = {
  idPrefix: string;
  /** Value saved to MongoDB (storage path or external URL). */
  defaultStorageKey?: string | null;
  /** Resolved URL for preview when editing. */
  defaultPreviewUrl?: string | null;
  disabled?: boolean;
};

export function MenuItemImageField({
  idPrefix,
  defaultStorageKey = null,
  defaultPreviewUrl = null,
  disabled,
}: MenuItemImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [storageKey, setStorageKey] = useState(defaultStorageKey ?? "");
  const [preview, setPreview] = useState<string | null>(
    defaultPreviewUrl ?? defaultStorageKey,
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(file: File | null) {
    if (!file) {
      return;
    }
    setError(null);
    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/menu-items/upload", {
        method: "POST",
        body,
      });
      const json = (await response.json()) as {
        data?: { path: string; url: string };
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error ?? "Upload failed");
      }
      const path = json.data?.path;
      const url = json.data?.url;
      if (!path || !url) {
        throw new Error("Upload failed");
      }
      setStorageKey(path);
      setPreview(url);
    } catch (err) {
      setPreview(defaultPreviewUrl ?? defaultStorageKey);
      setStorageKey(defaultStorageKey ?? "");
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  }

  function clearImage() {
    setStorageKey("");
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-image`}>Photo</Label>
      <input type="hidden" name="imageUrl" value={storageKey} readOnly />
      <div className="flex gap-3">
        <div
          className={cn(
            "relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted",
            preview && "border-solid",
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs
            <img
              src={preview}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon className="size-8 text-muted-foreground/50" />
          )}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            id={`${idPrefix}-image`}
            type="file"
            accept={ACCEPT}
            disabled={disabled || uploading}
            className="text-sm file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              void onFileChange(file);
            }}
          />
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, or GIF · max 5 MB. Stored in Supabase Storage.
          </p>
          {preview ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-fit text-muted-foreground"
              onClick={clearImage}
              disabled={disabled || uploading}
            >
              <X />
              Remove photo
            </Button>
          ) : null}
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
