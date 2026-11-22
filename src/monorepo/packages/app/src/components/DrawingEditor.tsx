import {
  Excalidraw,
  MainMenu,
  serializeAsJSON,
} from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";
import { 
  FolderOpen,
  Save,
  SavePlus,
  ImageDown,
  ShoppingBag,
  Trash2,
  Info,
} from "lucide-react";
import { 
  useEffect, 
  useRef, 
  useState 
} from "react";
import {
  loadLibraryItems,
  saveLibraryItems,
} from "../storage";
import { useAppStore } from "../store/app-store";
import { createEmptyScene } from "../types";

type DrawingEditorProps = {
  documentId: string;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onAbout: () => void;
};

const parseInitialData = (scene: string): ExcalidrawInitialDataState => {
  try {
    const data = JSON.parse(scene) as ExcalidrawInitialDataState;
    return {
      ...data,
      appState: {
        ...(data.appState ?? {}),
        isLoading: false,
      },
    };
  } catch {
    return JSON.parse(createEmptyScene()) as ExcalidrawInitialDataState;
  }
};

export const DrawingEditor = ({ 
  documentId,
  onOpen,
  onSave,
  onSaveAs,
  onAbout,
}: DrawingEditorProps) => {
  const updateDocumentScene = useAppStore((state) => state.updateDocumentScene);
  const [initialData] = useState(() => {
    const scene = useAppStore
      .getState()
      .documents.find((document) => document.id === documentId)?.scene;
    return parseInitialData(scene ?? createEmptyScene());
  });
  const acceptsChanges = useRef(false);

  const exportImage = () => {
    excalidrawAPIRef.current?.updateScene({
      appState: {
        openDialog: {
          name: "imageExport",
        },
      },
    });
  };

  const clearCanvas = () => {
    if (!window.confirm("Clear canvas? This action cannot be undone.")) {
      return;
    }

    excalidrawAPIRef.current?.resetScene();
  };

  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const importLibrary = async () => {
    const file = await new Promise<File | null>((resolve) => {
      const input = document.createElement("input");

      input.type = "file";
      input.accept = ".excalidrawlib,.json,application/json";
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.click();
    });

    if (!file || !excalidrawAPIRef.current) {
      return;
    }

    await excalidrawAPIRef.current.updateLibrary({
      libraryItems: file,
      merge: true,
      prompt: true,
      openLibraryMenu: true,
    });
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      acceptsChanges.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const onChange: NonNullable<ExcalidrawProps["onChange"]> = (elements, appState, files) => {
    if (!acceptsChanges.current) {
      return;
    }
    updateDocumentScene(
      documentId,
      serializeAsJSON(elements, appState, files, "local"),
    );
  };

  return (
    <div className="editor-shell">
      <Excalidraw
        initialData={initialData}
        autoFocus
        handleKeyboardGlobally
        onChange={onChange}
        onLibraryChange={saveLibraryItems}
        onMount={({ excalidrawAPI }) => {
          excalidrawAPIRef.current = excalidrawAPI;

          void excalidrawAPI
            .updateLibrary({
              libraryItems: loadLibraryItems(),
              merge: false,
            })
            .catch((error) => {
              console.error("Could not load the library.", error);
            });
        }}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
          },
        }}
      >
        <MainMenu>
          <MainMenu.Item
            icon={<FolderOpen size={16} />}
            shortcut="Ctrl+O"
            onSelect={onOpen}
          >
            Open…
          </MainMenu.Item>

          <MainMenu.Item
            icon={<Save size={16} />}
            shortcut="Ctrl+S"
            onSelect={onSave}
          >
            Save
          </MainMenu.Item>

          <MainMenu.Item
            icon={<SavePlus size={16} />}
            shortcut="Ctrl+Shift+S"
            onSelect={onSaveAs}
          >
            Save as…
          </MainMenu.Item>

          <MainMenu.Separator />
        
          <MainMenu.Item
            icon={<ImageDown size={16} />}
            onSelect={exportImage}
          >
            Export image…
          </MainMenu.Item>

          <MainMenu.Item
            icon={<ShoppingBag />}
            onSelect={() => void importLibrary()}
          >
            Import library…
          </MainMenu.Item>

          <MainMenu.Item
            icon={<Trash2 size={16} />}
            onSelect={clearCanvas}
          >
            Clear canvas
          </MainMenu.Item>

          <MainMenu.Separator />

          <MainMenu.Item
            icon={<Info size={16} />}
            onSelect={onAbout}
          >
            About
          </MainMenu.Item>
          
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
    </div>
  );
};
