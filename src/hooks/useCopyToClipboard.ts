import { useCallback, useEffect, useRef, useState } from "react";
import { copyText } from "@/utils/clipboard";

interface CopyState {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

/** Copy text to the clipboard and expose a transient `copied` flag. */
export function useCopyToClipboard(resetAfter = 1600): CopyState {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      if (!ok) return false;
      setCopied(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), resetAfter);
      return true;
    },
    [resetAfter],
  );

  return { copied, copy };
}
