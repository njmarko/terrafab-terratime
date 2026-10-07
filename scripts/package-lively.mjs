// dist-lively/TerraTime-Lively/ -> dist-lively/TerraTime-Lively_<lively/VERSION>.zip
// LivelyInfo.json sits at the zip root, so the zip can be dragged straight onto Lively.
// Run `npm run package:lively` (it builds first).
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const src = join(root, "dist-lively/TerraTime-Lively");
const version = readFileSync(join(root, "lively/VERSION"), "utf8").trim();
const out = join(root, `dist-lively/TerraTime-Lively_${version}.zip`);

const files = {};
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else {
      const stored = /\.(jpe?g|png|woff2?)$/i.test(name); // already compressed
      files[relative(src, path).split("\\").join("/")] = [readFileSync(path), { level: stored ? 0 : 9 }];
    }
  }
};
walk(src);
if (!files["LivelyInfo.json"] || !files["index.html"]) {
  throw new Error(`${src} is missing LivelyInfo.json or index.html; run npm run build:lively first`);
}
const zip = zipSync(files);
writeFileSync(out, zip);
console.log(`${relative(root, out)}  ${Object.keys(files).length} files  ${(zip.length / 1e6).toFixed(2)} MB`);
