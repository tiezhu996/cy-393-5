import type { Edge, Node } from "reactflow";

export interface NodeData {
  label: string;
  icon: string;
  collapsed: boolean;
  note?: string;
  bg?: string;
  color?: string;
}

export interface MindMapFile {
  id: string;
  name: string;
  updatedAt: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  theme: string;
}
