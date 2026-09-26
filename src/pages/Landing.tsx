import { motion, AnimatePresence, useScroll, useSpring, useTransform, useInView, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Check, Minus, Plus, Clock, Terminal, Pencil, Save, RefreshCw } from "lucide-react";
import { useState, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { useNavigate } from "react-router";
import { ClearField, DigitChars, PopNumber, SlidingTabs, TextSwap, usePopIn } from "@/components/transitions";
import GradualBlur from "@/components/GradualBlur";
import FlipCard from "@/components/FlipCard";
import LineSidebar from "@/components/LineSidebar";
import QraftMark from "@/components/QraftMark";
import GlowCursor from "@/components/GlowCursor";
import GlareHover from "@/components/GlareHover";
import PixelTrail from "@/components/PixelTrail";
import StaggeredMenu from "@/components/StaggeredMenu";
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

const plans = [
  { name: "ESSENCE", price: "1 900 zł", sub: "/ mies.", line: "Fundamenty, by dać się znaleźć.", pts: ["Uporządkowanie marki", "Strona + Mapy", "Opieka i raport"], featured: false, cta: "Wybierz Essence" },
  { name: "SIGNATURE", price: "3 800 zł", sub: "/ mies.", line: "Pełny system. Wypełnia kalendarz.", pts: ["Wszystko z Essence", "Zasięg + płatne w promieniu", "Silnik treści + lista"], featured: true, cta: "Wybierz Signature" },
  { name: "PRESTIGE", price: "Wycena", sub: "", line: "Starty, rebrandingi, wiele lokalizacji.", pts: ["Od zera", "Atelier foto & film", "Sprinty co tydzień"], featured: false, cta: "Zapytaj o Prestige" },
];

/* okienko audytu — wybór usługi przesuwa pasek */
const auditServices = [
  { id: "audyt", label: "AUDYT", note: "bezpłatny · 20 min", items: ["Ogląd firmy z zewnątrza", "Pierwsza największa dźwignia", "Lista rzeczy do naprawy"] },
  { id: "essence", label: "ESSENCE", note: "1 900 zł / mies.", items: ["Uporządkowanie marki", "Strona + Mapy", "Opieka i raport"] },
  { id: "signature", label: "SIGNATURE", note: "3 800 zł / mies.", items: ["Wszystko z Essence", "Zasięg + płatne w promieniu", "Silnik treści + lista"] },
  { id: "prestige", label: "PRESTIGE", note: "wycena indywidualna", items: ["Od zera", "Atelier foto & film", "Sprinty co tydzień"] },
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

function FloatingField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* miękkie orb-y w odcieniach czerni/szarości */}
      {[
        { left: "6%", top: "14%", size: 420, dur: 16 },
        { left: "62%", top: "8%", size: 360, dur: 18 },
        { left: "38%", top: "42%", size: 520, dur: 20 },
        { left: "78%", top: "48%", size: 300, dur: 15 },
      ].map((o,i)=>(
        <motion.div key={i} className="absolute rounded-full"
          style={{
            left: o.left, top: o.top, width: o.size, height: o.size,
            background: "radial-gradient(circle at center, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 35%, transparent 70%)",
            filter: "blur(28px)",
          }}
          animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut", delay: i*0.6 }}
        />
      ))}
      {/* latający pył — 12 drobin */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={"dust"+i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${8 + (i * 7.8) % 84}%`,
            top: `${12 + (i % 4) * 18 + (i % 3)*6}%`,
            width: i % 3 === 0 ? 2 : 1.2,
            height: i % 3 === 0 ? 2 : 1.2,
            opacity: 0.18 + (i % 4)*0.06,
            boxShadow: i % 4 === 0 ? "0 0 6px rgba(255,255,255,0.5)" : "none",
          }}
          animate={{
            y: [0, -22 - (i % 5)*4, 0],
            x: [0, 8 - (i % 3)*4, -6, 0],
            opacity: [0.18, 0.38, 0.18],
          }}
          transition={{ duration: 10 + i*0.7, repeat: Infinity, ease: "easeInOut", delay: i*0.35 }}
        />
      ))}
      {/* cienkie latające pierścienie */}
      {[
        { l: "14%", t: "22%", s: 44 },
        { l: "82%", t: "18%", s: 32 },
        { l: "68%", t: "62%", s: 56 },
      ].map((r,i)=>(
        <motion.div key={"ring"+i} className="absolute rounded-full border border-white/[0.06]"
          style={{ left: r.l, top: r.t, width: r.s, height: r.s }}
          animate={{ y: [0, -14, 0], rotate: [0, 12, 0], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 13 + i*2, repeat: Infinity, ease: "easeInOut", delay: i*0.7 }}
        />
      ))}
      {/* subtelne kreski */}
      {[
        { l: "22%", t: "68%", w: 28 },
        { l: "74%", t: "28%", w: 36 },
      ].map((k,i)=>(
        <motion.div key={"line"+i} className="absolute h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{ left: k.l, top: k.t, width: k.w }}
          animate={{ x: [0, 10, 0], opacity: [0.18, 0.32, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: i*1.1 }}
        />
      ))}
    </div>
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

/* ---------------- spiral plan showcase (desktop) ------------------ */

function useDesktop() {
  const [on, setOn] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return on;
}

/** off = -1 / 0 / 1 — position on a cylinder wound into a spiral. */
const SPIRAL_R = 340;
function spiralAt(off: number) {
  const a = off * 0.7;
  return {
    x: Math.sin(a) * SPIRAL_R,
    y: (1 - Math.cos(a)) * 150,
    rotate: Math.sin(a) * 11,
    scale: off === 0 ? 1.02 : 1 - Math.abs(off) * 0.07,
    opacity: off === 0 ? 1 : 0.55,
    filter: off === 0 ? "blur(0px)" : "blur(1px)",
    zIndex: 20 - Math.abs(off) * 10,
  };
}

/* Szklany przycisk strzałki (plany: poziomy, proces: pionowy). Klik =
   wciśnięcie szkła, błysk przebiegający przez obręcz, fala od środka
   i strzałka wysuwająca się w kierunku podróży. tone="light" — wariant
   na jasnym tle sekcji PROCES. */
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

function PlanShowcase({
  isEditing,
  onPick,
  recommended = 1,
  pickedCount = 0,
}: {
  isEditing: boolean;
  onPick: () => void;
  recommended?: number;
  pickedCount?: number;
}) {
  const L = plans.length;
  const [active, setActive] = useState(recommended);
  const isDesktop = useDesktop();
  const stageRef = useRef<HTMLDivElement>(null);
  /* wjeżdżając w sekcję planów podpowiadamy pakiet dobrany do liczby modułów */
  const inView = useInView(stageRef, { amount: 0.25, margin: "0px 0px -12% 0px" });
  useEffect(() => {
    if (inView) setActive(recommended);
  }, [inView, recommended]);
  const signed = (n: number) => {
    const m = ((n % L) + L) % L;
    return m > L / 2 ? m - L : m;
  };
  const turn = (d: number) => setActive((a) => ((a + d) % L + L) % L);

  return (
    <>
      <div ref={stageRef} className="relative mt-14 flex flex-col lg:block lg:h-[660px]">
        {/* szklane strzałki obok wybranego planu — animowane kliknięciem */}
        <GlassArrow
          dir={-1}
          onClick={() => turn(-1)}
          label="Poprzedni plan"
          className="hidden lg:grid absolute top-1/2 -translate-y-1/2 left-[24px]"
        />
        <GlassArrow
          dir={1}
          onClick={() => turn(1)}
          label="Następny plan"
          className="hidden lg:grid absolute top-1/2 -translate-y-1/2 right-[24px]"
        />
        {/* guide rings + floor light (desktop only) */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 hidden lg:block"
          style={{ width: 920, height: 480, transform: "translate(-50%,-50%)" }}
        >
          <div className="absolute inset-0 rounded-[50%] border border-white/[0.05]" />
          <div className="absolute inset-[70px_-50px] rounded-[50%] border border-dashed border-white/[0.035]" />
        </div>
        <div
          className="pointer-events-none absolute left-1/2 bottom-20 hidden lg:block rounded-[50%] blur-2xl -translate-x-1/2"
          style={{
            width: 640,
            height: 90,
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.12), transparent 70%)",
          }}
        />

        {plans.map((p, i) => {
          const off = signed(i - active);
          const front = off === 0;
          const pos = isDesktop
            ? spiralAt(off)
            : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 1 };
          const cta = (
            <EditableText
              ek={`qraft.plan.${i}.cta2`}
              def={p.cta}
              className="font-[JetBrains_Mono] font-light tracking-[0.14em]"
              isEditing={isEditing}
              as="span"
            />
          );
          return (
            <motion.div
              key={p.name}
              onClick={() => (off === 1 ? turn(1) : off === -1 ? turn(-1) : undefined)}
              initial={false}
              animate={pos}
              transition={{ type: "spring", stiffness: 70, damping: 15, mass: 1.1 }}
              style={{ transformOrigin: "50% 50%" }}
              className={`relative mb-6 last:mb-0 lg:absolute lg:mb-0 lg:left-1/2 lg:top-1/2 lg:w-[360px] lg:-ml-[180px] lg:-mt-[300px] ${
                off === 0 ? "cursor-default" : "cursor-pointer"
              } ${front ? "shadow-[0_10px_26px_rgba(0,0,0,0.28)]" : "shadow-[0_8px_22px_rgba(0,0,0,0.28)]"}`}
            >
              {/* animacja nie zostaje w granicach kafla: poświata i obracające się
                  światło żyją poza nim i towarzyszą karcie w spirali */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-x-10 -top-10 -bottom-14"
                initial={false}
                animate={{ opacity: front ? [0.65, 1, 0.65] : 0.26 }}
                transition={
                  front
                    ? { duration: 7.5, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.5 }
                }
                style={{
                  background:
                    "radial-gradient(58% 52% at 50% 58%, rgba(255,255,255,0.18), rgba(255,255,255,0.05) 56%, transparent 76%)",
                  filter: "blur(30px)",
                }}
              />
              {front && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                >
                  {[
                    { x: -300, y: -60, s: 210, o: 0.5 },
                    { x: 260, y: 130, s: 150, o: 0.34 },
                  ].map((d, k) => (
                    <span
                      key={k}
                      className="absolute rounded-full"
                      style={{
                        left: d.x,
                        top: d.y,
                        width: d.s,
                        height: d.s,
                        opacity: d.o,
                        background: "radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)",
                        filter: "blur(26px)",
                      }}
                    />
                  ))}
                </motion.div>
              )}
              <GlareHover
                width="100%"
                height="100%"
                background="transparent"
                borderRadius="28px"
                borderColor="transparent"
                glareColor="#ffffff"
                glareOpacity={front ? 0.18 : 0}
                glareAngle={-30}
                glareSize={320}
                transitionDuration={850}
                style={{ display: "block", border: "none", outline: "none" }}
              >
              <div
                className={`relative overflow-hidden rounded-[28px] border p-8 flex flex-col h-full transition-colors duration-500 ${
                  front
                    ? "bg-[#F7F7F5] text-black border-[#F7F7F5]"
                    : "bg-white/[0.07] text-white border-white/[0.14] backdrop-blur-2xl backdrop-saturate-[1.4] shadow-[inset_0_1px_1px_rgba(255,255,255,0.16)]"
                }`}
              >
                {/* szklany polysk na kartach bocznych */}
                {!front && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                )}
                {/* pakiet dobrany do liczby zaznaczonych modułów */}
                {i === recommended && (
                  <div className="absolute right-0 top-0 z-20 flex items-center gap-2 rounded-bl-[22px] rounded-tr-[28px] bg-[#7DF0AE] px-4 py-2.5 font-[JetBrains_Mono] font-light text-[9px] tracking-[0.16em] text-black">
                    <span className="h-1.5 w-1.5 rounded-full bg-black/55" />
                    IDEALNY DLA CIEBIE
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-[JetBrains_Mono] font-light text-[11px] tracking-[0.16em] ${
                      front ? "text-black/65" : "text-white/60"
                    }`}
                  >
                    <EditableText
                      ek={`qraft.plan.${i}.name2`}
                      def={p.name}
                      className="font-[JetBrains_Mono] font-light"
                      isEditing={isEditing}
                      as="span"
                    />
                  </span>
                  {p.featured && i !== recommended && (
                    <span
                      className={`font-[JetBrains_Mono] font-light text-[10px] rounded-full px-3 py-1 ${
                        front
                          ? "bg-black text-white"
                          : "bg-white/10 text-white/80 border border-white/15"
                      }`}
                    >
                      WYRÓŻNIONY
                    </span>
                  )}
                </div>
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="font-[Cormorant_Garamond] font-light text-[30px] tracking-[-0.02em]">
                    <EditableText
                      ek={`qraft.plan.${i}.price`}
                      def={p.price}
                      className="font-[Cormorant_Garamond] font-light"
                      isEditing={isEditing}
                      as="span"
                      pop
                      popKey={off === 0 ? String(active) : "off"}
                    />
                  </span>
                  <span
                    className={`font-[JetBrains_Mono] font-light text-[11px] ${
                      front ? "text-black/55" : "text-white/55"
                    }`}
                  >
                    <EditableText
                      ek={`qraft.plan.${i}.sub`}
                      def={p.sub}
                      className="font-[JetBrains_Mono] font-light"
                      isEditing={isEditing}
                      as="span"
                    />
                  </span>
                </div>
                <EditableText
                  ek={`qraft.plan.${i}.line`}
                  def={p.line}
                  className={`mt-2 block font-[Inter] font-light text-[14px] ${
                    front ? "text-black/70" : "text-white/70"
                  }`}
                  isEditing={isEditing}
                  as="div"
                />
                <ul className="mt-8 space-y-3 flex-1">
                  {p.pts.map((x, idx) => (
                    <li
                      key={x}
                      className={`flex gap-3 font-[Inter] font-light text-[14px] ${
                        front ? "text-black/85" : "text-white/85"
                      }`}
                    >
                      <Check
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          front ? "text-black/45" : "text-white/60"
                        }`}
                      />
                      <EditableText
                        ek={`qraft.plan.${i}.pt${idx}`}
                        def={x}
                        className="font-[Inter] font-light"
                        isEditing={isEditing}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
                {/* guzik wyboru musi być czytelny na obu wariantach karty:
                    front jest biały → przycisk ciemny, karty boczne szklane → jasny */}
                <div onClick={(e) => e.stopPropagation()} className="mt-10">
                  {front ? (
                    <BtnDark onClick={onPick} className="w-full h-11 text-[11px]">
                      {cta}
                    </BtnDark>
                  ) : (
                    <BtnPrimary onClick={onPick} className="w-full h-11 text-[11px]">
                      {cta}
                    </BtnPrimary>
                  )}
                </div>
              </div>
              </GlareHover>
            </motion.div>
          );
        })}
      </div>

      {/* desktop: zamiast przycisków wyboru — typograficzne domknięcie sekcji */}
      <div className="mt-12 hidden lg:flex flex-col items-center text-center select-none">
        <div className="flex items-center gap-4">
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-white/20" />
          <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.32em] text-white/30">
            PRECISION BUILDS BRANDS
          </span>
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-white/20" />
        </div>
        <p className="mt-5 font-[Cormorant_Garamond] font-light text-[40px] leading-[1.04] tracking-[-0.01em] text-[#F2F2F0]">
          Perfection{" "}
          <span className="font-[Instrument_Serif] italic text-white/55">can’t be rushed</span>
        </p>
        <p className="mt-4 font-[Cormorant_Garamond] font-light text-[20px] leading-none text-white/50">
          Cały proces zajmuje{" "}
          <span className="font-[Instrument_Serif] italic text-[#7DF0AE]">od 90 dni</span>.
        </p>
        {pickedCount > 0 && (
          <p className="mt-4 font-[JetBrains_Mono] font-light text-[10px] tracking-[0.24em] text-white/25">
            DOPASOWANE DO {pickedCount} MODUŁÓW
          </p>
        )}
      </div>
    </>
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
        <div className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.18em] text-black/30">02 — PROCES</div>
        <h3 className="mt-4 font-[Cormorant_Garamond] font-light text-[36px] leading-[0.9] tracking-[-0.02em]">
          <EditableText ek="qraft.process.h1" def="Cztery tygodnie" className="block font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />
          <EditableText ek="qraft.process.h2" def="do rozpędu." className="block font-[Cormorant_Garamond] font-light italic text-black/30" isEditing={isEditing} as="span" />
        </h3>
        <EditableText ek="qraft.process.desc" def="Otwarty proces. Cotygodniowe dowody. Bez teatru." className="mt-4 block font-[Inter] font-light text-[15px] leading-7 text-black/60" isEditing={isEditing} as="p" />

        <div className="mt-10 flex items-center gap-3">
          <GlassArrow
            dir={-1}
            axis="y"
            tone="light"
            onClick={() => step(active - 1, -1)}
            label="Poprzedni etap"
            className="grid"
          />
          <GlassArrow
            dir={1}
            axis="y"
            tone="light"
            onClick={() => step(active + 1, 1)}
            label="Następny etap"
            className="grid"
          />
          <div className="ml-1 flex items-baseline gap-2 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.16em] text-black/30">
            ETAP
            <PopNumber text={`0${active + 1}`} className="text-black/70" />
            <span className="opacity-50">/ 0{n}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 sm:gap-10">
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
                    backgroundColor: i <= active ? "#0a0a0a" : "#E4E4E0",
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
          <div ref={stackRef} className="t-stack t-stack--steps absolute inset-x-0 bottom-0 h-[340px]">
            {processSteps.map((s, i) => {
              const d = mod(active - i);
              const front = d === 0;
              return (
                <div
                  key={s.n}
                  data-step={i}
                  data-depth={d === 3 ? 2 : d}
                  className={`t-stack-banner h-[250px] w-full rounded-[24px] border p-7 flex flex-col ${
                    front
                      ? "bg-[#F4F4F1] border-black/12 text-black shadow-[0_24px_60px_rgba(0,0,0,0.14)]"
                      : "bg-[#EDEDE9]/85 border-black/[0.09] text-black/85 backdrop-blur-xl"
                  } ${d === 3 ? "is-leaving" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.16em]">
                      {s.n}
                    </span>
                    <span className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.12em] opacity-80">
                      {s.meta}
                    </span>
                  </div>
                  <h4 className="mt-6 font-[Cormorant_Garamond] font-light text-[26px] lg:text-[30px] leading-none tracking-[-0.02em]">
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
                    className="mt-4 block font-[Inter] font-light text-[15px] leading-7 opacity-95"
                    isEditing={isEditing}
                    as="p"
                  />
                  <div className="mt-auto flex gap-2">
                    {processSteps.map((_, k) => (
                      <span
                        key={k}
                        className="h-[3px] flex-1 rounded-full transition-colors duration-500"
                        style={{ backgroundColor: k <= active ? "#0a0a0a" : "rgba(0,0,0,0.12)" }}
                      />
                    ))}
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

      <g fill="none" strokeLinecap="round" filter="url(#qSoft)">
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
  { label: "PLANY", id: "pricing" },
  { label: "PROCES", id: "process" },
  { label: "FAQ", id: "faq" },
  { label: "KONTAKT", id: "contact" },
];
const SIDEBAR_IDS = SIDEBAR.map((s) => s.id);

/* menu z boku: kolejność zgodna z ławkiem bocznym */
const MENU_ITEMS: StaggeredMenuItem[] = [
  { label: "System", ariaLabel: "Przejdź do sekcji SYSTEM", link: "#services" },
  { label: "Plany", ariaLabel: "Przejdź do sekcji PLANY", link: "#pricing" },
  { label: "Proces", ariaLabel: "Przejdź do sekcji PROCES", link: "#process" },
  { label: "FAQ", ariaLabel: "Przejdź do sekcji FAQ", link: "#faq" },
  { label: "Kontakt", ariaLabel: "Przejdź do sekcji KONTAKT", link: "#contact" },
  { label: "Zaloguj się", ariaLabel: "Przejdź do logowania", link: "/auth" },
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
  const y = useTransform(p, [0, 1], ["0%", "-30%"]);
  const x = useTransform(p, [0, 1], ["0%", "-11%"]);
  const scale = useTransform(p, [0, 1], [1.08, 1.36]);
  const rotate = useTransform(p, [0, 1], ["0deg", "-2.6deg"]);

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

      <div
        className="absolute inset-0 opacity-[0.03]"
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
  const atPageEnd = useAtPageEnd();
  /* ślad pikselowy w hero ma sens tylko dla myszy/trackpada */
  const finePointer = useFinePointer();
  const spy = useSectionSpy(SIDEBAR_IDS);
  /* zaznaczone moduły w SYSTEM napędzają rekomendowany pakiet */
  const [picked, setPicked] = useState<number[]>([]);
  const toggleModule = (i: number) =>
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  const recommended = picked.length > 3 ? 2 : 1;
  const cinemaRef = useRef<HTMLElement>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const { scrollYProgress: cinemaProgress } = useScroll({ target: cinemaRef, offset: ["start end", "end start"] });
  const cinemaY = useTransform(cinemaProgress, [0, 1], ["-14%", "14%"]);
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
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name || !form.date) return;
    setSent(true);
    setTimeout(()=>setSent(false), 6000);
  };

  const svc = auditServices.find((s) => s.id === form.service) || auditServices[0];

  return (
    <div className="min-h-screen text-[#F2F2F0] antialiased selection:bg-white selection:text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@300;400&family=Space+Grotesk:wght@300;400&display=swap'); html{scroll-behavior:smooth} @keyframes qmarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}} @keyframes qmsheen{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}} @keyframes qmbreathe{0%,100%{opacity:.35}50%{opacity:.9}}`}</style>
      <motion.div className="fixed top-0 inset-x-0 h-[1px] bg-white/80 z-50 origin-left" style={{ scaleX: progress }} />
      <FlowBackdrop />
      <GradualBlur
        target="page"
        position="bottom"
        height="8rem"
        strength={3}
        divCount={10}
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
        enabled={!REDUCE_MOTION}
        color={inProcess ? "#0a0a0a" : "#ffffff"}
        secondaryColor={inProcess ? "#3c3e3d" : "#c9c9cf"}
        trailLength={38}
        trailWidth={6}
        trailTaper={0.82}
        followSpeed={0.16}
        glowIntensity={1.7}
        glowSpread={1.15}
        hotspot={inProcess ? 0.05 : 0.7}
        brightness={inProcess ? 0.9 : 1.2}
        opacity={inProcess ? 0.42 : 0.5}
        pulseSpeed={1.1}
        noiseStrength={0.03}
        idleFade
        idleTimeout={700}
        fadeDuration={600}
        blendMode={inProcess ? "normal" : "screen"}
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
                className={`font-[JetBrains_Mono] font-light text-[8px] leading-[1.7] tracking-[0.2em] ${
                  inProcess ? "text-black/40" : "text-white/30"
                }`}
              >
                PRECISION
                <br />
                BUILDS BRANDS
              </span>
            </div>
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border font-[Instrument_Serif] text-[13px] ${
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
            onItemClick={(i) => go(SIDEBAR[i].id)}
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
            className={`flex items-center justify-between font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] transition-opacity duration-300 hover:opacity-100 ${
              inProcess ? "text-black/60" : "text-white/45"
            }`}
          >
            ZACZNIJMY
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </motion.aside>
      </div>

      <FloatingField />

      <motion.header
        animate={{ y: barHidden && !isEditing ? "-104%" : "0%" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 bg-[#050507]/28 backdrop-blur-[28px] backdrop-saturate-[1.5] border-b border-white/[0.08] supports-[backdrop-filter]:bg-[#050507]/20" style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" } as any}>
        <div className="mx-auto max-w-[1280px] pl-6 pr-[150px] lg:pl-8 lg:pr-[176px] h-[72px] flex items-center justify-between">
          <motion.div
            animate={{ y: barHidden ? 12 : 0, opacity: barHidden ? 0 : 1 }}
            transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <button
              onClick={()=>setNavOpen((v)=>!v)}
              aria-label={navOpen ? "Ukryj nawigację" : "Pokaż nawigację"}
              aria-expanded={navOpen}
              className={`h-[32px] w-[32px] rounded-[10px] border grid place-items-center cursor-pointer transition-all duration-300 ${navOpen ? "bg-white text-black border-white" : "border-white/15 bg-white/[0.02] hover:border-white/45 hover:bg-white/[0.08]"}`}
            >
              <span className="font-[Instrument_Serif] text-[16px]">Q</span>
            </button>
            <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} className="flex items-center gap-4 cursor-pointer">
              <span className="font-[Space_Grotesk] font-light tracking-[0.28em] text-[12px]">QRAFT</span>
              <span className="hidden lg:inline font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] text-white/25 border-l border-white/10 pl-4 ml-1">PERFEKCJA BUDUJE MARKI</span>
            </button>
          </motion.div>
          <motion.div
            animate={{ y: barHidden ? 12 : 0, opacity: barHidden ? 0 : 1 }}
            transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            <button
              onClick={()=>setIsEditing(!isEditing)}
              className={`hidden md:inline-flex items-center gap-2 px-4 h-9 rounded-full border font-[JetBrains_Mono] font-light text-[11px] tracking-[0.12em] transition-all duration-500 backdrop-blur ${isEditing ? "bg-white text-black border-white" : "border-white/15 bg-white/[0.02] text-white/60 hover:border-white/45 hover:bg-white/[0.08] hover:text-white"}`}
            >
              {isEditing ? <><Save className="h-3.5 w-3.5"/> ZAKOŃCZ EDYCJĘ</> : <><Pencil className="h-3.5 w-3.5"/> EDYTUJ TEKSTY</>}
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.14em] text-white/20"><Terminal className="h-3 w-3 opacity-60"/> qraft.build</span>
            <BtnPrimary onClick={()=>go("contact")} className="hidden sm:inline-flex text-[11px] tracking-[0.16em] px-6 h-9">ROZPOCZNIJ</BtnPrimary>
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
        colors={["#170A04", "#33110A", "#8A2A0C", "#FF3E0A"]}
        accentColor="#FF3E0A"
        menuButtonColor="#F2F2F0"
        openMenuButtonColor="#FF3E0A"
        changeMenuColorOnOpen
        closeOnClickAway
        onItemClick={handleMenuItem}
      />

      {isEditing && (
        <div className="sticky top-[72px] z-30 bg-[#111113] border-y border-white/10 text-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.04em] text-white/70">
              <Pencil className="h-3.5 w-3.5 text-white/50"/> Tryb edycji — kliknij w dowolny tekst, aby go zmienić. Zapis automatyczny w przeglądarce.
            </div>
            <button onClick={()=>setIsEditing(false)} className="hidden sm:inline-flex bg-white text-black font-[JetBrains_Mono] font-light text-[11px] tracking-[0.08em] px-4 h-7 rounded-full">GOTOWE</button>
          </div>
        </div>
      )}

      <section ref={cinemaRef} className="relative overflow-hidden">
        {/* jedna duża fotografia gór — parallax przez całą sekcję */}
        <div className="absolute inset-0">
          <motion.div style={{ y: cinemaY }} className="absolute inset-0 scale-[1.35]">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000&q=80&auto=format&fit=crop"
              alt="Góry o świcie"
              className="h-full w-full object-cover grayscale contrast-110 brightness-[0.42]"
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
          <div className="absolute inset-0 z-[5] mix-blend-screen">
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
          <div className="flex min-h-[calc(100vh-72px)] flex-col justify-center py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-[Space_Grotesk] font-light uppercase leading-[0.84] tracking-[-0.045em] text-[clamp(30px,7.4vw,100px)]">
                <span className="block text-white">Precision</span>
                <span className="block text-white">Builds</span>
                <span className="block text-transparent" style={{ WebkitTextStroke: "1.2px rgba(255,255,255,0.6)" }}>
                  Brands
                </span>
              </h1>

              <motion.div
                className="mt-12 h-px w-full bg-white origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />

              <motion.div
                className="mt-10 flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.6 }}
              >
                <BtnPrimary onClick={() => go("contact")} className="h-[52px] px-8 text-[11px] pointer-events-auto">
                  ZAMÓW DARMOWY AUDYT <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </BtnPrimary>
                <BtnGhost onClick={() => go("services")} className="h-[52px] pl-2 pr-6 text-[11px] pointer-events-auto">
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
                    <div className="font-[Cormorant_Garamond] font-light text-[26px] leading-none">{s.v}</div>
                    <div className="mt-2 font-[JetBrains_Mono] font-light text-[10px] tracking-[0.14em] text-white/55">{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/[0.06] pb-12 lg:pb-16">
            <div>
              <div className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.2em] text-white/50">01 — SYSTEM</div>
              <h2 className="mt-5 leading-[0.9] tracking-[-0.02em]">
                <EditableText ek="qraft.system.h1" def="Jeden system. Sześć modułów." className="block font-[Cormorant_Garamond] font-light text-[31px] sm:text-[52px]" isEditing={isEditing} as="span" />
              </h2>
            </div>
            <EditableText
              ek="qraft.system.subtitle"
              def="System prowadzi klienta od pierwszego wyszukania aż do powtórnych zakupów. Włączasz moduły po kolei albo wszystkie naraz — każdy działa sam, a razem działają lepiej."
              className="max-w-[460px] font-[Inter] font-light text-[16px] leading-8 text-white/45"
              isEditing={isEditing}
              as="p"
            />
          </div>
        </Reveal>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {serviceDefaults.map((s,i)=>(
            <motion.div
              key={s.n}
              initial={{ opacity:0, y:14 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.7, delay:i*0.04, ease:[0.22,1,0.36,1]}}
              className="h-[330px] sm:h-[348px]"
            >
              <FlipCard
                fill
                editable={isEditing}
                selected={picked.includes(i)}
                onActivate={() => toggleModule(i)}
                axis="y"
                ariaLabel={`Modu\u0142 ${s.n} \u2014 ${s.title}`}
                background={picked.includes(i) ? "#0A120E" : "#0A0A0D"}
                color="#F2F2F0"
                radius={24}
                width={420}
                height={348}
                perspective={1200}
                tiltMax={9}
                hoverScale={1.02}
                glareOpacity={0.17}
                shadow={false}
                flipOnClick={!isEditing}
                draggable={!isEditing}
                front={(
                  <div className="relative flex h-full w-full flex-col p-7 sm:p-8">
                    <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(74% 54% at 50% 0%, rgba(255,255,255,0.08), transparent 72%)" }} />
                    <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/[0.08]" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)" }} />
                    <div className="relative flex items-center justify-between">
                      <PopNumber text={s.n} className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.16em] text-white/25" />
                      <span className="h-8 w-8 grid place-items-center rounded-full border border-white/10 text-white/25"><ArrowUpRight className="h-3.5 w-3.5"/></span>
                    </div>
                    <h3 className="relative mt-7 font-[Cormorant_Garamond] font-light text-[23px] tracking-[-0.01em] leading-none">
                      <EditableText ek={`qraft.service.${i}.title`} def={s.title} className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />
                    </h3>
                    <div className="relative mt-auto space-y-2 pt-6">
                      <p className="font-[Inter] font-light text-[14.5px] leading-6 text-white/55">
                        <span className="font-[JetBrains_Mono] font-light text-[9.5px] tracking-[0.14em] text-white/30 mr-2">DOSTAJESZ</span>
                        <EditableText ek={`qraft.service.${i}.d`} def={s.dostajesz} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                      </p>
                      {isEditing && (
                        <p className="font-[Inter] font-light text-[14.5px] leading-6 text-white/80">
                          <span className="font-[JetBrains_Mono] font-light text-[9.5px] tracking-[0.14em] text-white/45 mr-2">CEL</span>
                          <EditableText ek={`qraft.service.${i}.c`} def={s.cel} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-3 pt-3">
                        {isEditing ? (
                          <span className="font-[JetBrains_Mono] font-light text-[9.5px] tracking-[0.18em] text-white/25">TRYB EDYCJI</span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-[JetBrains_Mono] font-light text-[9px] tracking-[0.16em] transition-colors duration-500 ${
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
                          <span className="flex items-center gap-2 font-[JetBrains_Mono] font-light text-[9px] tracking-[0.18em] text-white/25">
                            <RefreshCw className="h-3 w-3"/> OBR\u00d3\u0106
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                back={(
                  <div className="relative flex h-full w-full flex-col p-7 sm:p-8">
                    <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(86% 62% at 50% 108%, rgba(255,255,255,0.10), transparent 70%)" }} />
                    <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/[0.12]" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.08)" }} />
                    <div className="relative font-[JetBrains_Mono] font-light text-[9.5px] tracking-[0.18em] text-white/30">{s.meta}</div>
                    <h3 className="relative mt-3 font-[Cormorant_Garamond] font-light text-[21px] leading-none tracking-[-0.01em]">
                      <EditableText ek={`qraft.service.${i}.title`} def={s.title} className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />
                    </h3>
                    <p className="relative mt-4 font-[Inter] font-light text-[13.5px] leading-5 text-white/80">
                      <span className="font-[JetBrains_Mono] font-light text-[9.5px] tracking-[0.14em] text-white/45 mr-2">CEL</span>
                      <EditableText ek={`qraft.service.${i}.c`} def={s.cel} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                    </p>
                    <ul className="relative mt-4 space-y-1.5">
                      {s.pts.map((p,k)=>(
                        <li key={k} className="flex items-start gap-2 font-[Inter] font-light text-[13px] leading-5 text-white/55">
                          <Check className="mt-[3px] h-3 w-3 shrink-0 text-white/30"/>{p}
                        </li>
                      ))}
                    </ul>
                    <div className="relative mt-auto space-y-3 pt-6">
                      <span
                        className={`flex h-10 w-full items-center justify-center gap-2 rounded-full border font-[JetBrains_Mono] font-light text-[10px] tracking-[0.16em] transition-colors duration-500 ${
                          picked.includes(i)
                            ? "border-[#7DF0AE] bg-[#7DF0AE] text-black"
                            : "border-white/20 text-white/75"
                        }`}
                      >
                        {picked.includes(i) ? <><Check className="h-3.5 w-3.5"/> W TWOIM SYSTEMIE</> : <>DODAJ DO SYSTEMU <ArrowRight className="h-3 w-3 opacity-60"/></>}
                      </span>
                      <div className="flex items-center justify-between font-[JetBrains_Mono] font-light text-[9px] tracking-[0.18em]">
                        <span className="text-white/25">COFNIJ</span>
                        <button
                          onPointerDown={(e)=>e.stopPropagation()}
                          onClick={(e)=>{ e.stopPropagation(); go("contact"); }}
                          className="text-white/50 transition-colors duration-300 hover:text-white"
                        >
                          SPRAWDZIMY NA AUDYCIE \u2192
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              />
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex flex-col sm:flex-row justify-between gap-4 font-[JetBrains_Mono] font-light text-[11px]">
          <EditableText ek="qraft.system.footerL" def="OTWARTE DLA KAŻDEGO KLIENTA." className="text-white/20 tracking-[0.08em]" isEditing={isEditing} as="span" />
          <BtnGhost onClick={()=>go("contact")} className="h-11 px-6 text-[11px]">
            <EditableText ek="qraft.system.footerR" def="DIAGNOSTYKA →" className="font-[JetBrains_Mono] font-light tracking-[0.14em]" isEditing={isEditing} as="span" />
          </BtnGhost>
        </div>
      </section>

      <section id="process" className="bg-[#E4E4E0] text-[#0A0A0A] border-t border-white/5">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-24">
          <Reveal><ProcessStack isEditing={isEditing} onZoneChange={setInProcess} /></Reveal>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-24 lg:py-32">
        <Reveal><div className="text-center max-w-xl mx-auto"><div className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.2em] text-white/30">03 — PLANY</div><h2 className="mt-4 font-[Cormorant_Garamond] font-light text-[34px] sm:text-[50px] tracking-[-0.02em] leading-none"><EditableText ek="qraft.pricing.h" def="Jasne ceny." className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" /></h2><EditableText ek="qraft.pricing.sub" def="Miesiąc do miesiąca po 90 dniach. Bez zobowiązań. W odcieniach czerni — wyrafinowane." className="mt-4 block font-[Inter] font-light text-[15px] leading-7 text-white/50 max-w-[480px] mx-auto" isEditing={isEditing} as="p" /></div></Reveal>
        <Reveal><PlanShowcase
          isEditing={isEditing}
          onPick={()=>go("contact")}
          recommended={recommended}
          pickedCount={picked.length}
        /></Reveal>
        <div className="mt-8 text-center font-[JetBrains_Mono] font-light text-[11px] tracking-[0.06em] text-white/20"><EditableText ek="qraft.pricing.note2" def="Start bez sesji zdjęciowej — dostępna od Signature. Szczegóły na audycie." className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" /></div>
      </section>

      <section id="faq" className="mx-auto max-w-[1280px] px-6 lg:px-8 pb-12">
        <Reveal><div className="grid lg:grid-cols-[320px_1fr] gap-10 border-t border-white/[0.06] pt-12"><div><div className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.18em] text-white/20">04 — FAQ</div><h3 className="mt-4 font-[Cormorant_Garamond] font-light text-[30px] leading-none"><EditableText ek="qraft.faq.h" def="Szybkie odpowiedzi." className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" /></h3><EditableText ek="qraft.faq.desc" def="Jasno i bez żargonu. Resztę dopowiemy na audycie." className="mt-3 block font-[Inter] font-light text-[14px] leading-6 text-white/30" isEditing={isEditing} as="p" /></div><div className="divide-y divide-white/5 border border-white/10 rounded-[20px] overflow-hidden bg-white/[0.03] backdrop-blur-2xl backdrop-saturate-[1.3]" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.25)" } as any}>{[["Dla kogo jest QRAFT?","Dla firm, gdzie liczy się miejsce i reputacja. Kawiarnie, studia, butiki, kliniki."],["Jak szybko widać efekty?","2–4 tygodnie by dać się znaleźć. 30–60 dni by urosnąć w środku tygodnia."],["Czy jest zobowiązanie?","Nie. Miesiąc do miesiąca po 90 dniach."],["Czego potrzebujecie na start?","90 minut + dostęp do profilu. Resztą zajmujemy się my."]].map(([q,a],i)=>(<div key={q}><button onClick={()=>setFaqOpen(faqOpen===i?null:i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition"><span className="font-[Cormorant_Garamond] font-light text-[17px] pr-6"><EditableText ek={`qraft.faq.${i}.q`} def={q} className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" /></span><span className={`h-7 w-7 grid place-items-center rounded-full border shrink-0 transition ${faqOpen===i?"bg-white text-black border-white":"border-white/10 text-white/20"}`}>{faqOpen===i?<Minus className="h-3.5 w-3.5"/>:<Plus className="h-3.5 w-3.5"/>}</span></button><AnimatePresence>{faqOpen===i && (<motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden"><div className="px-6 pb-6 font-[Inter] font-light text-[14px] leading-7 text-white/60 max-w-[560px]"><EditableText ek={`qraft.faq.${i}.a`} def={a} className="font-[Inter] font-light" isEditing={isEditing} as="span" /></div></motion.div>)}</AnimatePresence></div>))}</div></div></Reveal>
      </section>

      <section id="contact" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <Reveal><div className="bg-[#0F0F11] border border-white/10 text-white rounded-[32px] p-8 lg:p-10 relative overflow-hidden min-h-[440px] flex flex-col"><div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/[0.04] blur-2xl"/><div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"/><div className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.18em] text-white/30">05 — AUDYT</div><h2 className="mt-6 font-[Cormorant_Garamond] font-light text-[40px] leading-[0.9] tracking-[-0.02em]"><EditableText ek="qraft.contact.h1b" def="Zamów bezpłatny" className="block font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" /><EditableText ek="qraft.contact.h2b" def="audyt." className="block font-[Cormorant_Garamond] font-light italic text-white/50" isEditing={isEditing} as="span" /></h2><EditableText ek="qraft.contact.desc2" def="20 minut online. Wybierz usługę, dzień i godzinę — potwierdzimy w ciągu kilku godzin. Nawet jeśli nas nie wybierzesz, zostajesz z planem." className="mt-4 block font-[Inter] font-light text-[14px] leading-7 text-white/60 max-w-[380px]" isEditing={isEditing} as="p" /><div className="mt-8 space-y-3 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.06em] text-white/35"><div className="flex items-center gap-2.5"><Clock className="h-3.5 w-3.5 opacity-60"/> <EditableText ek="qraft.contact.line1" def="Dwa terminy w tym tygodniu · 20 min" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" /></div><div className="flex items-center gap-2.5"><Terminal className="h-3.5 w-3.5 opacity-60"/> <EditableText ek="qraft.contact.line2" def="Otwarte dla każdego klienta" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" /></div></div><div className="mt-auto pt-10 flex gap-2 font-[JetBrains_Mono] font-light text-[10px] tracking-[0.1em]"><span className="border border-white/10 rounded-full px-4 py-2 bg-white/[0.03] text-white/60"><EditableText ek="qraft.contact.badge1" def="BEZ OPŁAT" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" /></span><span className="border border-white/10 rounded-full px-4 py-2 bg-white/[0.03] text-white/60"><EditableText ek="qraft.contact.badge2" def="BEZ ZOBOWIĄZAŃ" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" /></span></div></div></Reveal>
          <Reveal delay={0.06}>
            <div className="bg-white/[0.04] backdrop-blur-2xl backdrop-saturate-[1.4] border border-white/10 rounded-[32px] p-7 sm:p-8 h-full flex flex-col" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.32)" } as any}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-[Cormorant_Garamond] font-light text-[22px]">
                  <EditableText ek="qraft.form.h" def="Zamów bezpłatny audyt" className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />
                </h3>
                <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/20 border border-white/10 rounded-full px-3 py-1 whitespace-nowrap">
                  <TextSwap text={sent ? "WYSŁANO" : "2 MIN"} />
                </span>
              </div>

              <div className="mt-7">
                <SlidingTabs
                  items={auditServices.map((s) => ({ id: s.id, label: s.label }))}
                  value={form.service}
                  onChange={(id) => setForm({ ...form, service: id })}
                  className="t-tabs--fill"
                  tabClassName="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em]"
                />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/40">W ZAKRESIE</span>
                  <span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.1em] text-white/45 text-right">
                    <TextSwap text={svc.note} />
                  </span>
                </div>
                <motion.ul
                  key={form.service}
                  initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
                >
                  {svc.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-2.5 font-[Inter] font-light text-[12.5px] leading-5 text-white/80">
                      <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-white/45" />
                      {it}
                    </li>
                  ))}
                </motion.ul>
              </div>

              <form onSubmit={submit} className="mt-7 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <ClearField label="Imię i nazwisko" name="name" value={form.name} onChange={(v)=>setForm({...form, name:v})} placeholder="Alex Kowalski" autoComplete="name" required />
                  <ClearField label="Firma" name="business" value={form.business} onChange={(v)=>setForm({...form, business:v})} placeholder="Lumière" autoComplete="organization" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <ClearField label="Telefon" name="phone" type="tel" value={form.phone} onChange={(v)=>setForm({...form, phone:v})} placeholder="600 100 200" autoComplete="tel" />
                  <ClearField label="Email" name="email" type="email" value={form.email} onChange={(v)=>setForm({...form, email:v})} placeholder="alex@firma.pl" autoComplete="email" required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block space-y-2">
                    <span className="block font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/45">DZIEN</span>
                    <input required type="date" name="date" min={new Date().toISOString().slice(0,10)} value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} className="w-full h-11 rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm text-white [color-scheme:dark] focus:outline-none focus:border-white/25"/>
                  </label>
                  <label className="block space-y-2">
                    <span className="block font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/45">GODZINA</span>
                    <select name="time" value={form.time} onChange={(e)=>setForm({...form, time:e.target.value})} className="w-full h-11 rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm text-white [color-scheme:dark] focus:outline-none focus:border-white/25">
                      {["9:00","10:30","12:00","14:00","16:00","18:00"].map((t)=>(<option key={t} className="bg-[#0F0F11]" value={t}>{t}</option>))}
                    </select>
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="block font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/45">CO CHCESZ POPRAWIC</span>
                  <textarea name="message" rows={3} value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} placeholder="np. pusty kalendarz w weekendy, brak zdjęć w Mapach…" className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-5 py-4 font-[Inter] font-light text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"/>
                </label>

                <BtnPrimary type="submit" className="w-full h-[48px] text-[11px]">
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
                <div className="text-center font-[JetBrains_Mono] font-light text-[11px] tracking-[0.04em] text-white/20">
                  {sent ? (
                    <TextSwap text="Dziękujemy — potwierdzimy termin na e-mail." />
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
                      <div className="font-[Inter] font-light text-[14px] text-white">Termin zarezerwowany</div>
                      <div className="mt-1 font-[Inter] font-light text-[13px] leading-6 text-white/55">
                        {form.date ? new Date(form.date + "T12:00:00").toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" }) : ""} · {form.time} · {svc.label} — potwierdzenie wyślemy na {form.email}.
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
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.08em] text-white/20">
          <div className="flex items-center gap-3"><div className="h-7 w-7 rounded-[9px] border border-white/10 grid place-items-center font-[Instrument_Serif] text-[14px] font-light">Q</div><span className="font-[Space_Grotesk] font-light tracking-[0.2em] text-white/60 text-xs">QRAFT</span><span className="hidden sm:inline">© {new Date().getFullYear()} · PERFEKCJA BUDUJE MARKI</span></div>
          <div className="flex gap-3"><span>qraft.build</span><span className="opacity-20">·</span><span>Otwarte dla wszystkich</span></div>
        </div>
      </footer>

      {!isEditing && (
        <button onClick={()=>setIsEditing(true)} className="group fixed bottom-6 right-6 z-50 hidden lg:inline-flex items-center gap-2 px-5 h-11 rounded-full border border-white/25 bg-white/[0.03] backdrop-blur-2xl font-[JetBrains_Mono] font-light text-[11px] tracking-[0.08em] text-white/70 transition-all duration-500 hover:border-white/50 hover:bg-white hover:text-black shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
          <Pencil className="h-3.5 w-3.5" /> EDYTUJ TEKSTY
        </button>
      )}
    </div>
  );
}
