import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { GripVertical, Minus, Plus, Clock, RotateCcw } from "lucide-react";

const PHOTO = { w: 1872, h: 1056, cx: 944, cy: 518, r: 269 };
const TILES = 3;
const HAND_DEFAULT = { hour: 35, minute: 52, second: 55 };
const HAND_META = {
  second: { label: "Second", min: 10, max: 180, tip: 0.9472 },
  hour: { label: "Hour", min: 10, max: 180, tip: 1 },
  minute: { label: "Minute", min: 10, max: 180, tip: 1 },
} as const;
type HandKey = keyof typeof HAND_META;
const DEFAULT_ORDER: HandKey[] = ["second", "hour", "minute"];
const ROAD_INK = "#2a3645";
const LINE_WEIGHT = 2;
const NUMERAL_WEIGHT = 7;
const BLUR_MAX = 48;
const STACK_Z = [8, 3, 2];

const ROAD = {
  x: (PHOTO.cx / PHOTO.w) * 100,
  y: (PHOTO.cy / PHOTO.h) * 100,
  size: ((PHOTO.r * 2) / PHOTO.w) * 100,
};
const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

function dialBox(face: { x: number; y: number; size: number }) {
  return {
    left: `${face.x - face.size / 2}%`,
    top: `${face.y - (face.size * (PHOTO.w / PHOTO.h)) / 2}%`,
    width: `${face.size}%`,
  };
}

