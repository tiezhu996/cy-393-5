import type { MindMapFile } from "../types/mindmap";

const DB_NAME: string = "mindmap-editor-db";
const STORE: string = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve: (value: IDBDatabase) => void, reject: (reason?: Event | DOMException | null) => void): void => {
    const req: IDBOpenDBRequest = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (): void => {
      req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = (): void => {
      resolve(req.result);
    };
    req.onerror = (): void => {
      reject(req.error);
    };
  });
}

export async function loadFiles(): Promise<MindMapFile[]> {
  const db: IDBDatabase = await openDb();
  return new Promise<MindMapFile[]>((resolve: (value: MindMapFile[]) => void): void => {
    const req: IDBRequest<MindMapFile[]> = db.transaction(STORE).objectStore(STORE).getAll();
    req.onsuccess = (): void => {
      resolve(req.result as MindMapFile[]);
    };
  });
}

export async function saveFile(file: MindMapFile): Promise<void> {
  const db: IDBDatabase = await openDb();
  const cleanFile: MindMapFile = cloneForStorage(file);
  db.transaction(STORE, "readwrite").objectStore(STORE).put(cleanFile);
}

function cloneForStorage<T>(value: T): T {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (e) {
    return structuredClone(value);
  }
}

export async function deleteFile(id: string): Promise<void> {
  const db: IDBDatabase = await openDb();
  db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
}
