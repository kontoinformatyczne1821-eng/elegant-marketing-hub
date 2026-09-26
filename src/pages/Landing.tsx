import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowUpRight, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Menu, X, Check, Minus, Plus, Clock, Terminal, Pencil, Save } from "lucide-react";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ClearField, DigitChars, PopNumber, usePopIn } from "@/components/transitions";

function EditableText({ ek, def, className, as: Tag = "span", isEditing, pop, popKey }: { ek: string; def: string; className?: string; as?: any; isEditing: boolean; pop?: boolean; popKey?: string }) {
  const [val, setVal] = useState(def);
  const popRef = usePopIn<HTMLSpanElement>([val, popKey], popKey !== "off");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ek);
      if (saved !== null) setVal(saved);
    } catch {}
  }, [ek]);
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const t = e.currentTarget.textContent || "";
    setVal(t);
    try { localStorage.setItem(ek, t); } catch {}
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
  { n: "01", title: "System Marki", dostajesz: "spójny system wizualny, hasło i szyld.", cel: "rozpoznają Cię zanim ktoś się dowie." },
  { n: "02", title: "Strona i Wydajność", dostajesz: "szybką stronę z rezerwacją i formularzem.", cel: "każdy klik kończy się zamówieniem." },
  { n: "03", title: "Pozyskiwanie", dostajesz: "widoczność w Mapach i wyszukiwaniu do 3 km.", cel: "trafiają do Ciebie ludzie z okolicy." },
  { n: "04", title: "Silnik Treści", dostajesz: "zdjęcia, wideo i teksty o Twoim rzemiośle.", cel: "klient widzi jakość jeszcze przed wizytą." },
  { n: "05", title: "Kampanie", dostajesz: "kalendarz ofert i mailingi, które wracają.", cel: "puste godziny w tygodniu się zapełniają." },
  { n: "06", title: "Retencja", dostajesz: "system opinii, lojalności i raport tygodniowy.", cel: "klienci wracają i polecają Cię znajomym." },
];

const plans = [
  { name: "ESSENCE", price: "1 900 zł", sub: "/ mies.", line: "Fundamenty, by dać się znaleźć.", pts: ["Uporządkowanie marki", "Strona + Mapy", "Opieka i raport"], featured: false, cta: "Wybierz Essence" },
  { name: "SIGNATURE", price: "3 800 zł", sub: "/ mies.", line: "Pełny system. Wypełnia kalendarz.", pts: ["Wszystko z Essence", "Zasięg + płatne w promieniu", "Silnik treści + lista"], featured: true, cta: "Wybierz Signature" },
  { name: "PRESTIGE", price: "Wycena", sub: "", line: "Starty, rebrandingi, wiele lokalizacji.", pts: ["Od zera", "Atelier foto & film", "Sprinty co tydzień"], featured: false, cta: "Zapytaj o Prestige" },
];

/* 1 baner = 1 etap procesu */
const processSteps = [
  { n: "01", t: "Audyt — 20 min", d: "Oglądamy Twoją firmę z zewnątrza i wskazujemy pierwszą największą dźwignię.", meta: "Dzień 1" },
  { n: "02", t: "Blueprint — 1 strona", d: "Pozycjonowanie dla Twojej okolicy, oferta i plan na 90 dni.", meta: "Dzień 7" },
  { n: "03", t: "Budowa — 2–3 tyg.", d: "Tożsamość, strona i materiały — wszystko mówi tym samym głosem.", meta: "Dzień 10–28" },
  { n: "04", t: "Skalowanie — co tydzień", d: "Raport w złotówkach. Co działa, dostajemy więcej.", meta: "Co poniedziałek" },
];

