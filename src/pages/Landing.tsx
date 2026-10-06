import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Faq4 } from "@/components/ui/faq-4";
import GradualBlur from "@/components/GradualBlur";
import JellyRadio from "@/components/JellyRadio";
import LineSidebar from "@/components/LineSidebar";
import { LogoDropdown } from "@/components/LogoDropdown";
import PixelTrail from "@/components/PixelTrail";
import StaggeredMenu from "@/components/StaggeredMenu";
import QraftMark from "@/components/QraftMark";
import CountUp from "@/components/CountUp";
import FlipCard from "@/components/FlipCard";
import { PopNumber } from "@/components/transitions";
import { ArrowRight, Mail, Phone, ShieldCheck, Zap } from "lucide-react";

const NEEDS = [
  { value: "marka", label: "Marka" },
  { value: "strona", label: "Strona" },
  { value: "pozyskiwanie", label: "Pozyskiwanie" },
  { value: "tresc", label: "Tre\u015b\u0107" },
  { value: "kampanie", label: "Kampanie" },
  { value: "retencja", label: "Retencja" },
];

const FIRM_SIZE_OPTIONS = [
  { value: "1", label: "1\u20135", sub: "startup / w jednostce" },
  { value: "6", label: "6\u201320", sub: "ma\u0142\u0105 firma" },
  { value: "21", label: "21\u201350", sub: "\u015brednia firma" },
  { value: "51", label: "50+", sub: "du\u017c\u0105 firma / korporacja" },
];

const COOP_OPTIONS = [
  { value: "3", label: "3 mies.", sub: "quick check" },
  { value: "6", label: "6 mies.", sub: "cykl weryfikacji" },
  { value: "12", label: "12 mies.", sub: "pe\u0142ny roczny" },
];

