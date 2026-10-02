import { motion, AnimatePresence, useScroll, useSpring, useTransform, useInView, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Check, Minus, Plus, Clock, Terminal, Pencil, Save, RefreshCw, Quote, Handshake, Megaphone } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Lenis from "lenis";
import { useNavigate } from "react-router";
import { ClearField, DigitChars, PopNumber, SlidingTabs, TextSwap, usePopIn } from "@/components/transitions";
import GradualBlur from "@/components/GradualBlur";
import FlipCard from "@/components/FlipCard";
import LineSidebar from "@/components/LineSidebar";
import QraftMark from "@/components/QraftMark";
import GlowCursor from "@/components/GlowCursor";
import PixelTrail from "@/components/PixelTrail";
import StaggeredMenu from "@/components/StaggeredMenu";
import AeroShards from "@/components/AeroShards";
import StarField from "@/components/StarField";
import { Volume2, VolumeX } from "lucide-react";
import { setMuted, sfxPop, sfxTap, sfxWhoosh, unlockAudio } from "@/lib/sound";
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
        <DigitChars text={val} />
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

const serviceDefaults = [
  { n: "01", title: "System Marki", meta: "TYGODNIE 1–2", dostajesz: "spójny system wizualny, hasło i szyld.", cel: "rozpoznają Cię zanim ktoś się dowie.", pts: ["Nazwa, hasło, szyld", "Kolor, typografia, materiały", "Szablon social media"] },
  { n: "02", title: "Strona i Wydajność", meta: "TYGODNIE 2–4", dostajesz: "szybką stronę z rezerwacją i formularzem.", cel: "każdy klik kończy się zamówieniem.", pts: ["Landing pod konkretną usługę", "Rezerwacja i formularz", "Prędkość i SEO techniczne"] },
  { n: "03", title: "Pozyskiwanie", meta: "TYGODNIE 3–6", dostajesz: "widoczność w Mapach i wyszukiwaniu do 3 km.", cel: "trafiają do Ciebie ludzie z okolicy.", pts: ["Wizytówka w Mapach", "Pozycjonowanie lokalne", "Zasięg w promieniu 3 km"] },
  { n: "04", title: "Silnik Treści", meta: "CYKLICZNIE", dostajesz: "zdjęcia, wideo i teksty o Twoim rzemiośle.", cel: "klient widzi jakość jeszcze przed wizytą.", pts: ["Sesja foto 2× w miesiącu", "Krótkie wideo z realizacji", "Posty gotowe do publikacji"] },
  { n: "05", title: "Kampanie", meta: "CYKLICZNIE", dostajesz: "kalendarz ofert i mailingi, które wracają.", cel: "puste godziny w tygodniu się zapełniają.", pts: ["Kalendarz ofert", "Mailing do bazy klientów", "Raport z konwersji"] },
  { n: "06", title: "Retencja", meta: "STALE", dostajesz: "system opinii, lojalności i raport tygodniowy.", cel: "klienci wracają i polecają Cię znajomym.", pts: ["System opinii", "Program poleceń", "Raport tygodniowy"] },
];



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
  const Icon =
    axis === "y" ? (dir === 1 ? ArrowDown : ArrowUp) : dir === 1 ? ArrowRight : ArrowLeft;
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
  { label: "SYSTEM", id: "services" },
  { label: "ATELIER", id: "atelier" },
  { label: "PROCES", id: "process" },
  { label: "FAQ", id: "faq" },
  { label: "KONTAKT", id: "contact" },
];
const SIDEBAR_IDS = SIDEBAR.map((s) => s.id);

