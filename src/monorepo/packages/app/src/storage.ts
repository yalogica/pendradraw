import type { 
  LibraryItems 
} from "@excalidraw/excalidraw/types";
import type {
  DrawingDocument,
  StoredWorkspace,
} from "./types";

const WORKSPACE_KEY = "pendradraw:workspace";
const DOCUMENT_PREFIX = "pendradraw:document:";
const LIBRARY_KEY = "pendradraw:library";
const saveTimers = new Map<string, number>();
const pendingDocuments = new Map<string, DrawingDocument>();

const getDocumentKey = (id: string) => `${DOCUMENT_PREFIX}${id}`;

export const loadWorkspace = (): StoredWorkspace | null => {
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY);
    if (!raw) {
      return null;
    }

    const workspace = JSON.parse(raw) as StoredWorkspace;
    return workspace.version === 1 ? workspace : null;
  } catch {
    return null;
  }
};

export const loadDocumentScene = (id: string) => {
  try {
    return localStorage.getItem(getDocumentKey(id));
  } catch {
    return null;
  }
};

export const loadLibraryItems = (): LibraryItems => {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);

    if (!raw) {
      return [];
    }

    const libraryItems = JSON.parse(raw) as unknown;

    return Array.isArray(libraryItems)
      ? (libraryItems as LibraryItems)
      : [];
  } catch {
    return [];
  }
};

export const saveLibraryItems = (libraryItems: LibraryItems) => {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(libraryItems));
  } catch {
    // Library persistence is best effort.
  }
};

export const saveWorkspace = (workspace: StoredWorkspace) => {
  try {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
  } catch {
    // Scene recovery is best effort when browser storage is unavailable.
  }
};

export const scheduleDocumentSave = (document: DrawingDocument) => {
  const currentTimer = saveTimers.get(document.id);
  if (currentTimer) {
    window.clearTimeout(currentTimer);
  }

  pendingDocuments.set(document.id, document);
  const timer = window.setTimeout(() => {
    saveTimers.delete(document.id);
    const pendingDocument = pendingDocuments.get(document.id);
    pendingDocuments.delete(document.id);
    try {
      if (pendingDocument) {
        localStorage.setItem(getDocumentKey(document.id), pendingDocument.scene);
      }
    } catch {
      // Large embedded images can exceed the localStorage quota.
    }
  }, 350);

  saveTimers.set(document.id, timer);
};

export const removeStoredDocument = (id: string) => {
  const currentTimer = saveTimers.get(id);
  if (currentTimer) {
    window.clearTimeout(currentTimer);
    saveTimers.delete(id);
  }
  pendingDocuments.delete(id);

  try {
    localStorage.removeItem(getDocumentKey(id));
  } catch {
    // Ignore unavailable storage.
  }
};

const flushPendingDocuments = () => {
  for (const [id, document] of pendingDocuments) {
    try {
      localStorage.setItem(getDocumentKey(id), document.scene);
    } catch {
      // The normal recovery path remains best effort.
    }
  }
  pendingDocuments.clear();
};

window.addEventListener("pagehide", flushPendingDocuments);
