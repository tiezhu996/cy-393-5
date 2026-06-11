import { useState, useEffect, useRef } from "react";
import type { NodeProps } from "reactflow";
import type { NodeData } from "../../types/mindmap";
import { useMindMapStore } from "../../stores/mindMapStore";

export function MindNode({ id, data, selected }: NodeProps<NodeData>) {
  const updateNodeLabel = useMindMapStore((s) => s.updateNodeLabel);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect((): void => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect((): void => {
    setEditValue(data.label);
  }, [data.label]);

  function handleDoubleClick(e: React.MouseEvent): void {
    e.stopPropagation();
    setIsEditing(true);
  }

  function handleBlur(): void {
    if (editValue.trim()) {
      updateNodeLabel(id, editValue.trim());
    } else {
      setEditValue(data.label);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(data.label);
      setIsEditing(false);
    }
  }

  const hasNote: boolean = Boolean(data.note && data.note.trim().length > 0);

  return (
    <div
      className={`relative rounded-lg border px-4 py-2 shadow-sm ${selected ? "ring-2 ring-blue-500" : ""}`}
      style={{ background: data.bg, color: data.color }}
      onDoubleClick={handleDoubleClick}
    >
      {hasNote && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white shadow" title="有备注">
          ⓝ
        </span>
      )}
      <span className="mr-2 select-none">{data.icon}</span>
      {isEditing ? (
        <input
          ref={inputRef}
          className="min-w-[60px] rounded border-none bg-white/20 px-1 py-0 text-inherit outline-none"
          value={editValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e: React.MouseEvent): void => e.stopPropagation()}
        />
      ) : (
        <span className="select-none">{data.label}</span>
      )}
    </div>
  );
}