function CursorAura() {
  const [mouse, setMouse] = useState({ x: -400, y: -400 });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setMouse({ x: e.clientX, y: e.clientY }));
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    const t = setTimeout(() => setVisible(true), 200);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [visible]);
  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] hidden lg:block overflow-hidden">
      {/* outer soft aura */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: mouse.x,
          top: mouse.y,
          width: 820,
          height: 820,
          x: "-50%",
          y: "-50%",
          background: "radial-gradient(circle at center, rgba(255,255,255,0.095) 0%, rgba(255,255,255,0.035) 28%, rgba(255,255,255,0.012) 50%, transparent 72%)",
          filter: "blur(32px)",
        }}
        animate={{ left: mouse.x, top: mouse.y }}
        transition={{ type: "spring", damping: 32, stiffness: 140, mass: 0.9 }}
      />
      {/* APPLE LIQUID GLASS ORB — blurs content behind */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: mouse.x,
          top: mouse.y,
          width: 220,
          height: 220,
          x: "-50%",
          y: "-50%",
          background: "rgba(255,255,255,0.055)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -1px 1px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.35), 0 1px 1px rgba(255,255,255,0.08)",
          backdropFilter: "blur(22px) saturate(1.4)",
          WebkitBackdropFilter: "blur(22px) saturate(1.4)",
        }}
        animate={{ left: mouse.x, top: mouse.y }}
        transition={{ type: "spring", damping: 28, stiffness: 200, mass: 0.6 }}
      >
        {/* top highlight like iOS glass */}
        <div className="absolute inset-[1px] rounded-full" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.16) 0%, transparent 45%)" }} />
        {/* inner glow */}
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.18) 0%, transparent 55%)" }} />
      </motion.div>
      {/* mid glow inside glass */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: mouse.x,
          top: mouse.y,
          width: 120,
          height: 120,
          x: "-50%",
          y: "-50%",
          background: "radial-gradient(circle at center, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 60%, transparent 72%)",
          filter: "blur(10px)",
        }}
        animate={{ left: mouse.x, top: mouse.y }}
        transition={{ type: "spring", damping: 26, stiffness: 260, mass: 0.5 }}
      />
      {/* subtle breathing ring */}
      <motion.div
        className="absolute rounded-full border border-white/12"
        style={{
          left: mouse.x,
          top: mouse.y,
          width: 220,
          height: 220,
          x: "-50%",
          y: "-50%",
          borderColor: "rgba(255,255,255,0.10)",
        }}
        animate={{ left: mouse.x, top: mouse.y, scale: [1, 1.04, 1], opacity: [0.22, 0.08, 0.22] }}
        transition={{
          left: { type: "spring", damping: 28, stiffness: 200 },
          top: { type: "spring", damping: 28, stiffness: 200 },
          scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      {/* center dot with glow */}
      <motion.div
        className="absolute rounded-full bg-white"
        style={{
          left: mouse.x,
          top: mouse.y,
          width: 3,
          height: 3,
          x: "-50%",
          y: "-50%",
          boxShadow: "0 0 10px rgba(255,255,255,0.9), 0 0 22px rgba(255,255,255,0.45)",
        }}
        animate={{ left: mouse.x, top: mouse.y }}
        transition={{ type: "spring", damping: 34, stiffness: 480 }}
      />
    </div>
  );
}

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

