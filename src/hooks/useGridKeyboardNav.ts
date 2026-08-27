import { useCallback, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";

/**
 * Roving keyboard navigation for a responsive card grid.
 *
 * Items are discovered via `[data-nav-item]`, and the column count is derived
 * from the rendered layout, so arrow keys behave correctly at every breakpoint.
 */
export function useGridKeyboardNav<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T>(null);

  const getItems = useCallback(
    () =>
      Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>("[data-nav-item]") ?? [],
      ).filter((item) => item.offsetParent !== null),
    [],
  );

  /** Number of items rendered on the first visual row. */
  const getColumns = useCallback(
    (items: HTMLElement[]) => {
      if (items.length === 0) return 1;
      const top = items[0].getBoundingClientRect().top;
      const columns = items.filter(
        (item) => Math.abs(item.getBoundingClientRect().top - top) < 2,
      ).length;
      return Math.max(1, columns);
    },
    [],
  );

  const focusItem = useCallback(
    (index: number) => {
      const items = getItems();
      if (items.length === 0) return false;
      const clamped = Math.min(Math.max(index, 0), items.length - 1);
      items[clamped].focus();
      return true;
    },
    [getItems],
  );

  const focusFirst = useCallback(() => focusItem(0), [focusItem]);

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<T>) => {
      const items = getItems();
      if (items.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const current = active ? items.indexOf(active) : -1;
      if (current === -1) return;

      const columns = getColumns(items);
      let next: number | null = null;

      switch (event.key) {
        case "ArrowRight":
          next = current + 1;
          break;
        case "ArrowLeft":
          next = current - 1;
          break;
        case "ArrowDown":
          next = current + columns;
          break;
        case "ArrowUp":
          next = current - columns;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = items.length - 1;
          break;
        default:
          return;
      }

      if (next === null) return;
      // Stay put instead of wrapping when moving past the first / last row.
      if (next < 0 || next >= items.length) {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") return;
        next = next < 0 ? 0 : items.length - 1;
      }

      event.preventDefault();
      items[next].focus();
    },
    [getItems, getColumns],
  );

  return { containerRef, onKeyDown, focusFirst, focusItem };
}
