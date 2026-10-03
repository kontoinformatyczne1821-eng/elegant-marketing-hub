import { useState, useRef, useLayoutEffect } from "react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { ArrowRight, CheckCircle2, Zap, Target, Clock, Users, Mail, Loader2, Gauge, TrendingUp, Star, ArrowUpRight, Workflow, FileCheck2, ArrowUpRight as ArrowUpRightIcon } from "lucide-react"
import CountUp from "@/components/CountUp"
import StarField from "@/components/StarField"
import { cn } from "@/lib/utils"
import { sfxTap, sfxConfirm, sfxPop } from "@/lib/sound"

/* ============================================================================
 * Landing — QRAFT (qraft.build)
 * Atelier: agencja marketingowa dostosowująca tło do potrzeb biznesu.
 * ==========================================================================*/

const SECTION_SPACING = { default: 120, lg: 140 } as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
} as const

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
} as const

function useInViewOnce() {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-8%" })
  return { ref, inView }
}

/* ---------- Introduction / AGENCY ---------- */
function AgencyIntro() {
  const { ref, inView } = useInViewOnce()
  return (
    <section
      ref={ref}
      data-section="agency"
      className="relative overflow-hidden bg-[#050507] pt-[110px] pb-[60px] sm:pt-[130px] sm:pb-[80px]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[520px] w-[900px] rounded-full opacity-[0.16] blur-[130px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A] animate-pulse" />
            AGENCIA MARKETINGOWA — QRAFT
          </div>
          <h1 className="mt-5 font-[Space_Grotesk] text-[40px] font-bold leading-[1.04] tracking-[-0.03em] sm:text-[52px]">
            To nie dekoracja.
            <br />
            To nowy tło twojej marki.
          </h1>
          <p className="mt-5 max-w-xl mx-auto font-[Inter] text-[15px] leading-7 text-white/55">
            Agencja marketingowa, która buduje tło pod biznes — nie zamiast strategii,
            lecz jako mikstura dopasowana do tego, co Twoja firma faktycznie potrzebuje.
            Od statystyk, przez płynny start, po mierzalne rezultaty.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                sfxTap()
                window.parent?.postMessage({ type: "navigate", path: "/services" }, "*")
              }}
              className="inline-flex h-[52px] items-center gap-2 rounded-full bg-[#FF3E0A] px-8 text-[10px] font-[Space_Grotesk] font-semibold text-[#050507] transition-all duration-300 hover:bg-[#FF5A2E] hover:shadow-[0_0_0_1px_rgba(255,62,10,0.4)] active:scale-[0.98] select-none"
            >
              Ponad 340 firm wybrano my
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                sfxTap()
                window.parent?.postMessage({ type: "navigate", path: "/system" }, "*")
              }}
              className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-8 text-[10px] font-[Space_Grotesk] font-semibold text-white/60 backdrop-blur transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.06] active:scale-[0.98] select-none"
            >
              <Zap className="h-3.5 w-3.5" />
              Zobacz system
            </button>
          </div>
        </motion.div>
        {/* intro pixel trail + stars */}
        <div className="mt-6 sm:mt-10">
          <StarField className="absolute inset-x-0 top-[-120px] h-[420px] lg:h-[560px] pointer-events-none" />
        </div>
      </div>
    </section>
  )
}

