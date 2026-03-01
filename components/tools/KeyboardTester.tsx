"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { RotateCcw } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface KeyDef {
  code: string;
  label: string;
  width: number;
  mac?: string;
}

// ─── Keyboard Layout ─────────────────────────────────────────────────────────

const KEYBOARD_ROWS: KeyDef[][] = [
  // Function row
  [
    { code: "Escape", label: "Esc", width: 1 },
    { code: "F1", label: "F1", width: 1 },
    { code: "F2", label: "F2", width: 1 },
    { code: "F3", label: "F3", width: 1 },
    { code: "F4", label: "F4", width: 1 },
    { code: "F5", label: "F5", width: 1 },
    { code: "F6", label: "F6", width: 1 },
    { code: "F7", label: "F7", width: 1 },
    { code: "F8", label: "F8", width: 1 },
    { code: "F9", label: "F9", width: 1 },
    { code: "F10", label: "F10", width: 1 },
    { code: "F11", label: "F11", width: 1 },
    { code: "F12", label: "F12", width: 1 },
  ],
  // Number row
  [
    { code: "Backquote", label: "`", width: 1 },
    { code: "Digit1", label: "1", width: 1 },
    { code: "Digit2", label: "2", width: 1 },
    { code: "Digit3", label: "3", width: 1 },
    { code: "Digit4", label: "4", width: 1 },
    { code: "Digit5", label: "5", width: 1 },
    { code: "Digit6", label: "6", width: 1 },
    { code: "Digit7", label: "7", width: 1 },
    { code: "Digit8", label: "8", width: 1 },
    { code: "Digit9", label: "9", width: 1 },
    { code: "Digit0", label: "0", width: 1 },
    { code: "Minus", label: "-", width: 1 },
    { code: "Equal", label: "=", width: 1 },
    { code: "Backspace", label: "\u232B", width: 2 },
  ],
  // QWERTY row
  [
    { code: "Tab", label: "Tab", width: 1.5 },
    { code: "KeyQ", label: "Q", width: 1 },
    { code: "KeyW", label: "W", width: 1 },
    { code: "KeyE", label: "E", width: 1 },
    { code: "KeyR", label: "R", width: 1 },
    { code: "KeyT", label: "T", width: 1 },
    { code: "KeyY", label: "Y", width: 1 },
    { code: "KeyU", label: "U", width: 1 },
    { code: "KeyI", label: "I", width: 1 },
    { code: "KeyO", label: "O", width: 1 },
    { code: "KeyP", label: "P", width: 1 },
    { code: "BracketLeft", label: "[", width: 1 },
    { code: "BracketRight", label: "]", width: 1 },
    { code: "Backslash", label: "\\", width: 1.5 },
  ],
  // Home row
  [
    { code: "CapsLock", label: "Caps", width: 1.75 },
    { code: "KeyA", label: "A", width: 1 },
    { code: "KeyS", label: "S", width: 1 },
    { code: "KeyD", label: "D", width: 1 },
    { code: "KeyF", label: "F", width: 1 },
    { code: "KeyG", label: "G", width: 1 },
    { code: "KeyH", label: "H", width: 1 },
    { code: "KeyJ", label: "J", width: 1 },
    { code: "KeyK", label: "K", width: 1 },
    { code: "KeyL", label: "L", width: 1 },
    { code: "Semicolon", label: ";", width: 1 },
    { code: "Quote", label: "'", width: 1 },
    { code: "Enter", label: "\u21B5", width: 2.25 },
  ],
  // Shift row
  [
    { code: "ShiftLeft", label: "\u21E7 Shift", width: 2.25 },
    { code: "KeyZ", label: "Z", width: 1 },
    { code: "KeyX", label: "X", width: 1 },
    { code: "KeyC", label: "C", width: 1 },
    { code: "KeyV", label: "V", width: 1 },
    { code: "KeyB", label: "B", width: 1 },
    { code: "KeyN", label: "N", width: 1 },
    { code: "KeyM", label: "M", width: 1 },
    { code: "Comma", label: ",", width: 1 },
    { code: "Period", label: ".", width: 1 },
    { code: "Slash", label: "/", width: 1 },
    { code: "ShiftRight", label: "\u21E7 Shift", width: 2.75 },
  ],
  // Bottom row
  [
    { code: "ControlLeft", label: "Ctrl", width: 1.25, mac: "\u2303" },
    { code: "MetaLeft", label: "Win", width: 1.25, mac: "\u2318" },
    { code: "AltLeft", label: "Alt", width: 1.25, mac: "\u2325" },
    { code: "Space", label: "", width: 6 },
    { code: "AltRight", label: "Alt", width: 1.25, mac: "\u2325" },
    { code: "MetaRight", label: "Win", width: 1.25, mac: "\u2318" },
    { code: "ContextMenu", label: "Menu", width: 1.25, mac: "Fn" },
    { code: "ControlRight", label: "Ctrl", width: 1.25, mac: "\u2303" },
  ],
];

