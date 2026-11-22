import {
  Clock3,
  FilePlus2,
  FolderOpen,
  Keyboard,
  MousePointer2,
  Trash2,
  Heart,
} from "lucide-react";
import packageJson from "../../package.json";
import { useAppStore } from "../store/app-store";


type HomeScreenProps = {
  onOpenFile: () => void;
  onOpenRecent: (path: string) => void;
};

export const HomeScreen = ({ onOpenFile, onOpenRecent }: HomeScreenProps) => {
  const createDocument = useAppStore((state) => state.createDocument);
  const recentFiles = useAppStore((state) => state.recentFiles);
  const removeRecent = useAppStore((state) => state.removeRecent);

  return (
    <main className="home-screen">
      <div className="home-glow home-glow--one" />
      <div className="home-glow home-glow--two" />

      <section className="home-content">
        <header className="home-hero">
          <p className="eyebrow">PendraDraw</p>
          <h1>Think visually.<br />Keep it local.</h1>
          <p className="home-intro">
            A focused desktop canvas for diagrams, sketches, and ideas,
            powered by Excalidraw.
          </p>
        </header>

        <div className="quick-actions">
          <button className="action-card action-card--primary" onClick={createDocument}>
            <span className="action-icon"><FilePlus2 /></span>
            <span>
              <strong>New drawing</strong>
              <small>Start with an empty canvas</small>
            </span>
            <kbd>Ctrl T</kbd>
          </button>

          <button className="action-card" onClick={onOpenFile}>
            <span className="action-icon"><FolderOpen /></span>
            <span>
              <strong>Open file</strong>
              <small>Open an .excalidraw drawing</small>
            </span>
            <kbd>Ctrl O</kbd>
          </button>
        </div>

        <div className="home-grid">
          <section className="home-panel recent-panel">
            <div className="panel-heading">
              <span><Clock3 /> Recent files</span>
              <small>{recentFiles.length} saved</small>
            </div>

            {recentFiles.length === 0 ? (
              <div className="empty-recents">
                <MousePointer2 />
                <strong>No recent drawings</strong>
                <p>Files opened from disk will appear here.</p>
              </div>
            ) : (
              <ul className="recent-list">
                {recentFiles.map((file) => (
                  <li key={file.path}>
                    <button className="recent-open" onClick={() => onOpenRecent(file.path)}>
                      <span className="file-glyph">PD</span>
                      <span>
                        <strong>{file.name}</strong>
                        <small>{file.path}</small>
                      </span>
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Remove ${file.name} from recent files`}
                      onClick={() => removeRecent(file.path)}
                    >
                      <Trash2 />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="home-panel shortcuts-panel">
            <div className="panel-heading">
              <span><Keyboard /> Quick guide</span>
            </div>
            <dl className="shortcut-list">
              <div><dt>New drawing</dt><dd><kbd>Ctrl</kbd><kbd>T</kbd></dd></div>
              <div><dt>Open drawing</dt><dd><kbd>Ctrl</kbd><kbd>O</kbd></dd></div>
              <div><dt>Close tab</dt><dd><kbd>Ctrl</kbd><kbd>W</kbd></dd></div>
              <div><dt>Return home</dt><dd><kbd>Esc</kbd></dd></div>
            </dl>
            <p className="recovery-note">
              Open tabs are recovered automatically from local storage.
            </p>
          </aside>
        </div>

        <footer className="home-footer">
          <p>
            Made with love by <a
              href="https://yalogica.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Yalogica
            </a>
          </p>

          <p>
            Drawing engine <a
              href="https://github.com/excalidraw/excalidraw"
              target="_blank"
              rel="noopener noreferrer"
            >
              Excalidraw
            </a> by the Excalidraw contributors (MIT)
          </p>

          <p>
            Unofficial app
            <span className="home-footer__separator" aria-hidden="true">
              ·
            </span>
            not affiliated with or endorsed by Excalidraw
          </p>
        </footer>
      </section>
    </main>
  );
};
