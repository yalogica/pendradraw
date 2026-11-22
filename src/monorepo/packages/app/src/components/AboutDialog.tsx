import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import appIcon from "../../../tauri/src-tauri/icons/128x128@2x.png";
import packageJson from "../../package.json";
import "./AboutDialog.css";

type AboutDialogProps = {
  onClose: () => void;
};

export const AboutDialog = ({ onClose }: AboutDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;

    const getFocusableElements = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])",
        ) ?? [],
      );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const elements = getFocusableElements();

      if (elements.length === 0) {
        return;
      }

      const currentIndex = elements.indexOf(
        document.activeElement as HTMLElement,
      );

      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? elements.length - 1
          : currentIndex - 1
        : (currentIndex + 1) % elements.length;

      event.preventDefault();
      elements[nextIndex]?.focus();
    };

    dialog
      ?.querySelector<HTMLElement>("[data-autofocus]")
      ?.focus();

    dialog?.addEventListener("keydown", handleKeyDown);

    return () => {
      dialog?.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="about-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="about-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-dialog-title"
        aria-describedby="about-dialog-description"
      >
        <button
          type="button"
          className="about-dialog__dismiss"
          aria-label="Close About dialog"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="about-dialog__hero">
          <div className="about-dialog__logo">
            <img
              src={appIcon}
              alt=""
              width={72}
              height={72}
              draggable={false}
            />
          </div>

          <div>
            <div className="about-dialog__product-row">
              <h2 id="about-dialog-title">PendraDraw</h2>
              <span className="about-dialog__version">
                v{packageJson.version}
              </span>
            </div>

            <p className="about-dialog__tagline">
              A focused desktop space for visual thinking.
            </p>
          </div>
        </div>

        <div className="about-dialog__content">
          <p
            id="about-dialog-description"
            className="about-dialog__description"
          >
            Draw diagrams, sketch ideas and organize your thoughts in a fast,
            distraction-free workspace.
          </p>

          <div className="about-dialog__features" aria-label="Features">
            <span>Local-first</span>
            <span>Open format</span>
            <span>Excalidraw engine</span>
          </div>

          <div className="about-dialog__divider" />

          <p className="about-dialog__legal">
            Drawing engine powered by{" "}
            <strong>Excalidraw</strong>, licensed under the MIT License.
          </p>

          <p className="about-dialog__legal">
            PendraDraw is an independent application and is not affiliated
            with or endorsed by Excalidraw.
          </p>

          <p className="about-dialog__legal">
            <span>Designed and developed by </span>
            <a
              href="https://yalogica.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Yalogica
            </a>.
          </p>
        </div>

        <footer className="about-dialog__footer">
          <div className="about-dialog__actions">
            <button
              type="button"
              className="about-dialog__close"
              data-autofocus
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};