// Total expected keys
const ALL_KEY_CODES = KEYBOARD_ROWS.flat().map((k) => k.code);
const TOTAL_KEYS = ALL_KEY_CODES.length;

// ─── Component ───────────────────────────────────────────────────────────────

export default function KeyboardTester() {
  const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [lastKey, setLastKey] = useState<{
    key: string;
    code: string;
    keyCode: number;
  } | null>(null);
  const [isMac, setIsMac] = useState(false);

  // Detect Mac
  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes("mac"));
  }, []);

  // Event handlers
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Allow specific browser shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "a", "r"].includes(e.key.toLowerCase())
      ) {
        return;
      }
      if (e.code === "F12") {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "j") {
        return;
      }

      e.preventDefault();
      setHeldKeys((prev) => new Set([...prev, e.code]));
      setTestedKeys((prev) => new Set([...prev, e.code]));
      setLastKey({ key: e.key, code: e.code, keyCode: e.keyCode });
    }

    function onKeyUp(e: KeyboardEvent) {
      setHeldKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const handleReset = useCallback(() => {
    setHeldKeys(new Set());
    setTestedKeys(new Set());
    setLastKey(null);
  }, []);

  const testedCount = useMemo(() => {
    return ALL_KEY_CODES.filter((code) => testedKeys.has(code)).length;
  }, [testedKeys]);

  return (
    <div className="space-y-6">
      {/* Key info panel */}
      <div className="rounded-xl border border-border bg-card p-4">
        {lastKey ? (
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Key: </span>
              <span className="font-mono font-semibold text-foreground">
                {lastKey.key === " " ? "Space" : lastKey.key}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Code: </span>
              <span className="font-mono font-semibold text-foreground">
                {lastKey.code}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">KeyCode: </span>
              <span className="font-mono font-semibold text-foreground tabular-nums">
                {lastKey.keyCode}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Press any key to see its details
          </p>
        )}
      </div>

      {/* Counter and reset */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground tabular-nums">
          <span className="text-foreground font-semibold">{testedCount}</span>{" "}
          of {TOTAL_KEYS} keys tested
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Reset all tested keys"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Keyboard layout */}
      <div className="rounded-xl bg-gray-900 p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[700px] space-y-1.5">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className={`flex gap-1 ${rowIdx === 0 ? "mb-2" : ""}`}>
              {row.map((keyDef) => {
                const isHeld = heldKeys.has(keyDef.code);
                const isTested =
                  testedKeys.has(keyDef.code) && !isHeld;
                const label = isMac && keyDef.mac ? keyDef.mac : keyDef.label;

                return (
                  <div
                    key={keyDef.code}
                    className={`rounded-md border text-xs font-mono flex items-center justify-center transition-colors cursor-default select-none h-10 ${
                      isHeld
                        ? "bg-primary border-primary text-white ring-2 ring-primary/50"
                        : isTested
                          ? "bg-primary/80 border-primary/80 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-400"
                    }`}
                    style={{
                      flexBasis: `${keyDef.width * 3}rem`,
                      minWidth: `${keyDef.width * 3}rem`,
                    }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile note */}
      <p className="text-xs text-muted-foreground text-center sm:hidden">
        A physical keyboard is required to use this tool.
      </p>
    </div>
  );
}
