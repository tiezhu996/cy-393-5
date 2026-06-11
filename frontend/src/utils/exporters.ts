import { toPng } from "html-to-image";
import type { MindMapFile } from "../types/mindmap";
import { toMarkdown } from "./tree";

function download(content: string, filename: string, type: string): void {
  const url: string = URL.createObjectURL(new Blob([content], { type }));
  const anchor: HTMLAnchorElement = Object.assign(document.createElement("a"), { href: url, download: filename });
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportJson(file: MindMapFile): void {
  download(JSON.stringify(file, null, 2), `${file.name}.json`, "application/json");
}

export function exportMarkdown(file: MindMapFile): void {
  download(toMarkdown(file.nodes, file.edges), `${file.name}.md`, "text/markdown");
}

export async function exportPng(element: HTMLElement, name: string): Promise<void> {
  const dataUrl: string = await toPng(element);
  const anchor: HTMLAnchorElement = Object.assign(document.createElement("a"), { href: dataUrl, download: `${name}.png` });
  anchor.click();
}
