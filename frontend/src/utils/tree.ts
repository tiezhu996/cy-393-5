import type { Edge, Node } from "reactflow";
import type { NodeData } from "../types/mindmap";

export function subtreeIds(rootId: string, edges: Edge[]): string[] {
  const ids: Set<string> = new Set([rootId]);
  let changed: boolean = true;
  while (changed) {
    changed = false;
    edges.forEach((edge: Edge): void => {
      if (ids.has(edge.source) && !ids.has(edge.target)) {
        ids.add(edge.target);
        changed = true;
      }
    });
  }
  return Array.from(ids);
}

export function toMarkdown(nodes: Node<NodeData>[], edges: Edge[]): string {
  const root: Node<NodeData> | undefined =
    nodes.find((node: Node<NodeData>) => !edges.some((edge: Edge) => edge.target === node.id)) ?? nodes[0];
  const lines: string[] = [];

  function walk(id: string, depth: number): void {
    const node: Node<NodeData> | undefined = nodes.find((item: Node<NodeData>) => item.id === id);
    if (!node) return;
    const indent: string = "  ".repeat(depth);
    lines.push(`${indent}- ${node.data.label}`);
    if (node.data.note && node.data.note.trim().length > 0) {
      const noteIndent: string = "  ".repeat(depth + 1);
      const noteLines: string[] = node.data.note.trim().split("\n");
      lines.push("");
      noteLines.forEach((line: string): void => {
        lines.push(`${noteIndent}> ${line}`);
      });
      lines.push("");
    }
    edges
      .filter((edge: Edge) => edge.source === id)
      .forEach((edge: Edge): void => walk(edge.target, depth + 1));
  }

  if (root) walk(root.id, 0);
  return lines.join("\n");
}
