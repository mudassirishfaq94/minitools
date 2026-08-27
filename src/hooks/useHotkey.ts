import { useEffect } from "react";

interface HotkeyOptions {
  meta?: boolean;
  shift?: boolean;
  enabled?: boolean;
}

/** Registers a keyboard shortcut such as ⌘K / Ctrl+K. */
export function useHotkey(
  key: string,
  handler: (event: KeyboardEvent) => void,
  { meta = false, shift = false, enabled = true }: HotkeyOptions = {},
) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      // Never hijack plain typing inside inputs, textareas or editable elements.
      const target = event.target as HTMLElement | null;
      const editable =
        !!target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (editable && !meta) return;

      if (meta && !(event.metaKey || event.ctrlKey)) return;
      if (!meta && (event.metaKey || event.ctrlKey)) return;
      if (shift !== event.shiftKey) return;
      event.preventDefault();
      handler(event);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, handler, meta, shift, enabled]);
}
