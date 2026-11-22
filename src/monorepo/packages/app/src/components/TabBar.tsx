import type { WheelEvent as ReactWheelEvent } from "react";
import { Home, Plus, X } from "lucide-react";
import { useAppStore } from "../store/app-store";

type TabBarProps = {
  onClose: (id: string) => void;
};

const handleTabsWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
  const container = event.currentTarget;

  // Let the browser handle horizontal touchpad gestures.
  if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
    return;
  }

  const previousScrollLeft = container.scrollLeft;
  container.scrollLeft += event.deltaY;

  // Prevent vertical scrolling only when the tab container actually scrolled.
  if (container.scrollLeft !== previousScrollLeft) {
    event.preventDefault();
  }
};

export const TabBar = ({ onClose }: TabBarProps) => {
  const documents = useAppStore((state) => state.documents);
  const activeDocumentId = useAppStore((state) => state.activeDocumentId);
  const homeOpen = useAppStore((state) => state.homeOpen);
  const activateDocument = useAppStore((state) => state.activateDocument);
  const createDocument = useAppStore((state) => state.createDocument);
  const showHome = useAppStore((state) => state.showHome);

  return (
    <header className="tab-bar" data-tauri-drag-region>
      <button
        className={`home-button ${homeOpen ? "is-active" : ""}`}
        aria-label="Home"
        title="Home"
        onClick={showHome}
      >
        <Home />
      </button>

      <button className="new-tab-button" aria-label="New drawing" title="New drawing" onClick={createDocument}>
        <Plus />
      </button>

      <div className="tabs" role="tablist" onWheel={handleTabsWheel}>
        {documents.map((document) => {
          const active = !homeOpen && document.id === activeDocumentId;
          return (
            <button
              key={document.id}
              className={`tab ${active ? "is-active" : ""}`}
              role="tab"
              aria-selected={active}
              title={document.path ?? document.title}
              onClick={() => activateDocument(document.id)}
            >
              <span className={`dirty-dot ${document.dirty ? "is-dirty" : ""}`} />
              <span className="tab-title">{document.title}</span>
              <span
                className="tab-close"
                role="button"
                tabIndex={0}
                aria-label={`Close ${document.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(document.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.stopPropagation();
                    onClose(document.id);
                  }
                }}
              >
                <X />
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="window-drag-space" data-tauri-drag-region />
    </header>
  );
};
