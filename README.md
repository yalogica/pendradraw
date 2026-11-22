<div align="center">
  <img
    src="src/monorepo/packages/tauri/src-tauri/icons/128x128@2x.png"
    width="96"
    alt="PendraDraw icon"
  />

  <h1>PendraDraw</h1>

  <p>
    <strong>A focused desktop canvas for visual thinking.</strong><br />
    Draw diagrams, sketch ideas and keep your work in real files.
  </p>

  <p align="center">
  <a href="https://yalogica.com">
    <img alt="Yalogica website" src="https://img.shields.io/badge/Website-yalogica.com-6558d9?style=for-the-badge" />
  </a>
  <p>
  <a href="https://github.com/yalogica/pendradraw/releases/latest">
    <img alt="Download for Windows" src="https://img.shields.io/badge/Download-Windows%20installer-6558d9?style=for-the-badge&logo=windows"
    />
  </a>
  </p>
  </p>
</div>

---

> **Independent application.** PendraDraw is built on the open-source
> [Excalidraw](https://github.com/excalidraw/excalidraw) drawing engine.
> It is not affiliated with, endorsed by, or supported by the Excalidraw team.

## Why PendraDraw exists

[Excalidraw](https://excalidraw.com) is a fast and intuitive tool for diagrams,
sketches and visual notes. PendraDraw brings that experience into a focused
desktop application with document tabs, native file dialogs and local workspace
recovery.

Open an `.excalidraw` file and it appears in its own tab. Press `Ctrl+S` to save
it back to disk. Open documents and unsaved changes are kept locally so the
workspace can be restored after restarting the application.

PendraDraw uses the real Excalidraw drawing engine, which means files remain
compatible with Excalidraw and can be opened on
[excalidraw.com](https://excalidraw.com).

## Features

### Multiple document tabs

- Open multiple drawings in one application window.
- Each drawing is displayed in its own tab.
- Create documents with `Ctrl+T`.
- Close the active tab with `Ctrl+W`.
- Unsaved documents are marked with a dirty indicator.
- Recently opened files are available from the home screen.

### Real files on disk

- Open `.excalidraw` and compatible JSON files.
- Save changes to the original file with `Ctrl+S`.
- Choose a new location with `Ctrl+Shift+S`.
- Native file dialogs are provided by Tauri.
- Drawings use the standard Excalidraw file format.

### Local workspace recovery

PendraDraw stores the current workspace locally while you edit.

- Open documents are restored when the application starts again.
- Unsaved scene changes are periodically stored in local recovery.
- Recovery data is separate from the original file.
- Changes are written to the original file only when you explicitly save.

> Local recovery is a safety mechanism, not a replacement for saving important
> drawings to disk.

### Excalidraw libraries

- Import `.excalidrawlib` library files.
- Library items are shared between open documents.
- Imported libraries are persisted locally between sessions.

### Image export

Use the Excalidraw export dialog to export drawings as images. Export settings,
background options and supported formats are provided by the embedded
Excalidraw engine.

### Focused desktop experience

- Dedicated home screen.
- Native desktop file dialogs.
- Restored workspace between launches.
- Familiar editor shortcuts.
- Windows, macOS and Linux builds through Tauri.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+T` | Create a new drawing |
| `Ctrl+O` | Open a drawing |
| `Ctrl+S` | Save the active drawing |
| `Ctrl+Shift+S` | Save the active drawing as a new file |
| `Ctrl+W` | Close the active tab |
| `Esc` | Return to the home screen |

On macOS, use `Cmd` instead of `Ctrl`.

## Technology

PendraDraw is built with:

- [Excalidraw](https://github.com/excalidraw/excalidraw) - drawing engine
- [React](https://react.dev) - application interface
- [Tauri](https://tauri.app) - native desktop shell
- [Zustand](https://zustand.docs.pmnd.rs) - application state
- [Vite](https://vite.dev) - frontend tooling
- [Lucide](https://lucide.dev) - interface icons

## Build from source

### Requirements

Install the following tools:

- [Node.js](https://nodejs.org) 20 or newer
- [pnpm](https://pnpm.io) 10 or newer
- [Rust](https://rustup.rs) with the stable toolchain

## License and trademarks

MIT, see [LICENSE](LICENSE).
