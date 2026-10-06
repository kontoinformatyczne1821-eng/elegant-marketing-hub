import { motion, AnimatePresence, useScroll, useSpring, useTransform, useInView, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Check, Minus, Plus, Clock, Terminal, Pencil, Save, RefreshCw, Quote, Handshake, Megaphone } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Lenis from "lenis";
import { useNavigate } from "react-router";
import { ClearField, DigitChars, PopNumber, SlidingTabs, TextSwap, usePopIn } from "@/components/transitions";
import GradualBlur from "@/components/GradualBlur";
import LineSidebar from "@/components/LineSidebar";
import QraftMark from "@/components/QraftMark";
import GlowCursor from "@/components/GlowCursor";
import PixelTrail from "@/components/PixelTrail";
import StaggeredMenu from "@/components/StaggeredMenu";
import AeroShards from "@/components/AeroShards";
import StarField from "@/components/StarField";
import { Volume2, VolumeX } from "lucide-react";
import { setMuted, sfxConfirm, sfxPop, sfxTap, sfxWhoosh, unlockAudio } from "@/lib/sound";
import type { StaggeredMenuItem } from "@/components/StaggeredMenu";

const REDUCE_MOTION =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* PixelTrail (WebGL) ma sens tylko przy myszy/trackpadzie — na dotyku nie */
function useFinePointer() {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () =>
      typeof window !== "undefined" &&
      !!window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => false,
  );
}

/* Płynny scroll strony: Lenis prowadzi okno z lekkim wybieganiem (lerp) zamiast skoków kółka.
   Dotyk zostaje natywny, a przy prefers-reduced-motion w ogóle go nie włączamy. */
const lenisRef: { current: InstanceType<typeof Lenis> | null } = { current: null };

function useLenis() {
  useEffect(() => {
    if (REDUCE_MOTION || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const lenis = new Lenis({ lerp: 0.09 });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);
}

function EditableText({ ek, def, className, as: Tag = "span", isEditing, pop, popKey }: { ek: string; def: string; className?: string; as?: any; isEditing: boolean; pop?: boolean; popKey?: string }) {
  const [val, setVal] = useState(def);
  const popRef = usePopIn<HTMLSpanElement>([val, popKey], popKey !== "off");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ek);
      if (saved !== null) setVal(saved);
    } catch {}
  }, [ek]);
  /* ten sam klucz może być widoczny w dwóch miejscach (np. przód/tył kafla)
     — po zmianie rozsyłamy nową wartość do wszystkich instancji */
  useEffect(() => {
    const sync = (e: Event) => {
      const d = (e as CustomEvent<{ ek: string; val: string }>).detail;
      if (d && d.ek === ek) setVal(d.val);
    };
    window.addEventListener("qraft:text", sync);
    return () => window.removeEventListener("qraft:text", sync);
  }, [ek]);
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const t = e.currentTarget.textContent || "";
    setVal(t);
    try { localStorage.setItem(ek, t); } catch {}
    window.dispatchEvent(new CustomEvent("qraft:text", { detail: { ek, val: t } }));
  };
  if (!isEditing && pop && /\d/.test(val))
    return (
      <span ref={popRef} className={`t-digit-group ${className || ""}`}>
        <DigitChars text={val}/>

      </span>
    );
  if (!isEditing) return <Tag className={className}>{val}</Tag>;
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`${className || ""} outline-dashed outline-1 outline-white/30 hover:outline-white/50 cursor-text rounded-[6px] px-1 -mx-1 focus:outline-solid focus:outline-white/60 focus:bg-white/[0.06] transition-colors`}
    >
      {val}
    </Tag>
  );
}

/* ---------- KALKULATOR — trzy pytania, jeden szacunek ---------- */

const EST_SIZE = [
  { id: "1", label: "1–5" },
  { id: "6", label: "6–20" },
  { id: "21", label: "21–50" },
  { id: "50", label: "50+" },
] as const;

const EST_NEEDS = [
  { id: "marka", label: "Marka i szyld" },
  { id: "strona", label: "Strona / rezerwacje" },
  { id: "pozyskiwanie", label: "Pozyskiwanie klientów" },
  { id: "tresc", label: "Treść: foto & film" },
  { id: "kampanie", label: "Kampanie i mailing" },
  { id: "retencja", label: "Opinie i powroty" },
] as const;

const EST_TERM = [
  { id: "3", label: "3 mies." },
  { id: "6", label: "6 mies." },
  { id: "12", label: "12 mies." },
] as const;

const NEED_WEIGHT: Record<(typeof EST_NEEDS)[number]["id"], number> = {
  marka: 0.3,
  strona: 0.8,
  pozyskiwanie: 1.1,
  tresc: 0.5,
  kampanie: 0.7,
  retencja: 0.6,
};

function estimateClients(sizeId: string, needs: string[], termId: string): number {
  const sizeMul = sizeId === "1" ? 0.8 : sizeId === "6" ? 1 : sizeId === "21" ? 1.3 : 1.6;
  const termMul = termId === "3" ? 1 : termId === "6" ? 1.8 : 3;
  const weight = needs.reduce((acc, id) => acc + (NEED_WEIGHT[id as keyof typeof NEED_WEIGHT] ?? 0), 0);
  const raw = (2.2 + weight * 4.2) * sizeMul * termMul;
  return Math.max(1, Math.round(raw));
}

const computeBrief = (
  sizeLabel: string,
  needLabels: string,
  termLabel: string,
  clients: number,
): string => `KALKULATOR: firma ${sizeLabel} os., potrzeby: ${needLabels}, czas: ${termLabel}, szacunek ~${clients} dodatkowych klientów/mies.`;



/* okienko audytu — wybór usługi przesuwa pasek */
const auditServices = [
  { id: "audyt", label: "AUDYT", note: "bezpłatny · 20 min", items: ["Ogląd firmy z zewnątrza", "Pierwsza największa dźwignia", "Lista rzeczy do naprawy"] },
  { id: "essence", label: "ESSENCE", note: "wycena po audycie", items: ["Uporządkowanie marki", "Strona + Mapy", "Opieka i raport"] },
  { id: "signature", label: "SIGNATURE", note: "wycena po audycie", items: ["Wszystko z Essence", "Zasięg + płatne w promieniu", "Silnik treści + lista"] },
  { id: "prestige", label: "PRESTIGE", note: "wycena po audycie", items: ["Od zera", "Atelier foto & film", "Sprinty co tydzień"] },
];

/* 1 baner = 1 etap procesu */
const processSteps = [
  { n: "01", t: "Audyt — 20 min", d: "Oglądamy Twoją firmę z zewnątrza i wskazujemy pierwszą największą dźwignię.", meta: "Dzień 1" },
  { n: "02", t: "Blueprint — 1 strona", d: "Pozycjonowanie dla Twojej okolicy, oferta i plan na 90 dni.", meta: "Dzień 7" },
  { n: "03", t: "Budowa — 2–3 tyg.", d: "Tożsamość, strona i materiały — wszystko mówi tym samym głosem.", meta: "Dzień 10–28" },
  { n: "04", t: "Skalowanie — co tydzień", d: "Raport w złotówkach. Co działa, dostajemy więcej.", meta: "Co poniedziałek" },
];

function BtnPrimary({ children, onClick, className = "", type = "button" }: { children: React.ReactNode; onClick?: () => void; className?: string; type?: "button" | "submit" }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full border font-[JetBrains_Mono] font-light tracking-[0.14em] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${className}`}
      style={{ borderColor: hover ? "#ffffff" : "rgba(255,255,255,0.32)", color: hover ? "#000000" : "#ffffff" }}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-white origin-left"
        initial={false}
        animate={{ scaleX: hover ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
     />

      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

function BtnGhost({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-full border backdrop-blur font-[JetBrains_Mono] font-light tracking-[0.14em] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors duration-300 ${className}`}
      style={{
        borderColor: hover ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.16)",
        backgroundColor: hover ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.02)",
        color: hover ? "#ffffff" : "rgba(255,255,255,0.62)",
      }}
    >
      {children}
    </button>
  );
}

function BtnDark({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full border font-[JetBrains_Mono] font-light tracking-[0.14em] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black/40 ${className}`}
      style={{ borderColor: hover ? "#000000" : "rgba(0,0,0,0.22)", color: hover ? "#ffffff" : "#000000" }}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-black origin-left"
        initial={false}
        animate={{ scaleX: hover ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
     />

      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

function Reveal({ children, delay=0, y=18 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-12%" }} transition={{ duration: 0.9, delay, ease: [0.22,1,0.36,1] }}>{children}</motion.div>
  );
}

function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [v, setV] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1500;
    const tick = (now: number) => {
      const pr = Math.min(1, (now - start) / dur);
      setV(to * (1 - Math.pow(1 - pr, 3)));
      if (pr < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  /* pop-in fires once, the moment the counter lands on its final value */
  useEffect(() => {
    if (!inView || !done) return;
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-animating");
    void el.offsetWidth;
    el.classList.add("is-animating");
  }, [inView, done]);
  return (
    <span ref={ref} className="t-digit-group">
      <DigitChars
        text={
          v.toLocaleString("pl-PL", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }) + suffix
        }
     />

    </span>
  );
}

const GLASS_SKIN = {
  dark: {
    bg: "linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 55%), rgba(10,10,13,0.36)",
    border: "1px solid rgba(255,255,255,0.16)",
    shadow:
      "inset 0 1px 1px rgba(255,255,255,0.30), inset 0 -1px 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.35)",
    ring: "border-white/50",
    sheen:
      "conic-gradient(from 200deg, transparent 0deg, rgba(255,255,255,0.55) 18deg, transparent 46deg)",
    arrow: "text-white/70",
    glow: "drop-shadow(0 0 8px rgba(255,255,255,0.45))",
  },
  /* proces: ciemniejsze szklo z chlodnym, niebieskim akcentem */
  light: {
    bg: "linear-gradient(160deg, rgba(255,255,255,0.46), rgba(255,255,255,0.12) 55%), rgba(24,36,72,0.14)",
    border: "1px solid rgba(37,99,235,0.34)",
    shadow:
      "inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -1px 1px rgba(10,10,10,0.04), 0 10px 30px rgba(23,52,140,0.16)",
    ring: "border-[#3B82F6]/50",
    sheen:
      "conic-gradient(from 200deg, transparent 0deg, rgba(59,130,246,0.85) 24deg, transparent 54deg)",
    arrow: "text-[#2563EB]",
    glow: "drop-shadow(0 0 9px rgba(37,99,235,0.45))",
  },
} as const;

function GlassArrow({
  dir,
  onClick,
  label,
  className = "",
  axis = "x",
  tone = "dark",
}: {
  dir: 1 | -1;
  onClick: () => void;
  label: string;
  className?: string;
  axis?: "x" | "y";
  tone?: "dark" | "light";
}) {
  const [pressing, setPressing] = useState(false);
  const [burst, setBurst] = useState(0);
  const skin = GLASS_SKIN[tone];
  const fire = () => {
    onClick();
    setBurst((b) => b + 1);
  };
  const Icon =                    axis === "y" ? (dir === 1 ? ArrowDown : ArrowUp) : dir === 1 ? ArrowRight : ArrowLeft;
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={fire}
      onPointerDown={() => setPressing(true)}
      onPointerUp={() => setPressing(false)}
      onPointerLeave={() => setPressing(false)}
      className={`z-30 h-12 w-12 place-items-center rounded-full overflow-hidden cursor-pointer ${className}`}
      style={{
        pointerEvents: "auto",
        background: skin.bg,
        border: skin.border,
        boxShadow: skin.shadow,
        backdropFilter: "blur(18px) saturate(1.5)",
        WebkitBackdropFilter: "blur(18px) saturate(1.5)",
      }}
      animate={{ scale: pressing ? 0.88 : 1 }}
      transition={{ type: "spring", stiffness: 480, damping: 24 }}
    >
      {/* fala po kliknięciu */}
      {burst > 0 && (
        <motion.span
          key={burst}
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-full border ${skin.ring}`}
          initial={{ opacity: 0.85, scale: 0.35 }}
          animate={{ opacity: 0, scale: 1.65 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
       />

      )}
      {/* błysk na obręczy */}
      {burst > 0 && (
        <motion.span
          key={`sheen-${burst}`}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: skin.sheen }}
          initial={{ rotate: 0, opacity: 0.9 }}
          animate={{ rotate: 360, opacity: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
       />

      )}
      {/* strzałka wysuwa się w kierunku podróży */}
      <motion.span
        aria-hidden
        className={`relative z-10 grid place-items-center ${skin.arrow}`}
        animate={{
          x: axis === "x" ? (pressing ? dir * 5 : 0) : 0,
          y: axis === "y" ? (pressing ? dir * 5 : 0) : 0,
        }}
        transition={{ type: "spring", stiffness: 520, damping: 18 }}
        style={{ filter: skin.glow }}
      >
        <Icon className="h-4 w-4" />


      </motion.span>
    </motion.button>
  );
}

