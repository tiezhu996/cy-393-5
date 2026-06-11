import type { ChangeEvent } from "react";
import { THEMES } from "../../constants/themes";
import { useMindMapStore } from "../../stores/mindMapStore";
import type { MindMapFile } from "../../types/mindmap";
import { exportJson, exportMarkdown, exportPng } from "../../utils/exporters";
import { Button } from "../common/Button";

interface ToolbarProps {
  canvasId: string;
}

export function Toolbar({ canvasId }: ToolbarProps): JSX.Element {
  const store = useMindMapStore();
  const active: MindMapFile = store.active();

  function handleThemeChange(e: ChangeEvent<HTMLSelectElement>): void {
    store.setTheme(e.target.value);
  }

  function handleExportPng(): void {
    const canvasEl: HTMLElement | null = document.getElementById(canvasId);
    if (canvasEl) exportPng(canvasEl, active.name);
  }

  return <div className="flex flex-wrap items-center gap-2 border-b bg-white p-3">
    <Button onClick={store.addChild}>添加子节点</Button>
    <Button onClick={store.addSibling}>添加同级</Button>
    <Button onClick={store.removeSelected}>删除节点</Button>
    <select
      className="rounded-md border p-2"
      value={active?.theme}
      onChange={handleThemeChange}
    >
      {Object.entries(THEMES).map(([key, val]) => (
        <option key={key} value={key}>{val.name}</option>
      ))}
    </select>
    <Button onClick={(): void => exportJson(active)}>导出 JSON</Button>
    <Button onClick={(): void => exportMarkdown(active)}>导出 Markdown</Button>
    <Button onClick={handleExportPng}>导出 PNG</Button>
  </div>;
}