function PlanShowcase({ isEditing, onPick }: { isEditing: boolean; onPick: () => void }) {
  const L = plans.length;
  const [active, setActive] = useState(1);
  const isDesktop = useDesktop();
  const signed = (n: number) => {
    const m = ((n % L) + L) % L;
    return m > L / 2 ? m - L : m;
  };
  const turn = (d: number) => setActive((a) => ((a + d) % L + L) % L);

  return (
    <>
      <div className="relative mt-14 flex flex-col lg:block lg:h-[660px]">
        {/* strzałki obok wybranego planu, nie pod nim */}
        <button
          onClick={() => turn(-1)}
          aria-label="Poprzedni plan"
          className="hidden lg:grid absolute top-1/2 -translate-y-1/2 left-[24px] z-30 h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-xl text-white/60 transition-colors duration-300 hover:text-white hover:border-white/45 hover:bg-white/[0.09]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => turn(1)}
          aria-label="Następny plan"
          className="hidden lg:grid absolute top-1/2 -translate-y-1/2 right-[24px] z-30 h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-xl text-white/60 transition-colors duration-300 hover:text-white hover:border-white/45 hover:bg-white/[0.09]"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
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
              }`}
            >
              <div
                className={`relative overflow-hidden rounded-[28px] border p-8 flex flex-col h-full transition-colors duration-500 ${
                  front
                    ? "bg-[#F7F7F5] text-black border-[#F7F7F5] shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
                    : "bg-white/[0.07] text-white border-white/[0.14] backdrop-blur-2xl backdrop-saturate-[1.4] shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_12px_40px_rgba(0,0,0,0.35)]"
                }`}
              >
                {/* szklany polysk na kartach bocznych */}
                {!front && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-[JetBrains_Mono] font-light text-[11px] tracking-[0.16em] ${
                      front ? "text-black/40" : "text-white/35"
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
                  {p.featured && (
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
                  <span className="font-[Cormorant_Garamond] font-light text-[36px] tracking-[-0.02em]">
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
                      front ? "text-black/40" : "text-white/35"
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
                    front ? "text-black/50" : "text-white/40"
                  }`}
                  isEditing={isEditing}
                  as="div"
                />
                <ul className="mt-8 space-y-3 flex-1">
                  {p.pts.map((x, idx) => (
                    <li
                      key={x}
                      className={`flex gap-3 font-[Inter] font-light text-[14px] ${
                        front ? "text-black/70" : "text-white/65"
                      }`}
                    >
                      <Check
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          front ? "text-black/25" : "text-white/45"
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
                <div onClick={(e) => e.stopPropagation()} className="mt-10">
                  {p.featured ? (
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
            </motion.div>
          );
        })}
      </div>

      {/* desktop: spiral controls */}
      <div className="mt-8 hidden lg:block">
        <div className="text-center font-[JetBrains_Mono] font-light text-[11px] tracking-[0.16em] text-white/25">
          KLIKNIJ PLAN — SPIRALA PRZESUNIE SIĘ DALEJ
        </div>
        <div className="mt-6 flex items-center justify-center gap-2">
          {plans.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setActive(i)}
              className="h-11 px-5 rounded-full border transition-colors duration-300"
              style={
                i === active
                  ? { backgroundColor: "#ffffff", borderColor: "#ffffff", color: "#0a0a0a" }
                  : { borderColor: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.5)" }
              }
            >
              <span className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.16em] flex items-center gap-2">
                <PopNumber text={`0${i + 1}`} />
                <span className="opacity-70">{p.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* --------- proces: banery zawieszone na podświetlanej linii -------- */
/* transitions.dev "Banner stacking" — 1 baner = 1 etap. Nowy baner    */
/* wjeżdża ruchem tostownika (rise + blur + scale), starsze cofają się  */
/* w głąb, czwarty wychodzi. Sterowanie: strzałki góra/dół + kropki.    */

function ProcessStack({ isEditing }: { isEditing: boolean }) {
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
    <div className="grid lg:grid-cols-[360px_1fr] gap-12">
      <div className="lg:sticky lg:top-28 self-start">
        <div className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.18em] text-black/30">02 — PROCES</div>
        <h3 className="mt-4 font-[Cormorant_Garamond] font-light text-[36px] leading-[0.9] tracking-[-0.02em]">
          <EditableText ek="qraft.process.h1" def="Cztery tygodnie" className="block font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />
          <EditableText ek="qraft.process.h2" def="do rozpędu." className="block font-[Cormorant_Garamond] font-light italic text-black/30" isEditing={isEditing} as="span" />
        </h3>
        <EditableText ek="qraft.process.desc" def="Otwarty proces. Cotygodniowe dowody. Bez teatru." className="mt-4 block font-[Inter] font-light text-[15px] leading-7 text-black/40" isEditing={isEditing} as="p" />

        <div className="mt-10 flex items-center gap-3">
          <button
            onClick={() => step(active - 1, -1)}
            aria-label="Poprzedni etap"
            className="h-12 w-12 grid place-items-center rounded-full border border-black/15 text-black/55 transition-colors duration-300 hover:text-black hover:border-black/45"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => step(active + 1, 1)}
            aria-label="Następny etap"
            className="h-12 w-12 grid place-items-center rounded-full border border-black/15 text-black/55 transition-colors duration-300 hover:text-black hover:border-black/45"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
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
                    backgroundColor: i <= active ? "#0a0a0a" : "#F7F7F5",
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
                      ? "bg-white border-black/10 text-black shadow-[0_24px_60px_rgba(0,0,0,0.12)]"
                      : "bg-white/60 border-black/[0.07] text-black/55 backdrop-blur-xl"
                  } ${d === 3 ? "is-leaving" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.16em]">
                      {s.n}
                    </span>
                    <span className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.12em] opacity-60">
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
                    className="mt-4 block font-[Inter] font-light text-[15px] leading-7 opacity-75"
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

