/** Entry of the Lively Wallpaper build (vite.lively.config.ts); the site does not use it. */
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
// Bundled fonts (SIL OFL 1.1, licences copied next to index.html): the wallpaper works offline.
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./lively.css";
import { TerraClock, type ClockSettings } from "../src/components/terra-clock";
import { subscribeLively } from "./lively";

export function App() {
  const [settings, setSettings] = useState<Partial<ClockSettings>>();
  useEffect(() => subscribeLively(setSettings), []);
  return <TerraClock wallpaper settings={settings} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
