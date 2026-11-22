import { invoke, isTauri } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

export type OpenedDrawing = {
  title: string;
  path: string | null;
  scene: string;
};

export type SavedDrawing = {
  path: string | null;
  title: string;
};

type FileCommandError = {
  code?: string;
  message?: string;
};

const fileNameFromPath = (path: string) => {
  const name = path.split(/[\\/]/).at(-1) || "Drawing.excalidraw";
  return name.replace(/\.excalidraw$/i, "");
};

const ensureDrawingExtension = (path: string) =>
  path.toLowerCase().endsWith(".excalidraw") ? path : `${path}.excalidraw`;

const getFileCommandError = (cause: unknown): FileCommandError | null => {
  if (typeof cause === "object" && cause !== null) {
    return cause as FileCommandError;
  }
  if (typeof cause === "string") {
    try {
      return JSON.parse(cause) as FileCommandError;
    } catch {
      return { message: cause };
    }
  }
  return null;
};

const isFileNotFoundError = (cause: unknown) =>
  getFileCommandError(cause)?.code === "FILE_NOT_FOUND";

const toFileError = (cause: unknown, fallback: string) => {
  if (cause instanceof Error) {
    return cause;
  }
  const message = getFileCommandError(cause)?.message;
  if (message) {
    return new Error(message);
  }
  return new Error(fallback);
};

const pickSavePath = async (defaultPath: string | null) => {
  const selected = await save({
    defaultPath: defaultPath ?? "Untitled.excalidraw",
    filters: [
      {
        name: "Excalidraw drawing",
        extensions: ["excalidraw"],
      },
    ],
  });

  return selected ? ensureDrawingExtension(selected) : null;
};

const normalizeScene = (text: string) => {
  const data = JSON.parse(text) as {
    type?: unknown;
    elements?: unknown;
    appState?: unknown;
    files?: unknown;
  };

  if (!Array.isArray(data.elements)) {
    throw new Error("The selected file is not a valid Excalidraw drawing.");
  }

  return JSON.stringify({
    type: "excalidraw",
    version: 2,
    source: "pendradraw",
    elements: data.elements,
    appState: data.appState ?? {},
    files: data.files ?? {},
  });
};

const pickBrowserFile = () =>
  new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".excalidraw,.json,application/json";
    input.style.display = "none";
    document.body.appendChild(input);

    let settled = false;
    const finish = (file: File | null) => {
      if (settled) {
        return;
      }
      settled = true;
      input.remove();
      resolve(file);
    };

    input.addEventListener("change", () => finish(input.files?.[0] ?? null), {
      once: true,
    });
    window.addEventListener(
      "focus",
      () => window.setTimeout(() => finish(input.files?.[0] ?? null), 300),
      { once: true },
    );
    input.click();
  });

export const openDrawingPicker = async (): Promise<OpenedDrawing | null> => {
  if (isTauri()) {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "Excalidraw drawing",
          extensions: ["excalidraw", "json"],
        },
      ],
    });
    const path = Array.isArray(selected) ? selected[0] : selected;
    if (!path) {
      return null;
    }

    const text = await invoke<string>("read_drawing", { path });
    return {
      title: fileNameFromPath(path),
      path,
      scene: normalizeScene(text),
    };
  }

  const file = await pickBrowserFile();
  if (!file) {
    return null;
  }
  return {
    title: file.name.replace(/\.excalidraw$/i, ""),
    path: null,
    scene: normalizeScene(await file.text()),
  };
};

export const openRecentDrawing = async (path: string): Promise<OpenedDrawing> => {
  if (!isTauri()) {
    throw new Error("Recent files can only be reopened in the desktop app.");
  }
  const text = await invoke<string>("read_drawing", { path });
  return {
    title: fileNameFromPath(path),
    path,
    scene: normalizeScene(text),
  };
};

export const saveDrawing = async (
  scene: string,
  currentPath: string | null,
  saveAs = false,
): Promise<SavedDrawing | null> => {
  if (isTauri()) {
    let path = currentPath;
    let requireExisting = Boolean(path && !saveAs);

    if (!path || saveAs) {
      path = await pickSavePath(currentPath);

      if (!path) {
        return null;
      }
      requireExisting = false;
    }

    try {
      await invoke("write_drawing", {
        path,
        contents: scene,
        requireExisting,
      });
    } catch (cause) {
      if (!requireExisting || !isFileNotFoundError(cause)) {
        throw toFileError(cause, "Could not save the drawing.");
      }

      path = await pickSavePath(path);
      if (!path) {
        return null;
      }

      try {
        await invoke("write_drawing", {
          path,
          contents: scene,
          requireExisting: false,
        });
      } catch (retryCause) {
        throw toFileError(retryCause, "Could not save the drawing.");
      }
    }

    return {
      path,
      title: fileNameFromPath(path),
    };
  }

  const blob = new Blob([scene], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "Untitled.excalidraw";
  anchor.click();

  URL.revokeObjectURL(url);

  return {
    path: null,
    title: "Untitled",
  };
};
