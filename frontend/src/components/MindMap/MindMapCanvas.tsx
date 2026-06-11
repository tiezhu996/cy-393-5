import ReactFlow, { Background, Controls, MiniMap, applyEdgeChanges, applyNodeChanges, type Edge, type EdgeChange, type Node, type NodeChange } from "reactflow";
import { THEMES } from "../../constants/themes";
import { useAutoSave } from "../../hooks/useAutoSave";
import { useMindMapStore } from "../../stores/mindMapStore";
import type { NodeData } from "../../types/mindmap";
import { MindNode } from "./MindNode";

const nodeTypes = { default: MindNode };

interface MindMapCanvasProps {
  id: string;
}

export function MindMapCanvas({ id }: MindMapCanvasProps): JSX.Element | null {
  const store = useMindMapStore();
  const active = store.active();
  useAutoSave(active);
  if (!active) return null;
  const themeKey = active.theme as keyof typeof THEMES;
  const theme = THEMES[themeKey] ?? THEMES.business;
  const nodes: Node<NodeData>[] = active.nodes.map((node: Node<NodeData>): Node<NodeData> => ({
    ...node,
    data: { ...node.data, bg: theme.node, color: theme.text }
  }));
  function onNodesChange(changes: NodeChange[]): void {
    store.setNodesEdges(applyNodeChanges(changes, active.nodes), active.edges);
  }
  function onEdgesChange(changes: EdgeChange[]): void {
    store.setNodesEdges(active.nodes, applyEdgeChanges(changes, active.edges));
  }
  return <div id={id} className="h-full w-full">
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={active.edges as Edge[]}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_: React.MouseEvent, node: Node<NodeData>): void => store.selectNode(node.id)}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap pannable zoomable nodeColor={() => theme.node} />
    </ReactFlow>
  </div>;
}
