import type { ClockSettings } from "../src/components/terra-clock";

/**
 * Lively Wallpaper calls the global `livelyPropertyListener(name, value)` once per
 * LivelyProperties.json entry after the page has loaded (NavigationCompleted), and
 * again whenever the user changes a control in Customise. Values: slider -> number,
 * checkbox -> boolean, dropdown -> item index, color -> "#rrggbb".
 * Calls that arrive before React subscribes are buffered.
 */
type Patch = Partial<ClockSettings>;
const MARKS = ["off", "hours", "all"] as const;
const NUMERALS = ["off", "arabic", "roman"] as const;
const SIDES = ["inside", "outside"] as const;

let current: Patch = {};
let notify: ((s: Patch) => void) | null = null;

export function toPatch(name: string, v: unknown, cur: Patch): Patch {
  const n = Number(v);
  const b = v === true || v === "true";
  switch (name) {
    case "zoom": return { zoom: n / 100 };
    case "smoothSeconds": return { smooth: b };
    case "showInterface": return { showUi: b };
    case "showTitle": return { showTitle: b };
    case "showTime": return { showTime: b };
    case "showDate": return { showDate: b };
    case "showLive": return { showLive: b };
    case "showCredit": return { showCredit: b };
    case "blur": return { blur: n };
    case "unblurPastPhoto": return { autoClear: b };
    case "lines": return { marks: MARKS[n] ?? "all" };
    case "lineColor": return { lineColor: String(v) };
    case "lineThickness": return { lineWeight: n };
    case "numerals": return { numerals: NUMERALS[n] ?? "off" };
    case "numeralPlace": return { numeralSide: SIDES[n] ?? "inside" };
    case "numeralColor": return { numeralColor: String(v) };
    case "numeralThickness": return { numeralWeight: n };
    case "hourHand":
    case "minuteHand":
    case "secondHand": {
      const hands = { hour: 35, minute: 52, second: 55, ...cur.hands };
      hands[name.replace("Hand", "") as "hour" | "minute" | "second"] = n;
      return { hands };
    }
    case "stackByLength": return { autoStack: b };
    case "fitRoad": return { fitCircle: b };
    case "faceAcross":
    case "faceDown":
    case "faceSize": {
      const face = { x: 50.43, y: 49.05, size: 28.74, ...cur.face };
      face[name === "faceAcross" ? "x" : name === "faceDown" ? "y" : "size"] = n;
      return { face };
    }
    default: return {};
  }
}

declare global {
  interface Window {
    livelyPropertyListener?: (name: string, value: unknown) => void;
  }
}

window.livelyPropertyListener = (name, value) => {
  current = { ...current, ...toPatch(name, value, current) };
  notify?.(current);
};

export function subscribeLively(fn: (s: Patch) => void) {
  notify = fn;
  if (Object.keys(current).length) fn(current);
  return () => {
    notify = null;
  };
}
