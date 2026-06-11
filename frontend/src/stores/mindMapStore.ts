import { produce } from "immer";
import { create } from "zustand";
import type { Edge, Node } from "reactflow";
import { deleteFile, loadFiles, saveFile } from "../storage/indexedDb";
import type { MindMapFile, NodeData } from "../types/mindmap";
import { createNode, defaultFile } from "../utils/factory";
import { subtreeIds } from "../utils/tree";

export interface MindMapState {
  files: MindMapFile[];
  activeId: string;
  selectedId?: string;
  history: MindMapFile[];
  future: MindMapFile[];
  hydrate: () => Promise<void>;
  active: () => MindMapFile;
  selectFile: (id: string) => void;
  createFile: () => void;
  renameFile: (id: string, name: string) => void;
  removeFile: (id: string) => void;
  setNodesEdges: (nodes: Node<NodeData>[], edges: Edge[]) => void;
  addChild: () => void;
  addSibling: () => void;
  removeSelected: () => void;
  setTheme: (theme: string) => void;
  selectNode: (id?: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeNote: (nodeId: string, note: string) => void;
  undo: () => void;
  redo: () => void;
}

type SetState = (partial: Partial<MindMapState> | ((state: MindMapState) => Partial<MindMapState>)) => void;
type GetState = () => MindMapState;

export const useMindMapStore = create<MindMapState>((set: SetState, get: GetState) => ({
  files: [],
  activeId: "",
  history: [],
  future: [],
  hydrate: async (): Promise<void> => {
    const saved: MindMapFile[] = await loadFiles();
    const files: MindMapFile[] = saved.length ? saved : [defaultFile()];
    files.forEach(saveFile);
    set({ files, activeId: files[0].id });
  },
  active: (): MindMapFile => get().files.find((file: MindMapFile) => file.id === get().activeId) ?? get().files[0],
  selectFile: (id: string): void => set({ activeId: id, selectedId: undefined }),
  createFile: (): void => {
    const file: MindMapFile = defaultFile();
    saveFile(file);
    set({ files: [file, ...get().files], activeId: file.id });
  },
  renameFile: (id: string, name: string): void => mutateFile(set, get, id, (file: MindMapFile): void => { file.name = name; }),
  removeFile: (id: string): void => { deleteFile(id); const files: MindMapFile[] = get().files.filter((f: MindMapFile) => f.id !== id); set({ files, activeId: files[0]?.id ?? "" }); },
  setNodesEdges: (nodes: Node<NodeData>[], edges: Edge[]): void => mutateActive(set, get, (file: MindMapFile): void => { file.nodes = nodes; file.edges = edges; }),
  addChild: (): void => {
    const active: MindMapFile = get().active();
    const selected: Node<NodeData> = active.nodes.find((n: Node<NodeData>) => n.id === get().selectedId) ?? active.nodes[0];
    if (!selected) return;
    const child: Node<NodeData> = createNode("新子节点", selected.position.x + 240, selected.position.y + 90);
    mutateActive(set, get, (file: MindMapFile): void => { file.nodes.push(child); file.edges.push({ id: `${selected.id}-${child.id}`, source: selected.id, target: child.id }); });
  },
  addSibling: (): void => {
    const active: MindMapFile = get().active();
    const selected: Node<NodeData> | undefined = active.nodes.find((n: Node<NodeData>) => n.id === get().selectedId);
    if (!selected) return;
    const parent: string | undefined = active.edges.find((e: Edge) => e.target === selected.id)?.source;
    if (!parent) return get().addChild();
    const siblingNode: Node<NodeData> = createNode("新同级节点", selected.position.x, selected.position.y + 120);
    mutateActive(set, get, (file: MindMapFile): void => { file.nodes.push(siblingNode); file.edges.push({ id: `${parent}-${siblingNode.id}`, source: parent, target: siblingNode.id }); });
  },
  removeSelected: (): void => {
    const id: string | undefined = get().selectedId;
    if (!id) return;
    const ids: string[] = subtreeIds(id, get().active().edges);
    mutateActive(set, get, (file: MindMapFile): void => {
      file.nodes = file.nodes.filter((n: Node<NodeData>) => !ids.includes(n.id));
      file.edges = file.edges.filter((e: Edge) => !ids.includes(e.source) && !ids.includes(e.target));
    });
  },
  setTheme: (theme: string): void => mutateActive(set, get, (file: MindMapFile): void => { file.theme = theme; }),
  selectNode: (id?: string): void => set({ selectedId: id }),
  updateNodeLabel: (nodeId: string, label: string): void => mutateActive(set, get, (file: MindMapFile): void => {
    const targetNode: Node<NodeData> | undefined = file.nodes.find((n: Node<NodeData>) => n.id === nodeId);
    if (targetNode) targetNode.data.label = label;
  }),
  updateNodeNote: (nodeId: string, note: string): void => mutateActive(set, get, (file: MindMapFile): void => {
    const targetNode: Node<NodeData> | undefined = file.nodes.find((n: Node<NodeData>) => n.id === nodeId);
    if (targetNode) targetNode.data.note = note;
  }),
  undo: (): void => {
    const history: MindMapFile[] = get().history;
    const prev: MindMapFile | undefined = history[history.length - 1];
    if (!prev) return;
    set({
      future: [get().active(), ...get().future],
      history: history.slice(0, -1),
      files: get().files.map((f: MindMapFile) => f.id === prev.id ? prev : f)
    });
  },
  redo: (): void => {
    const next: MindMapFile | undefined = get().future[0];
    if (!next) return;
    set({
      history: [...get().history, get().active()],
      future: get().future.slice(1),
      files: get().files.map((f: MindMapFile) => f.id === next.id ? next : f)
    });
  }
}));

function mutateActive(set: SetState, get: GetState, recipe: (file: MindMapFile) => void): void {
  const active: MindMapFile = get().active();
  mutateFile(set, get, active.id, recipe);
}

function mutateFile(set: SetState, get: GetState, id: string, recipe: (file: MindMapFile) => void): void {
  const previous: MindMapFile = get().active();
  const files: MindMapFile[] = produce(get().files, (draft: MindMapFile[]): void => {
    const file: MindMapFile | undefined = draft.find((item: MindMapFile) => item.id === id);
    if (!file) return;
    recipe(file);
    file.updatedAt = new Date().toISOString();
  });
  const savedFile: MindMapFile | undefined = files.find((item: MindMapFile) => item.id === id);
  if (savedFile) saveFile(savedFile);
  set({ files, history: [...get().history, previous], future: [] });
}
