import { AlertCircle, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AboutDialog } from "./components/AboutDialog";
import { DrawingEditor } from "./components/DrawingEditor";
import { HomeScreen } from "./components/HomeScreen";
import { TabBar } from "./components/TabBar";
import { openDrawingPicker, openRecentDrawing, saveDrawing } from "./services/files";
import { useAppStore } from "./store/app-store";

export const App = () => {
  const activeDocumentId = useAppStore((state) => state.activeDocumentId);
  const homeOpen = useAppStore((state) => state.homeOpen);
  const openDocument = useAppStore((state) => state.openDocument);
  const [error, setError] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleOpen = useCallback(async (path?: string) => {
    try {
      setError(null);
      const drawing = path
        ? await openRecentDrawing(path)
        : await openDrawingPicker();
      if (drawing) {
        openDocument(drawing);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open the drawing.");
    }
  }, [openDocument]);

  const handleSave = useCallback(async (saveAs = false) => {
    const state = useAppStore.getState();
    const document = state.documents.find(
      (item) => item.id === state.activeDocumentId,
    );

    if (!document) {
      return;
    }

    try {
      setError(null);

      const saved = await saveDrawing(
        document.scene,
        document.path,
        saveAs,
      );

      if (saved) {
        useAppStore
          .getState()
          .markDocumentSaved(
            document.id,
            document.scene,
            saved.path,
            saved.title,
          );
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save the drawing.",
      );
    }
  }, []);

  const handleClose = useCallback((id: string) => {
    const state = useAppStore.getState();
    const document = state.documents.find((item) => item.id === id);
    if (!document) {
      return;
    }
    if (document.dirty && !window.confirm(`Close “${document.title}”? The recovered copy will be removed.`)) {
      return;
    }
    state.closeDocument(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSave(event.shiftKey);
      } else if (mod && event.key.toLowerCase() === "t") {
        event.preventDefault();
        useAppStore.getState().createDocument();
      } else if (mod && event.key.toLowerCase() === "o") {
        event.preventDefault();
        void handleOpen();
      } else if (mod && event.key.toLowerCase() === "w") {
        event.preventDefault();
        const activeId = useAppStore.getState().activeDocumentId;
        if (activeId) {
          handleClose(activeId);
        }
      } else if (event.key === "Escape" && !useAppStore.getState().homeOpen) {
        useAppStore.getState().showHome();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, handleOpen, handleSave]);

  return (
    <div className="app-shell">
      <TabBar onClose={handleClose} />

      <div className="app-content">
        {homeOpen || !activeDocumentId ? (
          <HomeScreen
            onOpenFile={() => void handleOpen()}
            onOpenRecent={(path) => void handleOpen(path)}
          />
        ) : (
          <DrawingEditor
            key={activeDocumentId}
            documentId={activeDocumentId}
            onOpen={() => void handleOpen()}
            onSave={() => void handleSave()}
            onSaveAs={() => void handleSave(true)}
            onAbout={() => setAboutOpen(true)}
           />
        )}
      </div>
      {aboutOpen && (
        <AboutDialog onClose={() => setAboutOpen(false)} />
      )}
      {error && (
        <div className="error-toast" role="alert">
          <AlertCircle />
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError(null)}><X /></button>
        </div>
      )}
    </div>
  );
};