function stackOrder(order: HandKey[], hands: typeof HAND_DEFAULT, auto: boolean) {
  if (!auto) return order;
  return [...order].sort((a, b) => hands[a] - hands[b] || order.indexOf(a) - order.indexOf(b));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pointerAngle(event: { clientX: number; clientY: number }, el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

export function TerraClock() {
  const viewRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glassRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dialRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const dragRef = useRef<{ last: number } | null>(null);
  const zoomRef = useRef(0);
  const zoomVelRef = useRef(0);
  const targetRef = useRef(0);
  const placeRef = useRef<(z: number) => void>(() => {});
  const reduceRef = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const [stamp, setStamp] = useState<Date | null>(null);
  const [shifted, setShifted] = useState(false);
  const [zoomTarget, setZoomTarget] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [hands, setHands] = useState(HAND_DEFAULT);
  const [order, setOrder] = useState<HandKey[]>(DEFAULT_ORDER);
  const [autoStack, setAutoStack] = useState(false);
  const [blur, setBlur] = useState(18);
  const [autoClear, setAutoClear] = useState(true);
  const [dragging, setDragging] = useState<HandKey | null>(null);
  const [fitCircle, setFitCircle] = useState(true);
  const [face, setFace] = useState(ROAD);
  const [marks, setMarks] = useState<"off" | "hours" | "all">("all");
  const [numerals, setNumerals] = useState<"off" | "arabic" | "roman">("off");
  const [numeralSide, setNumeralSide] = useState<"inside" | "outside">("inside");
  const [lineColor, setLineColor] = useState(ROAD_INK);
  const [numeralColor, setNumeralColor] = useState(ROAD_INK);
  const [lineWeight, setLineWeight] = useState(LINE_WEIGHT);
  const [numeralWeight, setNumeralWeight] = useState(NUMERAL_WEIGHT);
  const [showUi, setShowUi] = useState(true);
  const handsRef = useRef(HAND_DEFAULT);
  const blurRef = useRef(18);
  const autoClearRef = useRef(true);
  const anglesRef = useRef({ hour: 0, minute: 0, second: 0 });
  const geomRef = useRef({ s: 1, stageTop: 0, stageH: 0 });
  const draggingRef = useRef<HandKey | null>(null);
  handsRef.current = hands;
  blurRef.current = blur;
  autoClearRef.current = autoClear;

  const seekZoom = (value: number, immediate = false) => {
    const next = clamp(value, 0, 1);
    targetRef.current = next;
    setZoomTarget(next);
    if (immediate || reduceRef.current) {
      zoomVelRef.current = 0;
      zoomRef.current = next;
      placeRef.current(next);
    }
  };

  useLayoutEffect(() => {
    const dial = dialRef.current;
    const view = viewRef.current;
    const stage = stageRef.current;
    if (!dial || !view || !stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reduceRef.current = reduce;
    let frameId = 0;
    let lastText = "";

    const place = (z: number) => {
      const vw = view.clientWidth;
      const vh = view.clientHeight;
      if (vw === 0 || vh === 0) return;
      const diam = PHOTO.r * 2;
      const sMin = Math.min(vw / PHOTO.w, vh / PHOTO.h);
      const sMax = Math.max(sMin, Math.min(vw, vh) / diam);
      const s = sMin + (sMax - sMin) * z;
      const focusX = PHOTO.w / 2 + (PHOTO.cx - PHOTO.w / 2) * z;
      const focusY = PHOTO.h / 2 + (PHOTO.cy - PHOTO.h / 2) * z;
      const width = PHOTO.w * s;
      const height = PHOTO.h * s;
      const left = vw / 2 - focusX * s;
      const top = vh / 2 - focusY * s;
      stage.style.left = `${left}px`;
      stage.style.top = `${top}px`;
      stage.style.width = `${width}px`;
      stage.style.height = `${height}px`;
      for (const band of [
        { start: 0, side: -1 as const, axis: "y" as const },
        { start: TILES, side: 1 as const, axis: "y" as const },
        { start: TILES * 2, side: -1 as const, axis: "x" as const },
        { start: TILES * 3, side: 1 as const, axis: "x" as const },
      ]) {
        for (let i = 0; i < TILES; i += 1) {
          const el = glassRefs.current[band.start + i];
          if (!el) continue;
          const along = band.axis === "y" ? height : width;
          const origin = band.axis === "y" ? top : left;
          const pos = origin + band.side * ((i + 1) * along - 2);
          const visible =
            band.axis === "y" ? pos < vh && pos + height > 0 : pos < vw && pos + width > 0;
          el.style.display = visible ? "block" : "none";
          if (!visible) continue;
          el.style.left = `${band.axis === "y" ? left : pos}px`;
          el.style.top = `${band.axis === "y" ? pos : top}px`;
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
          el.dataset.flip = i % 2 === 0 ? "1" : "0";
          el.dataset.axis = band.axis;
          el.dataset.side =
            band.axis === "y" ? (band.side === -1 ? "top" : "bottom") : band.side === -1 ? "left" : "right";
        }
      }
      geomRef.current = { s, stageTop: top, stageH: height };
      paintMasks();
    };

    const paintMasks = () => {
      const blurPx = blurRef.current;
      view.style.setProperty("--glass-blur", `${blurPx}px`);
      view.style.setProperty("--glass-scale", `${1 + blurPx / 200}`);
      view.dataset.blur = blurPx === 0 ? "0" : "1";
      const rect = dial.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let radius = 0;
      if (autoClearRef.current && blurPx > 0 && rect.height > 0) {
        (Object.keys(HAND_META) as HandKey[]).forEach((key) => {
          radius = Math.max(radius, (handsRef.current[key] / 100) * rect.height * HAND_META[key].tip);
        });
      }
      const reach = {
        top: centerY - radius,
        bottom: centerY + radius,
        left: centerX - radius,
        right: centerX + radius,
      };
      glassRefs.current.forEach((el) => {
        if (!el || el.style.display === "none") return;
        const maskEl = el.querySelector<HTMLElement>(".glass-mask");
        if (!maskEl) return;
        const horizontal = el.dataset.axis === "x";
        const side = el.dataset.side ?? "top";
        const tileStart = Number.parseFloat(horizontal ? el.style.left : el.style.top);
        const tileSpan = Number.parseFloat(horizontal ? el.style.width : el.style.height);
        if (!tileSpan) return;
        const edge = reach[side as keyof typeof reach];
        const cut = edge - tileStart;
        const feather = 6 / tileSpan;
        const outward = side === "top" || side === "left";
        let mask = "none";
        if (!autoClearRef.current || blurPx <= 0 || radius <= 0) {
          mask = "none";
        } else if (outward) {
          if (cut <= 0) mask = "linear-gradient(transparent, transparent)";
          else if (cut < tileSpan) {
            const t = cut / tileSpan;
            const fade = Math.max(0, t - feather) * 100;
            const dir = horizontal ? "to right" : "to bottom";
            mask = `linear-gradient(${dir}, #000 0%, #000 ${fade}%, transparent ${t * 100}%, transparent 100%)`;
          }
        } else if (cut >= tileSpan) {
          mask = "linear-gradient(transparent, transparent)";
        } else if (cut > 0) {
          const t = cut / tileSpan;
          const fade = Math.min(100, (t + feather) * 100);
          const dir = horizontal ? "to right" : "to bottom";
          mask = `linear-gradient(${dir}, transparent 0%, transparent ${t * 100}%, #000 ${fade}%, #000 100%)`;
        }
        if (maskEl.dataset.mask === mask) return;
        maskEl.dataset.mask = mask;
        const value = mask === "none" ? "" : mask;
        maskEl.style.maskImage = value;
        maskEl.style.setProperty("-webkit-mask-image", value);
      });
    };

    placeRef.current = place;
    place(zoomRef.current);
    const observer = new ResizeObserver(() => place(zoomRef.current));
    observer.observe(view);

    const apply = (now: Date) => {
      const ms = reduce ? 0 : now.getMilliseconds();
      const seconds = now.getSeconds() + ms / 1000;
      const minutes = now.getMinutes() + seconds / 60;
      const hours = (now.getHours() % 12) + minutes / 60;
      dial.style.setProperty("--hour", `${hours * 30}deg`);
      dial.style.setProperty("--minute", `${minutes * 6}deg`);
      dial.style.setProperty("--second", `${seconds * 6}deg`);
      anglesRef.current = { hour: hours * 30, minute: minutes * 6, second: seconds * 6 };
      dial.dataset.ready = "true";
      const text = format(now, "HH:mm:ss");
      if (text !== lastText) {
        lastText = text;
        setStamp(now);
      }
    };

    const loop = () => {
      apply(new Date(Date.now() + offsetRef.current));
      const target = targetRef.current;
      const current = zoomRef.current;
      if (reduce) {
        if (current !== target) {
          zoomVelRef.current = 0;
          zoomRef.current = target;
          place(target);
        }
      } else {
        const delta = target - current;
        let vel = zoomVelRef.current * 0.88 + delta * 0.035;
        if (Math.abs(delta) > 0.00025 || Math.abs(vel) > 0.00012) {
          let next = current + vel;
          if (next <= 0 || next >= 1) {
            next = clamp(next, 0, 1);
            vel = 0;
          }
          zoomVelRef.current = vel;
          zoomRef.current = next;
          place(next);
        } else {
          zoomVelRef.current = 0;
          if (current !== target) {
            zoomRef.current = target;
            place(target);
          }
        }
      }
      paintMasks();
      frameId = requestAnimationFrame(loop);
    };
    apply(new Date(Date.now() + offsetRef.current));
    frameId = requestAnimationFrame(loop);

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? view.clientHeight : 1;
      seekZoom(targetRef.current - (event.deltaY * unit) / 1400);
    };
    view.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(frameId);
      view.removeEventListener("wheel", onWheel);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!optionsOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!optionsRef.current?.contains(event.target as Node)) setOptionsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOptionsOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [optionsOpen]);

  const windBy = (ms: number) => {
    offsetRef.current += ms;
    setShifted(Math.abs(offsetRef.current) > 800);
  };

  const backToNow = () => {
    offsetRef.current = 0;
    setShifted(false);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size >= 2) {
      dragRef.current = null;
      const [a, b] = [...pointers.current.values()];
      pinchRef.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        zoom: zoomRef.current,
      };
      return;
    }
    const dial = dialRef.current;
    if (dial?.contains(event.target as Node)) {
      dragRef.current = { last: pointerAngle(event, dial) };
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const point = pointers.current.get(event.pointerId);
    if (!point) return;
    point.x = event.clientX;
    point.y = event.clientY;
    const pinch = pinchRef.current;
    if (pinch && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      seekZoom(pinch.zoom + (dist / pinch.dist - 1) * 1.4, true);
      return;
    }
    const drag = dragRef.current;
    const dial = dialRef.current;
    if (!drag || !dial) return;
    const angle = pointerAngle(event, dial);
    let delta = angle - drag.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    drag.last = angle;
    windBy((delta / 6) * 60_000);
  };

  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      windBy(60_000);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      windBy(-60_000);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      windBy(3_600_000);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      windBy(-3_600_000);
    } else if (event.key === "Home" || event.key === "Escape") {
      event.preventDefault();
      backToNow();
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      seekZoom(targetRef.current + 0.12);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      seekZoom(targetRef.current - 0.12);
    }
  };

  const hoursLabel = stamp ? format(stamp, "h") : "";
  const minutesLabel = stamp ? format(stamp, "m") : "";
  const timeText = stamp ? format(stamp, "HH:mm:ss") : "––:––:––";
  const dateText = stamp ? format(stamp, "EEE d MMM").toUpperCase() : "–––";
  const shownFace = fitCircle ? ROAD : face;
  const markCount = marks === "all" ? 60 : 12;
  const stack = stackOrder(order, hands, autoStack);
  const stackZ = Object.fromEntries(stack.map((key, index) => [key, STACK_Z[index]])) as Record<HandKey, number>;

  const moveHand = (key: HandKey, y: number) => {
    setOrder((prev) => {
      const from = prev.indexOf(key);
      let to = from;
      prev.forEach((other, index) => {
        if (other === key) return;
        const row = document.querySelector<HTMLElement>(`[data-hand="${other}"]`);
        if (!row) return;
        const mid = row.getBoundingClientRect().top + row.getBoundingClientRect().height / 2;
        if (from < index && y > mid) to = index;
        if (from > index && y < mid) to = index;
      });
      if (to === from) return prev;
      const next = prev.slice();
      next.splice(from, 1);
      next.splice(to, 0, key);
      return next;
    });
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-bg text-fg">
      <div
        ref={viewRef}
        className="view"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        {Array.from({ length: TILES * 4 }, (_, index) => {
          const band = Math.floor(index / TILES);
          const className = ["glass glass-top", "glass glass-bottom", "glass glass-left", "glass glass-right"][band];
          return (
            <div
              key={index}
              ref={(node) => {
                glassRefs.current[index] = node;
              }}
              className={className}
              data-axis={band < 2 ? "y" : "x"}
            >
              <img src="/clock/bg.jpg?v=3" alt="" draggable={false} />
              <div className="glass-mask">
                <img src="/clock/bg.jpg?v=3" alt="" draggable={false} className="glass-blur" />
              </div>
            </div>
          );
        })}
        <div ref={stageRef} className="stage">
          <img
            src="/clock/bg.jpg?v=3"
            alt=""
            className="photo"
            draggable={false}
            fetchPriority="high"
          />
          <div
            ref={dialRef}
            className="dial"
            style={{
              ...dialBox(shownFace),
              ["--hand-hour" as string]: `${hands.hour}cqw`,
              ["--hand-minute" as string]: `${hands.minute}cqw`,
              ["--hand-second" as string]: `${hands.second}cqw`,
              ["--face-line" as string]: lineColor,
              ["--face-numeral" as string]: numeralColor,
              ["--line-weight" as string]: String(lineWeight),
              ["--numeral-weight" as string]: String(numeralWeight),
            }}
            tabIndex={0}
            role="img"
            aria-label={
              stamp
                ? `Terafab Terratime, ${hoursLabel} ${hoursLabel === "1" ? "hour" : "hours"} ${minutesLabel} ${minutesLabel === "1" ? "minute" : "minutes"}. Drag to wind. Scroll or pinch to zoom. Arrow keys step the time.`
                : "Terafab Terratime"
            }
            aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home Escape"
            onKeyDown={onKeyDown}
          >
            {marks !== "off"
              ? Array.from({ length: markCount }, (_, index) => {
                  const major = marks === "hours" || index % 5 === 0;
                  return (
                    <div
                      key={index}
                      className="tick-arm"
                      style={{ transform: `rotate(${index * (marks === "all" ? 6 : 30)}deg)` }}
                    >
                      <span className={major ? "tick tick-major" : "tick tick-minor"} />
                    </div>
                  );
                })
              : null}
            {numerals !== "off"
              ? ROMAN.map((roman, index) => (
                  <span
                    key={roman}
                    className="numeral"
                    style={{
                      transform: `rotate(${index * 30}deg) translateY(${
                        numeralSide === "outside"
                          ? "calc(-52cqw - var(--numeral-weight) * 0.7cqw)"
                          : "calc(-46cqw + var(--numeral-weight) * 0.7cqw)"
                      }) rotate(${index * -30}deg)`,
                    }}
                  >
                    {numerals === "roman" ? roman : index === 0 ? "12" : String(index)}
                  </span>
                ))
              : null}
            <div className="rotor rotor-hour" style={{ zIndex: stackZ.hour }}>
              <img src="/clock/hour.png?v=2" alt="" draggable={false} className="wing wing-hour" />
            </div>
            <div className="rotor rotor-minute" style={{ zIndex: stackZ.minute }}>
              <img src="/clock/minute.png?v=2" alt="" draggable={false} className="wing wing-minute" />
            </div>
            <div className="rotor rotor-second" style={{ zIndex: stackZ.second }}>
              <img src="/clock/second.png?v=2" alt="" draggable={false} className="wing wing-second" />
            </div>
            <div className="hub" />
          </div>
        </div>
      </div>

      {showUi ? <div className="top-scrim pointer-events-none absolute inset-x-0 top-0 h-40" /> : null}

      {showUi ? (
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 px-5 pt-5 sm:px-8 sm:pt-7">
        <div className="scrim-text max-w-md">
          <p className="font-display text-lg leading-none tracking-[0.12em] text-fg sm:text-2xl sm:tracking-[0.18em]">
            TERAFAB TERRATIME
          </p>
          <p className="font-mono mt-4 text-3xl leading-none text-fg tabular-nums sm:text-4xl">
            {timeText}
          </p>
          <p className="font-mono mt-2 text-xs tracking-widest text-muted tabular-nums">{dateText}</p>
          <div className="pointer-events-auto mt-4 flex min-h-11 items-center gap-3">
            {shifted ? (
              <button
                type="button"
                onClick={backToNow}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line/40 bg-bg/55 px-4 font-mono text-xs tracking-widest text-fg uppercase backdrop-blur-md"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Now
              </button>
            ) : (
              <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-muted uppercase">
                <span className="live-dot inline-block size-1.5 rounded-full bg-glow" />
                Live · scroll or pinch to zoom
              </p>
            )}
          </div>
          <p className="pointer-events-auto font-mono mt-3 text-xs tracking-widest text-muted">
            Made by{" "}
            <a
              href="https://x.com/njmarko"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-base tracking-normal text-fg italic underline decoration-line/40 underline-offset-4 hover:decoration-fg"
            >
              Marko Njegomir
            </a>
          </p>
        </div>
      </header>
      ) : null}

      <div ref={optionsRef} className="absolute right-4 bottom-4 z-20">
        {optionsOpen ? (
          <div
            className="absolute right-0 bottom-14 max-h-[min(72dvh,34rem)] w-64 overflow-y-auto overscroll-contain rounded-2xl border border-line/40 bg-bg/70 p-4 backdrop-blur-md"
            role="dialog"
            aria-label="Clock options"
          >
            <button
              type="button"
              aria-pressed={showUi}
              onClick={() => {
                if (showUi) setOptionsOpen(false);
                setShowUi((on) => !on);
              }}
              className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
            >
              <span className="font-mono text-[11px] tracking-widest text-muted uppercase">Show interface</span>
              <span className="switch" data-on={showUi ? "true" : "false"}>
                <span className="switch-knob" />
              </span>
            </button>
            <p className="font-display mt-4 text-lg leading-none tracking-widest text-fg">FACE</p>
            <button
              type="button"
              aria-pressed={fitCircle}
              onClick={() => setFitCircle((on) => !on)}
              className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 text-left"
            >
              <span className="font-mono text-[11px] tracking-widest text-muted uppercase">Fit the road</span>
              <span className="switch" data-on={fitCircle ? "true" : "false"}>
                <span className="switch-knob" />
              </span>
            </button>
            {(
              [
                ["x", "Across", 10, 90],
                ["y", "Down", 10, 90],
                ["size", "Size", 12, 70],
              ] as const
            ).map(([key, label, min, max]) => (
              <label key={key} className={fitCircle ? "mt-2 block opacity-40" : "mt-2 block"}>
                <span className="flex items-baseline justify-between font-mono text-[11px] tracking-widest text-muted uppercase">
                  {label}
                  <span className="tabular-nums text-fg">{shownFace[key].toFixed(0)}</span>
                </span>
                <input
                  className="hand-range"
                  type="range"
                  min={min}
                  max={max}
                  step={0.5}
                  disabled={fitCircle}
                  value={shownFace[key]}
                  aria-label={`Circle ${label}`}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setFace((current) => ({ ...current, [key]: value }));
                  }}
                />
              </label>
            ))}
            <p className="font-mono mt-3 text-[10px] tracking-widest text-muted uppercase">Lines</p>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {(
                [
                  ["off", "Off"],
                  ["hours", "Hours"],
                  ["all", "Both"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={marks === value}
                  onClick={() => setMarks(value)}
                  className={
                    marks === value
                      ? "min-h-11 rounded-full bg-fg font-mono text-[10px] tracking-widest text-bg uppercase"
                      : "min-h-11 rounded-full border border-line/40 font-mono text-[10px] tracking-widest text-muted uppercase"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="mt-2 flex min-h-11 items-center justify-between gap-3">
              <span className="font-mono text-[11px] tracking-widest text-muted uppercase">Line color</span>
              <input
                className="ink"
                type="color"
                value={lineColor}
                aria-label="Line color"
                onChange={(event) => setLineColor(event.target.value)}
              />
            </label>
            <label className="mt-1 block">
              <span className="flex items-baseline justify-between font-mono text-[11px] tracking-widest text-muted uppercase">
                Line thickness
                <span className="tabular-nums text-fg">{lineWeight}</span>
              </span>
              <input
                className="hand-range"
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={lineWeight}
                aria-label="Line thickness"
                onChange={(event) => setLineWeight(Number(event.target.value))}
              />
            </label>
            <p className="font-mono mt-3 text-[10px] tracking-widest text-muted uppercase">Numerals</p>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {(
                [
                  ["off", "Off"],
                  ["arabic", "12"],
                  ["roman", "XII"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={numerals === value}
                  onClick={() => setNumerals(value)}
                  className={
                    numerals === value
                      ? "min-h-11 rounded-full bg-fg font-mono text-[10px] tracking-widest text-bg uppercase"
                      : "min-h-11 rounded-full border border-line/40 font-mono text-[10px] tracking-widest text-muted uppercase"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="mt-2 flex min-h-11 items-center justify-between gap-3">
              <span className="font-mono text-[11px] tracking-widest text-muted uppercase">Numeral color</span>
              <input
                className="ink"
                type="color"
                value={numeralColor}
                aria-label="Numeral color"
                onChange={(event) => setNumeralColor(event.target.value)}
              />
            </label>
            <label className="mt-1 block">
              <span className="flex items-baseline justify-between font-mono text-[11px] tracking-widest text-muted uppercase">
                Numeral thickness
                <span className="tabular-nums text-fg">{numeralWeight}</span>
              </span>
              <input
                className="hand-range"
                type="range"
                min={3}
                max={14}
                step={0.5}
                value={numeralWeight}
                aria-label="Numeral thickness"
                onChange={(event) => setNumeralWeight(Number(event.target.value))}
              />
            </label>
            <p className="font-mono mt-3 text-[10px] tracking-widest text-muted uppercase">Place</p>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {(
                [
                  ["inside", "Inside"],
                  ["outside", "Outside"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={numeralSide === value}
                  onClick={() => setNumeralSide(value)}
                  className={
                    numeralSide === value
                      ? "min-h-11 rounded-full bg-fg font-mono text-[10px] tracking-widest text-bg uppercase"
                      : "min-h-11 rounded-full border border-line/40 font-mono text-[10px] tracking-widest text-muted uppercase"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="font-display mt-5 text-lg leading-none tracking-widest text-fg">HANDS</p>
            <button
              type="button"
              aria-pressed={autoStack}
              onClick={() => setAutoStack((on) => !on)}
              className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 text-left"
            >
              <span className="font-mono text-[11px] tracking-widest text-muted uppercase">Stack by length</span>
              <span className="switch" data-on={autoStack ? "true" : "false"}>
                <span className="switch-knob" />
              </span>
            </button>
            <p className="font-mono mt-3 text-[10px] tracking-widest text-muted uppercase">
              {autoStack ? "Shortest in front" : "Drag · top is in front"}
            </p>
            {stack.map((key) => {
              const meta = HAND_META[key];
              return (
                <div key={key} data-hand={key} className={dragging === key ? "mt-2 opacity-60" : "mt-2"}>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Reorder ${meta.label}`}
                      disabled={autoStack}
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted disabled:opacity-30"
                      onPointerDown={(event) => {
                        if (autoStack || event.button !== 0) return;
                        event.preventDefault();
                        event.currentTarget.setPointerCapture(event.pointerId);
                        draggingRef.current = key;
                        setDragging(key);
                      }}
                      onPointerMove={(event) => {
                        if (draggingRef.current !== key) return;
                        moveHand(key, event.clientY);
                      }}
                      onPointerUp={() => {
                        draggingRef.current = null;
                        setDragging(null);
                      }}
                      onPointerCancel={() => {
                        draggingRef.current = null;
                        setDragging(null);
                      }}
                    >
                      <GripVertical className="size-4" aria-hidden />
                    </button>
                    <label className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between font-mono text-[11px] tracking-widest text-muted uppercase">
                        {meta.label}
                        <span className="tabular-nums text-fg">{hands[key]}</span>
                      </span>
                      <input
                        className="hand-range"
                        type="range"
                        min={meta.min}
                        max={meta.max}
                        step={1}
                        value={hands[key]}
                        aria-label={`${meta.label} hand size`}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          setHands((current) => ({ ...current, [key]: value }));
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
            <p className="font-display mt-4 text-lg leading-none tracking-widest text-fg">BLUR</p>
            <label className="mt-3 block">
              <span className="flex items-baseline justify-between font-mono text-[11px] tracking-widest text-muted uppercase">
                Amount
                <span className="tabular-nums text-fg">{blur === 0 ? "Off" : blur}</span>
              </span>
              <input
                className="hand-range"
                type="range"
                min={0}
                max={BLUR_MAX}
                step={1}
                value={blur}
                aria-label="Blur amount"
                onChange={(event) => setBlur(Number(event.target.value))}
              />
            </label>
            <button
              type="button"
              aria-pressed={autoClear}
              onClick={() => setAutoClear((on) => !on)}
              className="mt-1 flex min-h-11 w-full items-center justify-between gap-3 text-left"
            >
              <span className="font-mono text-[11px] tracking-widest text-muted uppercase">Unblur past the photo</span>
              <span className="switch" data-on={autoClear ? "true" : "false"}>
                <span className="switch-knob" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setHands(HAND_DEFAULT);
                setOrder(DEFAULT_ORDER);
                setAutoStack(false);
                setBlur(18);
                setAutoClear(true);
                setFitCircle(true);
                setFace(ROAD);
                setMarks("all");
                setNumerals("off");
                setNumeralSide("inside");
                setLineColor(ROAD_INK);
                setNumeralColor(ROAD_INK);
                setLineWeight(LINE_WEIGHT);
                setNumeralWeight(NUMERAL_WEIGHT);
              }}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line/40 font-mono text-[11px] tracking-widest text-fg uppercase"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Reset to default
            </button>
          </div>
        ) : null}
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Clock options"
            aria-expanded={optionsOpen}
            onClick={() => setOptionsOpen((open) => !open)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line/40 bg-bg/55 text-fg backdrop-blur-md"
          >
            <Clock className="size-4" aria-hidden />
          </button>
          {showUi ? (
            <>
          <button
            type="button"
            aria-label="Zoom out"
            disabled={zoomTarget <= 0}
            onClick={() => seekZoom(targetRef.current - 0.16)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line/40 bg-bg/55 text-fg backdrop-blur-md disabled:opacity-35"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            disabled={zoomTarget >= 1}
            onClick={() => seekZoom(targetRef.current + 0.16)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line/40 bg-bg/55 text-fg backdrop-blur-md disabled:opacity-35"
          >
            <Plus className="size-4" aria-hidden />
          </button>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
