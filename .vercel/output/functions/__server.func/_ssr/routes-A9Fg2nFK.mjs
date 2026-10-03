import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as GripVertical, i as Minus, n as RotateCcw, o as Clock, r as Plus } from "../_libs/lucide-react.mjs";
import { t as format } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-A9Fg2nFK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PHOTO = {
	w: 1872,
	h: 1056,
	cx: 944,
	cy: 518,
	r: 269
};
var TILES = 3;
var HAND_DEFAULT = {
	hour: 35,
	minute: 52,
	second: 55
};
var HAND_META = {
	second: {
		label: "Second",
		min: 10,
		max: 180,
		tip: .9472
	},
	hour: {
		label: "Hour",
		min: 10,
		max: 180,
		tip: 1
	},
	minute: {
		label: "Minute",
		min: 10,
		max: 180,
		tip: 1
	}
};
var DEFAULT_ORDER = [
	"second",
	"hour",
	"minute"
];
var ROAD_INK = "#2a3645";
var LINE_WEIGHT = 2;
var NUMERAL_WEIGHT = 7;
var BLUR_MAX = 48;
var STACK_Z = [
	8,
	3,
	2
];
var ROAD = {
	x: PHOTO.cx / PHOTO.w * 100,
	y: PHOTO.cy / PHOTO.h * 100,
	size: PHOTO.r * 2 / PHOTO.w * 100
};
var ROMAN = [
	"XII",
	"I",
	"II",
	"III",
	"IV",
	"V",
	"VI",
	"VII",
	"VIII",
	"IX",
	"X",
	"XI"
];
function dialBox(face) {
	return {
		left: `${face.x - face.size / 2}%`,
		top: `${face.y - face.size * (PHOTO.w / PHOTO.h) / 2}%`,
		width: `${face.size}%`
	};
}
function stackOrder(order, hands, auto) {
	if (!auto) return order;
	return [...order].sort((a, b) => hands[a] - hands[b] || order.indexOf(a) - order.indexOf(b));
}
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
function pointerAngle(event, el) {
	const rect = el.getBoundingClientRect();
	const dx = event.clientX - (rect.left + rect.width / 2);
	const dy = event.clientY - (rect.top + rect.height / 2);
	return Math.atan2(dx, -dy) * 180 / Math.PI;
}
function TerraClock() {
	const viewRef = (0, import_react.useRef)(null);
	const stageRef = (0, import_react.useRef)(null);
	const glassRefs = (0, import_react.useRef)([]);
	const dialRef = (0, import_react.useRef)(null);
	const optionsRef = (0, import_react.useRef)(null);
	const offsetRef = (0, import_react.useRef)(0);
	const dragRef = (0, import_react.useRef)(null);
	const zoomRef = (0, import_react.useRef)(0);
	const zoomVelRef = (0, import_react.useRef)(0);
	const targetRef = (0, import_react.useRef)(0);
	const placeRef = (0, import_react.useRef)(() => {});
	const reduceRef = (0, import_react.useRef)(false);
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const pinchRef = (0, import_react.useRef)(null);
	const [stamp, setStamp] = (0, import_react.useState)(null);
	const [shifted, setShifted] = (0, import_react.useState)(false);
	const [zoomTarget, setZoomTarget] = (0, import_react.useState)(0);
	const [optionsOpen, setOptionsOpen] = (0, import_react.useState)(false);
	const [hands, setHands] = (0, import_react.useState)(HAND_DEFAULT);
	const [order, setOrder] = (0, import_react.useState)(DEFAULT_ORDER);
	const [autoStack, setAutoStack] = (0, import_react.useState)(false);
	const [blur, setBlur] = (0, import_react.useState)(18);
	const [autoClear, setAutoClear] = (0, import_react.useState)(true);
	const [dragging, setDragging] = (0, import_react.useState)(null);
	const [fitCircle, setFitCircle] = (0, import_react.useState)(true);
	const [face, setFace] = (0, import_react.useState)(ROAD);
	const [marks, setMarks] = (0, import_react.useState)("all");
	const [numerals, setNumerals] = (0, import_react.useState)("off");
	const [numeralSide, setNumeralSide] = (0, import_react.useState)("inside");
	const [lineColor, setLineColor] = (0, import_react.useState)(ROAD_INK);
	const [numeralColor, setNumeralColor] = (0, import_react.useState)(ROAD_INK);
	const [lineWeight, setLineWeight] = (0, import_react.useState)(LINE_WEIGHT);
	const [numeralWeight, setNumeralWeight] = (0, import_react.useState)(NUMERAL_WEIGHT);
	const [showUi, setShowUi] = (0, import_react.useState)(true);
	const handsRef = (0, import_react.useRef)(HAND_DEFAULT);
	const blurRef = (0, import_react.useRef)(18);
	const autoClearRef = (0, import_react.useRef)(true);
	const anglesRef = (0, import_react.useRef)({
		hour: 0,
		minute: 0,
		second: 0
	});
	const geomRef = (0, import_react.useRef)({
		s: 1,
		stageTop: 0,
		stageH: 0
	});
	const draggingRef = (0, import_react.useRef)(null);
	handsRef.current = hands;
	blurRef.current = blur;
	autoClearRef.current = autoClear;
	const seekZoom = (value, immediate = false) => {
		const next = clamp(value, 0, 1);
		targetRef.current = next;
		setZoomTarget(next);
		if (immediate || reduceRef.current) {
			zoomVelRef.current = 0;
			zoomRef.current = next;
			placeRef.current(next);
		}
	};
	(0, import_react.useLayoutEffect)(() => {
		const dial = dialRef.current;
		const view = viewRef.current;
		const stage = stageRef.current;
		if (!dial || !view || !stage) return;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		reduceRef.current = reduce;
		let frameId = 0;
		let lastText = "";
		const place = (z) => {
			const vw = view.clientWidth;
			const vh = view.clientHeight;
			if (vw === 0 || vh === 0) return;
			const diam = PHOTO.r * 2;
			const sMin = Math.min(vw / PHOTO.w, vh / PHOTO.h);
			const s = sMin + (Math.max(sMin, Math.min(vw, vh) / diam) - sMin) * z;
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
			for (let i = 0; i < TILES; i += 1) {
				const flip = i % 2 === 0;
				for (const side of [-1, 1]) {
					const el = glassRefs.current[(side === -1 ? 0 : TILES) + i];
					if (!el) continue;
					const y = top + side * ((i + 1) * height - 2);
					const visible = y < vh && y + height > 0;
					el.style.display = visible ? "block" : "none";
					if (!visible) continue;
					el.style.left = `${left}px`;
					el.style.top = `${y}px`;
					el.style.width = `${width}px`;
					el.style.height = `${height}px`;
					el.dataset.flip = flip ? "1" : "0";
				}
			}
			geomRef.current = {
				s,
				stageTop: top,
				stageH: height
			};
			paintMasks();
		};
		const paintMasks = () => {
			const blurPx = blurRef.current;
			view.style.setProperty("--glass-blur", `${blurPx}px`);
			view.style.setProperty("--glass-scale", `${1 + blurPx / 200}`);
			view.dataset.blur = blurPx === 0 ? "0" : "1";
			const rect = dial.getBoundingClientRect();
			const centerY = rect.top + rect.height / 2;
			let radius = 0;
			if (autoClearRef.current && blurPx > 0 && rect.height > 0) Object.keys(HAND_META).forEach((key) => {
				radius = Math.max(radius, handsRef.current[key] / 100 * rect.height * HAND_META[key].tip);
			});
			const highestY = centerY - radius;
			const lowestY = centerY + radius;
			glassRefs.current.forEach((el, index) => {
				if (!el || el.style.display === "none") return;
				const maskEl = el.querySelector(".glass-mask");
				if (!maskEl) return;
				const tileTop = Number.parseFloat(el.style.top);
				const tileH = Number.parseFloat(el.style.height);
				if (!tileH) return;
				const topSide = index < TILES;
				const cut = (topSide ? highestY : lowestY) - tileTop;
				const feather = 6 / tileH;
				let mask = "none";
				if (!autoClearRef.current || blurPx <= 0 || radius <= 0) mask = "none";
				else if (topSide) {
					if (cut <= 0) mask = "linear-gradient(transparent, transparent)";
					else if (cut < tileH) {
						const t = cut / tileH;
						mask = `linear-gradient(to bottom, #000 0%, #000 ${Math.max(0, t - feather) * 100}%, transparent ${t * 100}%, transparent 100%)`;
					}
				} else if (cut >= tileH) mask = "linear-gradient(transparent, transparent)";
				else if (cut > 0) {
					const t = cut / tileH;
					const fade = Math.min(100, (t + feather) * 100);
					mask = `linear-gradient(to bottom, transparent 0%, transparent ${t * 100}%, #000 ${fade}%, #000 100%)`;
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
		const apply = (now) => {
			const ms = reduce ? 0 : now.getMilliseconds();
			const seconds = now.getSeconds() + ms / 1e3;
			const minutes = now.getMinutes() + seconds / 60;
			const hours = now.getHours() % 12 + minutes / 60;
			dial.style.setProperty("--hour", `${hours * 30}deg`);
			dial.style.setProperty("--minute", `${minutes * 6}deg`);
			dial.style.setProperty("--second", `${seconds * 6}deg`);
			anglesRef.current = {
				hour: hours * 30,
				minute: minutes * 6,
				second: seconds * 6
			};
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
				let vel = zoomVelRef.current * .88 + delta * .035;
				if (Math.abs(delta) > 25e-5 || Math.abs(vel) > 12e-5) {
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
		const onWheel = (event) => {
			event.preventDefault();
			const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? view.clientHeight : 1;
			seekZoom(targetRef.current - event.deltaY * unit / 1400);
		};
		view.addEventListener("wheel", onWheel, { passive: false });
		return () => {
			cancelAnimationFrame(frameId);
			view.removeEventListener("wheel", onWheel);
			observer.disconnect();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!optionsOpen) return;
		const onPointer = (event) => {
			if (!optionsRef.current?.contains(event.target)) setOptionsOpen(false);
		};
		const onKey = (event) => {
			if (event.key === "Escape") setOptionsOpen(false);
		};
		window.addEventListener("pointerdown", onPointer);
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("pointerdown", onPointer);
			window.removeEventListener("keydown", onKey);
		};
	}, [optionsOpen]);
	const windBy = (ms) => {
		offsetRef.current += ms;
		setShifted(Math.abs(offsetRef.current) > 800);
	};
	const backToNow = () => {
		offsetRef.current = 0;
		setShifted(false);
	};
	const onPointerDown = (event) => {
		if (event.button !== 0) return;
		pointers.current.set(event.pointerId, {
			x: event.clientX,
			y: event.clientY
		});
		event.currentTarget.setPointerCapture(event.pointerId);
		if (pointers.current.size >= 2) {
			dragRef.current = null;
			const [a, b] = [...pointers.current.values()];
			pinchRef.current = {
				dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
				zoom: zoomRef.current
			};
			return;
		}
		const dial = dialRef.current;
		if (dial?.contains(event.target)) dragRef.current = { last: pointerAngle(event, dial) };
	};
	const onPointerMove = (event) => {
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
		windBy(delta / 6 * 6e4);
	};
	const endPointer = (event) => {
		pointers.current.delete(event.pointerId);
		if (pointers.current.size < 2) pinchRef.current = null;
		if (pointers.current.size === 0) dragRef.current = null;
	};
	const onKeyDown = (event) => {
		if (event.key === "ArrowRight") {
			event.preventDefault();
			windBy(6e4);
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			windBy(-6e4);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			windBy(36e5);
		} else if (event.key === "ArrowDown") {
			event.preventDefault();
			windBy(-36e5);
		} else if (event.key === "Home" || event.key === "Escape") {
			event.preventDefault();
			backToNow();
		} else if (event.key === "+" || event.key === "=") {
			event.preventDefault();
			seekZoom(targetRef.current + .12);
		} else if (event.key === "-" || event.key === "_") {
			event.preventDefault();
			seekZoom(targetRef.current - .12);
		}
	};
	const hoursLabel = stamp ? format(stamp, "h") : "";
	const minutesLabel = stamp ? format(stamp, "m") : "";
	const timeText = stamp ? format(stamp, "HH:mm:ss") : "––:––:––";
	const dateText = stamp ? format(stamp, "EEE d MMM").toUpperCase() : "–––";
	const shownFace = fitCircle ? ROAD : face;
	const markCount = marks === "all" ? 60 : 12;
	const stack = stackOrder(order, hands, autoStack);
	const stackZ = Object.fromEntries(stack.map((key, index) => [key, STACK_Z[index]]));
	const moveHand = (key, y) => {
		setOrder((prev) => {
			const from = prev.indexOf(key);
			let to = from;
			prev.forEach((other, index) => {
				if (other === key) return;
				const row = document.querySelector(`[data-hand="${other}"]`);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: viewRef,
				className: "view",
				onPointerDown,
				onPointerMove,
				onPointerUp: endPointer,
				onPointerCancel: endPointer,
				children: [Array.from({ length: 6 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: (node) => {
						glassRefs.current[index] = node;
					},
					className: index < TILES ? "glass glass-top" : "glass glass-bottom",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/clock/bg.jpg?v=3",
						alt: "",
						draggable: false
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "glass-mask",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/clock/bg.jpg?v=3",
							alt: "",
							draggable: false,
							className: "glass-blur"
						})
					})]
				}, index)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: stageRef,
					className: "stage",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/clock/bg.jpg?v=3",
						alt: "",
						className: "photo",
						draggable: false,
						fetchPriority: "high"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: dialRef,
						className: "dial",
						style: {
							...dialBox(shownFace),
							["--hand-hour"]: `${hands.hour}cqw`,
							["--hand-minute"]: `${hands.minute}cqw`,
							["--hand-second"]: `${hands.second}cqw`,
							["--face-line"]: lineColor,
							["--face-numeral"]: numeralColor,
							["--line-weight"]: String(lineWeight),
							["--numeral-weight"]: String(numeralWeight)
						},
						tabIndex: 0,
						role: "img",
						"aria-label": stamp ? `Terafab Terratime, ${hoursLabel} ${hoursLabel === "1" ? "hour" : "hours"} ${minutesLabel} ${minutesLabel === "1" ? "minute" : "minutes"}. Drag to wind. Scroll or pinch to zoom. Arrow keys step the time.` : "Terafab Terratime",
						"aria-keyshortcuts": "ArrowLeft ArrowRight ArrowUp ArrowDown Home Escape",
						onKeyDown,
						children: [
							marks !== "off" ? Array.from({ length: markCount }, (_, index) => {
								const major = marks === "hours" || index % 5 === 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "tick-arm",
									style: { transform: `rotate(${index * (marks === "all" ? 6 : 30)}deg)` },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: major ? "tick tick-major" : "tick tick-minor" })
								}, index);
							}) : null,
							numerals !== "off" ? ROMAN.map((roman, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "numeral",
								style: { transform: `rotate(${index * 30}deg) translateY(${numeralSide === "outside" ? "calc(-52cqw - var(--numeral-weight) * 0.7cqw)" : "calc(-46cqw + var(--numeral-weight) * 0.7cqw)"}) rotate(${index * -30}deg)` },
								children: numerals === "roman" ? roman : index === 0 ? "12" : String(index)
							}, roman)) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rotor rotor-hour",
								style: { zIndex: stackZ.hour },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/clock/hour.png?v=2",
									alt: "",
									draggable: false,
									className: "wing wing-hour"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rotor rotor-minute",
								style: { zIndex: stackZ.minute },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/clock/minute.png?v=2",
									alt: "",
									draggable: false,
									className: "wing wing-minute"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rotor rotor-second",
								style: { zIndex: stackZ.second },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/clock/second.png?v=2",
									alt: "",
									draggable: false,
									className: "wing wing-second"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hub" })
						]
					})]
				})]
			}),
			showUi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "top-scrim pointer-events-none absolute inset-x-0 top-0 h-40" }) : null,
			showUi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-10 px-5 pt-5 sm:px-8 sm:pt-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "scrim-text max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg leading-none tracking-[0.12em] text-fg sm:text-2xl sm:tracking-[0.18em]",
							children: "TERAFAB TERRATIME"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono mt-4 text-3xl leading-none text-fg tabular-nums sm:text-4xl",
							children: timeText
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono mt-2 text-xs tracking-widest text-muted tabular-nums",
							children: dateText
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-auto mt-4 flex min-h-11 items-center gap-3",
							children: shifted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: backToNow,
								className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line/40 bg-bg/55 px-4 font-mono text-xs tracking-widest text-fg uppercase backdrop-blur-md",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
									className: "size-3.5",
									"aria-hidden": true
								}), "Now"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 font-mono text-xs tracking-widest text-muted uppercase",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot inline-block size-1.5 rounded-full bg-glow" }), "Live · scroll or pinch to zoom"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "pointer-events-auto font-mono mt-3 text-xs tracking-widest text-muted",
							children: [
								"Made by",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "https://x.com/njmarko",
									target: "_blank",
									rel: "noopener noreferrer",
									className: "font-display text-base tracking-normal text-fg italic underline decoration-line/40 underline-offset-4 hover:decoration-fg",
									children: "Marko Njegomir"
								})
							]
						})
					]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: optionsRef,
				className: "absolute right-4 bottom-4 z-20",
				children: [optionsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute right-0 bottom-14 max-h-[min(72dvh,34rem)] w-64 overflow-y-auto overscroll-contain rounded-2xl border border-line/40 bg-bg/70 p-4 backdrop-blur-md",
					role: "dialog",
					"aria-label": "Clock options",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": showUi,
							onClick: () => {
								if (showUi) setOptionsOpen(false);
								setShowUi((on) => !on);
							},
							className: "flex min-h-11 w-full items-center justify-between gap-3 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] tracking-widest text-muted uppercase",
								children: "Show interface"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "switch",
								"data-on": showUi ? "true" : "false",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "switch-knob" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display mt-4 text-lg leading-none tracking-widest text-fg",
							children: "FACE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": fitCircle,
							onClick: () => setFitCircle((on) => !on),
							className: "mt-3 flex min-h-11 w-full items-center justify-between gap-3 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] tracking-widest text-muted uppercase",
								children: "Fit the road"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "switch",
								"data-on": fitCircle ? "true" : "false",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "switch-knob" })
							})]
						}),
						[
							[
								"x",
								"Across",
								10,
								90
							],
							[
								"y",
								"Down",
								10,
								90
							],
							[
								"size",
								"Size",
								12,
								70
							]
						].map(([key, label, min, max]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: fitCircle ? "mt-2 block opacity-40" : "mt-2 block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between font-mono text-[11px] tracking-widest text-muted uppercase",
								children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-fg",
									children: shownFace[key].toFixed(0)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "hand-range",
								type: "range",
								min,
								max,
								step: .5,
								disabled: fitCircle,
								value: shownFace[key],
								"aria-label": `Circle ${label}`,
								onChange: (event) => {
									const value = Number(event.target.value);
									setFace((current) => ({
										...current,
										[key]: value
									}));
								}
							})]
						}, key)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono mt-3 text-[10px] tracking-widest text-muted uppercase",
							children: "Lines"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 grid grid-cols-3 gap-1",
							children: [
								["off", "Off"],
								["hours", "Hours"],
								["all", "Both"]
							].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": marks === value,
								onClick: () => setMarks(value),
								className: marks === value ? "min-h-11 rounded-full bg-fg font-mono text-[10px] tracking-widest text-bg uppercase" : "min-h-11 rounded-full border border-line/40 font-mono text-[10px] tracking-widest text-muted uppercase",
								children: label
							}, value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-2 flex min-h-11 items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] tracking-widest text-muted uppercase",
								children: "Line color"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "ink",
								type: "color",
								value: lineColor,
								"aria-label": "Line color",
								onChange: (event) => setLineColor(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-1 block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between font-mono text-[11px] tracking-widest text-muted uppercase",
								children: ["Line thickness", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-fg",
									children: lineWeight
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "hand-range",
								type: "range",
								min: 1,
								max: 10,
								step: .5,
								value: lineWeight,
								"aria-label": "Line thickness",
								onChange: (event) => setLineWeight(Number(event.target.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono mt-3 text-[10px] tracking-widest text-muted uppercase",
							children: "Numerals"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 grid grid-cols-3 gap-1",
							children: [
								["off", "Off"],
								["arabic", "12"],
								["roman", "XII"]
							].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": numerals === value,
								onClick: () => setNumerals(value),
								className: numerals === value ? "min-h-11 rounded-full bg-fg font-mono text-[10px] tracking-widest text-bg uppercase" : "min-h-11 rounded-full border border-line/40 font-mono text-[10px] tracking-widest text-muted uppercase",
								children: label
							}, value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-2 flex min-h-11 items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] tracking-widest text-muted uppercase",
								children: "Numeral color"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "ink",
								type: "color",
								value: numeralColor,
								"aria-label": "Numeral color",
								onChange: (event) => setNumeralColor(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-1 block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between font-mono text-[11px] tracking-widest text-muted uppercase",
								children: ["Numeral thickness", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-fg",
									children: numeralWeight
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "hand-range",
								type: "range",
								min: 3,
								max: 14,
								step: .5,
								value: numeralWeight,
								"aria-label": "Numeral thickness",
								onChange: (event) => setNumeralWeight(Number(event.target.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono mt-3 text-[10px] tracking-widest text-muted uppercase",
							children: "Place"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 grid grid-cols-2 gap-1",
							children: [["inside", "Inside"], ["outside", "Outside"]].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": numeralSide === value,
								onClick: () => setNumeralSide(value),
								className: numeralSide === value ? "min-h-11 rounded-full bg-fg font-mono text-[10px] tracking-widest text-bg uppercase" : "min-h-11 rounded-full border border-line/40 font-mono text-[10px] tracking-widest text-muted uppercase",
								children: label
							}, value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display mt-5 text-lg leading-none tracking-widest text-fg",
							children: "HANDS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": autoStack,
							onClick: () => setAutoStack((on) => !on),
							className: "mt-3 flex min-h-11 w-full items-center justify-between gap-3 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] tracking-widest text-muted uppercase",
								children: "Stack by length"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "switch",
								"data-on": autoStack ? "true" : "false",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "switch-knob" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono mt-3 text-[10px] tracking-widest text-muted uppercase",
							children: autoStack ? "Shortest in front" : "Drag · top is in front"
						}),
						stack.map((key) => {
							const meta = HAND_META[key];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-hand": key,
								className: dragging === key ? "mt-2 opacity-60" : "mt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": `Reorder ${meta.label}`,
										disabled: autoStack,
										className: "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted disabled:opacity-30",
										onPointerDown: (event) => {
											if (autoStack || event.button !== 0) return;
											event.preventDefault();
											event.currentTarget.setPointerCapture(event.pointerId);
											draggingRef.current = key;
											setDragging(key);
										},
										onPointerMove: (event) => {
											if (draggingRef.current !== key) return;
											moveHand(key, event.clientY);
										},
										onPointerUp: () => {
											draggingRef.current = null;
											setDragging(null);
										},
										onPointerCancel: () => {
											draggingRef.current = null;
											setDragging(null);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, {
											className: "size-4",
											"aria-hidden": true
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-baseline justify-between font-mono text-[11px] tracking-widest text-muted uppercase",
											children: [meta.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "tabular-nums text-fg",
												children: hands[key]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "hand-range",
											type: "range",
											min: meta.min,
											max: meta.max,
											step: 1,
											value: hands[key],
											"aria-label": `${meta.label} hand size`,
											onChange: (event) => {
												const value = Number(event.target.value);
												setHands((current) => ({
													...current,
													[key]: value
												}));
											}
										})]
									})]
								})
							}, key);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display mt-4 text-lg leading-none tracking-widest text-fg",
							children: "BLUR"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between font-mono text-[11px] tracking-widest text-muted uppercase",
								children: ["Amount", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-fg",
									children: blur === 0 ? "Off" : blur
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "hand-range",
								type: "range",
								min: 0,
								max: BLUR_MAX,
								step: 1,
								value: blur,
								"aria-label": "Blur amount",
								onChange: (event) => setBlur(Number(event.target.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": autoClear,
							onClick: () => setAutoClear((on) => !on),
							className: "mt-1 flex min-h-11 w-full items-center justify-between gap-3 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] tracking-widest text-muted uppercase",
								children: "Unblur past the photo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "switch",
								"data-on": autoClear ? "true" : "false",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "switch-knob" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
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
							},
							className: "mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line/40 font-mono text-[11px] tracking-widest text-fg uppercase",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
								className: "size-3.5",
								"aria-hidden": true
							}), "Reset to default"]
						})
					]
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Clock options",
						"aria-expanded": optionsOpen,
						onClick: () => setOptionsOpen((open) => !open),
						className: "inline-flex size-11 items-center justify-center rounded-full border border-line/40 bg-bg/55 text-fg backdrop-blur-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
							className: "size-4",
							"aria-hidden": true
						})
					}), showUi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Zoom out",
						disabled: zoomTarget <= 0,
						onClick: () => seekZoom(targetRef.current - .16),
						className: "inline-flex size-11 items-center justify-center rounded-full border border-line/40 bg-bg/55 text-fg backdrop-blur-md disabled:opacity-35",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
							className: "size-4",
							"aria-hidden": true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Zoom in",
						disabled: zoomTarget >= 1,
						onClick: () => seekZoom(targetRef.current + .16),
						className: "inline-flex size-11 items-center justify-center rounded-full border border-line/40 bg-bg/55 text-fg backdrop-blur-md disabled:opacity-35",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "size-4",
							"aria-hidden": true
						})
					})] }) : null]
				})]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerraClock, {});
}
//#endregion
export { Home as component };
