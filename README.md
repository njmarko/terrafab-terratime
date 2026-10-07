# Terafab Terratime

<p align="center">
  <img src="docs/terrafab-terratime.gif" alt="Terafab Terratime. The wings sweep as clock hands over a night forest, while mist fills the space above and below the photograph." width="960" />
</p>

A live analog clock set in a night forest. The hour and minute hands are the wings of the site. The second hand is a line of light. They turn over the circular road, from the full landscape down to a clock that fills the screen.

Made by [Marko Njegomir](https://x.com/njmarko).

## Using it

The clock follows your time. Drag around the dial to wind it. When the time has moved, **Now** puts it back.

| | |
| --- | --- |
| Scroll or pinch | Zoom from the whole photograph to the clock filling the view |
| Drag around the center | Wind the hands |
| ← → | Step one minute |
| ↑ ↓ | Step one hour |
| Home | Return to now |
| Clock button | Open the menu |
| Eye | Hide the interface. Click again, or press Escape, to bring it back |

When the photograph is wider than the window, the forest continues above and below as a blurred reflection. If a hand crosses that edge, the blur clears only as far as the hand reaches.

## Clock menu

- **Circle.** Keep the dial on the road, or set its position and size yourself.
- **Lines.** Hour marks, or hour and minute marks. Color and thickness.
- **Numerals.** Arabic or Roman, inside the circle or outside it. Color and thickness.
- **Hands.** Length of each hand. Drag the rows to change which hand sits in front. Or stack them by length, longest behind.
- **Glass.** Blur of the reflection, and whether a hand that leaves the photograph clears it.

**Reset to default** restores the road, the marks, and the hands.

## Lively Wallpaper

The clock also runs as a desktop wallpaper on Windows with [Lively Wallpaper](https://github.com/rocksdanister/lively). It works offline: the photograph, the hands and the fonts are inside the package.

1. Download `TerraTime-Lively_<version>.zip` from [Releases](https://github.com/njmarko/terrafab-terratime/releases).
2. Drag the zip onto the Lively window (or **Add Wallpaper** and choose the zip). Do not unzip it.
3. Set it as the wallpaper, then right-click it in the library and choose **Customise**.

Customise has:

- **View.** Zoom, from the whole photograph to the clock filling the screen. Smooth or ticking second hand (ticking redraws once a second and uses less power).
- **Header.** Show or hide the whole interface, or the title, time, date, Live line and credit one by one.
- **Face.** Lines, numerals, their color and thickness. Keep the dial on the road, or set its position and size.
- **Hands.** Length of each hand, and stacking by length.
- **Blur.** Blur of the reflection, and whether a hand that leaves the photograph clears it.

Limits:

- Lively does not pass the mouse wheel to wallpapers, so there is no wheel or pinch zoom. Use the **Zoom** slider.
- Winding the hands and the clock menu are not available on the desktop. The clock always shows your local time.
- With several monitors, use the per-monitor layout: in Lively's settings set **Placement Method** to **Screen**, so each screen gets its own clock. **Span** stretches one clock across all screens.

Instead of the package, Lively can also show the site itself as a URL wallpaper: `https://terrafab-terratime.grok.me/?wallpaper=1` hides the buttons and the menu. That needs a connection and has no Customise options.

For a Rainmeter version of the clock, see [terratime-rainmeter-desktop](https://github.com/njmarko/terratime-rainmeter-desktop).

## Run it

Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

```bash
npm run build
npm run preview
```

The Lively package is a second, separate build (`vite.lively.config.ts`, entry in `lively/`):

```bash
npm run build:lively    # dist-lively/TerraTime-Lively/ (index.html also opens in a browser)
npm run package:lively  # dist-lively/TerraTime-Lively_<version>.zip, version from lively/VERSION
```

## Stack

[React](https://react.dev) and [TanStack Start](https://tanstack.com/start), [Vite](https://vite.dev), and [Tailwind CSS](https://tailwindcss.com).
