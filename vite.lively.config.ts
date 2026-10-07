/**
 * Second build: the clock as an offline Lively Wallpaper (https://github.com/rocksdanister/lively).
 *   npm run build:lively    -> dist-lively/TerraTime-Lively/ (open index.html, or point Lively at it)
 *   npm run package:lively  -> dist-lively/TerraTime-Lively_<lively/VERSION>.zip (drag onto Lively)
 * The site build (vite.config.ts) is not affected; this entry renders only <TerraClock wallpaper>.
 */
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(root, "dist-lively/TerraTime-Lively");

/**
 * One classic (non-module) script, so index.html also loads from file:// and from
 * Lively's CefSharp player (localfolder://), not only from WebView2's https://<id>.localhost.
 */
function classicScript(): Plugin {
  return {
    name: "lively:classic-script",
    apply: "build",
    enforce: "post",
    transformIndexHtml: (html) => html.replace(/<script type="module" crossorigin/g, "<script defer"),
  };
}

/** Only the files the wallpaper needs (not all of public/), plus the Lively metadata and licences. */
function livelyFiles(): Plugin {
  const copy = (from: string, to: string) => {
    mkdirSync(dirname(join(outDir, to)), { recursive: true });
    copyFileSync(resolve(root, from), join(outDir, to));
  };
  return {
    name: "lively:files",
    apply: "build",
    writeBundle() {
      for (const f of ["bg.jpg", "hour.png", "minute.png", "second.png"]) copy(`public/clock/${f}`, `clock/${f}`);
      copy("public/favicon.svg", "favicon.svg");
      for (const f of readdirSync(resolve(root, "lively/package"))) copy(`lively/package/${f}`, f);
      copy("node_modules/@fontsource/ibm-plex-mono/LICENSE", "fonts/OFL-IBMPlexMono.txt");
      copy("node_modules/@fontsource/instrument-serif/LICENSE", "fonts/OFL-InstrumentSerif.txt");
    },
  };
}

export default defineConfig({
  root: resolve(root, "lively"),
  base: "./",
  publicDir: false,
  plugins: [tailwindcss(), react(), classicScript(), livelyFiles()],
  resolve: { alias: { "@": resolve(root, "src") } },
  build: {
    outDir,
    emptyOutDir: true,
    assetsInlineLimit: 0,
    modulePreload: false,
    rollupOptions: { output: { format: "iife" } },
  },
});
