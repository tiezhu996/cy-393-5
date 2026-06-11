import { useEffect } from "react";
import { SHORTCUTS } from "../constants/shortcuts";
import { useMindMapStore } from "../stores/mindMapStore";
import type { MindMapState } from "../stores/mindMapStore";

type KeyboardStore = Pick<MindMapState, "addChild" | "addSibling" | "removeSelected" | "undo" | "redo">;

export function useKeyboard(): void {
  const store: KeyboardStore = useMindMapStore(
    (s: MindMapState): KeyboardStore => ({
      addChild: s.addChild,
      addSibling: s.addSibling,
      removeSelected: s.removeSelected,
      undo: s.undo,
      redo: s.redo
    })
  );

  useEffect((): () => void => {
    function onKey(e: KeyboardEvent): void {
      const target: EventTarget | null = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (e.key === SHORTCUTS.ADD_CHILD) { e.preventDefault(); store.addChild(); }
      if (e.key === SHORTCUTS.ADD_SIBLING) store.addSibling();
      if (e.key === SHORTCUTS.DELETE) store.removeSelected();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === SHORTCUTS.UNDO) store.undo();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === SHORTCUTS.REDO) store.redo();
    }
    window.addEventListener("keydown", onKey);
    return (): void => {
      window.removeEventListener("keydown", onKey);
    };
  }, [store]);
}