/* ---------- Hero: SYSTEM — tło dopasowane do potrzeb biznesu ---------- */
function SystemSection() {
  return (
    <section className="relative overflow-hidden bg-[#070708] pt-[40px] pb-[110px] sm:pt-[70px] sm:pb-[140px]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
                SYSTEM
              </div>
              <h2 className="font-[Space_Grotesk] text-[34px] font-bold leading-[1.12] tracking-[-0.02em] sm:text-[44px]">
                System, który wyświetla <span className="text-[#FF3E0A]">działanie</span> Twojej marki.
              </h2>
              <p className="font-[Inter] text-[14px] leading-6 text-white/55">
                QRAFT pozyskuje dane, buduje kibice i prowadzi kampanie. Mierzymy każdy
                krok liczbami — przede wszystkim, żeby nie działało „między belkiem”.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { k: "01", t: "Zapoznanie", d: "Mierzymy, jak mówi się o marki i gdzie zaczyna się zaufanie." },
                { k: "02", t: "Screening", d: "Zaznaczamy, gdzie zmuszamy Towarzystwo do działania." },
                { k: "03", t: "Treść", d: "Tworzymy komunikat, który oddaje poszanowanie klienta." },
                { k: "04", t: "Rekrutacja", d: "Budujemy relację, a nie tylko ruch." },
                { k: "05", t: "Aktywacja", d: "Prowadzimy kampanie, jeśli nadal jest potrzebne." },
                { k: "06", t: "Podsumowanie", d: "Dla każdego kroku pokazujemy dokładną wartość." },
              ].map((c, i) => (
                <div key={c.k} className="flex gap-4 rounded-[18px] border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-[11px] font-medium text-white/45">{c.k}</div>
                  <div>
                    <div className="font-[JetBrains_Mono] font-semibold text-[13px] text-white/80">{c.t}</div>
                    <div className="mt-1 font-[Inter] text-[12px] leading-5 text-white/45">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/system" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full bg-white text-[#050507] font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:bg-white/90 active:scale-[0.98] select-none"
              >
                Zoom do systemu
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/b2b" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-white/60 font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.07] active:scale-[0.98] select-none"
              >
                <Workflow className="h-3.5 w-3.5" />
                B2B & raport
              </button>
            </div>
          </div>
          <div className="relative h-[320px] sm:h-[440px]">
            <StarField className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-[240px] w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center shadow-2xl backdrop-blur">
                <div className="mb-3 flex items-center justify-center gap-2 font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
                  STATYSTYKA
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-center gap-2">
                    <CountUp to={340} className="font-[Cormorant_Garamond] text-[26px] font-light leading-none text-white" />
                    <span className="font-[JetBrains_Mono] text-[9px] tracking-[0.16em] text-white/40">firm</span>
                  </div>
                  <div className="mx-auto h-1 w-[80px] rounded-full bg-white/5" />
                  <div className="flex items-baseline justify-center gap-2">
                    <CountUp to={4.9} className="font-[Cormorant_Garamond] text-[26px] font-light leading-none text-white" />
                    <span className="font-[JetBrains_Mono] text-[9px] tracking-[0.16em] text-white/40">/5 ocena</span>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2 font-[JetBrains_Mono] text-[9px] tracking-[0.14em] text-white/35">
                    <Clock className="mr-1 h-3 w-3" /> średnio 14 miesięcy pomocy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- B2B: business needs mapping ---------- */
function B2BSection() {
  const needs = [
    { t: "Ilość", d: "Ile czasu zajmie to mówienie 'gotowe'?" },
    { t: "Płynność", d: "Mogę zacząć już dziś, czy poczekać na idealny moment?" },
    { t: "Mierzalność", d: "Jak weryfikuję, czy działanie działa?" },
    { t: "Zakres", d: "Czy to wystarczy, żeby przestać myśleć o reklamie?" },
    { t: "Zespół", d: "Czy to jest następny krok po dawnych kampaniami?" },
    { t: "Czas", d: "Kiedy jednak będzie naprawdę gotowe?" },
  ] as const

  return (
    <section className="relative overflow-hidden bg-[#050507] pt-[80px] pb-[110px] sm:pt-[120px] sm:pb-[150px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[720px] w-[900px] rounded-full opacity-[0.10] blur-[140px]" style={{ background: "radial-gradient(ellipse at center, #18181b 0%, transparent 60%)" }} />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
              B2B — BUSINESS NEEDS
            </div>
            <h2 className="font-[Space_Grotesk] text-[32px] font-bold leading-[1.14] tracking-[-0.02em] sm:text-[44px]">
              Dostosowujemy tło do <span className="text-[#FF3E0A]">potrzeb biznesowych</span>.
              Nie na odwrót.
            </h2>
            <p className="font-[Inter] text-[14px] leading-6 text-white/55">
              Zarzadzamy: marką, stroną, pozyskiwaniem, treścią, kampaniami, dowodami.
              Dostosowujemy wymagania, dostosowując swoją pracę do tego, co działa dla
              Twojego biznesu.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { k: "Agencja marketingowa", s: "Drobne zakresy, szczerość, rzeczywiste wyniki" },
                { k: "Płynny start", s: "Jesteś gotowy do działania, nie czekając na argumenty" },
                { k: "Mierzalne rezultaty", s: "Sprawdzamy każdy krok liczbami, nie wrażeniami" },
                { k: "Zespół pod obsługę", s: "Jeden punkt kontaktu, jeden raport, jeden cykl" },
              ].map((c, i) => (
                <div key={i} className="flex gap-4 rounded-[18px] border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-[11px] font-medium text-white/45">{i + 1}</div>
                  <div>
                    <div className="font-[JetBrains_Mono] font-semibold text-[12px] text-white/80">{c.k}</div>
                    <div className="mt-1 font-[Inter] text-[11px] leading-4 text-white/40">{c.s}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/atelier" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full bg-[#FF3E0A] px-8 text-[11px] font-[Space_Grotesk] font-semibold text-[#050507] transition-all duration-300 hover:bg-[#FF5A2E] active:scale-[0.98] select-none"
              >
                O tym, jak to działa
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/request" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-white/60 font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.07] active:scale-[0.98] select-none"
              >
                <Target className="h-3.5 w-3.5" />
                Zapytaj o potrzeby biznesowe
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { v: <CountUp to={340} className="font-[Cormorant_Garamond] text-[26px] font-light leading-none text-white" /> + "+", l: "Zbudowanych" },
              { v: <CountUp to={4.9} className="font-[Cormorant_Garamond] text-[26px] font-light leading-none text-white" />, l: "Ocena" },
              { v: <CountUp to={14} className="font-[Cormorant_Garamond] text-[26px] font-light leading-none text-white" />, l: "Średnio" },
              { v: <CountUp to={9} className="font-[Cormorant_Garamond] text-[26px] font-light leading-none text-white" /> + "+", l: "Nowych" },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-[Cormorant_Garamond] text-[22px] font-light leading-none text-white">{s.v}</div>
                <div className="mt-2 font-[JetBrains_Mono] text-[9px] tracking-[0.14em] text-white/55">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- MANIFEST ---------- */
function ManifestSection() {
  const items = [
    { k: "01", t: "System", d: "Zapoznanie — screen, tune, screen, treść." },
    { k: "02", t: "Rola", d: "Rekrutacja — aktiva, powiadomienia, licencjowanie." },
    { k: "03", t: "Treść", d: "Komunikat + media, dostosowane do czasu i promieniowania." },
    { k: "04", t: "Weryfikacja", d: "Weryfikacja — also tests, correction, review." },
    { k: "05", t: "Kampania", d: "Kampania — automatyczna testowalność i śledzenie." },
    { k: "06", t: "Efekt", d: "Efekt — raport na żądanie, raport tygodniowy." },
  ] as const
  return (
    <section id="manifest" className="relative overflow-hidden bg-[#070708] pt-[80px] pb-[110px] sm:pt-[120px] sm:pb-[150px]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
              MANIFEST — DOKUMENTACJA
            </div>
            <h2 className="mt-4 font-[Space_Grotesk] text-[32px] font-bold leading-[1.14] tracking-[-0.02em] sm:text-[42px]">
              Mówię o Twoim biznesie tak, <span className="text-[#FF3E0A]">jak nie mówią inne.</span>
            </h2>
            <p className="mt-4 font-[Inter] text-[14px] leading-6 text-white/55">
              Dla każdego kroku — z dopiskiem, który łączy to, co masz z tego na razie.
              Każdy fakt, każdy krok, każdy zakres konkretnie sobie przypisany.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { k: "Zakres", d: "Co wchodzi w Twoją budowę, co nie." },
                { k: "Czas", d: "Kiedy co się zaczyna, kończy, i na ile." },
                { k: "Odpowiedzialność", d: "Kto zajmuje się czym, i jak działamy." },
                { k: "Rok", d: "Gdzie jest to w Twoim biznesie i czemu to się zawiesi." },
              ].map((c, i) => (
                <div key={i} className="flex gap-4 rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-[11px] font-medium text-white/45">{c.k}</div>
                  <div>
                    <div className="font-[JetBrains_Mono] font-semibold text-[13px] text-white/80">{c.k}</div>
                    <div className="mt-1 font-[Inter] text-[12px] leading-5 text-white/45">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/atelier" }, "*") }}
                className="inline-flex h-[46px] items-center gap-2 rounded-full bg-white text-[#050507] font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:bg-white/85 active:scale-[0.98] select-none"
              >
                Dokumentacja manifestu
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/results" }, "*") }}
                className="inline-flex h-[46px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-white/60 font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.07] active:scale-[0.98] select-none"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                Wyniki
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { k: "01", t: "Tło dla działania", s: "Płynny start, ażez czas" },
              { k: "02", t: "Mierzalny biznes", s: "Szczerość w danych" },
              { k: "03", t: "Stan kontaktu", s: "Aktiva, powiadomienia, fakt " },
            ].map((c, i) => (
              <div key={i} className="rounded-[18px] border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20">
                <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/35">{c.k}</div>
                <div className="mt-2 font-[Space_Grotesk] text-[15px] font-bold text-white">{c.t}</div>
                <div className="mt-1 font-[JetBrains_Mono] text-[10px] text-white/35">{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- ATELIER: agency catering to business needs ---------- */
function AtelierSection() {
  return (
    <section
      id="atelier"
      className="relative overflow-hidden bg-[#050507] pt-[100px] pb-[120px] sm:pt-[140px] sm:pb-[160px]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[620px] w-[1000px] rounded-full opacity-[0.14] blur-[150px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
              ATELIER
            </div>
            <h2 className="mt-4 font-[Space_Grotesk] text-[32px] font-bold leading-[1.14] tracking-[-0.02em] sm:text-[44px]">
              Agencja marketingowa, <span className="text-[#FF3E0A]">dostosowana do biznesu</span>.
            </h2>
            <p className="mt-4 font-[Inter] text-[14px] leading-6 text-white/55">
              Sprawdzamy, co Twój biznes potrzebuje — czy to jest płynny start, czy
              jest to mierzalny rezultat. Potem wkładamy to, co potrzebuje.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { k: "Płynny start", s: "Mówimy 'gotowe', zanim zaczniesz patrzeć na 'widoczne'." },
                { k: "Mierzalne rezultaty", s: "Dane, raporty, ewidentacja — nie obrażania." },
                { k: "Agencja marketingowa", s: "Zakresy, terminy, lokalny koordynator." },
              ].map((c, i) => (
                <div key={i} className="flex gap-4 rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-[11px] font-medium text-white/45">{c.k}</div>
                  <div>
                    <div className="font-[Space_Grotesk] text-[15px] font-bold text-white">{c.k}</div>
                    <div className="mt-1 font-[Inter] text-[12px] leading-5 text-white/45">{c.s}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/services" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full bg-[#FF3E0A] px-8 text-[11px] font-[Space_Grotesk] font-semibold text-[#050507] transition-all duration-300 hover:bg-[#FF5A2E] active:scale-[0.98] select-none"
              >
                Zapoznaj się z zakresami
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/results" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-white/60 font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.07] active:scale-[0.98] select-none"
              >
                <Gauge className="h-3.5 w-3.5" />
                Zobacz statystyki
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { k: "01", t: "Agencja marketingowa", s: "Zakres, termin, lokalny koordynator" },
              { k: "02", t: "Płynny start", s: "Gotowe do działania, bez czekania na argumenty" },
              { k: "03", t: "Mierzalne rezultaty", s: "Dane, ewidentacja, raporty — nie wrażenia" },
            ].map((c, i) => (
              <div key={i} className="rounded-[18px] border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20">
                <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/35">{c.k}</div>
                <div className="mt-2 font-[Space_Grotesk] text-[15px] font-bold text-white">{c.t}</div>
                <div className="mt-1 font-[JetBrains_Mono] text-[11px] text-white/40">{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- RESULTS ---------- */
function ResultSection() {
  const stats = [
    { k: "01", v: 340, l: "firm zainteresowanych" },
    { k: "02", v: 4.9, l: "średnia ocena" },
    { k: "03", v: 14, l: "miesięcy średnio pomocy" },
    { k: "04", v: 9, l: "nowych klientów miesięcznie" },
  ] as const

  return (
    <section id="results" className="relative overflow-hidden bg-[#070708] pt-[80px] pb-[110px] sm:pt-[120px] sm:pb-[150px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[480px] w-[900px] rounded-full opacity-[0.12] blur-[130px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
              RESULTS
            </div>
            <h2 className="mt-4 font-[Space_Grotesk] text-[32px] font-bold leading-[1.14] tracking-[-0.02em] sm:text-[44px]">
              Mierzymy <span className="text-[#FF3E0A]">co działa</span>. W proste.
            </h2>
            <p className="mt-4 font-[Inter] text-[14px] leading-6 text-white/55">
              Każdy krok jest widoczny i przeliczalny. Nie ma "prawdopodobnie działa",
              tylko dokumentacja, raport i jasny przychód na działanie.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { k: "Zakres", d: "Co wchodzi w Twoją budowę, co nie." },
                { k: "Czas", d: "Kiedy co się zaczyna, kończy, i na ile." },
                { k: "Odpowiedzialność", d: "Kto zajmuje się czym, i jak działamy." },
                { k: "Rok", d: "Gdzie jest to w Twoim biznesie i czemu to się zawiesi." },
              ].map((c, i) => (
                <div key={i} className="flex gap-4 rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-[11px] font-medium text-white/45">{c.k}</div>
                  <div>
                    <div className="font-[JetBrains_Mono] font-semibold text-[13px] text-white/80">{c.k}</div>
                    <div className="mt-1 font-[Inter] text-[12px] leading-5 text-white/45">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/atelier" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full bg-white text-[#050507] font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:bg-white/85 active:scale-[0.98] select-none"
              >
                Powrót do atelieru
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/podzial" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-white/60 font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.07] active:scale-[0.98] select-none"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Podział efektów
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="rounded-[18px] border border-white/10 bg-white/[0.02] p-5 text-center transition-colors hover:border-white/20">
                <div className="font-[Cormorant_Garamond] text-[30px] font-light leading-none text-white">{s.v}</div>
                <div className="mt-2 font-[JetBrains_Mono] text-[9px] tracking-[0.14em] text-white/55">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- PODZIAŁ ---------- */
function PodzialSection() {
  const divs = [
    { k: "01", t: "Zakres", d: "Co wchodzi w Twoją budowę, co nie. Jeśli odpowiedź wisti się 'może', to nie." },
    { k: "02", t: "Czas", d: "Kiedy co się zaczyna, kończy, i na ile. Czas to nie estetyka." },
    { k: "03", t: "Odpowiedzialność", d: "Kto zajmuje się czym, i jak działamy. Bez 'zobaczymy'." },
    { k: "04", t: "Rok", d: "Gdzie jest to w Twoim biznesie i czemu to się zawiesi. Efekt na żywo." },
  ] as const
  const steps = ["zapoznanie", "screening", "treść", "rekrutacja", "aktywacja", "podsumowanie"] as const
  return (
    <section id="podzial" className="relative overflow-hidden bg-[#050507] pt-[80px] pb-[110px] sm:pt-[120px] sm:pb-[150px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[720px] w-[900px] rounded-full opacity-[0.10] blur-[140px]" style={{ background: "radial-gradient(ellipse at center, #18181b 0%, transparent 60%)" }} />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
              PODZIAŁ
            </div>
            <h2 className="font-[Space_Grotesk] text-[32px] font-bold leading-[1.14] tracking-[-0.02em] sm:text-[44px]">
              Działanie <span className="text-[#FF3E0A]">w porządku</span> — z przejrzystym podziałem.
            </h2>
            <p className="font-[Inter] text-[14px] leading-6 text-white/55">
              Każdy krok mierzalny: zakres, czas, odpowiedzialność, efekt.
              Jeśli coś wypadnie, to nie jest "błąd w silniku" — to jest w dokumentacji.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {divs.map((c, i) => (
                <div key={c.k} className="flex gap-4 rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-[11px] font-medium text-white/45">{c.k}</div>
                  <div>
                    <div className="font-[JetBrains_Mono] font-semibold text-[13px] text-white/80">{c.t}</div>
                    <div className="mt-1 font-[Inter] text-[12px] leading-5 text-white/45">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/atelier" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full bg-[#FF3E0A] px-8 text-[11px] font-[Space_Grotesk] font-semibold text-[#050507] transition-all duration-300 hover:bg-[#FF5A2E] active:scale-[0.98] select-none"
              >
                <Zap className="h-3.5 w-3.5" />
                O tym, jak działa
              </button>
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/request" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-white/60 font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.07] active:scale-[0.98] select-none"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sign a contract
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {steps.map((s, i) => (
              <div key={s} className="rounded-[18px] border border-white/10 bg-white/[0.02] p-4 text-center transition-colors hover:border-white/20">
                <div className="font-[Cormorant_Garamond] text-[22px] font-light leading-none text-white">{i + 1}</div>
                <div className="mt-2 font-[JetBrains_Mono] text-[9px] tracking-[0.14em] text-white/40">krok {i+1}</div>
                <div className="mt-1 font-[Space_Grotesk] text-[13px] font-bold text-white">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- FAQ ---------- */
function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  const faqs = [
    { q: "Czy to dla mnie? / Czy to jest dla mnie?", a: "Tak. To wszystko, kto ma pytanie o tło, które ma. Twój biznes jest ważny, a Ty zostajesz słuchany." },
    { q: "Czy to płynne?", a: "Płynne. Zaczynasz jak doktor. Przychodzi się artykuł, a potem zaczyna się doktor." },
    { q: "Czy to jest konieczne?", a: "Konieczne. Wymaga to czasu i zasięgu. Jeśli to nie jest dla Ciebie, to nie przejdziesz." },
    { q: "Czy to jest lżejsze?", a: "Lżejsze. Program ma 30 lat. Sprawdź, czy to się nie zawiesi." },
  ]

  return (
    <section id="faq" className="relative overflow-hidden bg-[#070708] pt-[80px] pb-[110px] sm:pt-[120px] sm:pb-[150px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[480px] w-[900px] rounded-full opacity-[0.12] blur-[130px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
            FAQ
          </div>
          <h2 className="mt-4 font-[Space_Grotesk] text-[32px] font-bold leading-[1.14] tracking-[-0.02em] sm:text-[42px]">
            Pytania, <span className="text-[#FF3E0A]">które często są zadawane</span>.
          </h2>
          <p className="mt-4 font-[Inter] text-[14px] leading-6 text-white/55">
            Sprawdź, czy odpowiedź znajduje się tutaj. Jeśli nie, napisz — z pewnością
            odpowiem bez „sprawdź, czy to działa”.
          </p>
        </div>
        <div className="mt-10 max-w-3xl space-y-4">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20"
            >
              <button
                onClick={() => { sfxTap(); setOpen(open === i ? null : i) }}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-[Space_Grotesk] text-[16px] font-bold text-white">{f.q}</span>
                <span className={cn("flex-shrink-0", open === i ? "text-white/60" : "text-white/25")}>
                  {open === i ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16m8-8H4" /></svg>
                  )}
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 pt-0">
                  <p className="font-[Inter] text-[14px] leading-6 text-white/55">{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/contact" }, "*") }}
            className="inline-flex h-[52px] items-center gap-2 rounded-full bg-[#FF3E0A] px-8 text-[11px] font-[Space_Grotesk] font-semibold text-[#050507] transition-all duration-300 hover:bg-[#FF5A2E] active:scale-[0.98] select-none"
          >
            <Mail className="h-3.5 w-3.5" />
            Napisz, jeśli nie ma odpowiedzi
          </button>
        </div>
      </div>
    </section>
  )
}

/* ---------- PROŻĘK ---------- */
function ProzekSection() {
  const [year, setYear] = useState<string>("")
  const [engine, setEngine] = useState<string>("")
  const [role, setRole] = useState<string>("")
  const [goTop, setGoTop] = useState<boolean>(false)
  const [warnings, setWarnings] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const list: string[] = []
    if (!year) list.push("rok")
    if (!engine) list.push("silnik")
    if (!role) list.push("rola")
    if (list.length > 0) {
      setWarnings(list)
      // feedback vyhr
      sfxTap()
      return
    }
    setWarnings([])
    setGoTop(true)
    // feedback vyhr
    sfxConfirm()
    setTimeout(() => setGoTop(false), 1200)
  }

  return (
    <section id="proziek" className="relative overflow-hidden bg-[#050507] pt-[80px] pb-[110px] sm:pt-[120px] sm:pb-[150px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[720px] w-[900px] rounded-full opacity-[0.10] blur-[140px]" style={{ background: "radial-gradient(ellipse at center, #18181b 0%, transparent 60%)" }} />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
            PROŻĘK
          </div>
          <h2 className="mt-4 font-[Space_Grotesk] text-[32px] font-bold leading-[1.14] tracking-[-0.02em] sm:text-[42px]">
            Zapytaj o <span className="text-[#FF3E0A]">potrzeby biznesowe</span>.
          </h2>
          <p className="mt-4 font-[Inter] text-[14px] leading-6 text-white/55">
            Wypełnij formularz. Dojdzie do klasyfikacji, wystawimy propozycję i zbierzemy
            to, co macha się w tle.
          </p>
        </div>
        <div
          className={cn(
            "mx-auto mt-10 max-w-2xl rounded-[20px] border border-white/10 bg-white/[0.02] p-6 transition-all duration-500 sm:p-8",
            goTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {warnings.map((w) => (
              <p key={w} className="font-[JetBrains_Mono] text-[11px] text-red-400">
                Wymagane: {w}
              </p>
            ))}
            <div className="space-y-3">
              <label className="block font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/45">Rok</label>
              <input
                value={year}
                onChange={(e) => { setYear(e.target.value); sfxTap() }}
                placeholder="np. 2026"
                className="w-full h-11 rounded-full border border-white/10 bg-white/[0.04] px-4 font-[JetBrains_Mono] text-[14px] text-white placeholder:text-white/20 focus-visible:border-[#FF3E0A]/40 focus-visible:ring-0 outline-none transition-colors"
              />
            </div>
            <div className="space-y-3">
              <label className="block font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/45">Silnik</label>
              <input
                value={engine}
                onChange={(e) => { setEngine(e.target.value); sfxTap() }}
                placeholder="np. marketingowy, logistyka"
                className="w-full h-11 rounded-full border border-white/10 bg-white/[0.04] px-4 font-[JetBrains_Mono] text-[14px] text-white placeholder:text-white/20 focus-visible:border-[#FF3E0A]/40 focus-visible:ring-0 outline-none transition-colors"
              />
            </div>
            <div className="space-y-3">
              <label className="block font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/45">Rola</label>
              <input
                value={role}
                onChange={(e) => { setRole(e.target.value); sfxTap() }}
                placeholder="np. zarządca, zakładowy, partner"
                className="w-full h-11 rounded-full border border-white/10 bg-white/[0.04] px-4 font-[JetBrains_Mono] text-[14px] text-white placeholder:text-white/20 focus-visible:border-[#FF3E0A]/40 focus-visible:ring-0 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#FF3E0A] text-[#050507] font-[Space_Grotesk] font-bold text-[12px] transition-all duration-300 hover:bg-[#FF5A2E] active:scale-[0.98] select-none"
            >
              <Zap className="h-4 w-4" />
              Prześlij
            </button>
            <p className="font-[JetBrains_Mono] text-[10px] text-white/25">
              Konta klientów, kontakty i czas trwania są zapisane. Użytkownik jest
              zobowiązany do dostarczenia prawdziwych danych.
            </p>
          </form>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/contact" }, "*") }}
            className="inline-flex h-[46px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-white/60 font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.07] active:scale-[0.98] select-none"
          >
            <Mail className="h-3.5 w-3.5" />
            Kontakt
          </button>
        </div>
      </div>
    </section>
  )
}

/* ---------- KONTAKT ---------- */
function ContactSection() {
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim()) e.name = "Wymagane"
    if (!email.trim()) e.email = "Wymagane"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Nieprawidłowy email"
    if (!message.trim()) e.message = "Wymagane"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return
    setSending(true)
    sfxConfirm()
    setTimeout(() => {
      setSubmitted(true)
      setSending(false)
      sfxPop()
    }, 900)
  }

  const inputClass = (hasError: boolean) =>
    cn(
      "flex h-11 w-full rounded-full border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition-colors placeholder:text-white/20",
      hasError ? "border-red-400/40" : "focus-visible:border-[#FF3E0A]/40 focus-visible:ring-0",
    )

  if (submitted) {
    return (
      <section id="contact" className="relative overflow-hidden bg-[#070708] pt-[80px] pb-[110px] sm:pt-[120px] sm:pb-[150px]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[480px] w-[900px] rounded-full opacity-[0.12] blur-[130px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
        </div>
        <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
          <div className="max-w-xl text-center">              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <h2 className="mt-5 font-[Space_Grotesk] text-[28px] font-bold text-white">Wiadomość wysłana</h2>
            <p className="mt-2 font-[Inter] text-[14px] leading-6 text-white/55">
              Dziękujemy. Odpowiemy w ciągu 24 godzin. W międzyczasie zapoznaj się z
              atelieru — to tam mamy odpowiedzi na pytania, które są ważne.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  sfxTap()
                  window.parent?.postMessage({ type: "navigate", path: "/atelier" }, "*")
                }}
                className="inline-flex h-[46px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-white/60 font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.07] active:scale-[0.98] select-none"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Powrót do atelieru
              </button>
              <button
                onClick={() => {
                  sfxTap()
                  window.parent?.postMessage({ type: "navigate", path: "/" }, "*")
                }}
                className="inline-flex h-[46px] items-center gap-2 rounded-full bg-[#FF3E0A] px-6 text-[11px] font-[Space_Grotesk] font-semibold text-[#050507] transition-all duration-300 hover:bg-[#FF5A2E] active:scale-[0.98] select-none"
              >
                Powrót do strony
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-[#070708] pt-[80px] pb-[110px] sm:pt-[120px] sm:pb-[150px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[480px] w-[900px] rounded-full opacity-[0.12] blur-[130px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
              KONTAKT
            </div>
            <h2 className="mt-4 font-[Space_Grotesk] text-[32px] font-bold leading-[1.14] tracking-[-0.02em] sm:text-[42px]">
              Nie wiesz, <span className="text-[#FF3E0A]">co wolisz powiedzieć?</span>
              Napisz po prostu.
            </h2>
            <p className="mt-4 font-[Inter] text-[14px] leading-6 text-white/55">
              Nie znajdziesz odpowiedzi w FAQ? Nie ma problemu. Napisz — odpowiem
              bez „sprawdź, czy działa” i zanim wybaczyć,
              zanim wolisz odpowiedzieć samodzielnie.
            </p>
            <div className="mt-6 space-y-4">
              {[
                { k: "Marka", s: "Co to jest Twoja marka i czym jest?" },
                { k: "Zakres", s: "Czy to treść, konta, edycja, lub cała budowa?" },
                { k: "Czas", s: "Kiedy to się konkretnie potrzebne?" },
                { k: "Zespół", s: "Czy to zespół, partner, czy ktoś indywidualny?" },
              ].map((c, i) => (
                <div key={i} className="flex gap-3 rounded-[14px] border border-white/10 bg-white/[0.02] px-4 py-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-[10px] font-medium text-white/45">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-[JetBrains_Mono] text-[11px] text-white/80">{c.k}</div>
                    <div className="mt-0.5 font-[Inter] text-[12px] leading-4 text-white/45">{c.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/[0.02] p-5 sm:p-7">
            {errors.name && <p className="font-[JetBrains_Mono] text-[11px] text-red-400">{errors.name}</p>}
            {errors.email && <p className="font-[JetBrains_Mono] text-[11px] text-red-400">{errors.email}</p>}
            {errors.message && <p className="font-[JetBrains_Mono] text-[11px] text-red-400">{errors.message}</p>}
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-3">
                <label className="block font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/45">Imię i nazwisko</label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); sfxTap() }}
                  placeholder="Klient"
                  className={inputClass(!!errors.name)}
                />
              </div>
              <div className="space-y-3">
                <label className="block font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/45">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); sfxTap() }}
                  placeholder="klient@firma.pl"
                  className={inputClass(!!errors.email)}
                />
              </div>
              <div className="space-y-3">
                <label className="block font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/45">Treść wiadomości</label>
                <textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); sfxTap() }}
                  placeholder="Napisz, co pyta na temat atelieru, klasyfikacji, czy masz wątpliwości..."
                  rows={5}
                  className={inputClass(!!errors.message)}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#FF3E0A] text-[#050507] font-[Space_Grotesk] font-bold text-[12px] transition-all duration-300 hover:bg-[#FF5A2E] active:scale-[0.98] select-none"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Wysyłanie...
                  </>
                ) : (
                  <>
                    Wyślij
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Footer ---------- */
function FooterSection() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/10 bg-[#050507]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-white/5">
              <span className="font-[Space_Grotesk] font-bold text-[11px] text-white">Q</span>
            </div>
            <span className="font-[Space_Grotesk] font-bold text-[14px] text-white">QRAFT</span>
            <span className="font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/30">agencja marketingowa · open for every client</span>
          </div>
          <div className="font-[JetBrains_Mono] text-[10px] text-white/25">
            © {year} QRAFT · {year} — wszystkie prawa zastrzeżone.
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ---------- Root Landing Page ---------- */
export default function Landing() {
  const [activeSection, setActiveSection] = useState("home")
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050507] text-white antialiased relative overflow-hidden selection:bg-[#FF3E0A] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&family=Cormorant+Garamond:wght@300&display=swap');
      `}</style>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] -translate-y-1/2 rounded-full opacity-[0.18] blur-[120px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
      </div>

      {/* Hero grid */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 lg:px-8 pt-[90px] pb-[60px] sm:pt-[120px] sm:pb-[80px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.16em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]" />
              AGENCIA MARKETINGOWA — QRAFT
            </div>
            <h1 className="mt-4 font-[Space_Grotesk] text-[40px] font-bold leading-[1.08] tracking-[-0.02em] sm:text-[52px]">
              To nie dekoracja.
              <br />
              To nowe tło twojej marki.
            </h1>
            <p className="mt-5 font-[Inter] text-[14px] leading-6 text-white/55">
              Agencja marketingowa, która buduje tło pod Twoją firmę — od statystyk, przez płynny start, po mierzalne rezultaty.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/contact" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full bg-[#FF3E0A] px-8 text-[10px] font-[Space_Grotesk] font-semibold text-[#050507] transition-all duration-300 hover:bg-[#FF5A2E] active:scale-[0.98] select-none"
              >
                Zapytaj o potrzeby biznesowe
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { sfxTap(); window.parent?.postMessage({ type: "navigate", path: "/system" }, "*") }}
                className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-white/60 font-[Space_Grotesk] font-semibold text-[11px] transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.07] active:scale-[0.98] select-none"
              >
                <Zap className="h-3.5 w-3.5" />
                Zobacz system
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "Agencja marketingowa", s: "Mierzymy sukces liczbami, nie wrażeniami" },
              { icon: "Płynny start", s: "Gotowiec do działania, ilość z góry" },
              { icon: "Mierzalne rezultaty", s: "Droberze zakresy, szczerość, rzeczywiste wyniki" },
            ].map((c, i) => (
              <div key={i} className="rounded-[18px] border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20">
                <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/35">{c.icon}</div>
                <div className="mt-2 font-[Inter] text-[12px] leading-5 text-white/60">{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 lg:px-8 pb-[40px]">
        <AgencyIntro />
        <SystemSection />
        <B2BSection />
        <ManifestSection />
        <AtelierSection />
        <ResultSection />
        <PodzialSection />
        <FaqSection />
        <ProzekSection />
        <ContactSection />
        <FooterSection />
      </div>
    </div>
  )
}