/* menu z boku: kolejność zgodna z ławkiem bocznym */
const MENU_ITEMS: StaggeredMenuItem[] = [
  { label: "System", ariaLabel: "Przejdź do sekcji SYSTEM", link: "#services" },
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
          <FlowArt />
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
  /* zaznaczone moduły w SYSTEM napędzają rekomendowany pakiet */
  /* zaznaczone moduły w SYSTEM */
  const [picked, setPicked] = useState<number[]>([]);
  const toggleModule = (i: number) => {
    setPicked((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  };
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
  /* wybrany pakiet trafia od razu do zapytania o audyt */
  /* ATELIER: ceny poznajesz na audycie — CTA prowadzi prosto do formularza */
  const goContact = () => {
    sfxTap();
    go("contact");
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone) return;
    setSent(true);
    setTimeout(()=>setSent(false), 6000);
  };

  const svc = auditServices.find((s) => s.id === form.service) || auditServices[0];

  return (
    <div className="min-h-screen text-[#F2F2F0] antialiased selection:bg-white selection:text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@300;400&display=swap'); html{scroll-behavior:smooth} @keyframes qmarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}} @keyframes qmsheen{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}} @keyframes qmbreathe{0%,100%{opacity:.35}50%{opacity:.9}}`}</style>
      <motion.div className="fixed top-0 inset-x-0 h-[1px] bg-white/80 z-50 origin-left" style={{ scaleX: progress }} />
      <FlowBackdrop />
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
              <QraftMark className={inProcess ? "text-black" : "text-white"} height={19} />
              <span
                className={`font-[JetBrains_Mono] font-light text-[7px] sm:text-[8px] leading-[1.7] tracking-[0.2em] ${
                  inProcess ? "text-black/40" : "text-white/30"
                }`}
              >
                PRECISION
                <br />
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

          <div className={`my-6 h-px w-full ${inProcess ? "bg-black/10" : "bg-white/10"}`} />

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

          <div className={`my-6 h-px w-full ${inProcess ? "bg-black/10" : "bg-white/10"}`} />

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
              {isEditing ? <><Save className="h-3.5 w-3.5"/> ZAKOŃCZ EDYCJĘ</> : <><Pencil className="h-3.5 w-3.5"/> EDYTUJ TEKSTY</>}
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.14em] text-white/20"><Terminal className="h-3 w-3 opacity-60"/> qraft.build</span>
            <button
              onClick={() => { const next = !soundOn; setSoundOn(next); setMuted(!next); if (next) sfxTap(); }}
              aria-label={soundOn ? "Wycisz dźwięki" : "Włącz dźwięki"}
              aria-pressed={!soundOn}
              className="hidden sm:grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.02] text-white/55 transition-colors duration-300 hover:border-white/45 hover:text-white"
            >
              {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
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
              <Pencil className="h-3.5 w-3.5 text-white/50"/> Tryb edycji — kliknij w dowolny tekst, aby go zmienić. Zapis automatyczny w przeglądarce.
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
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "88px 88px" }} />

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
                  ZOBACZ SYSTEM
                </BtnGhost>
              </motion.div>

              <motion.div
                className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.8 }}
              >
                {[
                  { v: <CountUp to={340} suffix="+" />, l: "Zbudowanych" },
                  { v: <CountUp to={4.9} decimals={1} />, l: "Ocena" },
                  { v: <CountUp to={14} suffix=" mies." />, l: "Średnio" },
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
              <div className="font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.2em] text-white/50">01 — SYSTEM</div>
              <h2 className="mt-5 leading-[0.9] tracking-[-0.02em]">
                <EditableText ek="qraft.system.h1" def="Jeden system. Sześć modułów." className="block font-[Cormorant_Garamond] font-light text-[26px] sm:text-[52px]" isEditing={isEditing} as="span" />
              </h2>
            </div>
            <EditableText
              ek="qraft.system.subtitle"
              def={"System prowadzi klienta od pierwszego wyszukania aż do powtórnych zakupów. Włączasz moduły po kolei albo wszystkie naraz — każdy działa sam, a razem działają lepiej." + (picked.length ? ` (Twoje zaznaczenie: ${picked.length}/6)` : "")}
              className="max-w-[460px] font-[Inter] font-light text-[14.5px] sm:text-[16px] leading-8 text-white/45"
              isEditing={isEditing}
              as="p"
            />
          </div>
        </Reveal>
        <div className="mt-6 sm:mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {serviceDefaults.map((s,i)=>(
            <motion.div
              key={s.n}
              initial={{ opacity:0, y:14 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.7, delay:i*0.04, ease:[0.22,1,0.36,1]}}
              className="h-[260px] sm:h-[300px]"
            >
              <FlipCard
                fill
                editable={isEditing}
                selected={picked.includes(i)}
                onActivate={() => { sfxTap(); toggleModule(i); }}
                axis="y"
                ariaLabel={`Modu\u0142 ${s.n} \u2014 ${s.title}`}
                background={picked.includes(i) ? "#0A120E" : "#0A0A0D"}
                color="#F2F2F0"
                radius={24}
                width={420}
                height={300}
                perspective={1200}
                tiltMax={9}
                hoverScale={1.02}
                glareOpacity={0.17}
                shadow={false}
                flipOnClick={!isEditing}
                draggable={!isEditing}
                front={(
                  <div className="relative flex h-full w-full flex-col p-4 sm:p-6 lg:p-7">
                    <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(74% 54% at 50% 0%, rgba(255,255,255,0.08), transparent 72%)" }} />
                    <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/[0.08]" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)" }} />
                    <div className="relative flex items-center justify-between">
                      <PopNumber text={s.n} className="font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.16em] text-white/25" />
                      <span className="h-8 w-8 grid place-items-center rounded-full border border-white/10 text-white/25"><ArrowUpRight className="h-3.5 w-3.5"/></span>
                    </div>
                    <h3 className="relative mt-3 sm:mt-5 font-[Cormorant_Garamond] font-light text-[19px] sm:text-[21px] tracking-[-0.01em] leading-none">
                      <EditableText ek={`qraft.service.${i}.title`} def={s.title} className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />
                    </h3>
                    <div className="relative mt-auto space-y-2 pt-4">
                      <p className="font-[Inter] font-light text-[13.5px] sm:text-[14.5px] leading-6 text-white/55">
                        <span className="font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.14em] text-white/30 mr-2">DOSTAJESZ</span>
                        <EditableText ek={`qraft.service.${i}.d`} def={s.dostajesz} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                      </p>
                      {isEditing && (
                        <p className="font-[Inter] font-light text-[13.5px] sm:text-[14.5px] leading-6 text-white/80">
                          <span className="font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.14em] text-white/45 mr-2">CEL</span>
                          <EditableText ek={`qraft.service.${i}.c`} def={s.cel} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-3 pt-3">
                        {isEditing ? (
                          <span className="font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.18em] text-white/25">TRYB EDYCJI</span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-[JetBrains_Mono] font-light text-[8px] sm:text-[9px] tracking-[0.16em] transition-colors duration-500 ${
                              picked.includes(i)
                                ? "border-[#7DF0AE]/60 bg-[#7DF0AE]/12 text-[#9BF3C0]"
                                : "border-white/12 text-white/35"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${picked.includes(i) ? "bg-[#7DF0AE]" : "bg-white/25"}`} />
                            {picked.includes(i) ? "W TWOIM SYSTEMIE" : "DODAJ DO SYSTEMU"}
                          </span>
                        )}
                        {!isEditing && (
                          <span className="flex items-center gap-2 font-[JetBrains_Mono] font-light text-[8px] sm:text-[9px] tracking-[0.18em] text-white/25">
                            <RefreshCw className="h-3 w-3"/> OBR\u00d3\u0106
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                back={(
                  <div className="relative flex h-full w-full flex-col p-4 sm:p-6 lg:p-7">
                    <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(86% 62% at 50% 108%, rgba(255,255,255,0.10), transparent 70%)" }} />
                    <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/[0.12]" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.08)" }} />
                    <div className="relative font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.18em] text-white/30">{s.meta}</div>
                    <h3 className="relative mt-3 font-[Cormorant_Garamond] font-light text-[17px] sm:text-[19px] leading-none tracking-[-0.01em]">
                      <EditableText ek={`qraft.service.${i}.title`} def={s.title} className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />
                    </h3>
                    <p className="relative mt-4 font-[Inter] font-light text-[13.5px] leading-5 text-white/80">
                      <span className="font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.14em] text-white/45 mr-2">CEL</span>
                      <EditableText ek={`qraft.service.${i}.c`} def={s.cel} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                    </p>
                    <ul className="relative mt-3 space-y-1">
                      {s.pts.map((p,k)=>(
                        <li key={k} className="flex items-start gap-2 font-[Inter] font-light text-[12px] sm:text-[13px] leading-5 text-white/55">
                          <Check className="mt-[3px] h-3 w-3 shrink-0 text-white/30"/>{p}
                        </li>
                      ))}
                    </ul>
                    <div className="relative mt-auto space-y-3 pt-6">
                      <span
                        className={`flex h-10 w-full items-center justify-center gap-2 rounded-full border font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.16em] transition-colors duration-500 ${
                          picked.includes(i)
                            ? "border-[#7DF0AE] bg-[#7DF0AE] text-black"
                            : "border-white/20 text-white/75"
                        }`}
                      >
                        {picked.includes(i) ? <><Check className="h-3.5 w-3.5"/> W TWOIM SYSTEMIE</> : <>DODAJ DO SYSTEMU <ArrowRight className="h-3 w-3 opacity-60"/></>}
                      </span>
                      <div className="flex items-center justify-between font-[JetBrains_Mono] font-light text-[8px] sm:text-[9px] tracking-[0.18em]">
                        <span className="text-white/25">COFNIJ</span>
                        <button
                          onPointerDown={(e)=>e.stopPropagation()}
                          onClick={(e)=>{ e.stopPropagation(); go("contact"); }}
                          className="text-white/50 transition-colors duration-300 hover:text-white"
                        >
                          SPRAWDZIMY NA AUDYCIE →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              />
            </motion.div>
          ))}
        </div>
        {/* przy wiecej niz 4 modulach pakiet PRESTIGE dobiera sie automatycznie */}
        {picked.length > 4 && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-[20px] border border-[#7DF0AE]/40 bg-[#7DF0AE]/10 p-4 sm:p-5">
            <p className="font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.16em] text-[#9BF3C0]">
              5+ MODUŁÓW — DOBRALIŚMY CI PAKIET PRESTIGE
            </p>
            <BtnGhost onClick={()=>go("atelier")} className="h-9 shrink-0 border-[#7DF0AE]/50 px-4 text-[9px] text-[#9BF3C0]">
              ZOBACZ ATELIER
            </BtnGhost>
          </div>
        )}
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
          <Reveal><ProcessStack isEditing={isEditing} onZoneChange={setInProcess} /></Reveal>
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
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #050507 0%, rgba(5,5,7,0.35) 22%, rgba(5,5,7,0.25) 55%, rgba(5,5,7,0.78) 88%, #050507 100%)" }} />
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
                    <CountUp to={Number(to)} suffix={String(suffix)} />
                  </div>
                  <div className="mt-3 font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.18em] text-white/45">
                    <EditableText ek={`qraft.atelier.stat${idx}`} def={String(label)} className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" />
                  </div>
                </div>
              ))}
              style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.07), 0 18px 50px rgba(0,0,0,0.4)" }}
            >
              {[
                ["Zdjęć w miesiącu", 24, "+"],
                ["Godzin warsztatu", 90, ""],
                ["Detali w kadrze", 340, "+"],
              ].map(([label, to, suffix], idx) => (
                <div key={String(label)} className="border-r border-white/10 px-4 py-8 text-center last:border-r-0 sm:py-10">
                  <div className="font-[Cormorant_Garamond] font-light text-[26px] sm:text-[40px] leading-none text-white">
                    <CountUp to={Number(to)} suffix={String(suffix)} />
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
                    <CountUp to={Number(to)} suffix={String(suffix)} />
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
                    <select name="time" value={form.time} onChange={(e)=>setForm({...form, time:e.target.value})} className="w-full h-11 rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm text-white [color-scheme:dark] focus:outline-none focus:border-white/25">
                      {["9:00","10:30","12:00","14:00","16:00","18:00"].map((t)=>(<option key={t} className="bg-[#0F0F11]" value={t}>{t}</option>))}
                    </select>
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="block font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.12em] text-white/45">CO CHCESZ POPRAWIC</span>
                  <textarea name="message" rows={3} value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} placeholder="np. pusty kalendarz w weekendy, brak zdjęć w Mapach…" className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-5 py-4 font-[Inter] font-light text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"/>
                </label>

                <BtnPrimary type="submit" className="w-full h-[48px] text-[10px] sm:text-[11px]">
                  <TextSwap text={sent ? "WYSŁANO ZGŁOSZENIE" : "WYŚLIJ ZAPYTANIE O TERMIN"} />
                  <AnimatePresence initial={false} mode="wait">
                    {sent ? (
                      <motion.span key="check" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.25 }} className="inline-flex">
                        <Check className="h-4 w-4" />
                      </motion.span>
                    ) : (
                      <motion.span key="arrow" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="inline-flex">
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </BtnPrimary>
                <div className="text-center font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.04em] text-white/20">
                  {sent ? (
                    <TextSwap text="Dziękujemy — odezwiemy się z potwierdzeniem." />
                  ) : (
                    <>Lub <button type="button" onClick={()=>navigate("/auth")} className="underline decoration-white/15 text-white/30 hover:text-white/60">zaloguj się</button> by zarządzać terminami</>
                  )}
                </div>
              </form>

              <AnimatePresence>
                {sent && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-6 flex items-start gap-4 rounded-[20px] border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="h-9 w-9 shrink-0 grid place-items-center rounded-full bg-white text-black">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-[Inter] font-light text-[13px] sm:text-[14px] text-white">Termin zarezerwowany</div>
                      <div className="mt-1 font-[Inter] font-light text-[12px] sm:text-[13px] leading-6 text-white/55">
                        {form.date ? new Date(form.date + "T12:00:00").toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" }) : ""} · {form.time} · {svc.label} — potwierdzenie wyślemy na {form.email || form.phone}.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.08em] text-white/20">
          <div className="flex items-center gap-3"><div className="h-7 w-7 rounded-[9px] border border-white/10 grid place-items-center font-[Instrument_Serif] text-[13px] sm:text-[14px] font-light">Q</div><span className="font-[Instrument_Serif] font-light tracking-[0.2em] text-white/60 text-xs">QRAFT</span><span className="hidden sm:inline">© {new Date().getFullYear()} · PERFEKCJA BUDUJE MARKI</span></div>
          <div className="flex gap-3"><span>qraft.build</span><span className="opacity-20">·</span><span>Otwarte dla wszystkich</span></div>
        </div>
      </footer>

      {!isEditing && (
        <button onClick={()=>setIsEditing(true)} className="group fixed bottom-6 right-6 z-50 hidden lg:inline-flex items-center gap-2 px-5 h-11 rounded-full border border-white/25 bg-white/[0.03] backdrop-blur-2xl font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.08em] text-white/70 transition-all duration-500 hover:border-white/50 hover:bg-white hover:text-black shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
          <Pencil className="h-3.5 w-3.5" /> EDYTUJ TEKSTY
        </button>
      )}
    </div>
  );
}

      {/* PODZIAŁ RÓL przyjmuje ciepło, któremu kończy się sekcja wyniki — stąd łagodne przejście */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[6]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, transparent 0%, rgba(5,5,7,0.25) 40%, #050507 100%)" }} />
      </div>

import { motion, AnimatePresence, useScroll, useSpring, useTransform, useInView, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Check, Minus, Plus, Clock, Terminal, Pencil, Save, RefreshCw, Quote, Handshake, Megaphone } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Lenis from "lenis";
import { useNavigate } from "react-router";
import { ClearField, DigitChars, PopNumber, SlidingTabs, TextSwap, usePopIn } from "@/components/transitions";
import GradualBlur from "@/components/GradualBlur";
import FlipCard from "@/components/FlipCard";
import LineSidebar from "@/components/LineSidebar";
import QraftMark from "@/components/QraftMark";
import GlowCursor from "@/components/GlowCursor";
import PixelTrail from "@/components/PixelTrail";
import StaggeredMenu from "@/components/StaggeredMenu";
import AeroShards from "@/components/AeroShards";
import StarField from "@/components/StarField";
import { Volume2, VolumeX } from "lucide-react";
import { setMuted, sfxPop, sfxTap, sfxWhoosh, unlockAudio } from "@/lib/sound";
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
        <DigitChars text={val} />
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

const serviceDefaults = [
  { n: "01", title: "System Marki", meta: "TYGODNIE 1–2", dostajesz: "spójny system wizualny, hasło i szyld.", cel: "rozpoznają Cię zanim ktoś się dowie.", pts: ["Nazwa, hasło, szyld", "Kolor, typografia, materiały", "Szablon social media"] },
  { n: "02", title: "Strona i Wydajność", meta: "TYGODNIE 2–4", dostajesz: "szybką stronę z rezerwacją i formularzem.", cel: "każdy klik kończy się zamówieniem.", pts: ["Landing pod konkretną usługę", "Rezerwacja i formularz", "Prędkość i SEO techniczne"] },
  { n: "03", title: "Pozyskiwanie", meta: "TYGODNIE 3–6", dostajesz: "widoczność w Mapach i wyszukiwaniu do 3 km.", cel: "trafiają do Ciebie ludzie z okolicy.", pts: ["Wizytówka w Mapach", "Pozycjonowanie lokalne", "Zasięg w promieniu 3 km"] },
  { n: "04", title: "Silnik Treści", meta: "CYKLICZNIE", dostajesz: "zdjęcia, wideo i teksty o Twoim rzemiośle.", cel: "klient widzi jakość jeszcze przed wizytą.", pts: ["Sesja foto 2× w miesiącu", "Krótkie wideo z realizacji", "Posty gotowe do publikacji"] },
  { n: "05", title: "Kampanie", meta: "CYKLICZNIE", dostajesz: "kalendarz ofert i mailingi, które wracają.", cel: "puste godziny w tygodniu się zapełniają.", pts: ["Kalendarz ofert", "Mailing do bazy klientów", "Raport z konwersji"] },
  { n: "06", title: "Retencja", meta: "STALE", dostajesz: "system opinii, lojalności i raport tygodniowy.", cel: "klienci wracają i polecają Cię znajomym.", pts: ["System opinii", "Program poleceń", "Raport tygodniowy"] },
];



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
  const Icon =
    axis === "y" ? (dir === 1 ? ArrowDown : ArrowUp) : dir === 1 ? ArrowRight : ArrowLeft;
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
  { label: "SYSTEM", id: "services" },
  { label: "ATELIER", id: "atelier" },
  { label: "PROCES", id: "process" },
  { label: "FAQ", id: "faq" },
  { label: "KONTAKT", id: "contact" },
];
const SIDEBAR_IDS = SIDEBAR.map((s) => s.id);

/* menu z boku: kolejność zgodna z ławkiem bocznym */
const MENU_ITEMS: StaggeredMenuItem[] = [
  { label: "System", ariaLabel: "Przejdź do sekcji SYSTEM", link: "#services" },
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
          <FlowArt />
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
  /* zaznaczone moduły w SYSTEM napędzają rekomendowany pakiet */
  /* zaznaczone moduły w SYSTEM */
  const [picked, setPicked] = useState<number[]>([]);
  const toggleModule = (i: number) => {
    setPicked((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  };
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
  /* wybrany pakiet trafia od razu do zapytania o audyt */
  /* ATELIER: ceny poznajesz na audycie — CTA prowadzi prosto do formularza */
  const goContact = () => {
    sfxTap();
    go("contact");
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone) return;
    setSent(true);
    setTimeout(()=>setSent(false), 6000);
  };

  const svc = auditServices.find((s) => s.id === form.service) || auditServices[0];

  return (
    <div className="min-h-screen text-[#F2F2F0] antialiased selection:bg-white selection:text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@300;400&display=swap'); html{scroll-behavior:smooth} @keyframes qmarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}} @keyframes qmsheen{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}} @keyframes qmbreathe{0%,100%{opacity:.35}50%{opacity:.9}}`}</style>
      <motion.div className="fixed top-0 inset-x-0 h-[1px] bg-white/80 z-50 origin-left" style={{ scaleX: progress }} />
      <FlowBackdrop />
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
              <QraftMark className={inProcess ? "text-black" : "text-white"} height={19} />
              <span
                className={`font-[JetBrains_Mono] font-light text-[7px] sm:text-[8px] leading-[1.7] tracking-[0.2em] ${
                  inProcess ? "text-black/40" : "text-white/30"
                }`}
              >
                PRECISION
                <br />
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

          <div className={`my-6 h-px w-full ${inProcess ? "bg-black/10" : "bg-white/10"}`} />

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

          <div className={`my-6 h-px w-full ${inProcess ? "bg-black/10" : "bg-white/10"}`} />

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
              {isEditing ? <><Save className="h-3.5 w-3.5"/> ZAKOŃCZ EDYCJĘ</> : <><Pencil className="h-3.5 w-3.5"/> EDYTUJ TEKSTY</>}
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.14em] text-white/20"><Terminal className="h-3 w-3 opacity-60"/> qraft.build</span>
            <button
              onClick={() => { const next = !soundOn; setSoundOn(next); setMuted(!next); if (next) sfxTap(); }}
              aria-label={soundOn ? "Wycisz dźwięki" : "Włącz dźwięki"}
              aria-pressed={!soundOn}
              className="hidden sm:grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.02] text-white/55 transition-colors duration-300 hover:border-white/45 hover:text-white"
            >
              {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
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
              <Pencil className="h-3.5 w-3.5 text-white/50"/> Tryb edycji — kliknij w dowolny tekst, aby go zmienić. Zapis automatyczny w przeglądarce.
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
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "88px 88px" }} />

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
                  ZOBACZ SYSTEM
                </BtnGhost>
              </motion.div>

              <motion.div
                className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.8 }}
              >
                {[
                  { v: <CountUp to={340} suffix="+" />, l: "Zbudowanych" },
                  { v: <CountUp to={4.9} decimals={1} />, l: "Ocena" },
                  { v: <CountUp to={14} suffix=" mies." />, l: "Średnio" },
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
              <div className="font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.2em] text-white/50">01 — SYSTEM</div>
              <h2 className="mt-5 leading-[0.9] tracking-[-0.02em]">
                <EditableText ek="qraft.system.h1" def="Jeden system. Sześć modułów." className="block font-[Cormorant_Garamond] font-light text-[26px] sm:text-[52px]" isEditing={isEditing} as="span" />
              </h2>
            </div>
            <EditableText
              ek="qraft.system.subtitle"
              def={"System prowadzi klienta od pierwszego wyszukania aż do powtórnych zakupów. Włączasz moduły po kolei albo wszystkie naraz — każdy działa sam, a razem działają lepiej." + (picked.length ? ` (Twoje zaznaczenie: ${picked.length}/6)` : "")}
              className="max-w-[460px] font-[Inter] font-light text-[14.5px] sm:text-[16px] leading-8 text-white/45"
              isEditing={isEditing}
              as="p"
            />
          </div>
        </Reveal>
        <div className="mt-6 sm:mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {serviceDefaults.map((s,i)=>(
            <motion.div
              key={s.n}
              initial={{ opacity:0, y:14 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.7, delay:i*0.04, ease:[0.22,1,0.36,1]}}
              className="h-[260px] sm:h-[300px]"
            >
              <FlipCard
                fill
                editable={isEditing}
                selected={picked.includes(i)}
                onActivate={() => { sfxTap(); toggleModule(i); }}
                axis="y"
                ariaLabel={`Modu\u0142 ${s.n} \u2014 ${s.title}`}
                background={picked.includes(i) ? "#0A120E" : "#0A0A0D"}
                color="#F2F2F0"
                radius={24}
                width={420}
                height={300}
                perspective={1200}
                tiltMax={9}
                hoverScale={1.02}
                glareOpacity={0.17}
                shadow={false}
                flipOnClick={!isEditing}
                draggable={!isEditing}
                front={(
                  <div className="relative flex h-full w-full flex-col p-4 sm:p-6 lg:p-7">
                    <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(74% 54% at 50% 0%, rgba(255,255,255,0.08), transparent 72%)" }} />
                    <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/[0.08]" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)" }} />
                    <div className="relative flex items-center justify-between">
                      <PopNumber text={s.n} className="font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.16em] text-white/25" />
                      <span className="h-8 w-8 grid place-items-center rounded-full border border-white/10 text-white/25"><ArrowUpRight className="h-3.5 w-3.5"/></span>
                    </div>
                    <h3 className="relative mt-3 sm:mt-5 font-[Cormorant_Garamond] font-light text-[19px] sm:text-[21px] tracking-[-0.01em] leading-none">
                      <EditableText ek={`qraft.service.${i}.title`} def={s.title} className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />
                    </h3>
                    <div className="relative mt-auto space-y-2 pt-4">
                      <p className="font-[Inter] font-light text-[13.5px] sm:text-[14.5px] leading-6 text-white/55">
                        <span className="font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.14em] text-white/30 mr-2">DOSTAJESZ</span>
                        <EditableText ek={`qraft.service.${i}.d`} def={s.dostajesz} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                      </p>
                      {isEditing && (
                        <p className="font-[Inter] font-light text-[13.5px] sm:text-[14.5px] leading-6 text-white/80">
                          <span className="font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.14em] text-white/45 mr-2">CEL</span>
                          <EditableText ek={`qraft.service.${i}.c`} def={s.cel} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-3 pt-3">
                        {isEditing ? (
                          <span className="font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.18em] text-white/25">TRYB EDYCJI</span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-[JetBrains_Mono] font-light text-[8px] sm:text-[9px] tracking-[0.16em] transition-colors duration-500 ${
                              picked.includes(i)
                                ? "border-[#7DF0AE]/60 bg-[#7DF0AE]/12 text-[#9BF3C0]"
                                : "border-white/12 text-white/35"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${picked.includes(i) ? "bg-[#7DF0AE]" : "bg-white/25"}`} />
                            {picked.includes(i) ? "W TWOIM SYSTEMIE" : "DODAJ DO SYSTEMU"}
                          </span>
                        )}
                        {!isEditing && (
                          <span className="flex items-center gap-2 font-[JetBrains_Mono] font-light text-[8px] sm:text-[9px] tracking-[0.18em] text-white/25">
                            <RefreshCw className="h-3 w-3"/> OBR\u00d3\u0106
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                back={(
                  <div className="relative flex h-full w-full flex-col p-4 sm:p-6 lg:p-7">
                    <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(86% 62% at 50% 108%, rgba(255,255,255,0.10), transparent 70%)" }} />
                    <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/[0.12]" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.08)" }} />
                    <div className="relative font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.18em] text-white/30">{s.meta}</div>
                    <h3 className="relative mt-3 font-[Cormorant_Garamond] font-light text-[17px] sm:text-[19px] leading-none tracking-[-0.01em]">
                      <EditableText ek={`qraft.service.${i}.title`} def={s.title} className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />
                    </h3>
                    <p className="relative mt-4 font-[Inter] font-light text-[13.5px] leading-5 text-white/80">
                      <span className="font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.14em] text-white/45 mr-2">CEL</span>
                      <EditableText ek={`qraft.service.${i}.c`} def={s.cel} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                    </p>
                    <ul className="relative mt-3 space-y-1">
                      {s.pts.map((p,k)=>(
                        <li key={k} className="flex items-start gap-2 font-[Inter] font-light text-[12px] sm:text-[13px] leading-5 text-white/55">
                          <Check className="mt-[3px] h-3 w-3 shrink-0 text-white/30"/>{p}
                        </li>
                      ))}
                    </ul>
                    <div className="relative mt-auto space-y-3 pt-6">
                      <span
                        className={`flex h-10 w-full items-center justify-center gap-2 rounded-full border font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.16em] transition-colors duration-500 ${
                          picked.includes(i)
                            ? "border-[#7DF0AE] bg-[#7DF0AE] text-black"
                            : "border-white/20 text-white/75"
                        }`}
                      >
                        {picked.includes(i) ? <><Check className="h-3.5 w-3.5"/> W TWOIM SYSTEMIE</> : <>DODAJ DO SYSTEMU <ArrowRight className="h-3 w-3 opacity-60"/></>}
                      </span>
                      <div className="flex items-center justify-between font-[JetBrains_Mono] font-light text-[8px] sm:text-[9px] tracking-[0.18em]">
                        <span className="text-white/25">COFNIJ</span>
                        <button
                          onPointerDown={(e)=>e.stopPropagation()}
                          onClick={(e)=>{ e.stopPropagation(); go("contact"); }}
                          className="text-white/50 transition-colors duration-300 hover:text-white"
                        >
                          SPRAWDZIMY NA AUDYCIE →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              />
            </motion.div>
          ))}
        </div>
        {/* przy wiecej niz 4 modulach pakiet PRESTIGE dobiera sie automatycznie */}
        {picked.length > 4 && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-[20px] border border-[#7DF0AE]/40 bg-[#7DF0AE]/10 p-4 sm:p-5">
            <p className="font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.16em] text-[#9BF3C0]">
              5+ MODUŁÓW — DOBRALIŚMY CI PAKIET PRESTIGE
            </p>
            <BtnGhost onClick={()=>go("atelier")} className="h-9 shrink-0 border-[#7DF0AE]/50 px-4 text-[9px] text-[#9BF3C0]">
              ZOBACZ ATELIER
            </BtnGhost>
          </div>
        )}
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
          <Reveal><ProcessStack isEditing={isEditing} onZoneChange={setInProcess} /></Reveal>
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
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #050507 0%, rgba(5,5,7,0.35) 22%, rgba(5,5,7,0.25) 55%, rgba(5,5,7,0.78) 88%, #050507 100%)" }} />
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
                    <CountUp to={Number(to)} suffix={String(suffix)} />
                  </div>
                  <div className="mt-3 font-[JetBrains_Mono] font-light text-[8.5px] sm:text-[9.5px] tracking-[0.18em] text-white/45">
                    <EditableText ek={`qraft.atelier.stat${idx}`} def={String(label)} className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" />
                  </div>
                </div>
              ))}
              style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.07), 0 18px 50px rgba(0,0,0,0.4)" }}
            >
              {[
                ["Zdjęć w miesiącu", 24, "+"],
                ["Godzin warsztatu", 90, ""],
                ["Detali w kadrze", 340, "+"],
              ].map(([label, to, suffix], idx) => (
                <div key={String(label)} className="border-r border-white/10 px-4 py-8 text-center last:border-r-0 sm:py-10">
                  <div className="font-[Cormorant_Garamond] font-light text-[26px] sm:text-[40px] leading-none text-white">
                    <CountUp to={Number(to)} suffix={String(suffix)} />
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
                    <CountUp to={Number(to)} suffix={String(suffix)} />
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
                    <select name="time" value={form.time} onChange={(e)=>setForm({...form, time:e.target.value})} className="w-full h-11 rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm text-white [color-scheme:dark] focus:outline-none focus:border-white/25">
                      {["9:00","10:30","12:00","14:00","16:00","18:00"].map((t)=>(<option key={t} className="bg-[#0F0F11]" value={t}>{t}</option>))}
                    </select>
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="block font-[JetBrains_Mono] font-light text-[9px] sm:text-[10px] tracking-[0.12em] text-white/45">CO CHCESZ POPRAWIC</span>
                  <textarea name="message" rows={3} value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} placeholder="np. pusty kalendarz w weekendy, brak zdjęć w Mapach…" className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-5 py-4 font-[Inter] font-light text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"/>
                </label>

                <BtnPrimary type="submit" className="w-full h-[48px] text-[10px] sm:text-[11px]">
                  <TextSwap text={sent ? "WYSŁANO ZGŁOSZENIE" : "WYŚLIJ ZAPYTANIE O TERMIN"} />
                  <AnimatePresence initial={false} mode="wait">
                    {sent ? (
                      <motion.span key="check" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.25 }} className="inline-flex">
                        <Check className="h-4 w-4" />
                      </motion.span>
                    ) : (
                      <motion.span key="arrow" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="inline-flex">
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </BtnPrimary>
                <div className="text-center font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.04em] text-white/20">
                  {sent ? (
                    <TextSwap text="Dziękujemy — odezwiemy się z potwierdzeniem." />
                  ) : (
                    <>Lub <button type="button" onClick={()=>navigate("/auth")} className="underline decoration-white/15 text-white/30 hover:text-white/60">zaloguj się</button> by zarządzać terminami</>
                  )}
                </div>
              </form>

              <AnimatePresence>
                {sent && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-6 flex items-start gap-4 rounded-[20px] border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="h-9 w-9 shrink-0 grid place-items-center rounded-full bg-white text-black">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-[Inter] font-light text-[13px] sm:text-[14px] text-white">Termin zarezerwowany</div>
                      <div className="mt-1 font-[Inter] font-light text-[12px] sm:text-[13px] leading-6 text-white/55">
                        {form.date ? new Date(form.date + "T12:00:00").toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" }) : ""} · {form.time} · {svc.label} — potwierdzenie wyślemy na {form.email || form.phone}.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.08em] text-white/20">
          <div className="flex items-center gap-3"><div className="h-7 w-7 rounded-[9px] border border-white/10 grid place-items-center font-[Instrument_Serif] text-[13px] sm:text-[14px] font-light">Q</div><span className="font-[Instrument_Serif] font-light tracking-[0.2em] text-white/60 text-xs">QRAFT</span><span className="hidden sm:inline">© {new Date().getFullYear()} · PERFEKCJA BUDUJE MARKI</span></div>
          <div className="flex gap-3"><span>qraft.build</span><span className="opacity-20">·</span><span>Otwarte dla wszystkich</span></div>
        </div>
      </footer>

      {!isEditing && (
        <button onClick={()=>setIsEditing(true)} className="group fixed bottom-6 right-6 z-50 hidden lg:inline-flex items-center gap-2 px-5 h-11 rounded-full border border-white/25 bg-white/[0.03] backdrop-blur-2xl font-[JetBrains_Mono] font-light text-[10px] sm:text-[11px] tracking-[0.08em] text-white/70 transition-all duration-500 hover:border-white/50 hover:bg-white hover:text-black shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
          <Pencil className="h-3.5 w-3.5" /> EDYTUJ TEKSTY
        </button>
      )}
    </div>
  );
}
