import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Mail,
  Menu,
  Minus,
  Pencil,
  Plus,
  Save,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

/* ------------------------------------------------------------------ */
/*  amp system — one orange (#ff6105), one sans, hairline structure    */
/* ------------------------------------------------------------------ */

const AMP = "#ff6105";
const AMP_HOVER = "#e25704";
const AMP_SHADOW =
  "rgba(255, 97, 5, 0.6) 1px 6px 14px 0px, rgba(0, 0, 0, 0.06) 0px 1px 4px 0px";

function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-[12px] uppercase tracking-[0.16em] text-ash font-medium ${className}`}
    >
      {children}
    </div>
  );
}

/** The 2–3px orange punctuation mark, one third of the heading width. */
function Accent({ w = 120, className = "" }: { w?: number; className?: string }) {
  return (
    <div
      className={`h-[3px] ${className}`}
      style={{ width: w, backgroundColor: AMP }}
    />
  );
}

/* ----------------------------- buttons ----------------------------- */

function BtnPrimary({
  children,
  onClick,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`inline-flex items-center justify-center gap-2 rounded-[50px] font-amp font-medium text-[15px] tracking-[-0.01em] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#ff6105]/40 transition-transform duration-300 ${
        hover ? "-translate-y-[1px]" : "translate-y-0"
      } ${className}`}
      style={{ backgroundColor: hover ? AMP_HOVER : AMP, boxShadow: AMP_SHADOW }}
    >
      {children}
    </button>
  );
}

function NavLink({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`text-[14px] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#ff6105]/40 rounded-[4px] ${className}`}
      style={{ color: hover ? "#0a0a0a" : "#292b2a" }}
    >
      {children}
    </button>
  );
}

function BtnSecondary({
  children,
  onClick,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`inline-flex items-center justify-center gap-2 rounded-[24px] font-amp text-[15px] tracking-[-0.01em] outline-none focus-visible:ring-2 focus-visible:ring-[#ff6105]/40 transition-colors duration-300 ${className}`}
      style={{
        backgroundColor: hover ? "#f3f4f3" : "#ffffff",
        borderColor: hover ? "#a2a3a2" : "#e5e5e5",
        color: "#292b2a",
      }}
    >
      {children}
    </button>
  );
}

/* --------------------------- edit support -------------------------- */

function EditableText({
  ek,
  def,
  className,
  as: Tag = "span",
  isEditing,
}: {
  ek: string;
  def: string;
  className?: string;
  as?: any;
  isEditing: boolean;
}) {
  const [val, setVal] = useState(def);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ek);
      if (saved !== null) setVal(saved);
    } catch {}
  }, [ek]);
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const t = e.currentTarget.textContent || "";
    setVal(t);
    try {
      localStorage.setItem(ek, t);
    } catch {}
  };
  if (!isEditing)
    return <Tag className={className}>{val}</Tag>;
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`${className || ""} outline-dashed outline-1 outline-[#ff6105]/60 hover:outline-[#ff6105] cursor-text rounded-[3px] px-1 -mx-1 focus:outline-solid focus:outline-[#ff6105] focus:bg-[#ffdfcd]/50 transition-colors`}
    >
      {val}
    </Tag>
  );
}

/* --------------------------- motion bits --------------------------- */

