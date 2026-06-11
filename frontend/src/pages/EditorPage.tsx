import { useEffect } from "react";
import { FileSidebar } from "../components/Sidebar/FileSidebar";
import { MindMapCanvas } from "../components/MindMap/MindMapCanvas";
import { NotePanel } from "../components/MindMap/NotePanel";
import { Toolbar } from "../components/MindMap/Toolbar";
import { useKeyboard } from "../hooks/useKeyboard";
import { useMindMapStore } from "../stores/mindMapStore";

export function EditorPage() {
  const hydrate = useMindMapStore((s: { hydrate: () => Promise<void> }) => s.hydrate);
  useEffect((): void => { hydrate(); }, [hydrate]);
  useKeyboard();
  return <main className="flex h-screen overflow-hidden">
    <FileSidebar />
    <section className="flex min-w-0 flex-1 flex-col">
      <Toolbar canvasId="mindmap-canvas" />
      <MindMapCanvas id="mindmap-canvas" />
    </section>
    <NotePanel />
  </main>;
}
