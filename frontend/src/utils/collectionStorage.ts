import type { Collection } from "../types";

const COLLECTIONS_KEY = "wslab-collections";
const SIDEBAR_KEY = "wslab-sidebar-open";

interface StoredCollections {
  collections: Collection[];
  activeId: string;
}

export function saveCollections(collections: Collection[], activeId: string): void {
  const data: StoredCollections = { collections, activeId };
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(data));
}

export function loadCollections(): StoredCollections | null {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredCollections;
    if (!Array.isArray(data.collections) || typeof data.activeId !== "string") return null;
    if (data.collections.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveSidebarState(isOpen: boolean): void {
  localStorage.setItem(SIDEBAR_KEY, JSON.stringify(isOpen));
}

export function loadSidebarState(): boolean {
  try {
    const raw = localStorage.getItem(SIDEBAR_KEY);
    if (raw === null) return true;
    return JSON.parse(raw) === true;
  } catch {
    return true;
  }
}
