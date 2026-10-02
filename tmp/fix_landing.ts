import { readFileSync, writeFileSync } from "node:fs";

const path = "src/pages/Landing.tsx";
const lines = readFileSync(path, "utf-8").split("\n");

const startMarker = '<section\n        id="results"';
const endMarker = '<select name="time"';

let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (startIdx === -1 && lines[i] === startMarker) startIdx = i;
  if (lines[i].startsWith(endMarker)) endIdx = i;
}
if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
  throw new Error("marker search failed");
}

// Find the clean results block earlier in the file.
let cleanStart = -1;
let cleanEnd = -1;
for (let j = 0; j < lines.length; j++) {
  if (cleanStart === -1 && lines[j] === startMarker) cleanStart = j;
  if (lines[j].startsWith(endMarker)) {
    cleanEnd = j;
    break;
  }
}
if (cleanStart === -1 || cleanEnd === -1 || cleanStart >= cleanEnd || cleanStart >= startIdx) {
  throw new Error("clean block not found");
}
const cleanBlock = lines.slice(cleanStart, cleanEnd);
console.log("clean block lines:", cleanBlock.length);

const newLines = lines.slice(0, startIdx).concat(cleanBlock, lines.slice(endIdx));
console.log("after results replacement line count:", newLines.length);

// Transition band: insert before remaining PODZIAŁ RÓL section.
const band = [
  "",
  "      {/* SFORMATOWANY PRZEKRĘT — PRZELICZENIE Z WYNIKÓW DO RÓL KLIENTA */}",
  '      <section',
  '        id="podzial"',
  '        className="relative overflow-hidden bg-[#050507] border-t border-white/5"',
  '        style={',
  '          backgroundImage:',
  '            "radial-gradient(120% 62% at 50% -10%, rgba(255,62,10,0.14), rgba(255,62,10,0) 62%)," +',
  '            "linear-gradient(180deg, #0A0A0A 0%, #111012 38%, #050507 78%, #000000 100%)",',
  '        }',
  '      >',
  '        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-24 lg:py-36">',
  '          <Reveal>',
  '            <div className="text-center">',
  '              <div className="font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.32em] text-white/50">05 — PODZIAŁ RÓL</div>',
  '              <h2 className="mt-6 leading-[0.9] tracking-[-0.02em]">',
  '                <EditableText',
  '                  ek="qraft.podzial.h1"',
  '                  def="Dwa zakresy, jeden kompas: marzenie klienta i wynik brońcy."',
  '                  className="block font-[Cormorant_Garamond] font-light text-[30px] sm:text-[56px] leading-[1.05] tracking-[-0.02em] text-white"',
  '                  isEditing={isEditing}',
  '                  as="span"',
  '                />',
  '              </h2>',
  '              <EditableText',
  '                ek="qraft.podzial.sub"',
  '                def="Klient widzi w Ciebie noż do cięcia i garnitur do drobnego zerwania. QRAFT widzi w jego rzeczywistości krzywiznę, którą można zrobić perfekcyjnie."',
  '                className="mx-auto mt-5 block max-w-[480px] font-[Inter] font-light text-[14px] sm:text-[15px] leading-7 text-white/45"',
  '                isEditing={isEditing}',
  '                as="p"',
  '              />',
  '            </div>',
  '          </Reveal>',
  "",
  "          <Reveal delay={0.1}>",
  '            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">',
  "              {[",
  '                { num: "01", label: "Marzenie klienta", desc: "Zanim zaczniesz projekt, słyszysz rzeczywistość — jaki problem znikąd, jaki efekt kojarzy się z chwilą, kto ma w tym biznesie władzę. Marzenie określa kształt i słońce. W ten sposób światło zostaje umieszczony w już istniejącym dzienniku." },',
  '                { num: "02", label: "Ascetyzm bunka", desc: "Cena nie jest wyrokiem, lecz odpowiedzią na zasady. Niski budżet nigdy nie da dobrej rzeczy; niskie wymagania też. QRAFT nie cenimy przypadkowo, dlatego wybieramy kronikę (w prostszym języku podanej przez klienta)." },',
  '                { num: "03", label: "Walka o materiał", desc: "Pierwszy raz, gdy materiał mówi sam. QRAFT uchwycamy jej tonę, miejscówkę i smak, zanim rzucimy okienko z cienia. Od tego momentu tok faktycznych zdarzeń przyjmuje formę obrazu, którym można przyglądać się w czasie rzeczywistym." },',
  '                { num: "04", label: "Polska różnorodność", desc: "Baśnie, rytmy i kolorowe szary szachy wydzielają go z wielkiej brońcy, zostawiając nieliczne śladami. Bród rzuca się w głąb igły, podmuchy z jego powierzchni przenoszą go w błyskawiczne zakazane przez klejnoty pajęczyny." },',
  "              ].map(({ num, label, desc }) => (",
  '                <div key={num} className="rounded-[20px] border border-white/10 bg-white/[0.02] p-6">',
  '                  <div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.22em] text-white/40">{num}</div>',
  '                  <div className="mt-3 font-[Cormorant_Garamond] font-light text-[18px] leading-[1.2] text-white">{label}</div>',
  '                  <div className="mt-3 font-[Inter] font-light text-[12px] leading-[1.7] text-white/40">{desc}</div>',
  '                </div>',
  "              ))}",
  "            </div>",
  "          </Reveal>",
  "        </div>",
  "      </section>",
];

const podzialStart = newLines.findIndex((l, i, arr) => l === '<section\n        id="podzial"' && i > 0 && arr[i - 1] !== "");

if (podzialStart === -1) {
  throw new Error("PODZIAL anchor not found");
}
console.log("podzial found at:", podzialStart);

const finalLines = newLines.slice(0, podzialStart).concat(band, newLines.slice(podzialStart));
writeFileSync(path, finalLines.join("\n"), "utf-8");
console.log("write complete");
console.log("final line count:", finalLines.length);
