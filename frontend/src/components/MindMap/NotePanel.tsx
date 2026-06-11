import { useMemo } from "react";
import type { Node } from "reactflow";
import { useMindMapStore } from "../../stores/mindMapStore";
import type { NodeData } from "../../types/mindmap";
import { Button } from "../common/Button";

export function NotePanel() {
  const store = useMindMapStore();
  const active = store.active();
  const selectedId = store.selectedId;

  const selectedNode: Node<NodeData> | undefined = useMemo<Node<NodeData> | undefined>(() => {
    if (!selectedId) return undefined;
    return active.nodes.find((n: Node<NodeData>) => n.id === selectedId);
  }, [active, selectedId]);

  if (!selectedNode) {
    return (
      <aside className="w-80 border-l bg-gray-50 p-4">
        <p className="text-sm text-gray-500">请选中一个节点来编辑备注</p>
      </aside>
    );
  }

  const nodeId: string = selectedNode.id;
  const nodeLabel: string = selectedNode.data.label;
  const nodeNote: string = selectedNode.data.note ?? "";

  function handleLabelChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value: string = e.target.value;
    store.updateNodeLabel(nodeId, value);
  }

  function handleNoteChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    const value: string = e.target.value;
    store.updateNodeNote(nodeId, value);
  }

  function handleClearNote(): void {
    store.updateNodeNote(nodeId, "");
  }

  return (
    <aside className="flex w-80 flex-col border-l bg-gray-50">
      <div className="border-b bg-white px-4 py-3">
        <h2 className="text-base font-semibold text-gray-800">节点属性</h2>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">节点标题</label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={nodeLabel}
            onChange={handleLabelChange}
            placeholder="输入节点标题"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">备注内容</label>
            {nodeNote && (
              <Button variant="ghost" size="sm" onClick={handleClearNote}>
                清空
              </Button>
            )}
          </div>
          <textarea
            className="h-64 w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={nodeNote}
            onChange={handleNoteChange}
            placeholder="在此输入长备注内容，支持换行…"
          />
          <p className="text-xs text-gray-500">{nodeNote.length} 字符 · 导出 Markdown 时附在节点下方</p>
        </div>
      </div>
    </aside>
  );
}
