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

const dropped = lines.slice(startIdx, endIdx);
console.log("dropped lines:", dropped.length);

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
  '                { num: "03", label: "Walka o material', '',
];

const newLines = lines.slice(0, startIdx).concat(band, lines.slice(endIdx));
writeFileSync(path, newLines.join("\n"), "utf-8");
console.log("transition band insertion complete");
console.log("new line count:", newLines.length);