export default function Landing() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
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
  const cinemaRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: cinemaProgress } = useScroll({ target: cinemaRef, offset: ["start end", "end start"] });
  const cinemaY = useTransform(cinemaProgress, [0, 1], ["-14%", "14%"]);
  const cinemaY2 = useTransform(cinemaProgress, [0, 1], ["6%", "-10%"]);
  const cinemaText = useTransform(cinemaProgress, [0, 0.5], ["-40px", "0px"]);
  const progress = useTransform(scrollYProgress, [0,1], [0,1]);

  const go = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name || !form.date) return;
    setSent(true);
    setTimeout(()=>setSent(false), 6000);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#F2F2F0] antialiased selection:bg-white selection:text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@300;400&family=Space+Grotesk:wght@300;400&display=swap'); html{scroll-behavior:smooth} @keyframes qmarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}} @keyframes qmsheen{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}} @keyframes qmbreathe{0%,100%{opacity:.35}50%{opacity:.9}}`}</style>
      <CursorAura />
      <motion.div className="fixed top-0 inset-x-0 h-[1px] bg-white/80 z-50 origin-left" style={{ scaleX: progress }} />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050507]" />
        {/* odcienie czerni — subtelne winiety */}
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "88px 88px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[720px] w-[1200px] -translate-y-1/2 rounded-full opacity-[0.09] blur-[140px]" style={{ background: "radial-gradient(ellipse at center, white 0%, #2A2A2E 32%, transparent 70%)" }} />
        <div className="absolute top-[38%] right-[-6%] h-[560px] w-[560px] rounded-full opacity-[0.045] blur-[90px]" style={{ background: "radial-gradient(ellipse at center, #1A1A1E 0%, transparent 68%)" }} />
        <div className="absolute bottom-0 left-[-8%] h-[520px] w-[700px] rounded-full opacity-[0.035] blur-[100px]" style={{ background: "radial-gradient(ellipse at center, #0F0F12 0%, transparent 70%)" }} />
      </div>
      <FloatingField />

      <header className="sticky top-0 z-40 bg-[#050507]/28 backdrop-blur-[28px] backdrop-saturate-[1.5] border-b border-white/[0.08] supports-[backdrop-filter]:bg-[#050507]/20" style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" } as any}>
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} className="flex items-center gap-4">
            <div className="h-[32px] w-[32px] rounded-[10px] border border-white/15 bg-white/[0.02] grid place-items-center">
              <span className="font-[Instrument_Serif] text-[16px]">Q</span>
            </div>
            <span className="font-[Space_Grotesk] font-light tracking-[0.28em] text-[12px]">QRAFT</span>
            <span className="hidden lg:inline font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] text-white/25 border-l border-white/10 pl-4 ml-1">PERFEKCJA BUDUJE MARKI</span>
          </button>
          <nav className="hidden lg:flex gap-8 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.18em] text-white/30">
            <button onClick={()=>go("services")} className="hover:text-white/80 transition">— SYSTEM</button>
            <button onClick={()=>go("pricing")} className="hover:text-white/80 transition">— PLANY</button>
            <button onClick={()=>go("contact")} className="hover:text-white/80 transition">— KONTAKT</button>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={()=>setIsEditing(!isEditing)}
              className={`hidden md:inline-flex items-center gap-2 px-4 h-9 rounded-full border font-[JetBrains_Mono] font-light text-[11px] tracking-[0.12em] transition-all duration-500 backdrop-blur ${isEditing ? "bg-white text-black border-white" : "border-white/15 bg-white/[0.02] text-white/60 hover:border-white/45 hover:bg-white/[0.08] hover:text-white"}`}
            >
              {isEditing ? <><Save className="h-3.5 w-3.5"/> ZAKOŃCZ EDYCJĘ</> : <><Pencil className="h-3.5 w-3.5"/> EDYTUJ TEKSTY</>}
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.14em] text-white/20"><Terminal className="h-3 w-3 opacity-60"/> qraft.build</span>
            <BtnPrimary onClick={()=>go("contact")} className="hidden sm:inline-flex text-[11px] tracking-[0.16em] px-6 h-9">ROZPOCZNIJ</BtnPrimary>
            <button onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden h-9 w-9 grid place-items-center rounded-full border border-white/10 bg-white/[0.03]">{mobileOpen?<X className="h-4 w-4"/>:<Menu className="h-4 w-4"/>}</button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="lg:hidden border-t border-white/5 bg-[#0A0A0C]">
              <div className="px-6 py-6 space-y-1 font-[JetBrains_Mono] font-light text-xs tracking-[0.14em]">
                <button onClick={()=>go("services")} className="w-full text-left py-3 border-b border-white/[0.04] text-white/60">— SYSTEM</button>
                <button onClick={()=>go("pricing")} className="w-full text-left py-3 border-b border-white/[0.04] text-white/60">— PLANY</button>
                <button onClick={()=>go("contact")} className="w-full text-left py-3 border-b border-white/[0.04] text-white/60">— KONTAKT</button>
                <button onClick={()=>setIsEditing(!isEditing)} className={`mt-4 w-full py-3.5 rounded-full font-[JetBrains_Mono] font-light tracking-[0.1em] text-xs transition-colors duration-500 ${isEditing ? "bg-white text-black" : "border border-white/15 bg-white/[0.02] text-white/60 hover:bg-white/[0.08] hover:text-white"}`}>{isEditing ? "ZAKOŃCZ EDYCJĘ" : "EDYTUJ TEKSTY"}</button>
                <button onClick={()=>navigate("/auth")} className="mt-3 w-full py-3.5 rounded-full font-[JetBrains_Mono] font-light tracking-[0.1em] text-xs border border-white/30 text-white transition-colors duration-500 hover:bg-white hover:text-black">ZALOGUJ SIĘ</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

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
        {/* deep layered mountains */}
        <div className="absolute inset-0">
          <motion.div style={{ y: cinemaY }} className="absolute inset-0 scale-[1.2]">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000&q=80&auto=format&fit=crop"
              alt="Góry o świcie"
              className="h-full w-full object-cover grayscale contrast-125 brightness-[0.30]"
            />
          </motion.div>

          <motion.div style={{ y: cinemaY2 }} className="absolute inset-x-0 bottom-0 h-[62%] scale-[1.15]">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80&auto=format&fit=crop"
              alt="Grzbiet mgłą"
              className="h-full w-full object-cover grayscale contrast-125 brightness-[0.22]"
            />
          </motion.div>

          <motion.div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(5,5,7,0.82) 0%, transparent 30%, transparent 60%, #050507 100%)" }}
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -left-1/4 top-1/3 h-[46vh] w-[160%] opacity-40"
            style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.10), transparent 72%)", filter: "blur(30px)" }}
            animate={{ x: ["-8%", "8%", "-8%"] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_6%,transparent_0%,rgba(5,5,7,0.62)_58%,#050507_100%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "88px 88px" }} />

        {/* vertical light streak */}
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

        {/* content */}
        <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
          <div className="flex min-h-[calc(100vh-72px)] flex-col justify-center py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-[Space_Grotesk] font-light uppercase leading-[0.84] tracking-[-0.045em] text-[52px] sm:text-[92px] lg:text-[152px]">
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
                <BtnPrimary onClick={() => go("contact")} className="h-[52px] px-8 text-[11px]">
                  ZAMÓW DARMOWY AUDYT <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </BtnPrimary>
                <BtnGhost onClick={() => go("services")} className="h-[52px] pl-2 pr-6 text-[11px]">
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
                    <div className="mt-2 font-[JetBrains_Mono] font-light text-[10px] tracking-[0.14em] text-white/40">{s.l}</div>
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
              <div className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.2em] text-white/35">01 — SYSTEM</div>
              <h2 className="mt-5 leading-[0.9] tracking-[-0.02em]">
                <EditableText ek="qraft.system.h1" def="Jeden system. Sześć modułów." className="block font-[Cormorant_Garamond] font-light text-[40px] sm:text-[52px]" isEditing={isEditing} as="span" />
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
            <motion.div key={s.n} initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7, delay:i*0.04, ease:[0.22,1,0.36,1]}} className="group bg-white/[0.03] backdrop-blur-2xl backdrop-saturate-[1.2] border border-white/[0.08] rounded-[24px] p-8 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.35)" } as any}>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/0 to-transparent group-hover:via-white/10 transition duration-700"/>
              <div className="pointer-events-none absolute -inset-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "radial-gradient(55% 45% at 50% 0%, rgba(255,255,255,0.10), transparent 70%)" }} />
              <div className="flex items-center justify-between">
                <PopNumber text={s.n} className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.16em] text-white/20" />
                <span className="h-8 w-8 grid place-items-center rounded-full border border-white/10 text-white/20 group-hover:border-white/30 group-hover:text-white group-hover:rotate-45 group-hover:bg-white/5 transition-all duration-500"><ArrowUpRight className="h-3.5 w-3.5"/></span>
              </div>
              <h3 className="mt-7 font-[Cormorant_Garamond] font-light text-[23px] tracking-[-0.01em] leading-none">
                <EditableText ek={`qraft.service.${i}.title`} def={s.title} className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" />
              </h3>

              <div className="mt-5 space-y-2">
                <p className="font-[Inter] font-light text-[14.5px] leading-6 text-white/50">
                  <span className="font-[JetBrains_Mono] font-light text-[9.5px] tracking-[0.14em] text-white/30 mr-2">DOSTAJESZ</span>
                  <EditableText ek={`qraft.service.${i}.d`} def={s.dostajesz} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                </p>
                <p className="font-[Inter] font-light text-[14.5px] leading-6 text-white/80">
                  <span className="font-[JetBrains_Mono] font-light text-[9.5px] tracking-[0.14em] text-white/45 mr-2">CEL</span>
                  <EditableText ek={`qraft.service.${i}.c`} def={s.cel} className="font-[Inter] font-light" isEditing={isEditing} as="span" />
                </p>
              </div>
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

      <section className="bg-[#F7F7F5] text-[#0A0A0A] border-t border-white/5">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-24">
          <Reveal><ProcessStack isEditing={isEditing} /></Reveal>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-24 lg:py-32">
        <Reveal><div className="text-center max-w-xl mx-auto"><div className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.2em] text-white/30">03 — PLANY</div><h2 className="mt-4 font-[Cormorant_Garamond] font-light text-[42px] sm:text-[50px] tracking-[-0.02em] leading-none"><EditableText ek="qraft.pricing.h" def="Jasne ceny." className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" /></h2><EditableText ek="qraft.pricing.sub" def="Miesiąc do miesiąca po 90 dniach. Bez zobowiązań. W odcieniach czerni — wyrafinowane." className="mt-4 block font-[Inter] font-light text-[15px] leading-7 text-white/30 max-w-[480px] mx-auto" isEditing={isEditing} as="p" /></div></Reveal>
        <Reveal><PlanShowcase isEditing={isEditing} onPick={()=>go("contact")} /></Reveal>
        <div className="mt-8 text-center font-[JetBrains_Mono] font-light text-[11px] tracking-[0.06em] text-white/20"><EditableText ek="qraft.pricing.note2" def="Start bez sesji zdjęciowej — dostępna od Signature. Szczegóły na audycie." className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" /></div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 lg:px-8 pb-12">
        <Reveal><div className="grid lg:grid-cols-[320px_1fr] gap-10 border-t border-white/[0.06] pt-12"><div><div className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.18em] text-white/20">04 — FAQ</div><h3 className="mt-4 font-[Cormorant_Garamond] font-light text-[30px] leading-none"><EditableText ek="qraft.faq.h" def="Szybkie odpowiedzi." className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" /></h3><EditableText ek="qraft.faq.desc" def="Jasno i bez żargonu. Resztę dopowiemy na audycie." className="mt-3 block font-[Inter] font-light text-[14px] leading-6 text-white/30" isEditing={isEditing} as="p" /></div><div className="divide-y divide-white/5 border border-white/10 rounded-[20px] overflow-hidden bg-white/[0.03] backdrop-blur-2xl backdrop-saturate-[1.3]" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.25)" } as any}>{[["Dla kogo jest QRAFT?","Dla firm, gdzie liczy się miejsce i reputacja. Kawiarnie, studia, butiki, kliniki."],["Jak szybko widać efekty?","2–4 tygodnie by dać się znaleźć. 30–60 dni by urosnąć w środku tygodnia."],["Czy jest zobowiązanie?","Nie. Miesiąc do miesiąca po 90 dniach."],["Czego potrzebujecie na start?","90 minut + dostęp do profilu. Resztą zajmujemy się my."]].map(([q,a],i)=>(<div key={q}><button onClick={()=>setFaqOpen(faqOpen===i?null:i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition"><span className="font-[Cormorant_Garamond] font-light text-[17px] pr-6"><EditableText ek={`qraft.faq.${i}.q`} def={q} className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" /></span><span className={`h-7 w-7 grid place-items-center rounded-full border shrink-0 transition ${faqOpen===i?"bg-white text-black border-white":"border-white/10 text-white/20"}`}>{faqOpen===i?<Minus className="h-3.5 w-3.5"/>:<Plus className="h-3.5 w-3.5"/>}</span></button><AnimatePresence>{faqOpen===i && (<motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden"><div className="px-6 pb-6 font-[Inter] font-light text-[14px] leading-7 text-white/30 max-w-[560px]"><EditableText ek={`qraft.faq.${i}.a`} def={a} className="font-[Inter] font-light" isEditing={isEditing} as="span" /></div></motion.div>)}</AnimatePresence></div>))}</div></div></Reveal>
      </section>

      <section id="contact" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <Reveal><div className="bg-[#0F0F11] border border-white/10 text-white rounded-[32px] p-8 lg:p-10 relative overflow-hidden min-h-[440px] flex flex-col"><div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/[0.04] blur-2xl"/><div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"/><div className="font-[JetBrains_Mono] font-light text-[11px] tracking-[0.18em] text-white/30">05 — TERMIN</div><h2 className="mt-6 font-[Cormorant_Garamond] font-light text-[40px] leading-[0.9] tracking-[-0.02em]"><EditableText ek="qraft.contact.h1" def="Zarezerwuj termin" className="block font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" /><EditableText ek="qraft.contact.h2" def="na bezpłatny audyt." className="block font-[Cormorant_Garamond] font-light italic text-white/50" isEditing={isEditing} as="span" /></h2><EditableText ek="qraft.contact.desc" def="20 minut online. Wybierz dzień i godzinę — potwierdzimy w ciągu kilku godzin. Nawet jeśli nas nie wybierzesz, zostajesz z planem." className="mt-4 block font-[Inter] font-light text-[14px] leading-7 text-white/40 max-w-[380px]" isEditing={isEditing} as="p" /><div className="mt-8 space-y-3 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.06em] text-white/35"><div className="flex items-center gap-2.5"><Clock className="h-3.5 w-3.5 opacity-60"/> <EditableText ek="qraft.contact.line1" def="Dwa terminy w tym tygodniu · 20 min" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" /></div><div className="flex items-center gap-2.5"><Terminal className="h-3.5 w-3.5 opacity-60"/> <EditableText ek="qraft.contact.line2" def="Otwarte dla każdego klienta" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" /></div></div><div className="mt-auto pt-10 flex gap-2 font-[JetBrains_Mono] font-light text-[10px] tracking-[0.1em]"><span className="border border-white/10 rounded-full px-4 py-2 bg-white/[0.03] text-white/60"><EditableText ek="qraft.contact.badge1" def="BEZ OPŁAT" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" /></span><span className="border border-white/10 rounded-full px-4 py-2 bg-white/[0.03] text-white/60"><EditableText ek="qraft.contact.badge2" def="BEZ ZOBOWIĄZAŃ" className="font-[JetBrains_Mono] font-light" isEditing={isEditing} as="span" /></span></div></div></Reveal>
          <Reveal delay={0.06}><div className="bg-white/[0.04] backdrop-blur-2xl backdrop-saturate-[1.4] border border-white/10 rounded-[32px] p-7 sm:p-8" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.32)" } as any}><div className="flex items-center justify-between"><h3 className="font-[Cormorant_Garamond] font-light text-[22px]"><EditableText ek="qraft.form.h" def="Zapytanie o termin" className="font-[Cormorant_Garamond] font-light" isEditing={isEditing} as="span" /></h3><span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/20 border border-white/10 rounded-full px-3 py-1"><PopNumber text="2 MIN" /></span></div>{sent ? (<motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="mt-8 bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center"><div className="h-10 w-10 mx-auto grid place-items-center rounded-full bg-white text-black"><Check className="h-5 w-5"/></div><div className="mt-4 font-[Cormorant_Garamond] font-light text-[18px]">Termin zarezerwowany.</div><div className="mt-2 font-[Inter] font-light text-[13px] text-white/30">{form.date ? new Date(form.date + "T12:00:00").toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" }) : ""} \u00b7 {form.time} — potwierdzenie wyślemy na {form.email}.</div><button onClick={()=>setSent(false)} className="mt-5 font-[JetBrains_Mono] font-light text-xs underline decoration-white/20 text-white/40">Wyślij kolejne</button></motion.div>) : (<form onSubmit={submit} className="mt-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <ClearField label="Imię i nazwisko" name="name" value={form.name} onChange={(v)=>setForm({...form, name:v})} placeholder="Alex Kowalski" autoComplete="name" required />
            <ClearField label="Firma" name="business" value={form.business} onChange={(v)=>setForm({...form, business:v})} placeholder="Lumière" autoComplete="organization" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <ClearField label="Telefon" name="phone" type="tel" value={form.phone} onChange={(v)=>setForm({...form, phone:v})} placeholder="600 100 200" autoComplete="tel" />
            <ClearField label="Email" name="email" type="email" value={form.email} onChange={(v)=>setForm({...form, email:v})} placeholder="alex@firma.pl" autoComplete="email" required />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block space-y-2">
              <span className="block font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/30">USŁUGA</span>
              <select name="service" value={form.service} onChange={(e)=>setForm({...form, service:e.target.value})} className="w-full h-11 rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm text-white [color-scheme:dark] focus:outline-none focus:border-white/20">
                <option className="bg-[#0F0F11]" value="audyt">Audyt 20 min</option>
                <option className="bg-[#0F0F11]" value="essence">Essence</option>
                <option className="bg-[#0F0F11]" value="signature">Signature</option>
                <option className="bg-[#0F0F11]" value="prestige">Prestige / warsztat</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="block font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/30">DZIEŃ</span>
              <input required type="date" name="date" min={new Date().toISOString().slice(0,10)} value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} className="w-full h-11 rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm text-white [color-scheme:dark] focus:outline-none focus:border-white/20"/>
            </label>
            <label className="block space-y-2">
              <span className="block font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/30">GODZINA</span>
              <select name="time" value={form.time} onChange={(e)=>setForm({...form, time:e.target.value})} className="w-full h-11 rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm text-white [color-scheme:dark] focus:outline-none focus:border-white/20">
                {["9:00","10:30","12:00","14:00","16:00","18:00"].map((t)=>(<option key={t} className="bg-[#0F0F11]" value={t}>{t}</option>))}
              </select>
            </label>
          </div>
          <label className="block space-y-2">
            <span className="block font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/30">CO CHCESZ POPRAWIĆ</span>
            <textarea name="message" rows={3} value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} placeholder="np. pusty kalendarz w weekendy, brak zdjęć w Mapach…" className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-5 py-4 font-[Inter] font-light text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"/>
          </label>
          <BtnPrimary type="submit" className="w-full h-[48px] text-[11px]">WYŚLIJ ZAPYTANIE O TERMIN <ArrowRight className="h-4 w-4 opacity-60" /></BtnPrimary>
          <div className="text-center font-[JetBrains_Mono] font-light text-[11px] tracking-[0.04em] text-white/20">Lub <button type="button" onClick={()=>navigate("/auth")} className="underline decoration-white/15 text-white/30 hover:text-white/60">zaloguj się</button> by zarządzać terminami</div>
        </form>)}</div></Reveal>
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
