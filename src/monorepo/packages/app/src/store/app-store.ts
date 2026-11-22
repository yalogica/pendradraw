import { create } from "zustand";
import {
  loadDocumentScene,
  loadWorkspace,
  removeStoredDocument,
  saveWorkspace,
  scheduleDocumentSave,
} from "../storage";
import {
  createEmptyScene,
  type DrawingDocument,
  type RecentFile,
  type StoredWorkspace,
} from "../types";

type OpenDocumentInput = {
  title: string;
  path: string | null;
  scene: string;
};

type AppStore = {
  documents: DrawingDocument[];
  activeDocumentId: string | null;
  recentFiles: RecentFile[];
  homeOpen: boolean;
  createDocument: () => string;
  openDocument: (input: OpenDocumentInput) => string;
  activateDocument: (id: string) => void;
  updateDocumentScene: (id: string, scene: string) => void;
  markDocumentSaved: (id: string, savedScene: string, path: string | null, title: string) => void;
  closeDocument: (id: string) => void;
  showHome: () => void;
  hideHome: () => void;
  removeRecent: (path: string) => void;
};

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `drawing-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const initialWorkspace = loadWorkspace();
const initialDocuments = (initialWorkspace?.documents ?? []).flatMap((document) => {
  const scene = loadDocumentScene(document.id);
  return scene ? [{ ...document, scene }] : [];
});

const persistMetadata = (state: AppStore) => {
  const workspace: StoredWorkspace = {
    version: 1,
    documents: state.documents.map(({ scene: _scene, ...document }) => document),
    activeDocumentId: state.activeDocumentId,
    recentFiles: state.recentFiles,
    homeOpen: state.homeOpen,
  };
  saveWorkspace(workspace);
};

export const useAppStore = create<AppStore>((set, get) => ({
  documents: initialDocuments,
  activeDocumentId:
    initialDocuments.some((document) => document.id === initialWorkspace?.activeDocumentId)
      ? initialWorkspace?.activeDocumentId ?? null
      : initialDocuments[0]?.id ?? null,
  recentFiles: initialWorkspace?.recentFiles ?? [],
  homeOpen: initialDocuments.length === 0 || (initialWorkspace?.homeOpen ?? false),

  createDocument: () => {
    const state = get();
    const untitledCount = state.documents.filter((document) => document.path === null).length;
    const document: DrawingDocument = {
      id: createId(),
      title: untitledCount === 0 ? "Untitled" : `Untitled ${untitledCount + 1}`,
      path: null,
      scene: createEmptyScene(),
      dirty: false,
      updatedAt: Date.now(),
    };

    scheduleDocumentSave(document);
    set({
      documents: [document, ...state.documents],
      activeDocumentId: document.id,
      homeOpen: false,
    });
    persistMetadata(get());
    return document.id;
  },

  openDocument: (input) => {
    const state = get();
    const existing = input.path
      ? state.documents.find(
          (document) => document.path?.toLowerCase() === input.path?.toLowerCase(),
        )
      : undefined;

    if (existing) {
      set({ activeDocumentId: existing.id, homeOpen: false });
      persistMetadata(get());
      return existing.id;
    }

    const document: DrawingDocument = {
      id: createId(),
      title: input.title,
      path: input.path,
      scene: input.scene,
      dirty: false,
      updatedAt: Date.now(),
    };
    const recentFiles = input.path
      ? [
          { path: input.path, name: input.title, lastOpened: Date.now() },
          ...state.recentFiles.filter(
            (recent) => recent.path.toLowerCase() !== input.path?.toLowerCase(),
          ),
        ].slice(0, 10)
      : state.recentFiles;

    scheduleDocumentSave(document);
    set({
      documents: [document, ...state.documents],
      activeDocumentId: document.id,
      recentFiles,
      homeOpen: false,
    });
    persistMetadata(get());
    return document.id;
  },

  activateDocument: (id) => {
    if (!get().documents.some((document) => document.id === id)) {
      return;
    }
    set({ activeDocumentId: id, homeOpen: false });
    persistMetadata(get());
  },

  updateDocumentScene: (id, scene) => {
    let changedDocument: DrawingDocument | undefined;
    set((state) => ({
      documents: state.documents.map((document) => {
        if (document.id !== id || document.scene === scene) {
          return document;
        }

        changedDocument = {
          ...document,
          scene,
          dirty: true,
          updatedAt: Date.now(),
        };
        return changedDocument;
      }),
    }));
    if (changedDocument) {
      scheduleDocumentSave(changedDocument);
      persistMetadata(get());
    }
  },

  markDocumentSaved: (id, savedScene, path, title) => {
    set((state) => ({
      documents: state.documents.map((document) =>
        document.id === id
          ? {
              ...document,
              path,
              title,
              dirty: document.scene !== savedScene,
            }
          : document,
      ),
      recentFiles: path
        ? [
            {
              path,
              name: title,
              lastOpened: Date.now(),
            },
            ...state.recentFiles.filter(
              (recent) => recent.path.toLowerCase() !== path.toLowerCase(),
            ),
          ].slice(0, 10)
        : state.recentFiles,
    }));

    persistMetadata(get());
  },

  closeDocument: (id) => {
    const state = get();
    const index = state.documents.findIndex((document) => document.id === id);
    if (index === -1) {
      return;
    }

    const documents = state.documents.filter((document) => document.id !== id);
    const wasActive = state.activeDocumentId === id;
    const nextActiveId = wasActive
      ? documents[Math.min(index, documents.length - 1)]?.id ?? null
      : state.activeDocumentId;

    removeStoredDocument(id);
    set({
      documents,
      activeDocumentId: nextActiveId,
      homeOpen: documents.length === 0,
    });
    persistMetadata(get());
  },

  showHome: () => {
    set({ homeOpen: true });
    persistMetadata(get());
  },

  hideHome: () => {
    if (!get().activeDocumentId) {
      return;
    }
    set({ homeOpen: false });
    persistMetadata(get());
  },

  removeRecent: (path) => {
    set((state) => ({
      recentFiles: state.recentFiles.filter((recent) => recent.path !== path),
    }));
    persistMetadata(get());
  },
}));
