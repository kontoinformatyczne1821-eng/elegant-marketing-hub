import { writeFileSync } from "node:fs";
const path = "src/pages/Landing.tsx";
const src = readFileSync(path, "utf-8");
const marker = `      <motion.aside\n        aria-label="Nawigacja strony"\n        style={{`;
if (!src.includes(marker)) throw new Error("anchor missing");
const out = src.replace(marker, `      {/* parallax hero: wolniejsze płynięcie za schemem — dla głębi, nie dla gawędzi */}
      <motion.div
        aria-hidden="true"
        style={{
          y: useTransform(scrollYProgress, [0, 0.42], ["-6%", "6%"]),
          scale: useTransform(scrollYProgress, [0, 0.42], [1.02, 0.98]),
          filter: useTransform(scrollYProgress, [0, 0.42], ["blur(0px)", "blur(1px)"]),
        }}
        className="fixed inset-0 z-0 will-change-transform pointer-events-none"
      />

      <motion.aside
        aria-label="Nawigacja strony"
        style={{`);
writeFileSync(path, out, "utf-8");
console.log("patched hero parallax peek");
console.log("new size:", out.length);