function logoPath(dark = false) {
  const c = dark ? "#000000" : "#ffffff";
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9.5 L8 4.5 L12 9.5 L16 4.5 L21 9.5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 14.5 L8 9.5 L12 14.5 L16 9.5 L21 14.5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function NavLink({ href, children, active, onClick }: {
  href: string; children: React.ReactNode; active?: boolean; onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`relative font-[JetBrains_Mono] text-[11px] tracking-[0.16em] ${
        active
          ? "text-white"
          : "text-white/50 hover:text-white/90"
      } transition-colors`}
    >
      {children}
      {active && <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#FF3E0A]" />}
    </a>
  );
}

function TerminalChip({ lines = 3 }: { lines?: number }) {
  const [cursor, setCursor] = useState(true);
  useEffect(() => { const t = setInterval(() => setCursor((c) => !c), 530); return () => clearInterval(t); }, []);
  return (
    <span className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/[0.04] px-3 py-1 text-white/40 font-[JetBrains_Mono] text-[10px] tracking-[0.14em]">
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-[#FF3E0A] animate-pulse" />
        <span className="text-white/70">TIMEOUT</span>
      </span>
      <span className="text-white/20">{'}'}&thinsp;</span>
      <span className="h-4 w-4 rounded border border-white/20 flex items-center justify-center text-[8px] font-bold">
        {cursor ? "\u0001" : " "}
      </span>
    </span>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050507]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[70vh] w-[80vw] rounded-full opacity-[0.22] blur-[140px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
      <div className="absolute bottom-[-5%] right-[-5%] h-[60vh] w-[70vw] rounded-full opacity-[0.18] blur-[160px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 55%)" }} />
      <GradualBlur className="absolute inset-0 dark:opacity-40" />
      <PixelTrail />
      <div className="relative z-10 mx-auto max-w-[1200px] px-6 lg:px-8 text-center">
        <LogoDropdown>
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-[10px] bg-[#FF3E0A] text-black grid place-items-center shadow-[0_20px_48px_rgba(255,62,10,0.45)]">
              {logoPath(true)}
            </div>
            <span className="font-[Space_Grotesk] font-bold text-[22px] tracking-[-0.02em]">QRAFT.BUILD</span>
          </div>
        </LogoDropdown>
        <div className="mt-6 inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 bg-white/[0.04] font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A] animate-pulse" />
          MARKI \u2014 DLA KA\u017dDEGO KLIENTA
        </div>
        <h1 className="mt-6 font-[Space_Grotesk] text-[58px] sm:text-[76px] leading-[0.98] tracking-[-0.02em] font-bold">
          Budujemy marki, kt\xf3re
          <br />
          <span className="text-[#FF3E0A]">zbieraj\u0105 klient\xf3w.</span>
        </h1>
        <p className="mt-4 text-[15px] leading-6 text-white/40 max-w-[560px] mx-auto">
          Nie trafiaj na agency, kt\xf3re g\u0107waj\u0105. T\u0119cza, dowody, procesy \u2014 wszystko mierzymy przez to, ile firma zdobywa i utrzymuje klient\xf3w.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a href="#estimator" className="inline-flex items-center gap-2 bg-[#FF3E0A] text-white rounded-full px-7 h-[54px] font-[Space_Grotesk] text-sm font-bold shadow-[0_24px_50px_rgba(255,62,10,0.45)] hover:bg-[#FF5A2E] transition-colors">
            Zobacz ceny i wstep <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-6 text-left max-w-[680px] mx-auto">
          <div className="bg-white/[0.03] border border-white/10 rounded-[16px] p-5">
            <div className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em]">01</div>
            <div className="mt-2 font-[Space_Grotesk] text-[18px] font-bold">Niezale\u017cna cena</div>
            <div className="mt-1.5 text-[13px] text-white/40">Zale\u017czy od rozmiaru i celu. Bez ukrytych blok\xf3w.</div>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-[16px] p-5">
            <div className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em]">02</div>
            <div className="mt-2 font-[Space_Grotesk] text-[18px] font-bold">Symbolika i audyt</div>
            <div className="mt-1.5 text-[13px] text-white/40">Ka\u017cda decyzja \u2014 z odno\u015bnikiem i uzasadnieniem.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EstResults() {
  return (
    <section className="relative bg-[#050507] border-b border-white/5">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-20 lg:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-10">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 bg-white/[0.04] font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
              <Zap className="h-3 w-3" /> W\u0119GRANY
            </div>
            <h2 className="mt-4 font-[Space_Grotesk] text-[42px] sm:text-[56px] font-bold tracking-[-0.02em] leading-tight">
              Wyniki, nie wst\u0119pne.
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-white/40 max-w-[520px]">
              Tylko to, co wynika z wielko\u0142ci firmy i tego, czego potrzebujesz. Nie obietnice \u2014 liczby, kt\xf3re wynikaj\u0105 z wielko\u0142ci i rozk\u0142adu zada\u0144.
            </p>
          </div>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { k: "90+", n: "firm", c: "ocenionych w roku" },
            { k: "4.9/5", n: "ocena", c: "średnia z 212 opinii" },
            { k: "340+", n: "klient\u00f3w", c: "rozwi\u0105zani\u00e9 w trakcie" },
          ].map((r) => (
            <div key={r.k} className="bg-white/[0.03] border border-white/10 rounded-[18px] p-6">
              <div className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em]">STATystyka</div>
              <div className="mt-3">
                <PopNumber text={r.k} className="text-[48px] sm:text-[58px]" />
              </div>
              <div className="mt-2 font-[Space_Grotesk] text-[16px] font-bold">{r.n}</div>
              <div className="mt-1 text-[13px] text-white/40">{r.c}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Atelier() {
  return (
    <section className="relative bg-[#050507]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-20 lg:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-10">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 bg-white/[0.04] font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
              <ShieldCheck className="h-3 w-3" /> STUDIO
            </div>
            <h2 className="mt-4 font-[Space_Grotesk] text-[42px] sm:text-[56px] font-bold tracking-[-0.02em] leading-tight">
              Atelier strategii.
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-white/40 max-w-[520px]">
              Ka\u017cda marka \u2014 przez pryzmat symboli, gest\xf3w i sygna\u0142\xf3w. Nie pad\u0105jemy na opisy; zbieramy to, co firma robi i dlaczego.
            </p>
          </div>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {[
            { t: "Symbolika", d: "Co marka rz\u0105ca, kiedy nie m\u00f3wi \u2014 kolory, kszta\u0142ty, gesty, sposoby wypowiadania si\u0119." },
            { t: "Procesy", d: "Jak firma decyduje, kto wej\u015bci, kto wypuszczony, kto zostaje i kto \u015bwieci." },
            { t: "Dowody", d: "Nie obietnice \u2014 liczby, opinie, zmiany w zachowaniach, zasi\u0119g i relacje." },
            { t: "Budowa", d: "Jak przez 90 dni zbudowana zostaje marka, kt\xf3ra zbiera klient\xf3w zamiast tylko by\u0107 widziana." },
          ].map((c) => (
            <FlipCard key={c.t} className="bg-white/[0.03] border border-white/10 rounded-[18px] p-6 group">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-[Space_Grotesk] text-[20px] font-bold">{c.t}</h3>
                <div className="shrink-0 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-white/30 font-[JetBrains_Mono] text-[10px]">{c.t.length} pkt</div>
              </div>
              <p className="mt-3 text-[13.5px] leading-6 text-white/40">{c.d}</p>
            </FlipCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="relative bg-[#050507]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-20 lg:py-28">
        <Faq4
          badge="/ FAQs"
          title="Cz\u0119sto zadawane pytania"
          description="Oto wszystko, czego potrzebujesz, by rozpocz\u0105\u0107, zarz\u0105dza\u0107 kontem i rozwi\u0105za\u0107 najcz\u0119stsze problemy."
          buttonText="Wszystkie odpowiedzi"
          buttonHref="#contact"
          faqs={[
            { id: "item-1", question: "Z jakich technologii korzystamy?", answer: "Specjalizujemy si\u0119 w nowoczesnych technologiach frontendowych i fullstack: React, Next.js, TypeScript, Tailwind CSS, Node.js, Hono oraz skalowalnych systemach projektowych. Nasz zesp\u00f3\u0142 pracuje te\u017c z aplikacjami czasu rzeczywistego, systemami uwierzytelniania i wdra\u017caniem w chmurze." },
            { id: "item-2", question: "Budujesz w pe\u0142ni dostosowane komponenty UI?", answer: "Tak. Projektujemy i tworzymy w pe\u0142ni dostosowane systemy UI dostosowane do wymaga\u0144 Twojego produktu. Od paneli i stron reklamowych po z\u0142o\u017cone interfejsy SaaS \u2014 ka\u017czy komponent jest zbudowany z my\u015bnym uwzgl\u0119dnieniem dost\u0119pno\u015bci, responsywno\u015bci i skalowalno\u015bci." },
            { id: "item-3", question: "Pracujesz z startupami i wczesnymi produktem?", answer: "Bezw\u0105tpliwie. Cz\u0119sto wsp\u00f3\u0142pracujemy z startupami, pomagaj\u0105c w weryfikacji pomys\u0142\u00f3w, projektowaniu MVP i szybkim wdra\u017caniu aplikacji gotowych do produkcji. Skupiamy si\u0119 na szybkiej iteracji bez kompromis\u00f3w w jako\u015bci kodu i do\u015bnie u\u017cytkownika." },
            { id: "item-4", question: "Jak radzisz sobie z komunikacj\u0105 w projekcie?", answer: "Utrzymujemy klarown\u0105 i przejrzyst\u0105 komunikacj\u0119 poprzez regularne aktualizacje, \u0142\u0105czenie post\u0119pu i wsp\u00f3\u0142pracowe cykle informowania. W zale\u017cno\u015bci od projektu normalnie u\u017cywamy Slack, Discord, Linear, Notion lub e-maila do koordynacji." },
            { id: "item-5", question: "Czy mo\u017cna zredesignowa\u0107 lub zoptymalizowa\u0107 aplikacje?", answer: "Tak. Mo\u017cemy znowoczesni\u0107 przestarza\u0142e interfejsy, ulepszy\u0107 przep\u0142y UX, zoptymalizowa\u0107 wydajno\u015b\u0107 frontendu i refaktoryzowa\u0107 bazy kodu dla lepszej \u0142atwo\u015bci utrzymania. Nasz proces obejmuje audyty projektowe, ulepszenia dost\u0119pno\u015bci i analiz\u0119 wydajno\u015bci." },
            { id: "item-6", question: "Dostarczasz ci\u0105g\u0142\u0119 obs\u0142ug\u0119 i wsparcie?", answer: "Oferujemy ci\u0105g\u0142\u0105 obs\u0142ug\u0119 dla napraw b\u0115d\u0119, rozwoju funkcji, ulepsze\u0144 infrastruktury i d\u0142ugoterminowego skalowania. Niezale\u017cnie od tego, czy potrzebujesz okazjonalnych aktualizacji, czy dedykowanego partnera do rozwoju, mo\u017cemy dostosowa\u0107 wsparcie do Twojego workflow." },
          ]}
        />
      </div>
    </section>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("/");
  const estimatorRef = useRef<HTMLDivElement>(null);
  const [formFilled, setFormFilled] = useState(false);

  useEffect(() => {
    const root = typeof window !== "undefined" ? window : null;
    if (!root) return;
    const onHash = () => {
      const h = (root.location?.hash || "").replace("#", "");
      if (h && estimatorRef.current) {
        const el = estimatorRef.current.querySelector(`#${CSS.escape(h)}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    root.addEventListener("hashchange", onHash);
    return () => root.removeEventListener("hashchange", onHash);
  }, []);

  const handleAuditClick = () => {
    if (!estimatorRef.current) return;
    estimatorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    setFormFilled(true);
  };

  return (
    <div className="bg-[#050507] text-white antialiased overflow-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap');`}</style>
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 h-[700px] w-[1000px] -translate-y-1/2 rounded-full opacity-[0.18] blur-[120px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />

      <header className="relative z-20 border-b border-white/[0.06] bg-[#050507]/70 backdrop-blur-xl sticky top-0">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => { setActiveNav("/"); navigate("/"); }} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-[10px] bg-white text-black grid place-items-center shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
                {logoPath(false)}
              </div>
              <span className="font-[Space_Grotesk] font-bold text-[17px] tracking-[-0.02em]">QRAFT</span>
              <span className="hidden sm:inline font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/30 border-l border-white/10 pl-3 ml-1">PERFEKCJA BUDUJE MARKI</span>
            </button>
          </div>
          <nav className="flex items-center gap-6">
            <NavLink href="/" active={activeNav === "/"} onClick={() => { setActiveNav("/"); navigate("/"); }}>
              HOME
            </NavLink>
            <NavLink href="/work" active={activeNav === "/work"} onClick={() => setActiveNav("/work")}>
              WORK
            </NavLink>
            <NavLink href="/services" active={activeNav === "/services"} onClick={() => setActiveNav("/services")}>
              SERVICES
            </NavLink>
            <NavLink href="/lab" active={activeNav === "/lab"} onClick={() => setActiveNav("/lab")}>
              LAB
            </NavLink>
            <TerminalChip />
          </nav>
        </div>
      </header>

      <main className="relative">
        <div ref={estimatorRef} id="estimator" className="scroll-mt-24">
          <Hero />
        </div>

        <section className="relative bg-[#050507] border-t border-white/5">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-20 lg:py-28">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-10">
              <div>
                <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 bg-white/[0.04] font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
                  <Mail className="h-3 w-3" /> WSTEP
                </div>
                <h2 className="mt-4 font-[Space_Grotesk] text-[42px] sm:text-[56px] font-bold tracking-[-0.02em] leading-tight">
                  Wst\u0119p i ceny.
                </h2>
                <p className="mt-3 text-[14px] leading-6 text-white/40 max-w-[520px]">
                  Kalkulator zale\u017cny od twojej sytuacji. Nie trafiaj na sprawdzenie \u2014 po prostu wst\u0119p: ile lat i czego potrzebujesz.
                </p>
              </div>
            </div>

            <div className="mt-10 grid lg:grid-cols-[1fr_420px] gap-10 items-start">
              <div className="bg-white/[0.03] border border-white/10 rounded-[18px] p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em]">01 / ROZMIAR FIRMY</div>
                  <div className="flex gap-2">
                    {FIRM_SIZE_OPTIONS.map((o) => (
                      <JellyRadio key={o.value} name="firmSize" value={o.value} defaultChecked={o.value === "21"}>
                        <span className="text-white/40 text-[13px] font-[Space_Grotesk] text-left font-bold">{o.label}</span>
                        <span className="block text-white/20 text-[11px] font-[JetBrains_Mono]">{o.sub}</span>
                      </JellyRadio>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em]">02 / CZEGO POTRZEBUJESZ</span>
                    <span className="font-[JetBrains_Mono] text-[10px] text-white/20">mo\u017cesz wybra\u0107 kilka</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {NEEDS.map((n) => (
                      <JellyRadio key={n.value} name="needs" value={n.value}>
                        <span className="text-white/40 text-[13px] font-[Space_Grotesk] font-bold">{n.label}</span>
                      </JellyRadio>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em]">03 / NA ILE WSP\u00d3LPracowa\u0107</span>
                    <span className="font-[JetBrains_Mono] text-[10px] text-white/20">okres wsp\u00f3\u0142pracy</span>
                  </div>
                  <div className="flex gap-2">
                    {COOP_OPTIONS.map((c) => (
                      <JellyRadio key={c.value} name="coop" value={c.value} defaultChecked={c.value === "12"}>
                        <span className="text-white/40 text-[13px] font-[Space_Grotesk] font-bold">{c.label}</span>
                        <span className="block text-white/20 text-[11px] font-[JetBrains_Mono]">{c.sub}</span>
                      </JellyRadio>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111113] rounded-[14px] p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-[JetBrains_Mono] text-[10px] text-white/30 tracking-[0.12em]">WPROWADZENIE</span>
                    <span className="font-[JetBrains_Mono] text-[10px] text-white/20">X klient\u00f3w / mies.</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-[JetBrains_Mono] text-[11px] text-white/30">Przyj\u0119to ~</span>
                    <CountUp
                      start={0}
                      end={Math.round(2.2 + 1 * 0 + 0 * 0 + 1 * 0 + 0 * 0)}
                      className="text-[14px] font-[Space_Grotesk] text-[#FF3E0A] font-semibold"
                    />
                    <span className="font-[JetBrains_Mono] text-[11px] text-white/30">klient\u00f3w / mies.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#FF3E0A] text-white rounded-[18px] p-6 shadow-[0_30px_50px_rgba(255,62,10,0.4)]">
                  <div className="text-center">
                    <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-white/60">AUDYTWE RACHU</div>
                    <div className="mt-3 font-[Space_Grotesk] text-[44px] sm:text-[56px] font-bold leading-none">
                      <PopNumber text={`${(2.2 + 4.2).toFixed(1)}k`} className="text-[44px] sm:text-[56px]" />
                    </div>
                    <p className="mt-2 text-[13px] text-white/70 text-center">o początku — bez ukrytych kosztów.</p>
                  </div>
                  <button
                    onClick={handleAuditClick}
                    className="mt-5 w-full bg-black text-white rounded-full h-11 font-[Space_Grotesk] text-xs font-bold flex items-center justify-center gap-1.5 hover:underline"
                  >
                    POPROŚ O AUDYT <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-[14px] p-4 flex items-start gap-3">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-white/5 border border-white/10 grid place-items-center text-white/30">
                  </div>
                  <div className="flex-1">
                    <div className="font-[Space_Grotesk] text-[13px] font-bold">Chcesz m\u0119cz od r\u0105zu?</div>
                    <p className="mt-1 text-[13px] text-white/40">Napisz do nas i weźmy to z Tob\u0105 na kolejny poziom. Nie potrzebujesz dodatkowych zatwierdze\u0144.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-2 bg-white/[0.03] font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/40">
                <Mail className="h-3.5 w-3.5" /> kontakt@qraft.build
              </div>
              <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-2 bg-white/[0.03] font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/40">
                <Phone className="h-3.5 w-3.5" /> +48 500 000 000
              </div>
              <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-2 bg-white/[0.03] font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/40">
                <Zap className="h-3.5 w-3.5" /> QRAFT.BUILD
              </div>
            </div>
          </div>
        </section>

        <EstResults />
        <Atelier />
        <FAQ />

        <section className="relative bg-[#050507] border-t border-white/5">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-20 lg:py-28">
            <form
              id="contact"
              className="max-w-[560px] mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="bg-white/[0.03] border border-white/10 rounded-[18px] p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em]">KONTAKT</div>
                  <div className="flex gap-2">
                    <JellyRadio name="contact" value="email" defaultChecked>
                      <span className="text-white/40 text-[13px] font-[Space_Grotesk] font-bold">E-mail</span>
                    </JellyRadio>
                    <JellyRadio name="contact" value="tel">
                      <span className="text-white/40 text-[13px] font-[Space_Grotesk] font-bold">Telefon</span>
                    </JellyRadio>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em] block mb-2">Imi\u0119 i nazwisko</label>
                    <input
                      type="text"
                      required
                      placeholder="Piotr Kowalski"
                      className="w-full h-11 rounded-[12px] bg-white/[0.04] border border-white/10 px-4 text-white placeholder:text-white/20 font-[Space_Grotesk] text-[14px] focus-visible:border-[#FF3E0A]/50 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em] block mb-2">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="piotr@firma.pl"
                      className="w-full h-11 rounded-[12px] bg-white/[0.04] border border-white/10 px-4 text-white placeholder:text-white/20 font-[Space_Grotesk] text-[14px] focus-visible:border-[#FF3E0A]/50 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em] block mb-2">Telefon</label>
                    <input
                      type="tel"
                      placeholder="+48 500 000 000"
                      className="w-full h-11 rounded-[12px] bg-white/[0.04] border border-white/10 px-4 text-white placeholder:text-white/20 font-[Space_Grotesk] text-[14px] focus-visible:border-[#FF3E0A]/50 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-[JetBrains_Mono] text-[11px] text-white/30 tracking-[0.1em] block mb-2">Wiadomo\u015b\u0107</label>
                    <textarea
                      rows={4}
                      placeholder="Kr\u00f3tk\u00f3 wprowadzenie: co chcesz osi\u0105gn\u0105\u0107, jaki jest Tw\u00f3j cel i co jest teraz najwa\u017cniejsze."
                      className="w-full h-[120px] rounded-[12px] bg-white/[0.04] border border-white/10 px-4 py-3 text-white placeholder:text-white/20 font-[Space_Grotesk] text-[14px] focus-visible:border-[#FF3E0A]/50 outline-none transition-colors resize-none"
                    />
                    {formFilled && (
                      <p className="mt-2 text-[12px] text-[#FF3E0A] font-[JetBrains_Mono]">
                        Wiadomo\u015b\u0107 zostanie uzupe\u0142niona o wst\u0119p: wybrany rozmiar firmy i potrzeby z kalkulatora.
                      </p>
                    )}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/[0.04] text-[#FF3E0A] focus-visible:ring-[#FF3E0A]/40"
                    />
                    <span className="font-[JetBrains_Mono] text-[12px] text-white/40">Tak, skontaktujcie si\u0119 ze mn\u0105 \u2014 jestem gotowy do wsp\u00f3\u0142pracy.</span>
                  </label>
                  <button
                    type="submit"
                    className="w-full bg-[#FF3E0A] text-white rounded-full h-11 font-[Space_Grotesk] text-xs font-bold hover:bg-[#FF5A2E] transition-colors"
                  >
                    WY\u015a\u0119LI\u0107 KONTAKT <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/5 bg-[#050507]/60">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-[JetBrains_Mono] text-[11px] text-white/25">
            QRAFT \u00b7 qraft.build \u00b7 Otwarte dla ka\u017cdego.
          </div>
          <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/20">
            PERFEKCJA BUDUJE MARKI
          </div>
        </div>
      </footer>
    </div>
  );
}