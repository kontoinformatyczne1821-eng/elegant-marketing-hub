import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const hits: Array<{ file: string; line: number; text: string }> = [];

function scan(dir: string) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (["node_modules", "dist", "tmp", ".next", ".turbo", ".git"].includes(e.name)) continue;
      scan(join(dir, e.name));
      continue;
    }
    if (!e.name.endsWith(".tsx") && !e.name.endsWith(".ts") && !e.name.endsWith(".js") && !e.name.endsWith(".jsx")) continue;
    const p = join(dir, e.name);
    let text: string;
    try { text = readFileSync(p, "utf-8"); } catch { continue; }
    const lines = text.split("\n");
    const needles = ["Skiper30", "skiper30", "/images/lummi/img15.png", "gxuri.me", "parallax_002", "scroll down to see", "scroll Up to see", "Skiper 30"];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (needles.some(n => line.includes(n))) {
        hits.push({ file: relative(root, p), line: i + 1, text: line.trimEnd() });
      }
    }
  }
}
scan(join(root, "src"));
hits.forEach(h => console.log(`${h.file}:${h.line}\n  ${h.text}`));
console.log("TOTAL_HITS", hits.length);
if (hits.length === 0) {
  console.log("NO_SKIER_CODE_FOUND");
}
