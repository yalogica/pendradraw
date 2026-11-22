export type DrawingDocument = {
  id: string;
  title: string;
  path: string | null;
  scene: string;
  dirty: boolean;
  updatedAt: number;
};

export type RecentFile = {
  path: string;
  name: string;
  lastOpened: number;
};

export type StoredDocument = Omit<DrawingDocument, "scene">;

export type StoredWorkspace = {
  version: 1;
  documents: StoredDocument[];
  activeDocumentId: string | null;
  recentFiles: RecentFile[];
  homeOpen: boolean;
};

export const createEmptyScene = () =>
  JSON.stringify({
    type: "excalidraw",
    version: 2,
    source: "pendradraw",
    elements: [],
    appState: {
      viewBackgroundColor: "#ffffff",
    },
    files: {},
  });