function Reveal({
  children,
  delay = 0,
  y = 16,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({
  to,
  suffix = "",
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const pr = Math.min(1, (now - start) / dur);
      setV(to * (1 - Math.pow(1 - pr, 3)));
      if (pr < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {v.toLocaleString("pl-PL", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/** Flat hairline card — the default surface. No shadow, 5px corners. */
function ModuleCard({
  n,
  title,
  dostajesz,
  cel,
  isEditing,
}: {
  n: string;
  title: string;
  dostajesz: string;
  cel: string;
  isEditing: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-[5px] border bg-white p-6 transition-colors duration-300"
      style={{ borderColor: hover ? "#a2a3a2" : "#e5e5e5" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[12px] tracking-[0.12em] transition-colors duration-300"
          style={{ color: hover ? AMP : "#a2a3a2" }}
        >
          {n}
        </span>
        <ArrowUpRight
          className="h-4 w-4 transition-colors duration-300"
          style={{ color: hover ? "#0a0a0a" : "#a2a3a2" }}
        />
      </div>
      <h3 className="mt-6 font-amp text-[20px] font-medium leading-[1.33] tracking-[-0.02em] text-ink">
        <EditableText
          ek={`qraft.service.${n}.title`}
          def={title}
          className="font-amp font-medium"
          isEditing={isEditing}
          as="span"
        />
      </h3>
      <div className="mt-5 space-y-3 border-t border-hairline pt-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-ash font-medium">
            Dostajesz
          </div>
          <EditableText
            ek={`qraft.service.${n}.d`}
            def={dostajesz}
            className="mt-1 block font-amp text-[14px] leading-[1.5] text-carbon"
            isEditing={isEditing}
            as="p"
          />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-ash font-medium">
            Cel
          </div>
          <EditableText
            ek={`qraft.service.${n}.c`}
            def={cel}
            className="mt-1 block font-amp text-[14px] leading-[1.5] text-ink"
            isEditing={isEditing}
            as="p"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ content ---------------------------- */

const serviceDefaults = [
  {
    n: "01",
    title: "System Marki",
    dostajesz: "spójny system wizualny, hasło i szyld.",
    cel: "rozpoznają Cię zanim ktoś się dowie.",
  },
  {
    n: "02",
    title: "Strona i Wydajność",
    dostajesz: "szybką stronę z rezerwacją i formularzem.",
    cel: "każdy klik kończy się zamówieniem.",
  },
  {
    n: "03",
    title: "Pozyskiwanie",
    dostajesz: "widoczność w Mapach i wyszukiwaniu do 3 km.",
    cel: "trafiają do Ciebie ludzie z okolicy.",
  },
  {
    n: "04",
    title: "Silnik Treści",
    dostajesz: "zdjęcia, wideo i teksty o Twoim rzemiośle.",
    cel: "klient widzi jakość jeszcze przed wizytą.",
  },
  {
    n: "05",
    title: "Kampanie",
    dostajesz: "kalendarz ofert i mailingi, które wracają.",
    cel: "puste godziny w tygodniu się zapełniają.",
  },
  {
    n: "06",
    title: "Retencja",
    dostajesz: "system opinii, lojalności i raport tygodniowy.",
    cel: "klienci wracają i polecają Cię znajomym.",
  },
];

const processSteps = [
  {
    t: "Audyt",
    d: "20 minut oglądania Twojej firmy z zewnątrza: strona, Mapy, wizualne, opinie. Bez slajdów i bez presji.",
    pts: ["Ocena w 3 punktach", "Pierwsza największa dźwignia", "Lista rzeczy do naprawy"],
    when: "Dzień 1",
  },
  {
    t: "Blueprint",
    d: "Jedna strona, na której widać całą strategię: pozycjonowanie, oferta, kolejność kroków i budżet miesięczny.",
    pts: ["Pozycjonowanie dla Twojej okolicy", "Oferta i cennik", "Plan na 90 dni"],
    when: "Dzień 7",
  },
  {
    t: "Budowa",
    d: "Tożsamość, strona, zdjęcia i wideo powstają razem — tak, żeby wszystko mówiło tym samym głosem.",
    pts: ["Identyfikacja wizualna", "Strona z rezerwacją", "Materiały zdjęciowe"],
    when: "Dzień 10–28",
  },
  {
    t: "Skalowanie",
    d: "Co poniedziałek liczby zamiast opowieści. Co działa, dostajemy więcej. Co nie działa, wycinamy.",
    pts: ["Raport w złotówkach", "Kampanie lokalne", "Opinie i powroty"],
    when: "Co tydzień",
  },
];

const industries = [
  "Kawiarnie",
  "Studia",
  "Butiki",
  "Kliniki",
  "Gabinety",
  "Warsztaty",
  "Restauracje",
  "Fryzjerzy",
];

const plans = [
  {
    name: "Start",
    price: "1 900 zł",
    sub: "/ mies.",
    line: "Fundamenty, by dać się znaleźć.",
    pts: ["Uporządkowanie marki", "Strona + Mapy", "Opieka i raport"],
    featured: false,
    cta: "Wybierz Start",
  },
  {
    name: "Skala",
    price: "3 800 zł",
    sub: "/ mies.",
    line: "Pełny system. Wypełnia kalendarz.",
    pts: ["Wszystko ze Startu", "Zasięg + płatne w promieniu", "Silnik treści + lista"],
    featured: true,
    cta: "Wybierz Skalę",
  },
  {
    name: "Lab",
    price: "Wycena",
    sub: "",
    line: "Starty, rebrandingi, wiele lokalizacji.",
    pts: ["Od zera", "Atelier foto & film", "Sprinty co tydzień"],
    featured: false,
    cta: "Zapytaj o Lab",
  },
];

/* ------------------------------- page ------------------------------ */

export default function Landing() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", business: "", email: "" });
  const [sent, setSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const go = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name) return;
    setSent(true);
    setTimeout(() => setSent(false), 3800);
  };

  return (
    <div className="min-h-screen bg-white text-ink antialiased selection:bg-[#ffdfcd] selection:text-ink">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap'); html{scroll-behavior:smooth}`}</style>

      {/* ---------------------------- announcement bar ----------------------- */}
      <div className="bg-linen border-b border-hairline">
        <div className="mx-auto max-w-[1200px] px-6 h-11 flex items-center justify-center gap-3 text-[13px] text-carbon">
          <EditableText
            ek="qraft.announce"
            def="Starty w listopadzie — zostały 2 miejsca w miesiącu."
            isEditing={isEditing}
            as="span"
          />
          <button
            onClick={() => go("contact")}
            className="hidden sm:inline-flex items-center gap-1 font-medium text-ink transition-colors"
            style={{ color: AMP }}
          >
            Zamów audyt <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ------------------------------- top nav ------------------------------ */}
      <header className="sticky top-0 z-40 bg-white border-b border-hairline">
        <div className="mx-auto max-w-[1200px] px-6 h-[68px] flex items-center justify-between gap-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 outline-none"
          >
            <span className="h-7 w-7 rounded-[5px] bg-charcoal grid place-items-center">
              <span className="font-amp font-medium text-[13px] text-white">Q</span>
            </span>
            <span className="relative font-amp font-medium text-[15px] tracking-[0.16em] text-ink">
              QRAFT
              <span
                className="absolute -bottom-[5px] left-0 h-[2px] w-6"
                style={{ backgroundColor: AMP }}
              />
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-9">
            {[
              ["services", "System"],
              ["process", "Proces"],
              ["pricing", "Plany"],
              ["contact", "Kontakt"],
            ].map(([id, label]) => (
              <NavLink key={id} onClick={() => go(id)}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="hidden lg:inline-flex items-center gap-2 h-10 px-4 rounded-[24px] border text-[13px] transition-colors"
              style={{
                borderColor: isEditing ? AMP : "#e5e5e5",
                backgroundColor: isEditing ? "#ffdfcd" : "#ffffff",
                color: isEditing ? "#0a0a0a" : "#7a7b7b",
              }}
            >
              {isEditing ? (
                <>
                  <Save className="h-3.5 w-3.5" /> ZAKOŃCZ
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" /> EDYTUJ TEKSTY
                </>
              )}
            </button>
            <NavLink onClick={() => navigate("/auth")} className="hidden sm:inline-flex h-10 px-3">
              Zaloguj się
            </NavLink>
            <BtnPrimary
              onClick={() => go("contact")}
              className="h-10 px-5 text-[14px] hidden sm:inline-flex"
            >
              Zamów audyt
            </BtnPrimary>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden h-10 w-10 grid place-items-center rounded-[24px] border border-hairline"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden border-t border-hairline bg-white overflow-hidden"
            >
              <div className="px-6 py-2">
                {[
                  ["services", "System"],
                  ["process", "Proces"],
                  ["pricing", "Plany"],
                  ["contact", "Kontakt"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    className="w-full text-left py-4 border-b border-hairline text-[16px] text-carbon"
                  >
                    {label}
                  </button>
                ))}
                <div className="py-4 flex flex-col gap-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full h-12 rounded-[24px] border border-hairline text-[14px] text-slate"
                  >
                    {isEditing ? "ZAKOŃCZ EDYCJĘ" : "EDYTUJ TEKSTY"}
                  </button>
                  <button
                    onClick={() => navigate("/auth")}
                    className="w-full h-12 rounded-[24px] border border-hairline text-[14px] text-carbon"
                  >
                    Zaloguj się
                  </button>
                  <BtnPrimary
                    onClick={() => go("contact")}
                    className="w-full h-12 text-[15px]"
                  >
                    Zamów audyt
                  </BtnPrimary>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {isEditing && (
        <div className="sticky top-[68px] z-30 bg-peach-wash border-b border-hairline">
          <div className="mx-auto max-w-[1200px] px-6 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-[12px] text-carbon">
              <Pencil className="h-3.5 w-3.5" /> Tryb edycji — kliknij w
              dowolny tekst, aby go zmienić. Zapis jest automatyczny.
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="hidden sm:inline-flex h-8 px-4 rounded-[24px] text-[12px] font-medium text-white"
              style={{ backgroundColor: AMP }}
            >
              GOTOWE
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------- hero ------------------------------- */}
      <section>
        <div className="mx-auto max-w-[1200px] px-6 pt-16 lg:pt-24 pb-16 lg:pb-20">
          <div className="max-w-[860px]">
            <Eyebrow>Marketing dla firm lokalnych</Eyebrow>
            <h1 className="mt-7 font-amp font-light text-[44px] sm:text-[62px] lg:text-[78px] leading-[1.05] tracking-[-0.036em] text-ink">
              <EditableText
                ek="qraft.hero.t1"
                def="Precyzja buduje"
                className="block font-amp font-light"
                isEditing={isEditing}
                as="span"
              />
              <EditableText
                ek="qraft.hero.t2"
                def="marki."
                className="block font-amp font-light"
                isEditing={isEditing}
                as="span"
              />
            </h1>
            <Accent className="mt-8" />
            <EditableText
              ek="qraft.hero.sub"
              def="Jeden system. Sześć modułów. Cotygodniowe dowody. Budujemy marki dla firm, które liczą każdego klienta — od kawiarni po klinikę."
              className="mt-8 block font-amp text-[17px] leading-[1.56] text-carbon max-w-[600px]"
              isEditing={isEditing}
              as="p"
            />
            <div className="mt-10 flex flex-wrap items-center gap-3.5">
              <BtnPrimary onClick={() => go("contact")} className="h-[56px] px-8 text-[16px]">
                Zamów darmowy audyt <ArrowRight className="h-4 w-4" />
              </BtnPrimary>
              <BtnSecondary
                onClick={() => go("services")}
                className="h-[56px] px-7 border text-[15px]"
              >
                Zobacz system
              </BtnSecondary>
            </div>
          </div>
        </div>

        {/* the object IS the product: the brand, photographed */}
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="relative rounded-[8px] overflow-hidden border border-hairline">
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=2000&q=80&auto=format&fit=crop"
              alt="Wnętrze kawiarni w ciepłym świetle"
              className="h-[280px] sm:h-[420px] lg:h-[540px] w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(32,33,32,0.28) 0%, transparent 42%)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[340px] rounded-[5px] border border-hairline bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <span
                  className="rounded-[8px] px-2.5 py-1 text-[11px] font-medium text-white"
                  style={{ backgroundColor: AMP }}
                >
                  Ostatnia budowa
                </span>
                <span className="text-[12px] text-ash">6 tygodni</span>
              </div>
              <EditableText
                ek="qraft.hero.cardTitle"
                def="Kawiarnia Młyn — Kraków"
                className="mt-4 block font-amp text-[20px] font-medium tracking-[-0.02em] text-ink"
                isEditing={isEditing}
                as="div"
              />
              <EditableText
                ek="qraft.hero.cardDesc"
                def="Identyfikacja, strona z rezerwacją i kampania w promieniu 3 km."
                className="mt-1.5 block font-amp text-[14px] leading-[1.5] text-slate"
                isEditing={isEditing}
                as="p"
              />
              <div className="mt-5 flex items-end justify-between border-t border-hairline pt-4">
                <div>
                  <div className="font-amp font-light text-[28px] leading-none tracking-[-0.03em] text-ink">
                    <CountUp to={64} suffix="%" />
                  </div>
                  <div className="mt-1.5 text-[12px] text-slate">
                    wzrost zapytań
                  </div>
                </div>
                <div className="flex gap-1.5 items-end h-10">
                  {[18, 26, 22, 34, 30, 44, 58, 74].map((h, i) => (
                    <span
                      key={i}
                      className="w-[6px] rounded-[2px]"
                      style={{
                        height: h,
                        backgroundColor:
                          i === 7 ? AMP : i > 4 ? "#ffdfcd" : "#e5e5e5",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* proof row */}
        <div className="mx-auto max-w-[1200px] px-6 pt-14">
          <div className="flex flex-wrap gap-x-16 gap-y-8 border-t border-hairline pt-10">
            {[
              { v: <CountUp to={340} suffix="+" />, l: "Zbudowanych marek" },
              { v: <CountUp to={4.9} decimals={1} />, l: "Średnia ocena" },
              { v: <CountUp to={14} suffix=" dni" />, l: "Do pierwszych efektów" },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-amp font-light text-[40px] leading-none tracking-[-0.03em] text-ink">
                  {s.v}
                </div>
                <div className="mt-3 text-[13px] text-slate">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------- press logo strip ------------------------- */}
      <section className="mt-20 lg:mt-28 border-y border-hairline">
        <div className="mx-auto max-w-[1200px] px-6 py-10">
          <div className="text-center text-[12px] uppercase tracking-[0.16em] text-ash font-medium">
            Gdzie pracujemy
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-14">
            {industries.map((x) => (
              <span
                key={x}
                className="font-amp font-light text-[17px] tracking-[-0.01em] text-ink"
              >
                {x}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- system ----------------------------- */}
      <section
        id="services"
        className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28 scroll-mt-24"
      >
        <Reveal>
          <div className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-16 items-end">
            <div>
              <Eyebrow>01 — System</Eyebrow>
              <h2 className="mt-6 font-amp font-light text-[36px] sm:text-[48px] leading-[1.1] tracking-[-0.03em] text-ink">
                <EditableText
                  ek="qraft.system.h1"
                  def="Jeden system."
                  className="block font-amp font-light"
                  isEditing={isEditing}
                  as="span"
                />
                <EditableText
                  ek="qraft.system.h2"
                  def="Sześć modułów."
                  className="block font-amp font-light"
                  isEditing={isEditing}
                  as="span"
                />
              </h2>
              <Accent className="mt-7" />
            </div>
            <EditableText
              ek="qraft.system.subtitle"
              def="System prowadzi klienta od pierwszego wyszukania aż do powtórnych zakupów. Włączasz moduły po kolei albo wszystkie naraz — każdy działa sam, a razem działają lepiej."
              className="font-amp text-[15px] leading-[1.56] text-slate"
              isEditing={isEditing}
              as="p"
            />
          </div>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {serviceDefaults.map((s) => (
            <ModuleCard
              key={s.n}
              n={s.n}
              title={s.title}
              dostajesz={s.dostajesz}
              cel={s.cel}
              isEditing={isEditing}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <EditableText
            ek="qraft.system.footerL"
            def="Otwarte dla każdego klienta."
            className="text-[13px] text-ash"
            isEditing={isEditing}
            as="span"
          />
          <BtnSecondary onClick={() => go("contact")} className="h-12 px-6 border text-[14px]">
            <EditableText
              ek="qraft.system.footerR"
              def="Umów bezpłatną diagnozę"
              className="font-amp text-[14px]"
              isEditing={isEditing}
              as="span"
            />
            <ArrowRight className="h-4 w-4" />
          </BtnSecondary>
        </div>
      </section>

      {/* ---------------------------- dark band ----------------------------- */}
      <section className="relative overflow-hidden bg-charcoal">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000&q=80&auto=format&fit=crop"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-[0.4]"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(32,33,32,0.65)" }}
        />
        <div className="relative mx-auto max-w-[1200px] px-6 py-24 lg:py-[120px] text-center">
          <Reveal>
            <Eyebrow className="text-white/50">Manifest</Eyebrow>
            <h2 className="mx-auto mt-6 max-w-[820px] font-amp font-light text-[32px] sm:text-[44px] lg:text-[48px] leading-[1.15] tracking-[-0.03em] text-white">
              <EditableText
                ek="qraft.band.h1"
                def="Dwa tygodnie do pierwszych efektów."
                className="block font-amp font-light"
                isEditing={isEditing}
                as="span"
              />
              <EditableText
                ek="qraft.band.h2"
                def="Potem tylko tydzień po tygodniu."
                className="block font-amp font-light text-white/55"
                isEditing={isEditing}
                as="span"
              />
            </h2>
            <div className="flex justify-center">
              <Accent w={60} className="mt-8" />
            </div>
            <EditableText
              ek="qraft.band.desc"
              def="Nie sprzedajemy obietnic. Sprzedajemy cotygodniowe liczby: zapytania, rezerwacje i powracających klientów."
              className="mx-auto mt-8 block max-w-[540px] font-amp text-[15px] leading-[1.56] text-white/60"
              isEditing={isEditing}
              as="p"
            />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ proces ------------------------------ */}
      <section
        id="process"
        className="bg-linen border-b border-hairline scroll-mt-24"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
          <Reveal>
            <div className="max-w-[720px]">
              <Eyebrow>02 — Proces</Eyebrow>
              <h2 className="mt-6 font-amp font-light text-[36px] sm:text-[48px] leading-[1.1] tracking-[-0.03em] text-ink">
                <EditableText
                  ek="qraft.process.h1"
                  def="Cztery tygodnie"
                  className="block font-amp font-light"
                  isEditing={isEditing}
                  as="span"
                />
                <EditableText
                  ek="qraft.process.h2"
                  def="do rozpędu."
                  className="block font-amp font-light"
                  isEditing={isEditing}
                  as="span"
                />
              </h2>
              <Accent className="mt-7" />
            </div>
          </Reveal>

          <div className="mt-14 grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
            {/* step indicator row */}
            <div className="space-y-2">
              {processSteps.map((s, i) => {
                const active = step === i;
                return (
                  <button
                    key={s.t}
                    onClick={() => setStep(i)}
                    onMouseEnter={() => setStep(i)}
                    className="w-full text-left rounded-[5px] border px-5 py-4 transition-colors duration-300"
                    style={{
                      borderColor: active ? "#e5e5e5" : "transparent",
                      backgroundColor: active ? "#ffffff" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="shrink-0 rounded-[8px] px-3 py-1 text-[12px] font-medium transition-colors duration-300"
                        style={{
                          backgroundColor: active ? AMP : "transparent",
                          color: active ? "#ffffff" : "#a2a3a2",
                        }}
                      >
                        Krok {i + 1}
                      </span>
                      <span
                        className="font-amp text-[18px] transition-colors duration-300"
                        style={{
                          color: active ? "#0a0a0a" : "#292b2a",
                          fontWeight: active ? 500 : 400,
                        }}
                      >
                        <EditableText
                          ek={`qraft.step.${i}.t`}
                          def={s.t}
                          className="font-amp"
                          isEditing={isEditing}
                          as="span"
                        />
                      </span>
                    </div>
                    <div className="mt-3.5 h-[2px] w-full bg-hairline" />
                  </button>
                );
              })}
            </div>

            {/* peach featured card — the "mockup" panel */}
            <div
              className="rounded-[5px] p-6 lg:p-8"
              style={{ backgroundColor: "#ffdfcd" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-[0.16em] font-medium text-ink/55">
                  {processSteps[step].when}
                </span>
                <span className="text-[12px] text-ink/45">
                  Krok {step + 1} / 4
                </span>
              </div>
              <h3 className="mt-5 font-amp text-[24px] font-medium tracking-[-0.02em] text-ink pb-4 border-b-2 border-white/60">
                <EditableText
                  ek={`qraft.step.${step}.h`}
                  def={processSteps[step].t}
                  className="font-amp font-medium"
                  isEditing={isEditing}
                  as="span"
                />
              </h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <EditableText
                    ek={`qraft.step.${step}.d`}
                    def={processSteps[step].d}
                    className="mt-5 block font-amp text-[15px] leading-[1.56] text-ink/70"
                    isEditing={isEditing}
                    as="p"
                  />
                  <ul className="mt-6 space-y-3">
                    {processSteps[step].pts.map((p) => (
                      <li
                        key={p}
                        className="flex gap-3 font-amp text-[14px] text-ink/80"
                      >
                        <Check className="h-4 w-4 mt-[3px] shrink-0" style={{ color: AMP }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
              <div className="mt-8">
                <div className="h-[3px] w-full rounded-full bg-white/60 overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: AMP }}
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / processSteps.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <BtnSecondary
                  onClick={() => go("contact")}
                  className="mt-6 h-12 px-6 border border-white/70 bg-transparent text-[14px] w-full"
                >
                  Zacznij od audytu <ArrowRight className="h-4 w-4" />
                </BtnSecondary>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- plany ------------------------------ */}
      <section
        id="pricing"
        className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28 scroll-mt-24"
      >
        <Reveal>
          <div className="mx-auto max-w-[620px] text-center">
            <div className="flex justify-center">
              <Eyebrow>03 — Plany</Eyebrow>
            </div>
            <h2 className="mt-6 font-amp font-light text-[36px] sm:text-[48px] leading-[1.1] tracking-[-0.03em] text-ink">
              <EditableText
                ek="qraft.pricing.h"
                def="Jasne ceny."
                className="font-amp font-light"
                isEditing={isEditing}
                as="span"
              />
            </h2>
            <div className="flex justify-center">
              <Accent className="mt-7" />
            </div>
            <EditableText
              ek="qraft.pricing.sub"
              def="Miesiąc do miesiąca po 90 dniach. Bez zobowiązań i bez ukrytych opłat."
              className="mt-7 block font-amp text-[15px] leading-[1.56] text-slate"
              isEditing={isEditing}
              as="p"
            />
          </div>
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-3 gap-5 items-start">
          {plans.map((p, i) => {
            const cta = (
              <EditableText
                ek={`qraft.plan.${i}.cta`}
                def={p.cta}
                className="font-amp text-[15px]"
                isEditing={isEditing}
                as="span"
              />
            );
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-[5px] border p-7 flex flex-col ${
                  p.featured ? "border-transparent" : "border-hairline bg-white"
                }`}
                style={p.featured ? { backgroundColor: "#ffdfcd" } : undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] uppercase tracking-[0.16em] font-medium text-slate">
                    <EditableText
                      ek={`qraft.plan.${i}.name`}
                      def={p.name}
                      className="uppercase tracking-[0.16em] font-medium"
                      isEditing={isEditing}
                      as="span"
                    />
                  </span>
                  {p.featured && (
                    <span className="rounded-[8px] bg-charcoal px-3 py-1 text-[11px] font-medium text-white">
                      Najczęściej wybierany
                    </span>
                  )}
                </div>
                <div className="mt-7 flex items-baseline gap-2">
                  <span className="font-amp font-light text-[40px] leading-none tracking-[-0.03em] text-ink">
                    <EditableText
                      ek={`qraft.plan.${i}.price`}
                      def={p.price}
                      className="font-amp font-light"
                      isEditing={isEditing}
                      as="span"
                    />
                  </span>
                  <span className="text-[14px] text-ash">
                    <EditableText
                      ek={`qraft.plan.${i}.sub`}
                      def={p.sub}
                      className="font-amp text-[14px] text-ash"
                      isEditing={isEditing}
                      as="span"
                    />
                  </span>
                </div>
                <EditableText
                  ek={`qraft.plan.${i}.line`}
                  def={p.line}
                  className="mt-4 block font-amp text-[15px] leading-[1.5] text-slate"
                  isEditing={isEditing}
                  as="p"
                />
                <ul className="mt-7 space-y-3 flex-1 border-t border-hairline pt-7">
                  {p.pts.map((x, idx) => (
                    <li
                      key={x}
                      className="flex gap-3 font-amp text-[14px] text-carbon"
                    >
                      <Check
                        className="h-4 w-4 mt-[3px] shrink-0"
                        style={{ color: p.featured ? AMP : "#a2a3a2" }}
                      />
                      <EditableText
                        ek={`qraft.plan.${i}.pt${idx}`}
                        def={x}
                        className="font-amp text-[14px]"
                        isEditing={isEditing}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {p.featured ? (
                    <BtnPrimary
                      onClick={() => go("contact")}
                      className="w-full h-14 text-[15px]"
                    >
                      {cta}
                    </BtnPrimary>
                  ) : (
                    <BtnSecondary
                      onClick={() => go("contact")}
                      className="w-full h-12 border text-[15px]"
                    >
                      {cta}
                    </BtnSecondary>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-8 text-center text-[13px] text-ash">
          <EditableText
            ek="qraft.pricing.note"
            def="Sesja zdjęciowa wchodzi w cenę od planu Skala. Szczegóły ustalamy na audycie."
            className="font-amp text-[13px] text-ash"
            isEditing={isEditing}
            as="span"
          />
        </div>
      </section>

      {/* --------------------------------- faq ------------------------------- */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20 lg:pb-28">
        <Reveal>
          <div className="grid lg:grid-cols-[320px_1fr] gap-10 lg:gap-16">
            <div>
              <Eyebrow>04 — FAQ</Eyebrow>
              <h2 className="mt-6 font-amp font-light text-[30px] leading-[1.15] tracking-[-0.03em] text-ink">
                <EditableText
                  ek="qraft.faq.h"
                  def="Szybkie odpowiedzi."
                  className="font-amp font-light"
                  isEditing={isEditing}
                  as="span"
                />
              </h2>
              <Accent w={80} className="mt-6" />
              <EditableText
                ek="qraft.faq.desc"
                def="Jasno i bez żargonu. Resztę dopowiemy na audycie."
                className="mt-6 block font-amp text-[14px] leading-[1.5] text-slate"
                isEditing={isEditing}
                as="p"
              />
            </div>
            <div className="rounded-[5px] border border-hairline bg-white divide-y divide-hairline overflow-hidden">
              {[
                [
                  "Dla kogo jest QRAFT?",
                  "Dla firm, gdzie liczy się miejsce i reputacja. Kawiarnie, studia, butiki, kliniki, gabinety i warsztaty.",
                ],
                [
                  "Jak szybko widać efekty?",
                  "2–4 tygodnie, by dać się znaleźć. 30–60 dni, by urosnąć w środku tygodnia.",
                ],
                [
                  "Czy jest zobowiązanie?",
                  "Nie. Miesiąc do miesiąca po 90 dniach. Odejście nie kosztuje nic.",
                ],
                [
                  "Czego potrzebujecie na start?",
                  "90 minut Twojego czasu i dostępu do profili w social mediach. Resztą zajmujemy się my.",
                ],
              ].map(([q, a], i) => (
                <div key={q}>
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-start justify-between gap-6 p-6 text-left"
                  >
                    <span
                      className="font-amp text-[18px] pb-3 border-b-2 border-hairline pr-2"
                      style={{
                        color: faqOpen === i ? "#0a0a0a" : "#292b2a",
                        fontWeight: faqOpen === i ? 500 : 400,
                      }}
                    >
                      <EditableText
                        ek={`qraft.faq.${i}.q`}
                        def={q}
                        className="font-amp text-[18px]"
                        isEditing={isEditing}
                        as="span"
                      />
                    </span>
                    <span
                      className="h-7 w-7 shrink-0 grid place-items-center rounded-[50px] border transition-colors duration-300"
                      style={{
                        borderColor: faqOpen === i ? AMP : "#e5e5e5",
                        color: faqOpen === i ? "#ffffff" : "#a2a3a2",
                        backgroundColor: faqOpen === i ? AMP : "transparent",
                      }}
                    >
                      {faqOpen === i ? (
                        <Minus className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence>
                    {faqOpen === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <EditableText
                            ek={`qraft.faq.${i}.a`}
                            def={a}
                            className="block font-amp text-[15px] leading-[1.56] text-slate max-w-[560px]"
                            isEditing={isEditing}
                            as="p"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------- kontakt ----------------------------- */}
      <section
        id="contact"
        className="bg-linen border-t border-hairline scroll-mt-24"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-5">
            <Reveal>
              <div className="rounded-[5px] bg-charcoal p-8 lg:p-10 h-full flex flex-col">
                <Eyebrow className="text-white/50">05 — Budowa</Eyebrow>
                <h2 className="mt-6 font-amp font-light text-[32px] sm:text-[40px] leading-[1.12] tracking-[-0.03em] text-white">
                  <EditableText
                    ek="qraft.contact.h1"
                    def="Spraw, by każdy"
                    className="block font-amp font-light"
                    isEditing={isEditing}
                    as="span"
                  />
                  <EditableText
                    ek="qraft.contact.h2"
                    def="klient się liczył."
                    className="block font-amp font-light text-white/55"
                    isEditing={isEditing}
                    as="span"
                  />
                </h2>
                <Accent className="mt-7" />
                <EditableText
                  ek="qraft.contact.desc"
                  def="20 minut. Znajdziemy lukę w Twojej firmie i zostawimy plan — nawet jeśli nas nie wybierzesz. Otwarte dla wszystkich."
                  className="mt-7 block font-amp text-[15px] leading-[1.56] text-white/60 max-w-[400px]"
                  isEditing={isEditing}
                  as="p"
                />
                <div className="mt-8 space-y-3 text-[14px] text-white/60">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 opacity-50" />
                    <EditableText
                      ek="qraft.contact.line1"
                      def="Dwa terminy w tym tygodniu · 20 minut"
                      className="font-amp text-[14px]"
                      isEditing={isEditing}
                      as="span"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 opacity-50" />
                    <EditableText
                      ek="qraft.contact.line2"
                      def="odpowiadamy w ciągu kilku godzin"
                      className="font-amp text-[14px]"
                      isEditing={isEditing}
                      as="span"
                    />
                  </div>
                </div>
                <div className="mt-10 flex flex-wrap gap-2">
                  <span className="rounded-[8px] border border-white/15 px-3 py-2 text-[12px] text-white/70">
                    <EditableText
                      ek="qraft.contact.badge1"
                      def="BEZ PREZENTACJI"
                      className="font-amp text-[12px]"
                      isEditing={isEditing}
                      as="span"
                    />
                  </span>
                  <span className="rounded-[8px] border border-white/15 px-3 py-2 text-[12px] text-white/70">
                    <EditableText
                      ek="qraft.contact.badge2"
                      def="BEZ ŻARGONU"
                      className="font-amp text-[12px]"
                      isEditing={isEditing}
                      as="span"
                    />
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="rounded-[5px] border border-hairline bg-white p-7 lg:p-8 h-full">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-amp text-[24px] font-medium tracking-[-0.02em] text-ink">
                    <EditableText
                      ek="qraft.form.h"
                      def="Rozpocznij budowę"
                      className="font-amp font-medium"
                      isEditing={isEditing}
                      as="span"
                    />
                  </h3>
                  <span className="rounded-[8px] border border-hairline px-3 py-1 text-[12px] text-ash">
                    2 min
                  </span>
                </div>

                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 rounded-[5px] p-8 text-center"
                    style={{ backgroundColor: "#ffdfcd" }}
                  >
                    <div
                      className="h-10 w-10 mx-auto grid place-items-center rounded-[50px] text-white"
                      style={{ backgroundColor: AMP }}
                    >
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="mt-5 font-amp text-[18px] font-medium text-ink">
                      Zgłoszenie otrzymane.
                    </div>
                    <div className="mt-2 font-amp text-[14px] text-ink/60">
                      Wyślemy terminy w ciągu kilku godzin.
                    </div>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-6 text-[13px] text-ink/60 underline underline-offset-4"
                    >
                      Wyślij kolejne
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={submit} className="mt-8 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="space-y-2 block">
                        <span className="block text-[12px] uppercase tracking-[0.12em] text-ash font-medium">
                          Imię i nazwisko
                        </span>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Alex Kowalski"
                          className="w-full h-14 rounded-[50px] border border-hairline bg-white px-5 font-amp text-[15px] text-ink placeholder:text-ash focus:outline-none focus:border-[#ff6105]"
                        />
                      </label>
                      <label className="space-y-2 block">
                        <span className="block text-[12px] uppercase tracking-[0.12em] text-ash font-medium">
                          Firma
                        </span>
                        <input
                          value={form.business}
                          onChange={(e) =>
                            setForm({ ...form, business: e.target.value })
                          }
                          placeholder="Lumière"
                          className="w-full h-14 rounded-[50px] border border-hairline bg-white px-5 font-amp text-[15px] text-ink placeholder:text-ash focus:outline-none focus:border-[#ff6105]"
                        />
                      </label>
                    </div>
                    <label className="space-y-2 block">
                      <span className="block text-[12px] uppercase tracking-[0.12em] text-ash font-medium">
                        Email
                      </span>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="alex@firma.pl"
                        className="w-full h-14 rounded-[50px] border border-hairline bg-white px-5 font-amp text-[15px] text-ink placeholder:text-ash focus:outline-none focus:border-[#ff6105]"
                      />
                    </label>
                    <BtnPrimary type="submit" className="w-full h-14 text-[16px]">
                      Zamów audyt — za darmo <ArrowRight className="h-4 w-4" />
                    </BtnPrimary>
                    <div className="text-center text-[13px] text-slate">
                      Lub{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/auth")}
                        className="font-medium text-ink underline underline-offset-4"
                      >
                        zaloguj się
                      </button>{" "}
                      by zarządzać budową
                    </div>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------- footer ----------------------------- */}
      <footer className="border-t border-hairline bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-[13px] text-ash">
          <div className="flex items-center gap-3">
            <span className="h-7 w-7 rounded-[5px] bg-charcoal grid place-items-center">
              <span className="font-amp font-medium text-[13px] text-white">Q</span>
            </span>
            <span className="font-amp font-medium text-[14px] tracking-[0.16em] text-ink">
              QRAFT
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <EditableText
              ek="qraft.footer.tag"
              def="Precyzja buduje marki"
              className="font-amp text-[13px]"
              isEditing={isEditing}
              as="span"
            />
            <span className="h-3 w-px bg-hairline" />
            <span>qraft.build</span>
          </div>
        </div>
      </footer>

      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="fixed bottom-6 right-6 z-50 hidden lg:inline-flex items-center gap-2 h-11 px-5 rounded-[50px] bg-charcoal text-white text-[13px]"
        >
          <Pencil className="h-3.5 w-3.5" /> EDYTUJ TEKSTY
        </button>
      )}
    </div>
  );
}
