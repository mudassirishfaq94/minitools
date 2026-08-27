import { useCallback, useEffect, useRef, useState } from "react";
import { loadImage, validateImageFile, type LoadedImage } from "@/utils/image";

interface ImageUploadState {
  image: LoadedImage | null;
  error: string | null;
  loading: boolean;
  accept: (file: File | null | undefined) => Promise<void>;
  clear: () => void;
  setError: (message: string | null) => void;
}

/**
 * Loads a user-selected image and owns its lifecycle.
 *
 * Object URLs and ImageBitmaps are released on replacement and on unmount,
 * which matters because bitmaps hold decoded pixel data in memory.
 */
export function useImageUpload(): ImageUploadState {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currentRef = useRef<LoadedImage | null>(null);

  const release = useCallback((target: LoadedImage | null) => {
    if (!target) return;
    URL.revokeObjectURL(target.url);
    target.bitmap.close();
  }, []);

  useEffect(
    () => () => {
      release(currentRef.current);
    },
    [release],
  );

  const accept = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;

      const invalid = validateImageFile(file);
      if (invalid) {
        setError(invalid.message);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const loaded = await loadImage(file);
        release(currentRef.current);
        currentRef.current = loaded;
        setImage(loaded);
      } catch (caught) {
        setError((caught as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [release],
  );

  const clear = useCallback(() => {
    release(currentRef.current);
    currentRef.current = null;
    setImage(null);
    setError(null);
  }, [release]);

  return { image, error, loading, accept, clear, setError };
}