/* --------- proces: banery zawieszone na podświetlanej linii -------- */
/* transitions.dev "Banner stacking" — 1 baner = 1 etap. Nowy baner    */
/* wjeżdża ruchem tostownika (rise + blur + scale), starsze cofają się  */
/* w głąb, czwarty wychodzi. Sterowanie: strzałki góra/dół + kropki.    */

function ProcessStack({ isEditing, onZoneChange }: { isEditing: boolean; onZoneChange?: (inside: boolean) => void }) {
  const n = processSteps.length;
  const [active, setActive] = useState(0);
  const [entering, setEntering] = useState<number | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const mod = (i: number) => ((i % n) + n) % n;

  const step = (target: number, dir: 1 | -1) => {
    const next = mod(target);
    if (next === active) return;
    setEntering(dir === 1 ? next : null);
    setActive(next);
  };


  /* wypłukaj stan spoczynkowy, potem puść go w tym samym ticku —
     rAF zostałby pominięty przy throttlowaniu zegara i baner wjechałby bez ruchu */
  useLayoutEffect(() => {
    if (entering === null) return;
    const el = stackRef.current?.querySelector<HTMLElement>(`[data-step="${entering}"]`);
    if (!el) return;
    el.classList.add("is-enter");
    void el.offsetWidth;
    el.classList.remove("is-enter");
  }, [entering, active]);

  return (
    <div
      className="grid lg:grid-cols-[360px_1fr] gap-12"
      onPointerEnter={() => onZoneChange?.(true)}
      onPointerLeave={() => onZoneChange?.(false)}
    >
      <div className="lg:sticky lg:top-28 self-start">
        <div className="font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.18em] text-black/30">02 — PROCES</div>
        <h3 className="mt-4 font-[Cormorant_Garamond] font-light text-[26px] sm:text-[30px] lg:text-[44px] leading-[0.9] tracking-[-0.02em]">
          <EditableText ek="qraft.process.h1" def="Cztery tygodnie" className="block font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />


          <EditableText ek="qraft.process.h2" def="do rozpędu." className="block font-[Cormorant_Garamond] font-light italic text-black/30" isEditing={isEditing} as="span" />


        </h3>
        <EditableText ek="qraft.process.desc" def="Otwarty proces. Cotygodniowe dowody. Bez teatru." className="mt-5 block font-[Inter] font-light text-[15px] sm:text-[17px] leading-8 text-black/75" isEditing={isEditing} as="p" />



        <div className="mt-10 flex items-center gap-3">
          <GlassArrow
            dir={-1}
            axis="y"
            tone="light"
            onClick={() => step(active - 1, -1)}
            label="Poprzedni etap"
            className="hidden sm:grid"
         />

          <GlassArrow
            dir={1}
            axis="y"
            tone="light"
            onClick={() => step(active + 1, 1)}
            label="Następny etap"
            className="hidden sm:grid"
         />

          <div className="ml-1 flex items-baseline gap-2 font-[JetBrains_Mono] font-light text-[11px] sm:text-[12px] tracking-[0.16em] text-black/50">
            ETAP
            <PopNumber text={`0${active + 1}`} className="text-black/70" />


            <span className="opacity-50">/ 0{n}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 sm:gap-6 lg:gap-10">
        {/* czarna podświetlana kreska z 4 punktami */}
        <div className="relative w-6 shrink-0">
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-black/12" />


          <motion.div
            className="absolute left-1/2 top-0 w-[2px] -translate-x-1/2 rounded-full bg-black"
            initial={false}
            animate={{ height: `${(active / (n - 1)) * 100}%` }}
            transition={{ type: "spring", stiffness: 110, damping: 18 }}
            style={{ boxShadow: "0 0 16px 3px rgba(0,0,0,0.30)" }}
         />

          <div className="relative flex h-full flex-col items-center justify-between py-[7px]">
            {processSteps.map((s, i) => (
              <button
                key={s.n}
                onClick={() => step(i, mod(i - active) <= n / 2 ? 1 : -1)}
                aria-label={`Etap ${s.n}`}
                className="grid place-items-center outline-none"
              >
                <span
                  className="block rounded-full transition-all duration-500"
                  style={{
                    width: i === active ? 13 : 8,
                    height: i === active ? 13 : 8,
                    /* lewarek nie koloruje się na kolor sekcji — działa na każdej barwie tła */
                    backgroundColor: i <= active ? "#0a0a0a" : "transparent",
                    border: `1px solid ${i <= active ? "#0a0a0a" : "rgba(0,0,0,0.28)"}`,
                    boxShadow: i === active ? "0 0 18px 4px rgba(0,0,0,0.30)" : "none",
                  }}
               />

              </button>
            ))}
          </div>
        </div>

        {/* stos banerów */}
        <div className="relative flex-1">
          <div ref={stackRef} className="t-stack t-stack--steps absolute inset-x-0 bottom-0 h-[318px] sm:h-[392px]">
            {processSteps.map((s, i) => {
              const d = mod(active - i);
              const front = d === 0;
              return (
                <div
                  key={s.n}
                  data-step={i}
                  data-depth={d === 3 ? 2 : d}
                  onClick={() => {
                    if (front && !isEditing && window.matchMedia("(hover: none)").matches) {
                      sfxPop();
                      step(active + 1, 1);
                    }
                  }}
                  className={`t-stack-banner h-[236px] sm:h-[292px] w-full rounded-[20px] sm:rounded-[24px] border p-5 sm:p-7 lg:p-8 flex flex-col ${
                    front
                      ? "bg-[#F9F5EF] border-black/12 text-black shadow-[0_24px_60px_rgba(0,0,0,0.14)]"
                      : "bg-[#F2ECE4]/85 border-black/[0.09] text-black/90 backdrop-blur-xl"
                  } ${d === 3 ? "is-leaving" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-[JetBrains_Mono] font-light text-[11px] sm:text-[12px] tracking-[0.16em] opacity-70">
                      {s.n}
                    </span>
                    <span className="font-[JetBrains_Mono] font-light text-[11px] sm:text-[12px] tracking-[0.12em] opacity-90">
                      {s.meta}
                    </span>
                  </div>
                  <h4 className="mt-3 sm:mt-6 font-[Cormorant_Garamond] font-light text-[20px] sm:text-[23px] lg:text-[38px] leading-[1.02] tracking-[-0.02em]">
                    <EditableText
                      ek={`qraft.process.${i}.title`}
                      def={s.t}
                      className="font-[Cormorant_Garamond] font-light"
                      isEditing={isEditing}
                      as="span"
                   />

                  </h4>
                  <EditableText
                    ek={`qraft.process.${i}.desc`}
                    def={s.d}
                    className="mt-3 sm:mt-5 block font-[Inter] font-light text-[13px] sm:text-[17px] leading-6 sm:leading-8 opacity-100 line-clamp-3 sm:line-clamp-none"
                    isEditing={isEditing}
                    as="p"
                 />

                  <div className="mt-auto">
                    <div className="flex gap-2">
                      {processSteps.map((_, k) => (
                        <span
                          key={k}
                          className="h-[3px] flex-1 rounded-full transition-colors duration-500"
                          style={{ backgroundColor: k <= active ? "#0a0a0a" : "rgba(0,0,0,0.12)" }}
                       />

                      ))}
                    </div>
                    {front && (
                      <div className="mt-3 hidden items-center justify-between gap-3 pointer-coarse:flex">
                        <span className="font-[JetBrains_Mono] font-light text-[8.5px] tracking-[0.14em] text-black/35">
                          TAPNIJ — NASTĘPNY ETAP
                        </span>
                        <ArrowRight className="h-3 w-3 text-black/40" />


                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------- tło: czarne łuki ze światłem ---------------- */
/* Wektor odwzorowujący motyw zdjęcia: ciemne wstęgi płynące przez
   kadr z białymi konturami i poświatą. Parallax sprężynowy — tło nie
   skacze przy scrollu, tylko się przeciąga za nim.
   Podmiana na oryginalne zdjęcie: wpisz ścieżkę w FLOW_BG_SRC. */

const FLOW_BG_SRC = "";

function FlowArt() {
  /* na dotyku pomijamy filtry SVG (feGaussianBlur) — to najdroższa część tła */
  const light = typeof window !== "undefined" &&
    !!window.matchMedia &&
    !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  return (
    <svg
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="qSheen" x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />


          <stop offset="26%" stopColor="#cfcfcf" stopOpacity="0.26" />


          <stop offset="48%" stopColor="#ffffff" stopOpacity="0.7" />


          <stop offset="62%" stopColor="#8e8e8e" stopOpacity="0.32" />


          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />


        </linearGradient>
        <linearGradient id="qSheenSoft" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />


          <stop offset="34%" stopColor="#6f6f74" stopOpacity="0.5" />


          <stop offset="58%" stopColor="#b9b9be" stopOpacity="0.75" />


          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />


        </linearGradient>
        <radialGradient id="qLamp" cx="62%" cy="34%" r="52%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />


          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.05" />


          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />


        </radialGradient>
        <filter id="qSoft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="26" />


        </filter>
        <filter id="qGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" result="b" />


          <feMerge>
            <feMergeNode in="b" />


            <feMergeNode in="b" />


            <feMergeNode in="SourceGraphic" />


          </feMerge>
        </filter>
      </defs>

      <rect width="1920" height="1080" fill="#050507" />


      <rect width="1920" height="1080" fill="url(#qLamp)" />



      <g fill="none" strokeLinecap="round" filter={light ? undefined : "url(#qSoft)"}>
        <path d="M -260 830 C 240 1250, 1120 1230, 2180 630" stroke="url(#qSheenSoft)" strokeWidth="300" opacity="0.5" />


        <path d="M -260 630 C 220 1090, 1080 1050, 2180 440" stroke="url(#qSheenSoft)" strokeWidth="180" opacity="0.55" />


        <path d="M -260 440 C 200 910, 1040 860, 2180 260" stroke="url(#qSheen)" strokeWidth="86" opacity="0.6" />


        <path d="M -260 255 C 240 710, 1000 630, 2180 70" stroke="url(#qSheen)" strokeWidth="34" opacity="0.7" />


      </g>

      <g fill="none" strokeLinecap="round" filter="url(#qGlow)">
        <path d="M -260 120 C 260 520, 940 470, 2180 -40" stroke="url(#qSheen)" strokeWidth="3.5" />


        <path d="M -260 255 C 240 710, 1000 630, 2180 70" stroke="url(#qSheen)" strokeWidth="2.4" opacity="0.9" />


        <path d="M -260 440 C 200 910, 1040 860, 2180 260" stroke="url(#qSheen)" strokeWidth="2" opacity="0.7" />


        <path d="M -260 630 C 220 1090, 1080 1050, 2180 440" stroke="url(#qSheen)" strokeWidth="1.6" opacity="0.5" />


      </g>

      <g fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.12">
        <path d="M -260 60 C 280 430, 980 380, 2180 -110" />


        <path d="M -260 700 C 240 1160, 1100 1120, 2180 510" />


        <path d="M -260 900 C 260 1300, 1140 1290, 2180 700" />


      </g>
    </svg>
  );
}

/** true, gdy strona jest przesunięta do samego końca — blur dolny
 *  wtedy się wyłącza, żeby stopka pozostała w pełni czytelna. */
function useAtPageEnd(threshold = 24) {
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        setAtEnd(window.innerHeight + window.scrollY >= doc.scrollHeight - threshold);
      });
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [threshold]);
  return atEnd;
}

/* pozycje bocznego paska nawigacji */
const SIDEBAR = [
  { label: "KALKULATOR", id: "services" },
  { label: "ATELIER", id: "atelier" },
  { label: "PROCES", id: "process" },
  { label: "FAQ", id: "faq" },
  { label: "KONTAKT", id: "contact" },
];
const SIDEBAR_IDS = SIDEBAR.map((s) => s.id);

/* menu z boku: kolejność zgodna z ławkiem bocznym */
const MENU_ITEMS: StaggeredMenuItem[] = [
  { label: "Kalkulator", ariaLabel: "Przejdź do sekcji KALKULATOR", link: "#services" },
  { label: "Atelier", ariaLabel: "Przejdź do sekcji ATELIER", link: "#atelier" },
  { label: "Proces", ariaLabel: "Przejdź do sekcji PROCES", link: "#process" },
  { label: "FAQ", ariaLabel: "Przejdź do sekcji FAQ", link: "#faq" },
  { label: "Kontakt", ariaLabel: "Przejdź do sekcji KONTAKT", link: "#contact" },
];

/** Scroll-spy: numer sekcji, ktora jest teraz na srodku ekranu. */
function useSectionSpy(ids: string[]) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const check = () => {
      const line = window.innerHeight * 0.45;
      let idx = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) idx = i;
      });
      setActive(idx);
    };
    /* scroll bywa gąsty — liczymy pozycje najwyżej raz na klatkę */
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);
  return active;
}

function FlowBackdrop() {
  const { scrollYProgress } = useScroll();
  /* niska sprężystość = tło ciągnie się za scrollem zamiast skakać */
  const p = useSpring(scrollYProgress, { stiffness: 40, damping: 16, mass: 0.8 });
  /* na dotyku mniejszy zakres ruchu = mniej podpikselowych repointów tła */
  const fineBg = typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const y = useTransform(p, [0, 1], ["0%", fineBg ? "-30%" : "-18%"]);
  const x = useTransform(p, [0, 1], ["0%", fineBg ? "-11%" : "-6%"]);
  const scale = useTransform(p, [0, 1], [fineBg ? 1.08 : 1.05, fineBg ? 1.36 : 1.2]);
  const rotate = useTransform(p, [0, 1], ["0deg", fineBg ? "-2.6deg" : "-1.6deg"]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050507]">
      <motion.div
        className="absolute inset-[-14%] will-change-transform"
        style={{ y, x, scale, rotate }}
      >
        {FLOW_BG_SRC ? (
          <img src={FLOW_BG_SRC} alt="" className="h-full w-full object-cover" />


        ) : (
          <FlowArt/>

        )}
      </motion.div>
      
      {/* siatka 88px to druga warstwa repaintu przy scrollu — tylko desktop */}
      <div
        className="absolute inset-0 opacity-[0.03] hidden lg:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
     />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 95% at 50% 0%, transparent 35%, rgba(5,5,7,0.72) 100%)",
        }}
     />

    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [form, setForm] = useState({
    name: "",
    business: "",
    email: "",
    phone: "",
    service: "audyt",
    date: "",
    time: "10:30",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  /* w sekcji PROCES tło jest jasne — kursor przechodzi na czarne światło */
  const [inProcess, setInProcess] = useState(false);
  const darkCursor = inProcess;
  const atPageEnd = useAtPageEnd();
  /* ikona głośnika musi się odświeża, więc stan trzymamy w Reaccie */
  const [soundOn, setSoundOn] = useState(true);
  /* przeglądarki wymagają geścia, zanim puszcza źdźwięk */
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
  /* ślad pikselowy w hero ma sens tylko dla myszy/trackpada */
  const finePointer = useFinePointer();
  const spy = useSectionSpy(SIDEBAR_IDS);
  /* płynny, sprzężony scroll strony (Lenis) — kotwice i CTA korzystają z jego API */
  useLenis();
  /* SYSTEM: to samo pole odłamków co w MANIFEŚCIE, wygaszone pod kafle */
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesNear = useInView(servicesRef, { once: true, margin: "35%" });
  /* MANIFEST: pole odłamków (WebGPU) montujemy dopiero, gdy sekcja zbliża się do ekranu */
  const manifestRef = useRef<HTMLElement>(null);
  const manifestNear = useInView(manifestRef, { once: true, margin: "35%" });
  /* bez WebGPU chowamy płótno i zostawiamy samo tło gradientowe */
  const [shardsFailed, setShardsFailed] = useState(false);
  /* KALKULATOR: 3 pytania → szacunek dodatkowych klientów */
  const [estSize, setEstSize] = useState<string>("6");
  const [estNeeds, setEstNeeds] = useState<string[]>(["pozyskiwanie"]);
  const [estTerm, setEstTerm] = useState<string>("6");
  const estClients = useMemo(
    () => estimateClients(estSize, estNeeds, estTerm),
    [estSize, estNeeds, estTerm],
  );
  const toggleEstNeed = (id: string) => {
    sfxTap();
    setEstNeeds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  /* brief z kalkulatora trafia do pola „co chcesz poprawić” */
  const [briefed, setBriefed] = useState(false);
  const [contactMe, setContactMe] = useState(true);
  const cinemaRef = useRef<HTMLElement>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const { scrollYProgress: cinemaProgress } = useScroll({ target: cinemaRef, offset: ["start end", "end start"] });
  const cinemaYRaw = useTransform(cinemaProgress, [0, 1], ["-14%", "14%"]);
  /* gwiazda „spada” wraz ze scrollem: większy zakres + sprężyna wygładza skoki Lenisa */
  const cinemaY = useSpring(cinemaYRaw, { stiffness: 140, damping: 26, mass: 0.4 });
  const progress = useTransform(scrollYProgress, [0,1], [0,1]);
  /* pasek boczny pokazuje się po kliknięciu Q w nagłówku */
  const [navOpen, setNavOpen] = useState(false);
  const navTarget = useMotionValue(0);
  const navFade = useSpring(navTarget, { stiffness: 120, damping: 28 });
  useEffect(() => {
    navTarget.set(navOpen ? 1 : 0);
  }, [navOpen, navTarget]);
  const navShift = useTransform(navFade, [0, 1], [-26, 0]);
  const navBlur = useTransform(navFade, [0, 1], [14, 0]);
  /* górny pasek chowa się przy jeździe w dół i wraca przy powrocie */
  const [barHidden, setBarHidden] = useState(false);
  const barHiddenRef = useRef(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    let next = barHiddenRef.current;
    if (y < 140) next = false;
    else if (y > prev + 6) next = true;
    else if (y < prev - 6) next = false;
    if (next !== barHiddenRef.current) {
      barHiddenRef.current = next;
      setBarHidden(next);
    }
  });

  /* pozycje z menu z boku: sekcje przewijamy gładko, /auth przez router */
  const handleMenuItem = (_index: number, item: StaggeredMenuItem) => {
    if (item.link === "/auth") {
      navigate("/auth");
      return;
    }
    go(item.link.replace("#", ""));
  };
  const go = (id: string) => {
    sfxWhoosh(true);
    const target = document.getElementById(id);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target ?? 0, { duration: 1.5 });
      return;
    }
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  /* KALKULATOR → KONTAKT: brief z szacunku trafia do pola „co chcesz poprawić",
     a stronę przewijamy na dół, do formularza z checkboxem kontaktu */
  const goContact = () => {
    sfxTap();
    const sizeLabel = EST_SIZE.find((s) => s.id === estSize)?.label ?? estSize;
    const termLabel = EST_TERM.find((t) => t.id === estTerm)?.label ?? estTerm;
    const needLabels =
      estNeeds
        .map((id) => EST_NEEDS.find((n) => n.id === id)?.label ?? "")
        .filter(Boolean)
        .join(", ") || "—";
    setForm((f) => ({ ...f, message: computeBrief(sizeLabel, needLabels, termLabel, estClients) }));
    setBriefed(true);
    go("contact");
  };
  /* wysyłka: telefon wymagany; checkbox decyduje o treści potwierdzenia */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone) return;
    sfxConfirm();
    setSent(true);
  };

  const svc = auditServices.find((s) => s.id === form.service) || auditServices[0];

  return (
    <div className="min-h-screen text-[#F2F2F0] antialiased selection:bg-white selection:text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@300;400&display=swap'); html{scroll-behavior:smooth} @keyframes qmarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}} @keyframes qmsheen{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}} @keyframes qmbreathe{0%,100%{opacity:.35}50%{opacity:.9}}`}</style>
      <motion.div className="fixed top-0 inset-x-0 h-[1px] bg-white/80 z-50 origin-left" style={{ scaleX: progress }}/>

      <FlowBackdrop/>

      <GradualBlur
        target="page"
        position="bottom"
        height={finePointer ? "8rem" : "5rem"}
        strength={finePointer ? 3 : 1.5}
        divCount={finePointer ? 10 : 3}
        curve="bezier"
        exponential={false}
        /* na samym dole strony gasniemy, żeby stopka nie zniknęła w rozmazie */
        opacity={atPageEnd ? 0 : 1}
        animated="scroll"
        duration="0.4s"
        easing="ease-out"
        style={{ zIndex: 30 }}
     />


      {/* globalny, świecący kursor — zmienia barwę przy sekcji procesu */}
      <GlowCursor
        globalPointer
        enabled={finePointer && !REDUCE_MOTION}
        color={darkCursor ? "#0a0a0a" : "#ffffff"}
        secondaryColor={darkCursor ? "#3c3e3d" : "#c9c9cf"}
        trailLength={38}
        trailWidth={6}
        trailTaper={0.82}
        followSpeed={0.16}
        glowIntensity={1.7}
        glowSpread={1.15}
        hotspot={darkCursor ? 0.05 : 0.7}
        brightness={darkCursor ? 0.9 : 1.2}
        opacity={darkCursor ? 0.42 : 0.5}
        pulseSpeed={1.1}
        noiseStrength={0.03}
        idleFade
        idleTimeout={700}
        fadeDuration={600}
        blendMode={darkCursor ? "normal" : "screen"}
        maxDevicePixelRatio={1.25}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 60,
          pointerEvents: "none",
        }}
     />


      {/* boczny pasek nawigacji (LineSidebar) — otwiera go kliknięcie Q w nagłówku */}
      <div className="hidden min-[1640px]:block fixed left-3 top-1/2 z-40 -translate-y-1/2">
        <motion.aside
          aria-label="Nawigacja strony"
          style={{
            opacity: navFade,
            x: navShift,
            filter: navBlur,
            pointerEvents: navOpen ? "auto" : "none",
            background: inProcess ? "rgba(232,232,228,0.55)" : "rgba(12,12,15,0.34)",
            borderColor: inProcess ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.10)",
            boxShadow: inProcess
              ? "inset 0 1px 1px rgba(255,255,255,0.75), 0 22px 60px rgba(0,0,0,0.16)"
              : "inset 0 1px 1px rgba(255,255,255,0.08), 0 22px 60px rgba(0,0,0,0.45)",
          }}
          className="flex w-[176px] flex-col rounded-[28px] border px-6 py-7 backdrop-blur-[28px] backdrop-saturate-[1.5]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-3">
              <QraftMark className={inProcess ? "text-black" : "text-white"} height={19}/>

              <span
                className={`font-[JetBrains_Mono] font-light text-[7px] sm:text-[8px] leading-[1.7] tracking-[0.2em] ${
                  inProcess ? "text-black/40" : "text-white/30"
                }`}
              >
                PRECISION
                <br/>

                BUILDS BRANDS
              </span>
            </div>
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border font-[Instrument_Serif] text-[12px] sm:text-[13px] ${
                inProcess ? "border-black/15 text-black/70" : "border-white/12 text-white/70"
              }`}
            >
              Q
            </span>
          </div>

          <div className={`my-6 h-px w-full ${inProcess ? "bg-black/10" : "bg-white/10"}`}/>


          <LineSidebar
            items={SIDEBAR.map((x) => x.label)}
            active={spy}
            onItemClick={(i) => { sfxTap(); go(SIDEBAR[i].id); }}
            accentColor="#FF3E0A"
            textColor={inProcess ? "rgba(10,10,10,0.45)" : "rgba(242,242,240,0.42)"}
            markerColor={inProcess ? "rgba(10,10,10,0.22)" : "rgba(255,255,255,0.16)"}
            showIndex
            proximityRadius={90}
            maxShift={14}
            markerLength={34}
            itemGap={15}
            fontSize={0.66}
            smoothing={120}
            className="font-[JetBrains_Mono] font-light tracking-[0.16em]"
         />


          <div className={`my-6 h-px w-full ${inProcess ? "bg-black/10" : "bg-white/10"}`}/>


          <button
            onClick={() => go("contact")}
            className={`flex items-center justify-between font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.18em] transition-opacity duration-300 hover:opacity-100 ${
              inProcess ? "text-black/60" : "text-white/45"
            }`}
          >
            ZACZNIJMY
            <ArrowUpRight className="h-3.5 w-3.5" />


          </button>
        </motion.aside>
      </div>


      <motion.header
        animate={{ y: barHidden && !isEditing ? "-104%" : "0%" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 bg-[#050507]/28 backdrop-blur-[28px] backdrop-saturate-[1.5] border-b border-white/[0.08] supports-[backdrop-filter]:bg-[#050507]/20" style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" } as any}>
        <div className="mx-auto max-w-[1280px] pl-6 pr-[150px] lg:pl-8 lg:pr-[220px] h-[72px] flex items-center justify-between">
          <motion.div
            animate={{ y: barHidden ? 12 : 0, opacity: barHidden ? 0 : 1 }}
            transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <button
              onClick={()=>{ sfxWhoosh(!navOpen); setNavOpen((v)=>!v); }}
              aria-label={navOpen ? "Ukryj nawigację" : "Pokaż nawigację"}
              aria-expanded={navOpen}
              className={`h-[32px] w-[32px] rounded-[10px] border grid place-items-center cursor-pointer transition-all duration-300 ${navOpen ? "bg-white text-black border-white" : "border-white/15 bg-white/[0.02] hover:border-white/45 hover:bg-white/[0.08]"}`}
            >
              <span className="font-[Instrument_Serif] text-[14.5px] sm:text-[16px]">Q</span>
            </button>
            <button onClick={()=>lenisRef.current ? lenisRef.current.scrollTo(0,{duration:1.5}) : window.scrollTo({top:0,behavior:"smooth"})} className="flex items-center gap-4 cursor-pointer">
              <span className="font-[Instrument_Serif] font-light tracking-[0.28em] text-[11px] sm:text-[12px]">QRAFT</span>
              <span className="hidden lg:inline font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.18em] text-white/25 border-l border-white/10 pl-4 ml-1">PERFEKCJA BUDUJE MARKI</span>
            </button>
          </motion.div>
          <motion.div
            animate={{ y: barHidden ? 12 : 0, opacity: barHidden ? 0 : 1 }}
            transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            <button
              onClick={()=>setIsEditing(!isEditing)}
              className={`hidden lg:inline-flex items-center gap-2 px-4 h-9 rounded-full border font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.12em] transition-all duration-500 backdrop-blur ${isEditing ? "bg-white text-black border-white" : "border-white/15 bg-white/[0.02] text-white/60 hover:border-white/45 hover:bg-white/[0.08] hover:text-white"}`}
            >
              {isEditing ? <><Save className="h-3.5 w-3.5" />
 ZAKOŃCZ EDYCJĘ</> : <><Pencil className="h-3.5 w-3.5" />
 EDYTUJ TEKSTY</>}
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.14em] text-white/20"><Terminal className="h-3 w-3 opacity-60" />
 qraft.build</span>
            <button
              onClick={() => { const next = !soundOn; setSoundOn(next); setMuted(!next); if (next) sfxTap(); }}
              aria-label={soundOn ? "Wycisz dźwięki" : "Włącz dźwięki"}
              aria-pressed={!soundOn}
              className="hidden sm:grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.02] text-white/55 transition-colors duration-300 hover:border-white/45 hover:text-white"
            >
              {soundOn ? <Volume2 className="h-3.5 w-3.5" />

 : <VolumeX className="h-3.5 w-3.5" />

}
            </button>
            <BtnPrimary onClick={()=>go("contact")} className="hidden sm:inline-flex text-[10px] sm:text-[11px] tracking-[0.16em] px-6 h-9">ROZPOCZNIJ</BtnPrimary>
          </motion.div>
        </div>
      </motion.header>

      {/* menu z boku — zastąpiło górne linki i mobilny dropdown */}
      <StaggeredMenu
        isFixed
        position="right"
        items={MENU_ITEMS}
        displaySocials={false}
        displayItemNumbering
        colors={["#07070A", "#1F0B03", "#5C1A05", "#FF3E0A"]}
        accentColor="#FF3E0A"
        menuButtonColor="#F2F2F0"
        openMenuButtonColor="#FF3E0A"
        changeMenuColorOnOpen
        closeOnClickAway
        onMenuOpen={() => sfxWhoosh(true)}
        onMenuClose={() => sfxWhoosh(false)}
        onItemClick={handleMenuItem}
     />


      {isEditing && (
        <div className="sticky top-[72px] z-30 bg-[#111113] border-y border-white/10 text-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.04em] text-white/70">
              <Pencil className="h-3.5 w-3.5 text-white/50" />
 Tryb edycji — kliknij w dowolny tekst, aby go zmienić. Zapis automatyczny w przeglądarce.
            </div>
            <button onClick={()=>setIsEditing(false)} className="hidden sm:inline-flex bg-white text-black font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.08em] px-4 h-7 rounded-full">GOTOWE</button>
          </div>
        </div>
      )}

      <section ref={cinemaRef} className="relative overflow-hidden">
        {/* jedna duża fotografia gór — parallax przez całą sekcję */}
        <div className="absolute inset-0">
          <motion.div style={{ y: cinemaY }} className="absolute inset-0 scale-[1.35]">
            <img
              src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2000&q=80&auto=format&fit=crop"
              alt="Góra pod gwiazdami nocą"
              className="h-full w-full object-cover grayscale contrast-110 brightness-[0.38]"
           />

          </motion.div>

          <motion.div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(5,5,7,0.50) 0%, transparent 34%, transparent 76%, rgba(5,5,7,0.55) 91%, #050507 100%)" }}
            animate={{ opacity: [0.55, 0.85, 0.55] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
         />

          <motion.div
            className="absolute -left-1/4 top-1/3 h-[46vh] w-[160%] opacity-40"
            style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.10), transparent 72%)", filter: "blur(30px)" }}
            animate={{ x: ["-8%", "8%", "-8%"] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
         />

        </div>

        <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_6%,transparent_0%,rgba(5,5,7,0.30)_64%,rgba(5,5,7,0.88)_100%)]" />


        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "88px 88px" }}/>


        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-[-10%] h-[120%] w-px -translate-x-1/2 bg-white/90 shadow-[0_0_30px_5px_rgba(255,255,255,0.6),0_0_110px_24px_rgba(255,255,255,0.24)]" />


          <motion.div
            className="absolute left-1/2 top-0 h-full w-[420px] -translate-x-1/2"
            style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.24) 50%, rgba(255,255,255,0.08) 60%, transparent)" }}
            animate={{ opacity: [0.28, 0.8, 0.28] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
         />

          <motion.div
            className="absolute left-1/2 top-0 h-[32%] w-[680px] -translate-x-1/2"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)" }}
            animate={{ y: ["0%", "212%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
         />

        </div>

        {/* pixelowy ślad kursora w hero — tylko dla myszy/trackpada */}
        {finePointer && (
          <div className="absolute inset-0 z-[5] hidden sm:block mix-blend-screen">
            <PixelTrail
              gridSize={80}
              trailSize={0.09}
              maxAge={520}
              interpolate={5}
              color="#ffffff"
              gooeyFilter={{ id: "qraft-goo", strength: 2.4 }}
              canvasProps={{ dpr: [1, 1.25] }}
              style={{ touchAction: "auto" }}
           />

          </div>
        )}

        {/* content */}
        <div className="relative z-10 mx-auto max-w-[1280px] px-6 lg:px-8 pointer-events-none">
          <div className="flex min-h-[calc(100svh-72px)] flex-col justify-center py-16 sm:py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-[Cormorant_Garamond] font-light uppercase leading-[0.86] tracking-[0.01em] text-[clamp(26px,7.8vw,106px)]">
                <span className="block text-white">Precision</span>
                <span className="block text-white">Builds</span>
                <span className="block text-transparent" style={{ WebkitTextStroke: "1.2px rgba(255,255,255,0.6)" }}>
                  Brands
                </span>
              </h1>

              <motion.div
                className="mt-8 sm:mt-12 h-px w-full bg-white origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
             />


              <motion.div
                className="mt-6 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.6 }}
              >
                <BtnPrimary onClick={() => go("contact")} className="h-[52px] px-8 text-[10px] sm:text-[11px] pointer-events-auto">
                  ZAMÓW DARMOWY AUDYT <ArrowRight className="h-3.5 w-3.5 opacity-60" />


                </BtnPrimary>
                <BtnGhost onClick={() => go("services")} className="h-[52px] pl-2 pr-6 text-[10px] sm:text-[11px] pointer-events-auto">
                  <span className="h-9 w-9 grid place-items-center rounded-full border border-white/15 transition-colors duration-300 group-hover:bg-white/10">
                    <ArrowUpRight className="h-3.5 w-3.5" />


                  </span>
                  POLICZ KLIENTÓW
                </BtnGhost>
              </motion.div>

              <motion.div
                className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.8 }}
              >
                {[
                  { v: <CountUp to={340} suffix="+" />

, l: "Zbudowanych" },
                  { v: <CountUp to={4.9} decimals={1}/>
, l: "Ocena" },
                  { v: <CountUp to={14} suffix=" mies." />

, l: "Średnio" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-[Cormorant_Garamond] font-light text-[22px] sm:text-[26px] leading-none">{s.v}</div>
                    <div className="mt-2 font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.14em] text-white/55">{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
        {/* dołek HERO: tło wygasa w czerń + wspólny rejestr 1px na granicy z SYSTEM */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-40 sm:h-64"
          style={{
            backgroundImage:
              "linear-gradient(0deg, #050507 0%, rgba(5,5,7,0.86) 30%, rgba(5,5,7,0.45) 62%, rgba(5,5,7,0) 100%)",
          }}
       />

        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-px bg-white/10" />


      </section>

      {/* SYSTEM na polu odłamków — to samo „kosmiczne" tło co w MANIFEŚCIE,
          tylko ciszej: wolniejsze, rzadsze i z miękkimi maskami, by kafle czytały się jak na dłoni */}
      <div ref={servicesRef} className="relative isolate">
        {/* całe tło wyłączone: sekcja przykrywa FlowBackdrop, zostają tylko gwiazdy */}
        <div aria-hidden="true" className="absolute inset-0 z-0 bg-[#050507]" />


        {servicesNear && !shardsFailed && (
          <StarField className="absolute inset-0 z-0 h-full w-full" />


        )}
        {/* wejście w pole: maska kończy się wcześniej, by 1px hero został widoczny */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 sm:h-64"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(5,5,7,0.92) 0%, rgba(5,5,7,0.4) 46%, rgba(5,5,7,0) 100%)",
          }}
       />

        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px bg-white/10" />


        <section id="services" className="relative z-10 mx-auto max-w-[1280px] px-6 lg:px-8 pt-20 lg:pt-28 pb-16 lg:pb-32">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/[0.06] pb-12 lg:pb-16">
            <div>
              <div className="font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.2em] text-white/50">01 — KALKULATOR</div>
              <h2 className="mt-5 leading-[0.9] tracking-[-0.02em]">
                <EditableText ek="qraft.system.h1" def="Ilu klientów możesz dorzucić?" className="block font-[Cormorant_Garamond] font-light text-[26px] sm:text-[52px]" isEditing={isEditing} as="span" />


              </h2>
            </div>
            <EditableText
              ek="qraft.system.subtitle"
              def="Trzy pytania. Jeden szacunek dodatkowych klientów miesięcznie. Bez zapisów, bez zobowiązań — policz, a potem zapytaj o audyt."
              className="max-w-[460px] font-[Inter] font-light text-[14.5px] sm:text-[16px] leading-8 text-white/45"
              isEditing={isEditing}
              as="p"
           />          </div>
        </Reveal>

        {/* KALKULATOR: trzy pytania → szacunek dodatkowych klientów */}
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          {/* pytania */}
          <div className="space-y-7 rounded-[26px] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-9" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 24px 70px rgba(0,0,0,0.4)" }}>
            {/* 1 — jak duża jest firma */}
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] text-white/45">01 — JAK DUŻA JEST FIRMA?</span>
                <span className="font-[JetBrains_Mono] font-light text-[9px] tracking-[0.14em] text-white/20">LICZBA OSÓB</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {EST_SIZE.map((s) => {
                  const on = estSize === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { sfxTap(); setEstSize(s.id); }}
                      aria-pressed={on}
                      className={`h-12 cursor-pointer rounded-full border font-[JetBrains_Mono] font-light text-[11px] tracking-[0.14em] transition-all duration-300 ${
                        on
                          ? "border-white bg-white text-black"
                          : "border-white/12 bg-white/[0.02] text-white/50 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2 — czego potrzebujesz */}
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] text-white/45">02 — CZEGO POTRZEBUJESZ?</span>
                <span className="font-[JetBrains_Mono] font-light text-[9px] tracking-[0.14em] text-white/20">WYBIERZ DOWOLNIE</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {EST_NEEDS.map((n) => {
                  const on = estNeeds.includes(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => toggleEstNeed(n.id)}
                      aria-pressed={on}
                      className={`inline-flex h-10 items-center gap-2 rounded-full border px-5 font-[JetBrains_Mono] font-light text-[10px] tracking-[0.14em] transition-all duration-300 ${
                        on
                          ? "border-[#7DF0AE]/60 bg-[#7DF0AE]/12 text-[#9BF3C0]"
                          : "border-white/12 bg-white/[0.02] text-white/45 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${on ? "bg-[#7DF0AE]" : "bg-white/25"}`} />

                      {n.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 — na ile chcesz współpracować */}
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] text-white/45">03 — NA JAK DŁUGO WSPÓŁPRACA?</span>
                <span className="font-[JetBrains_Mono] font-light text-[9px] tracking-[0.14em] text-white/20">BEZ WYŁĄCZNOŚCI</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {EST_TERM.map((t) => {
                  const on = estTerm === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { sfxTap(); setEstTerm(t.id); }}
                      aria-pressed={on}
                      className={`h-12 cursor-pointer rounded-full border font-[JetBrains_Mono] font-light text-[11px] tracking-[0.14em] transition-all duration-300 ${
                        on
                          ? "border-white bg-white text-black"
                          : "border-white/12 bg-white/[0.02] text-white/50 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* wynik — szacunek dodatkowych klientów */}
          <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.02] p-6 sm:p-8" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 24px 70px rgba(0,0,0,0.4)" }}>
            <motion.div
              key={`glow-${estClients}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(90% 60% at 50% 110%, rgba(255,62,10,0.16), rgba(255,62,10,0) 70%)" }}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />

            <div className="relative flex h-full flex-col">
              <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] text-white/45">TWÓJ SZACUNEK</span>
              <div className="mt-3 flex items-start">
                <span className="mt-3 font-[Cormorant_Garamond] font-light italic text-[30px] sm:text-[42px] leading-none text-white/40">~</span>
                <PopNumber
                  text={String(estClients)}
                  className="font-[Cormorant_Garamond] font-light leading-[0.85] tracking-[-0.02em] text-white text-[72px] sm:text-[96px]"
                />
              </div>
              <div className="mt-5 font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] leading-[1.7] tracking-[0.16em] text-white/45">
                DODATKOWYCH KLIENTÓW
                <br />

                KAŻDEGO MIESIĄCA
              </div>
              <p className="mt-5 font-[Inter] font-light text-[13px] leading-6 text-white/45">
                Liczba jest ostrożna — zakłada start od 90 dni i Twoje rzemiosło bez zmian. Resztę doprecyzujemy na audycie.
              </p>
              <div className="mt-auto pt-8">
                <BtnPrimary onClick={goContact} className="h-[52px] w-full px-6 text-[10px] sm:text-[11px]">
                  POPROŚ O AUDYT <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </BtnPrimary>
                <p className="mt-3 text-center font-[JetBrains_Mono] font-light text-[8.5px] tracking-[0.14em] text-white/25">
                  PRZEWINIEMY CIĘ DO FORMULARZA
                </p>
              </div>
            </div>
          </div>
        </div>


        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 sm:h-56" style={{ backgroundImage: "linear-gradient(180deg, rgba(5,5,7,0) 0%, rgba(5,5,7,0.55) 45%, #050507 100%)" }} />

        <div className="mt-10 flex flex-col sm:flex-row justify-between gap-4 font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px]">
          <EditableText ek="qraft.system.footerL" def="OTWARTE DLA KAŻDEGO KLIENTA." className="text-white/20 tracking-[0.08em]" isEditing={isEditing} as="span" />


          <BtnGhost onClick={()=>go("contact")} className="h-11 px-6 text-[10px] sm:text-[11px]">
            <EditableText ek="qraft.system.footerR" def="DIAGNOSTYKA →" className="font-[JetBrains_Mono] font-light tracking-[0.14em]" isEditing={isEditing} as="span" />
</BtnGhost>
        </div>
      </section>
      </div>

      {/* SPECJALIZACJA: pracujemy wyłącznie B2B — czarna wstawka między SYSTEMEM a MANIFESTEM, styki czarne na czarne */}
      <section id="b2b" className="relative bg-[#050507]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(64% 42% at 50% 0%, rgba(255,255,255,0.045), transparent 70%)" }}
       />

        <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <Reveal>
              <div className="font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.2em] text-white/50">
                DLACZEGO QRAFT
              </div>
              <h2 className="mt-5 leading-[0.92] tracking-[-0.02em]">
                <EditableText ek="qraft.b2b.h1" def="Biznes do biznesu." className="block font-[Cormorant_Garamond] font-light text-[26px] sm:text-[52px]" isEditing={isEditing} as="span" />


                <EditableText ek="qraft.b2b.h2" def="i nic więcej." className="block font-[Cormorant_Garamond] font-light italic text-white/40 text-[26px] sm:text-[52px]" isEditing={isEditing} as="span" />


              </h2>
              <EditableText
                ek="qraft.b2b.desc"
                def="QRAFT pracuje wyłącznie w modelu B2B. Naszym klientem jest firma — restauracja, gabinet, studio, warsztat — a nie przypadkowy przechodzień. Dlatego mówimy językiem przychodów, marży i wracających klientów, a nie lajków i zasięgów dla samych zasięgów."
                className="mt-6 block max-w-[460px] font-[Inter] font-light text-[14.5px] sm:text-[16px] leading-8 text-white/45"
                isEditing={isEditing}
                as="p"
             />

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#7DF0AE]/40 bg-[#7DF0AE]/10 px-4 py-2 font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.16em] text-[#9BF3C0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7DF0AE]" />


                  <EditableText ek="qraft.b2b.chip1" def="B2B — NASZ TEREN" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" />


                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.16em] text-white/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/25" />


                  <EditableText ek="qraft.b2b.chip2" def="B2C — NIE PRACUJEMY" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" />


                </span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <ul
                className="divide-y divide-white/[0.06] overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.02]"
                style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.25)" }}
              >
                {[
                  ["Decydent po drugiej stronie", "Rozmawiamy z właścicielem lub zarządem — nie z przypadkowym konsumentem."],
                  ["Cel mierzalny", "Rezerwacje, zamówienia, powracający klienci — nie lajki i puste zasięgi."],
                  ["Lokalna przewaga", "Mapy, lokalne SEO i kampanie w promieniu — tam, gdzie szuka klient Twojego biznesu."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex items-start gap-4 p-5 sm:p-6">
                    <span className="mt-0.5 h-8 w-8 shrink-0 grid place-items-center rounded-full border border-white/10 text-white/40">
                      <Check className="h-3.5 w-3.5" />


                    </span>
                    <div>
                      <EditableText ek={`qraft.b2b.${i}.t`} def={t} className="block font-[Cormorant_Garamond] font-light text-[17px] sm:text-[19px] leading-none tracking-[-0.01em]" isEditing={isEditing} as="span" />


                      <EditableText ek={`qraft.b2b.${i}.d`} def={d} className="mt-2 block font-[Inter] font-light text-[13px] sm:text-[13.5px] leading-6 text-white/50" isEditing={isEditing} as="span" />


                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* MANIFEST — cała sekcja poświęcona jednej myśli; tło: pole odłamków (AeroShards, WebGPU) */}
      <section
        ref={manifestRef}
        id="manifest"
        className="relative isolate flex min-h-[540px] items-center overflow-hidden sm:min-h-[660px] lg:min-h-[760px]"
      >
        {/* zapasowe tło: zostaje widoczne, gdy przeglądarka nie ma WebGPU */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #050507 0%, rgba(5,5,7,0) 22%, rgba(5,5,7,0) 78%, #050507 100%)",
          }}
       />

        {manifestNear && !shardsFailed && (
          <div className="absolute inset-0 pointer-events-none">
            <AeroShards
              backgroundColor="#050507"
              shardColor="#8E8A96"
              accentColor="#FF3E0A"
              placement="full"
              flow="stream"
              material="pearl"
              detail="balanced"
              effect="none"
              scale={1}
              spread={0.95}
              depth={1}
              speed={0.75}
              spin={0.8}
              interaction="repel"
              density={finePointer ? 1.15 : 0.8}
              shardSize={1.05}
              stretch={1}
              turbulence={1}
              glow={1}
              bloom={finePointer ? 0.5 : 0.35}
              grain={0.045}
              interactionRadius={1.4}
              interactionStrength={0.45}
              rippleIntensity={0.9}
              onError={() => setShardsFailed(true)}
           />

          </div>
        )}

        {/* płynne wejście i wyjście: pole odłamków wnika w tło strony zamiast zaczynać się cięciem */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-44 sm:h-64"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #050507 0%, rgba(5,5,7,0.72) 30%, rgba(5,5,7,0.4) 55%, rgba(5,5,7,0.12) 78%, rgba(5,5,7,0) 100%)",
          }}
       />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-28 sm:h-40"
          style={{
            backgroundImage:
              "linear-gradient(0deg, #050507 0%, rgba(5,5,7,0.86) 26%, rgba(5,5,7,0.5) 58%, rgba(5,5,7,0) 100%)",
          }}
       />

        {/* ciepła łuna marki — ta sama w obu stanach (z WebGPU i bez) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[6]"
          style={{
            backgroundImage:
              "radial-gradient(70% 55% at 50% 112%, rgba(255,62,10,0.17), rgba(255,62,10,0) 72%)",
          }}
       />


        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 py-24 text-center sm:py-32 lg:px-8 lg:py-40">
          <Reveal>
            <div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.24em] text-white/35 sm:text-[11px]">MANIFEST</div>
            <h2 className="mt-6 font-[Cormorant_Garamond] font-light leading-[0.9] tracking-[-0.03em] text-[clamp(30px,7.4vw,96px)]">
              <EditableText ek="qraft.manifest.l1" def="Perfekcji" className="block text-white/95" isEditing={isEditing} as="span" />


              <EditableText ek="qraft.manifest.l2" def="nie można" className="block text-white/95" isEditing={isEditing} as="span" />


              <span
                className="block font-[Instrument_Serif] italic text-transparent"
                style={{ WebkitTextStroke: "1.1px rgba(255,255,255,0.75)" }}
              >
                przyspieszyć.
              </span>
            </h2>
            <EditableText
              ek="qraft.manifest.sub"
              def="Trzy tygodnie pracy wyglądają jak trzy tygodnie pracy. Każdy detal doprowadzamy do końca, zamiast dowozić go szybciej."
              className="mx-auto mt-7 block max-w-[540px] font-[Inter] font-light text-[14px] leading-7 text-white/45 sm:text-[15px]"
              isEditing={isEditing}
              as="p"
           />

            <EditableText
              ek="qraft.manifest.start"
              def="START ZAJMUJE 90 DNI — BEZ POŚPIECHU"
              className="mt-8 inline-block rounded-full border border-white/10 px-5 py-2 font-[JetBrains_Mono] font-light text-[9px] tracking-[0.2em] text-white/45 sm:text-[10px]"
              isEditing={isEditing}
              as="span"
           />

          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <BtnGhost onClick={() => go("process")} className="h-11 px-6 text-[10px] sm:text-[11px]">
                ZOBACZ PROCES <ArrowRight className="h-3 w-3 opacity-60" />


              </BtnGhost>
              <BtnGhost onClick={() => go("contact")} className="h-11 px-6 text-[10px] sm:text-[11px]">
                ZAMÓW AUDYT
              </BtnGhost>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="process"
        className="bg-[#ECE8E2] border-t border-white/5 text-[#0A0A0A]"
        style={{
          backgroundImage:
            "radial-gradient(120% 62% at 50% -10%, rgba(255,62,10,0.18), rgba(255,62,10,0) 62%)," +
            "linear-gradient(180deg, #F6CFA0 0%, #F4D6B2 16%, #F1E0CC 38%, #EFE4D6 64%, #ECE8E2 100%)",
        }}
      >
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-24">
          <Reveal><ProcessStack isEditing={isEditing} onZoneChange={setInProcess}/>
</Reveal>
        </div>
      </section>

      <section id="atelier" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            initial={{ scale: 1.18 }}
            whileInView={{ scale: 1.02 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=2200&q=80&auto=format&fit=crop"
              alt="Rzemiosło w wykonaniu — detal dopracowany do perfekcji"
              className="h-full w-full object-cover grayscale contrast-110 brightness-[0.5]"
           />

          </motion.div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #050507 0%, rgba(5,5,7,0.35) 22%, rgba(5,5,7,0.25) 55%, rgba(5,5,7,0.78) 88%, #050507 100%)" }}/>

          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_30%,rgba(5,5,7,0.55)_100%)]" />


        </div>

        <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8 py-28 lg:py-40">
          <Reveal>
            <div className="text-center">
              <div className="font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.32em] text-white/50">03 — ATELIER</div>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />


              <h2 className="mt-6 leading-[0.9] tracking-[-0.02em]">
                <EditableText ek="qraft.atelier.h1" def="Detal, którego" className="block font-[Cormorant_Garamond] font-light text-[30px] sm:text-[64px]" isEditing={isEditing} as="span" />


                <EditableText ek="qraft.atelier.h2" def="nie da się sfałszować." className="block font-[Cormorant_Garamond] font-light italic text-white/45 text-[30px] sm:text-[64px]" isEditing={isEditing} as="span" />


              </h2>
              <EditableText
                ek="qraft.atelier.sub"
                def="Zanim cokolwiek zaplanujemy, przyglądamy się Twojemu rzemiosłu. Światło, materiał, sposób podania — wszystko, co robimy, wyrasta z tego, co Ty robisz najlepiej. Stąd też cena: nigdy z cennika — zawsze z zakresu."
                className="mx-auto mt-6 block max-w-[520px] font-[Inter] font-light text-[14px] sm:text-[15.5px] leading-8 text-white/55"
                isEditing={isEditing}
                as="p"
             />

            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div
              className="mx-auto mt-14 grid max-w-[880px] grid-cols-3 rounded-[24px] border border-white/12 bg-black/25 backdrop-blur-xl backdrop-saturate-[1.3]"
              style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.07), 0 18px 50px rgba(0,0,0,0.4)" }}
            >
              {[
                ["Zdjęć w miesiącu", 24, "+"],
                ["Godzin warsztatu", 90, ""],
                ["Detali w kadrze", 340, "+"],
              ].map(([label, to, suffix], idx) => (
                <div key={String(label)} className="border-r border-white/10 px-4 py-8 text-center last:border-r-0 sm:py-10">
                  <div className="font-[Cormorant_Garamond] font-light text-[26px] sm:text-[40px] leading-none text-white">
                    <CountUp to={Number(to)} suffix={String(suffix)}/>

                  </div>
                  <div className="mt-3 font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.18em] text-white/45">
                    <EditableText ek={`qraft.atelier.stat${idx}`} def={String(label)} className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" />


                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-12 text-center">
              <BtnGhost onClick={() => goContact()} className="h-12 px-8 text-[10px] sm:text-[11px]">
                ZOBACZ, CO WYCZUJEMY NA AUDYCIE <ArrowRight className="h-3.5 w-3.5 opacity-60" />


              </BtnGhost>
            </div>
          </Reveal>
        </div>
      </section>

            {/* WYNIKI — dowody zamiast obietnic: marki, które powierzyły nam markę, cytat, liczby */}
      <section id="results" className="relative bg-[#050507]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-24 lg:py-32">
          <Reveal>
            <div className="text-center">
              <div className="font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.32em] text-white/50">04 — WYNIKI</div>
              <h2 className="mt-6 leading-[0.9] tracking-[-0.02em]">
                <EditableText ek="qraft.results.h1" def="Marki, które" className="block font-[Cormorant_Garamond] font-light text-[30px] sm:text-[56px]" isEditing={isEditing} as="span" />


                <EditableText ek="qraft.results.h2" def="już rosną z nami." className="block font-[Cormorant_Garamond] font-light italic text-white/45 text-[30px] sm:text-[56px]" isEditing={isEditing} as="span" />


              </h2>
              <EditableText
                ek="qraft.results.sub"
                def="Nie pokazujemy slajdów. Pokazujemy stoliki, które się zapełniają i kalendarze, które nie gasną."
                className="mx-auto mt-5 block max-w-[480px] font-[Inter] font-light text-[14px] sm:text-[15px] leading-7 text-white/45"
                isEditing={isEditing}
                as="p"
             />

            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              className="mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]"
            >
              <div className="flex w-max items-center" style={{ animation: "qmarquee 46s linear infinite" }}>
                {[0, 1].map((dup) => (
                  <div key={dup} aria-hidden={dup === 1} className="flex items-center">
                    {["Lumière", "Cafe Nord", "Studio Kai", "Butik Mari", "Klinika Aesthetica", "Winnica Zamoyska", "Rzeźnia Nobla", "Piekarnia Sołow", "Bar Mistrzów"].map((name) => (
                      <span key={name + dup} className="flex items-center">
                        <span className="whitespace-nowrap font-[Cormorant_Garamond] font-light italic text-[22px] sm:text-[30px] text-white/35">{name}</span>
                        <span className="mx-8 sm:mx-12 h-1 w-1 rounded-full bg-white/15" />


                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <figure className="mx-auto mt-16 max-w-[760px] text-center">
              <Quote className="mx-auto h-5 w-5 text-white/20" />


              <blockquote className="mt-6">
                <EditableText
                  ek="qraft.results.quote"
                  def="QRAFT nie robi postów. QRAFT robi tak, że w piątek wieczór trzeba rezerwować stolik."
                  className="font-[Cormorant_Garamond] font-light text-[22px] sm:text-[34px] leading-[1.25] tracking-[-0.01em] text-white/90"
                  isEditing={isEditing}
                  as="p"
               />

              </blockquote>
              <figcaption className="mt-7 font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.2em] text-white/40">
                <EditableText ek="qraft.results.author" def="MARTA ZAWADZKA — WSPÓŁWŁAŚCICIELKA LUMIÈRE" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" />


              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-16 grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
              {[
                [38, "%", "wzrost rezerwacji w pierwsze 90 dni"],
                [21, " dni", "do pierwszych efektów w Mapach Google"],
                [68, "%", "gości wraca w kolejnym miesiącu"],
              ].map(([to, suffix, label], i) => (
                <div key={i} className="py-8 text-center sm:py-10">
                  <div className="font-[Cormorant_Garamond] font-light text-[34px] sm:text-[46px] leading-none text-white">
                    <CountUp to={Number(to)} suffix={String(suffix)}/>

                  </div>
                  <div className="mx-auto mt-3 max-w-[220px] font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] leading-4 tracking-[0.16em] text-white/40">
                    <EditableText ek={`qraft.results.stat${i}`} def={String(label)} className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" />


                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PODZIAŁ RÓL — najkrótsza wersja tego, po co w ogóle jesteśmy */}
      <section
        id="podzial"
        className="relative overflow-hidden border-t border-white/5 bg-[#050507]"
        style={{
          backgroundImage:
            "radial-gradient(120% 62% at 50% -10%, rgba(255,62,10,0.14), rgba(255,62,10,0) 62%)," +
            "linear-gradient(180deg, #0A0A0A 0%, #111012 38%, #050507 78%, #000000 100%)",
        }}
      >
        <div className="mx-auto max-w-[1280px] px-6 py-24 lg:px-8 lg:py-36">
          <Reveal>
            <div className="text-center">
              <div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.32em] text-white/50 sm:text-[11px]">
                05 — PODZIAŁ RÓL
              </div>
              <h2 className="mt-6 leading-[1.05] tracking-[-0.02em]">
                <EditableText
                  ek="qraft.podzial.h1"
                  def="Dwa zakresy, jeden kompas."
                  className="block font-[Cormorant_Garamond] font-light text-[30px] text-white sm:text-[56px]"
                  isEditing={isEditing}
                  as="span"
               />

              </h2>
              <EditableText
                ek="qraft.podzial.sub"
                def="W QRAFT widzimy Twój rzemiosł. Ty widzisz w naszej pracy narzędzie, które wreszcie działa po Twojej stronie."
                className="mx-auto mt-5 block max-w-[480px] font-[Inter] font-light text-[14px] leading-7 text-white/45 sm:text-[15px]"
                isEditing={isEditing}
                as="p"
             />

            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  num: "01",
                  label: "Marzenie klienta",
                  desc: "Zanim ruszymy, słuchamy: jaki efekt kojarzy Ci się z firmą i czyja decyzja o nim rozstrzyga. Potem dopiero ustalamy kształt i koch.",
                },
                {
                  num: "02",
                  label: "Ascetyzm formy",
                  desc: "Cena nie jest wyrokiem, tylko odpowiedzią na zasady. Nie sprzedajemy przypadkowo — wybieramy zakres, który da największy ruch w Twoim mieście.",
                },
                {
                  num: "03",
                  label: "Walka o materiał",
                  desc: "Materiał mówi pierwszy. Ton, faktura i światło Twojego rzemiosła wyznaczają rejestr, w którym pracujemy dalej.",
                },
                {
                  num: "04",
                  label: "Rzemiosło, nie portfolio",
                  desc: "Efekt ma być mierzalny. Stoliki, kalendarze i pełne godziny — nie slajdy i nie lajki.",
                },
              ].map(({ num, label, desc }) => (
                <div
                  key={num}
                  className="rounded-[20px] border border-white/10 bg-white/[0.02] p-6"
                >
                  <div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.22em] text-white/40">
                    {num}
                  </div>
                  <div className="mt-3 font-[Cormorant_Garamond] font-light text-[18px] leading-[1.2] text-white">
                    {label}
                  </div>
                  <div className="mt-3 font-[Inter] font-light text-[12px] leading-[1.7] text-white/40">
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ — najczęstsze pytania przed pierwszym zleceniem */}
      <section id="faq" className="relative border-t border-white/5 bg-[#050507]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 lg:px-8 lg:py-32">
          <Reveal>
            <div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.32em] text-white/50 sm:text-[11px]">
              06 — FAQ
            </div>
            <h2 className="mt-6 leading-[0.9] tracking-[-0.02em]">
              <EditableText
                ek="qraft.faq.h1"
                def="Zanim zadzwonisz."
                className="block font-[Cormorant_Garamond] font-light text-[30px] text-white sm:text-[56px]"
                isEditing={isEditing}
                as="span"
             />

            </h2>
          </Reveal>

          <div className="mt-12 divide-y divide-white/[0.08] border-y border-white/[0.08]">               {[
                ["Ile trwa pierwszy projekt?", 
                "Audyt zajmuje 20 minut i kończy się jedną stroną. Właściwa praca zaczyna się potem — blueprint dostajesz w ciągu tygodnia.",
              ],
              [
                "Ile kosztuje?",
                "Ceny nie ma na stronie, bo nie podajemy jej zgadywanki. Zakres i koszt ustalamy po audycie, kiedy wiemy już, co realnie wpłynie na przychód.",
              ],
              [
                "Czy pracujecie zdalnie?",
                "Tak. Cały proces — od rozmowy, przez materiały, po oddanie gotowca — odbywa się zdalnie. Spotkania są tylko punktem kontrolnym.",
              ],
              [
                "Co, jeśli nie wiem, czego chcę?",
                "To najczęstszy scenariusz i dokładnie po to jest audyt. Nie musisz przychodzić z gotowym briefem — musisz tylko powiedzieć, czym się zajmujesz.",
              ],
              [
                "Jak długo trwa współpraca?",
                "Start zawsze od 90 dni. Potem decydujesz: roczna opieka, kolejny sprint albo pauza. Bez zobowiązań na wyłączność.",
              ],
            ].map(([q, a], i) => {
              const open = faqOpen === i;
              return (
                <div key={q}>
                  <button
                    type="button"
                    onClick={() => { sfxTap(); setFaqOpen(open ? null : i); }}
                    aria-expanded={open}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-[Cormorant_Garamond] font-light text-[19px] leading-tight text-white sm:text-[24px]">
                      {q}
                    </span>
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 text-white/50 transition-transform duration-500 ${open ? "rotate-45" : ""}`}
                    >
                      {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[620px] pb-7 font-[Inter] font-light text-[14px] leading-7 text-white/45">
                        {a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROŚĆ — punkt kontaktu z sercem strony */}
      <section className="relative border-t border-white/5 bg-[#050507]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 lg:px-8 lg:py-32">
          <Reveal>
            <div className="max-w-[680px] mx-auto text-center">
              <div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.32em] text-white/50 sm:text-[11px]">
                Przetwarzanie
              </div>
              <h2 className="mt-6 leading-[1.05] tracking-[-0.02em]">
                <EditableText
                  ek="qraft.request.h1"
                  def="Poszukujesz partnera, który usłyszy i stworzy coś, co zadziała?"
                  className="block font-[Cormorant_Garamond] font-light text-[28px] leading-[1.15] tracking-[-0.02em] text-white sm:text-[48px]"
                  isEditing={isEditing}
                  as="span"
               />

              </h2>
              <p className="mx-auto mt-5 max-w-[420px] font-[Inter] font-light text-[14px] leading-7 text-white/40 sm:text-[15.5px]">
                <EditableText
                  ek="qraft.request.sub"
                  def="Nie wiem, jaki projekt potrzebujesz. Zgadzam się to przetworzyć w jednym audycie."
                  className="font-[Inter] font-light text-[14px] leading-7 text-white/40"
                  isEditing={isEditing}
                  as="p"
               />

              </p>
              <button
                type="button"
                onClick={() => go("contact")}
                className="mt-9 inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-white text-black font-[JetBrains_Mono] font-light text-[10px] tracking-[0.16em] transition-colors duration-300 hover:bg-[#FF3E0A] hover:text-white sm:text-[11px]"
              >
                ZMGOTOWAŃ AUDYT BEZPŁATNY <ArrowUpRight className="h-3.5 w-3.5" />


              </button>
              <p className="mt-4 text-white/20 font-[JetBrains_Mono] font-light text-[9px] tracking-[0.14em]">
                Brak przerw — tenth parkuje, ten sprint kończy się. Przeczekaj 20 minut, zanim zaczniemy.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* KONTAKT — bezpłatny audyt; formularz jest jedynym realnym wywołaniem akcji */}
      <section
        id="contact"
        className="relative border-t border-white/5 bg-[#050507]"
        style={{
          backgroundImage:
            "radial-gradient(90% 55% at 50% 0%, rgba(255,62,10,0.16), rgba(255,62,10,0) 60%)",
        }}
      >
        <div className="mx-auto max-w-[1280px] px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <Reveal>
              <div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.32em] text-white/50 sm:text-[11px]">
                07 — KONTAKT
              </div>
              <h2 className="mt-6 leading-[0.92] tracking-[-0.02em]">
                <EditableText
                  ek="qraft.contact.h1"
                  def="Zacznijmy od"
                  className="block font-[Cormorant_Garamond] font-light text-[30px] text-white sm:text-[56px]"
                  isEditing={isEditing}
                  as="span"
               />

                <EditableText
                  ek="qraft.contact.h2"
                  def="dwudziestu minut."
                  className="block font-[Cormorant_Garamond] font-light text-[30px] italic text-white/45 sm:text-[56px]"
                  isEditing={isEditing}
                  as="span"
               />

              </h2>
              <EditableText
                ek="qraft.contact.sub"
                def="Audyt jest bezpłatny i do niczego nie zobowiązuje. Wystarczy telefon — resztę znajdziemy sami, zanim odezwie się telefon."
                className="mt-6 block max-w-[420px] font-[Inter] font-light text-[14px] leading-7 text-white/45 sm:text-[15px]"
                isEditing={isEditing}
                as="p"
             />


              <ul className="mt-10 space-y-4">
                {[
                  [Clock, "20 minut, konkretne wnioski"],
                  [Handshake, "bez zobowiązań i bez presji"],
                  [Megaphone, "odpowiedź w ciągu jednego dnia roboczego"],
                ].map(([Icon, label], i) => (
                  <li key={i} className="flex items-center gap-3 font-[Inter] font-light text-[13px] text-white/45">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#FF3E0A]" />


                    {label as string}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <form
                onSubmit={submit}
                className="rounded-[26px] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8"
                style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 24px 70px rgba(0,0,0,0.4)" }}
              >
                <SlidingTabs
                  items={auditServices.map((s) => ({ id: s.id, label: s.label }))}
                  value={form.service}
                  onChange={(id) => { sfxTap(); setForm((f) => ({ ...f, service: id })); }}
                  className="mb-7 flex flex-wrap gap-1 rounded-full border border-white/10 p-1"
                  tabClassName="flex-1 rounded-full px-3 py-2 font-[JetBrains_Mono] font-light text-[9px] tracking-[0.14em] text-white/45 transition-colors duration-300 hover:text-white aria-selected:bg-white aria-selected:text-black"
               />


                <div className="mb-6 min-h-[54px]">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-[Cormorant_Garamond] font-light text-[22px] text-white">
                      <TextSwap text={svc.label}/>

                    </span>
                    <span className="font-[JetBrains_Mono] font-light text-[9px] tracking-[0.14em] text-white/35">
                      {svc.note}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {svc.items.map((it) => (
                      <li key={it} className="flex items-center gap-2 font-[Inter] font-light text-[12.5px] text-white/40">
                        <Check className="h-3 w-3 shrink-0 text-white/25" />


                        {it}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ClearField name="name" label="IMIĘ" placeholder="Jak mamy Cię nazywać?" autoComplete="name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))}/>

                  <ClearField name="business" label="FIRMA" placeholder="Nazwa lokalu lub studia" autoComplete="organization" value={form.business} onChange={(v) => setForm((f) => ({ ...f, business: v }))}/>

                  <ClearField name="email" label="E-MAIL" placeholder="imie@firma.pl" type="email" autoComplete="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))}/>

                  <ClearField name="phone" label="TELEFON" placeholder="+48 000 000 000" type="tel" required autoComplete="tel" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))}/>

                  <ClearField name="date" label="PREFEROWANY DZIEŃ" placeholder="np. 12.05" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))}/>

                  <label className="block space-y-2">
                    <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/45">GODZINA</span>
                    <select
                      name="time"
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      className="h-11 w-full cursor-pointer rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm text-white/75 outline-none transition-colors duration-300 focus:border-white/30"
                    >
                      {["09:00", "10:30", "12:00", "14:00", "16:30", "18:00"].map((t) => (
                        <option key={t} value={t} className="bg-[#111113] text-white">
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-3 block space-y-2">
                  <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/45">
                    CO CHCESZ POPRAWIĆ
                  </span>
                  <textarea
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Dwie linijki wystarczą."
                    className="w-full resize-none rounded-[18px] border border-white/10 bg-white/[0.02] px-5 py-3 font-[Inter] font-light text-sm text-white placeholder:text-white/20 outline-none transition-colors duration-300 focus:border-white/30"
                 />

                </label>

                {briefed && (
                  <div className="mt-5 flex items-start gap-3 rounded-[18px] border border-[#FF3E0A]/35 bg-[#FF3E0A]/[0.07] px-4 py-3">
                    <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF3E0A]" />

                    <p className="font-[Inter] font-light text-[12px] leading-5 text-white/70">
                      Brief z kalkulatora jest już w Twoim zgłoszeniu — szacunek ~{estClients} klientów/mies. Uzupełnij tylko telefon.
                    </p>
                  </div>
                )}

                <label className="mt-5 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={contactMe}
                    onChange={(e) => { sfxTap(); setContactMe(e.target.checked); }}
                    className="mt-[2px] h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[5px] border border-white/25 bg-white/[0.02] outline-none transition-colors duration-300 checked:border-white checked:bg-white focus-visible:ring-2 focus-visible:ring-white/50"
                  />
                  <span className="font-[Inter] font-light text-[12.5px] leading-5 text-white/60">
                    Tak, skontaktujcie się ze mną — najlepiej telefonicznie, w ciągu jednego dnia roboczego.
                  </span>
                </label>

                <button
                  type="submit"
                  className={`mt-6 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full font-[JetBrains_Mono] font-light text-[10px] tracking-[0.16em] transition-colors duration-300 sm:text-[11px] ${
                    sent ? "bg-[#7DF0AE] text-black" : "bg-white text-black hover:bg-[#FF3E0A] hover:text-white"
                  }`}
                >
                  {sent ? (
                    <>
                      <Check className="h-3.5 w-3.5" />

 {contactMe ? "ZAPISANE — ODEZWIEMY SIĘ JUTRO" : "ZAPISANE — CZEKAMY NA TWOJE ZGŁOSZENIE"}
                    </>
                  ) : (
                    <>
                      ZAMÓW BEZPŁATNY AUDYT <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />


                    </>
                  )}
                </button>

                <p className="mt-4 text-center font-[Inter] font-light text-[10.5px] leading-5 text-white/25">
                  Wysyłając formularz, zgadzasz się na kontakt w sprawie audytu. Nic więcej.
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.08] bg-[#050507]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-col gap-4">
            <QraftMark className="text-white" height={18}/>

            <span className="font-[JetBrains_Mono] font-light text-[9px] tracking-[0.2em] text-white/25">
              PRECISION BUILDS BRANDS
            </span>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {SIDEBAR.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(s.id)}
                className="cursor-pointer font-[JetBrains_Mono] font-light text-[9px] tracking-[0.18em] text-white/35 transition-colors duration-300 hover:text-white"
              >
                {s.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => { const next = !soundOn; setSoundOn(next); setMuted(!next); if (next) sfxTap(); }}
            aria-label={soundOn ? "Wycisz dźwięki" : "Włącz dźwięki"}
            aria-pressed={!soundOn}
            className="grid h-9 w-9 cursor-pointer place-items-center self-start rounded-full border border-white/15 bg-white/[0.02] text-white/55 transition-colors duration-300 hover:border-white/45 hover:text-white lg:self-auto"
          >
            {soundOn ? <Volume2 className="h-3.5 w-3.5" />

 : <VolumeX className="h-3.5 w-3.5" />

}
          </button>
        </div>
        <div className="mx-auto max-w-[1280px] border-t border-white/[0.06] px-6 py-6 lg:px-8">
          <span className="font-[JetBrains_Mono] font-light text-[8.5px] tracking-[0.16em] text-white/20">
            © {new Date().getFullYear()} QRAFT — WSZYSTKIE PRAWA ZASTRZEŻONE
          </span>
        </div>
      </footer>
    </div>
  );
}

