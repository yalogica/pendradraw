import clsx from "clsx";
import Colorful from "@uiw/react-color-colorful";
import { Popover } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { KEYS, normalizeInputColor } from "@excalidraw/common";
import { getShortcutKey } from "../..//shortcut";
import { useAtom } from "../../editor-jotai";
import { t } from "../../i18n";
import { useEditorInterface, useExcalidrawContainer } from "../App";
import { activeEyeDropperAtom } from "../EyeDropper";
import { eyeDropperIcon } from "../icons";
import { activeColorPickerSectionAtom } from "./colorPickerUtils";
import type { ColorPickerType } from "./colorPickerUtils";

export const ColorInput = ({
  color,
  onChange,
  label,
  colorPickerType,
  placeholder,
}: {
  color: string;
  onChange: (color: string) => void;
  label: string;
  colorPickerType: ColorPickerType;
  placeholder?: string;
}) => {
  const editorInterface = useEditorInterface();
  const { container } = useExcalidrawContainer();
  const [innerValue, setInnerValue] = useState(color);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveColorPickerSection] = useAtom(
    activeColorPickerSectionAtom,
  );


  useEffect(() => {
    setInnerValue(color);
  }, [color]);

  const changeColor = useCallback(
    (inputValue: string) => {
      const value = inputValue.toLowerCase().trim();
      const color = normalizeInputColor(value);

      if (color) {
        onChange(color);
        setErrorMessage(null);
      } else if (value.length === 0) {
        setErrorMessage(null);
      } else if (/^#?[0-9a-f]+$/.test(value)) {
        setErrorMessage(t("colorPicker.invalidHexLength"));
      } else {
        setErrorMessage(t("colorPicker.invalidColor"));
      }
      setInnerValue(value);
    },
    [onChange],
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const eyeDropperTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeSection]);
  
  const [eyeDropperState, setEyeDropperState] = useAtom(activeEyeDropperAtom);
  
  const chromeTriggerRef = useRef<HTMLButtonElement>(null);
  const [chromePickerOpen, setChromePickerOpen] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeSection]);

  return (
    <div className="color-picker__input-label-container">
      <div
        className={clsx("color-picker__input-label", {
          "has-error": errorMessage,
        })}
      >
        <div className="color-picker__input-hash">#</div>
        <input
          ref={activeSection === "hex" ? inputRef : undefined}
          style={{ border: 0, padding: 0 }}
          spellCheck={false}
          className="color-picker-input"
          aria-label={label}
          aria-invalid={!!errorMessage}
          onChange={(event) => {
            changeColor(event.target.value);
          }}
          value={(innerValue || "").replace(/^#/, "")}
          onBlur={() => {
            setInnerValue(color);
            setErrorMessage(null);
          }}
          tabIndex={-1}
          onFocus={() => setActiveColorPickerSection("hex")}
          onKeyDown={(event) => {
            if (event.key === KEYS.TAB) {
              return;
            } else if (event.key === KEYS.ESCAPE) {
              chromeTriggerRef.current?.focus();
            }
            event.stopPropagation();
          }}
          placeholder={placeholder}
        />
        <div
          style={{
            width: "1px",
            height: "1.25rem",
            backgroundColor: "var(--default-border-color)",
          }}
        />
        {/* TODO reenable on mobile with a better UX */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <Popover.Root
              open={chromePickerOpen}
              onOpenChange={setChromePickerOpen}
            >
              <Popover.Trigger
                asChild
              >
                <button
                  ref={chromeTriggerRef}
                  type="button"
                  className={clsx(
                    "color-picker-chrome-trigger",
                    {
                      selected:
                        chromePickerOpen,
                    },
                  )}
                  aria-label={"Choose custom color"}
                  aria-expanded={chromePickerOpen}
                  title={"Choose custom color"}
                >
                  <span
                    className={"color-picker-chrome-trigger__preview"}
                    style={{
                      background:
                        "conic-gradient(" +
                        "from 90deg, " +
                        "#ff0000, " +
                        "#ffff00, " +
                        "#00ff00, " +
                        "#00ffff, " +
                        "#0000ff, " +
                        "#ff00ff, " +
                        "#ff0000)",
                    }}
                  />
                </button>
              </Popover.Trigger>

              <Popover.Content
                className={"color-picker-chrome"}
                side="bottom"
                align="start"
                sideOffset={8}
                collisionPadding={8}
                collisionBoundary={container ?? undefined}
                avoidCollisions
                sticky="always"
                onPointerDown={(event) => { event.stopPropagation(); }}
                onCloseAutoFocus={(event) => { 
                  event.preventDefault();     
                  chromeTriggerRef.current?.focus();
                }}
              >
                <Colorful
                  color={color && color !== "transparent"
                    ? color
                    : "#ffffff"
                  }
                  disableAlpha={true}
                  onChange={(nextColor) => { changeColor(nextColor.hex); }}
                />
              </Popover.Content>
          </Popover.Root>
          {editorInterface.formFactor !== "phone" && (
            <>
              <div
                ref={eyeDropperTriggerRef}
                className={clsx("excalidraw-eye-dropper-trigger", { selected: eyeDropperState })}
                onClick={() =>
                  setEyeDropperState((s) =>
                    s
                      ? null
                      : {
                          keepOpenOnAlt: false,
                          onSelect: (color) => onChange(color),
                          colorPickerType,
                        },
                  )
                }
                title={`${t(
                  "labels.eyeDropper",
                )} — ${KEYS.I.toLocaleUpperCase()} or ${getShortcutKey("Alt")} `}
              >
                {eyeDropperIcon}
              </div>
            </>
          )}
        </div>
      </div>
      {errorMessage && (
      <div className="color-picker__error-message" role="alert">
        {errorMessage}
      </div>
      )}
    </div>
  );
};
