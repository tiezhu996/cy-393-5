import { useEffect } from "react";
import { saveFile } from "../storage/indexedDb";
import type { MindMapFile } from "../types/mindmap";

export function useAutoSave(file?: MindMapFile): void {
  useEffect((): (() => void) | undefined => {
    if (!file) return undefined;
    const timerId: ReturnType<typeof setTimeout> = window.setTimeout((): Promise<void> => saveFile(file), 500);
    return (): void => {
      window.clearTimeout(timerId);
    };
  }, [file]);
}
