import { useState } from "react";
import { MdBackspace } from "react-icons/md";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", null, "0", "⌫"];

export default function PinPad({ onComplete, disabled = false, error = "" }) {
  const [pin, setPin] = useState("");

  const press = (digit) => {
    if (disabled || pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      onComplete(next);
      setTimeout(() => setPin(""), 600);
    }
  };

  const backspace = () => {
    if (!disabled) setPin((p) => p.slice(0, -1));
  };

  return (
    <div className="space-y-5">
      {/* Dots */}
      <div className="flex justify-center gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < pin.length ? "bg-gold border-gold scale-110" : "border-white/30"
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-center text-sm text-live">{error}</p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k, i) => {
          if (k === null) return <div key={i} />;
          if (k === "⌫") {
            return (
              <button
                key={i}
                onClick={backspace}
                disabled={disabled}
                className="h-14 rounded-btn bg-card hover:bg-border text-white/60 flex items-center justify-center transition-colors disabled:opacity-40"
              >
                <MdBackspace className="text-xl" />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => press(k)}
              disabled={disabled}
              className="h-14 rounded-btn bg-card hover:bg-gold/20 active:bg-gold/30 text-white font-bold text-xl transition-colors disabled:opacity-40"
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}
