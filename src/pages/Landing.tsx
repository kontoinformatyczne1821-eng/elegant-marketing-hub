import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowRight, Menu, X, Check, Minus, Plus, Clock, TrendingUp, Terminal } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const services = [
  { n: "01", title: "System Marki", desc: "Przejrzysty. Wyrazisty. Wybierany jako pierwszy.", line: "Pozycjonowanie · Tożsamość · Szyld" },
  { n: "02", title: "Strona & Wydajność", desc: "Szybkie strony, które zamieniają intencję w rezerwację.", line: "<100ms · Mapy · Rezerwacje" },
  { n: "03", title: "Pozyskiwanie", desc: "Lokalny zasięg. Cichy wzrost.", line: "Wyszukiwanie · Mapy · Płatne" },
  { n: "04", title: "Silnik Treści", desc: "Reżyseria i rzemiosło, które widać.", line: "Art direction · Film" },
  { n: "05", title: "Kampanie", desc: "Oferty, które wypełniają tydzień.", line: "Kalendarz · Email · Pętla" },
  { n: "06", title: "Retencja", desc: "Opinie i przychód — udowodnione.", line: "CRM · Raport" },
];

const results = [
  { name: "Lumière", loc: "KAWIARNIA", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=80&auto=format&fit=crop", stat: "+187%", label: "Ruch · 90 dni" },
  { name: "Form", loc: "STUDIO", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop", stat: "2.4×", label: "Zapytania" },
  { name: "Marlowe", loc: "RESTAURACJA", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80&auto=format&fit=crop", stat: "+41%", label: "Środek tygodnia" },
];

const plans = [
  { name: "Start", price: "1 900 zł", sub: "/ mies.", line: "Fundamenty, by dać się znaleźć.", pts: ["Uporządkowanie marki", "Strona + Mapy", "Opieka i raport"], featured: false, cta: "Wybierz Start" },
  { name: "Skala", price: "3 800 zł", sub: "/ mies.", line: "Pełny system. Wypełnia kalendarz.", pts: ["Wszystko ze Startu", "Zasięg + płatne w promieniu", "Silnik treści + lista"], featured: true, cta: "Wybierz Skalę" },
  { name: "Lab", price: "Wycena", sub: "", line: "Starty, rebrandingi, wiele lokalizacji.", pts: ["Od zera", "Atelier foto & film", "Sprinty co tydzień"], featured: false, cta: "Zapytaj o Lab" },
];

function SynapseBG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg viewBox="0 0 1200 560" className="absolute inset-0 w-full h-full opacity-[0.22]" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="q1" cx="50%" cy="50%"><stop offset="0%" stopColor="#FF3E0A" stopOpacity="0.9"/><stop offset="100%" stopColor="#FF3E0A" stopOpacity="0"/></radialGradient>
          <filter id="qglow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <g fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1">
          <path d="M90 280 C 250 170, 380 210, 500 280" />
          <path d="M500 280 C 620 360, 760 330, 880 280" />
          <path d="M200 400 C 320 360, 410 340, 500 280" />
          <path d="M170 185 C 280 220, 380 250, 500 280" />
          <path d="M500 280 C 640 230, 730 195, 860 185" />
          <path d="M880 280 C 960 245, 1020 210, 1100 165" />
        </g>
        {["M90 280 C 250 170, 380 210, 500 280","M500 280 C 620 360, 760 330, 880 280","M200 400 C 320 360, 410 340, 500 280","M170 185 C 280 220, 380 250, 500 280"].map((d,i)=>(
          <motion.path key={d} d={d} fill="none" stroke="#FF3E0A" strokeWidth="1" strokeLinecap="round" filter="url(#qglow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0,1,0], opacity: [0,0.7,0] }} transition={{ duration: 4.2, delay: i*0.6, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }} />
        ))}
        {[[90,280],[200,400],[170,185],[500,280],[880,280],[1100,165],[860,185]].map(([x,y],i)=>(
          <g key={String(i)}>
            <circle cx={x} cy={y} r={i===3?7:4} fill={i===3?"#FF3E0A":"white"} fillOpacity={i===3?1:0.8}/>
            <motion.circle cx={x} cy={y} r={i===3?16:10} fill="url(#q1)" animate={{ scale: [1,1.18,1], opacity: [0.4,0.08,0.4] }} transition={{ duration: 3.2, delay: i*0.2, repeat: Infinity, ease:"easeInOut" }}/>
          </g>
        ))}
      </svg>
      <motion.div className="absolute h-[4px] w-[4px] rounded-full bg-[#FF3E0A] shadow-[0_0_12px_#FF3E0A]" animate={{ x: [90,500,880,1100], y: [280,280,280,165] }} transition={{ duration: 7, repeat: Infinity, ease:"easeInOut", times:[0,0.36,0.7,1] }}/>
    </div>
  );
}

function Reveal({ children, delay=0, y=18 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-12%" }} transition={{ duration: 0.9, delay, ease: [0.22,1,0.36,1] }}>{children}</motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", business: "", email: "" });
  const [sent, setSent] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0,0.22], [0,-40]);
  const progress = useTransform(scrollYProgress, [0,1], [0,1]);
  const cardY = useTransform(scrollYProgress, [0,0.3], [0, -12]);
  const cardRotate = useTransform(scrollYProgress, [0,0.25], [0, -0.6]);

  const go = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name) return;
    setSent(true);
    setTimeout(()=>setSent(false), 3800);
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F2F2F0] antialiased selection:bg-[#FF3E0A] selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@300;400&family=Space+Grotesk:wght@300;400&display=swap'); html{scroll-behavior:smooth}`}</style>
      <motion.div className="fixed top-0 inset-x-0 h-[1px] bg-[#FF3E0A] z-50 origin-left" style={{ scaleX: progress }} />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#08080A]" />
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[1200px] -translate-y-1/2 rounded-full opacity-[0.10] blur-[140px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 65%)" }} />
      </div>

      <header className="sticky top-0 z-40 bg-[#08080A]/40 backdrop-blur-2xl border-b border-white/[0.05]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} className="flex items-center gap-4">
            <div className="h-[32px] w-[32px] rounded-[10px] border border-white/20 grid place-items-center">
              <span className="font-[Instrument_Serif] text-[16px] tracking-[-0.02em] font-normal">Q</span>
            </div>
            <span className="font-[Space_Grotesk] font-light tracking-[0.28em] text-[12px]">QRAFT</span>
            <span className="hidden lg:inline font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] text-white/30 border-l border-white/10 pl-4 ml-1">PERFEKCJA BUDUJE MARKI</span>
          </button>
          <nav className="hidden lg:flex gap-8 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.18em] text-white/30">
            {[["SYSTEM","services"],["DOWODY","results"],["PLANY","pricing"]].map(([l,id])=>(
              <button key={id} onClick={()=>go(id)} className="hover:text-white/80 transition tracking-[0.18em]">— {l}</button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-1.5 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.14em] text-white/20"><Terminal className="h-3 w-3 opacity-60"/> qraft.build</span>
            <button onClick={()=>go("contact")} className="hidden sm:inline-flex bg-white text-black font-[JetBrains_Mono] font-light text-[11px] tracking-[0.16em] px-6 h-9 rounded-full hover:bg-white/90 transition">ROZPOCZNIJ</button>
            <button onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden h-9 w-9 grid place-items-center rounded-full border border-white/10 bg-white/[0.02]">{mobileOpen?<X className="h-4 w-4"/>:<Menu className="h-4 w-4"/>}</button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="lg:hidden border-t border-white/5 bg-[#0B0B0D]">
              <div className="px-6 py-6 space-y-1 font-[JetBrains_Mono] font-light text-xs tracking-[0.14em]">
                {[["SYSTEM","services"],["DOWODY","results"],["PLANY","pricing"],["KONTAKT","contact"]].map(([l,id])=>(
                  <button key={id} onClick={()=>go(id)} className="w-full text-left py-3 border-b border-white/[0.04] text-white/60">— {l}</button>
                ))}
                <button onClick={()=>navigate("/auth")} className="mt-4 w-full bg-white text-black py-3.5 rounded-full font-[JetBrains_Mono] font-light tracking-[0.1em] text-xs">ZALOGUJ SIĘ</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section className="relative overflow-hidden">
        <SynapseBG />
        <motion.div style={{ y: heroY }} className="mx-auto max-w-[1280px] px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-10 lg:gap-14 pt-16 lg:pt-28 pb-12 lg:pb-20 items-center min-h-[540px]">
            <div>
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, ease:[0.22,1,0.36,1] }} className="inline-flex items-center gap-3 border border-white/10 rounded-full pl-1 pr-4 py-1 bg-white/[0.02] backdrop-blur">
                <span className="bg-[#FF3E0A] text-white font-[JetBrains_Mono] font-light text-[10px] tracking-[0.14em] px-3 py-1 rounded-full">QRAFT</span>
                <span className="font-[Inter] font-light text-[12px] tracking-[0.02em] text-white/60">Stworzone dla klientów Twojej firmy.</span>
              </motion.div>

              <motion.h1 initial={{ opacity:0, y:16, filter:"blur(10px)" }} animate={{ opacity:1, y:0, filter:"blur(0px)" }} transition={{ duration:1, delay:0.08, ease:[0.22,1,0.36,1] }} className="mt-8 leading-[0.88] tracking-[-0.03em]">
                <span className="block font-[JetBrains_Mono] font-light text-[11px] tracking-[0.24em] text-[#FF3E0A] mb-4">PERFEKCJA BUDUJE MARKI</span>
                <span className="block font-[Cormorant_Garamond] font-light text-[52px] sm:text-[64px] lg:text-[84px] leading-[0.9]">Perfekcja</span>
                <span className="block font-[Cormorant_Garamond] font-light italic text-[52px] sm:text-[64px] lg:text-[84px] leading-[0.9] flex items-baseline gap-4 text-white/70">buduje <span className="font-[Cormorant_Garamond] not-italic font-light text-white">marki.</span></span>
                <span className="block mt-6 h-px w-[88px] bg-white/10"/>
                <span className="block mt-6 font-[Inter] font-light text-[13px] tracking-[0.06em] text-white/35 max-w-[420px] leading-6">Techniczne atelier marketingu. Jeden system — od marki po retencję. Mniej chaosu. Więcej klientów.</span>
              </motion.h1>

              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }} className="mt-10 flex flex-wrap items-center gap-4">
                <button onClick={()=>go("contact")} className="group bg-[#FF3E0A] text-white pl-7 pr-6 h-[48px] rounded-full font-[JetBrains_Mono] font-light text-[11px] tracking-[0.14em] inline-flex items-center gap-3 hover:bg-[#FF5A2E] transition">
                  DARMOWY AUDYT <ArrowRight className="h-3.5 w-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform"/>
                </button>
                <button onClick={()=>go("results")} className="inline-flex items-center gap-3 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.14em] text-white/40 hover:text-white/70 transition">
                  <span className="h-8 w-8 grid place-items-center rounded-full border border-white/10"><ArrowUpRight className="h-3 w-3"/></span> DOWODY
                </button>
              </motion.div>

              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.65 }} className="mt-14 flex gap-10 border-t border-white/[0.06] pt-8 max-w-[420px]">
                {[["340+","Zbudowanych"],["4,9","Ocena"],["14 mies.","Średnio"]].map(([v,l])=>(
                  <div key={v}><div className="font-[Cormorant_Garamond] font-light text-[24px] leading-none">{v}</div><div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.14em] text-white/25 mt-2">{l}</div></div>
                ))}
              </motion.div>
            </div>

            <motion.div style={{ y: cardY, rotate: cardRotate }} initial={{ opacity:0, y:20, scale:0.99 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:1, delay:0.2, ease:[0.22,1,0.36,1]}} className="relative hidden lg:block">
              <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[32px] p-4 shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between px-3 pb-4 font-[JetBrains_Mono] font-light text-[10px] tracking-[0.16em] text-white/25">
                  <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80"/> QRAFT — LIVE</span>
                  <span className="flex gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-white/15"/><span className="h-1.5 w-1.5 rounded-full bg-white/15"/><span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A]"/></span>
                </div>
                <div className="rounded-[24px] overflow-hidden bg-[#0A0A0B] border border-white/[0.06]">
                  <div className="aspect-[4/2.5] relative overflow-hidden">
                    <motion.img style={{ y: useTransform(scrollYProgress, [0,0.3], [0,14]) }} src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000&q=80&auto=format&fit=crop" alt="Atelier" className="h-full w-full object-cover opacity-[0.82] scale-[1.02]"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"/>
                    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-[18px] p-4 flex items-center justify-between">
                      <div><div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.14em] text-black/30">KLIENCI · 90 DNI</div><div className="font-[Cormorant_Garamond] font-light text-[26px] leading-none mt-1 text-black tracking-[-0.02em]">+187% <span className="font-[Inter] font-light text-[10px] text-emerald-600 tracking-normal align-middle">▲</span></div></div>
                      <div className="h-9 w-[88px] flex items-end gap-[3px]">
                        {[4,6,5,8,6,9,7,10].map((h,i)=>(
                          <motion.div key={i} initial={{ height:6 }} whileInView={{ height: h*3.4 }} viewport={{ once:true }} transition={{ duration:0.8, delay:i*0.05, ease:[0.22,1,0.36,1]}} className="flex-1 rounded-sm" style={{ background: i===7?"#FF3E0A": i>5?"#1A1A1A":"#E8E8E8" }}/>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-white/5 bg-black">
                    {[["#1","MAPY"],["2,4×","ZAPYTANIA"],["+41%","ŚRODEK TYG."]].map(([k,v])=>(
                      <div key={k} className="py-4 text-center"><div className="font-[Cormorant_Garamond] font-light text-white text-[18px] tracking-[-0.02em]">{k}</div><div className="font-[JetBrains_Mono] font-light text-[9px] tracking-[0.12em] text-white/30 mt-1">{v}</div></div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between bg-white rounded-full pl-5 pr-2 py-2">
                  <div><div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.14em] text-black/40">NASTĘPNY AUDYT</div><div className="font-[Inter] font-light text-[13px] text-black tracking-[-0.01em]">Dwa terminy w tym tygodniu</div></div>
                  <button onClick={()=>go("contact")} className="h-9 w-9 grid place-items-center rounded-full bg-black text-white hover:bg-black/80 transition"><ArrowUpRight className="h-4 w-4"/></button>
                </div>
              </div>
              <div className="mt-4 text-center font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/15">SCROLL — SYNAPSA BUDUJE SIĘ W RYTMIE RUCHU</div>
            </motion.div>

            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="lg:hidden bg-white/[0.02] border border-white/10 rounded-[24px] p-3 backdrop-blur">
              <div className="rounded-[20px] overflow-hidden bg-[#0A0A0B] border border-white/5">
                <img src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80&auto=format&fit=crop" alt="Atelier" className="h-52 w-full object-cover opacity-85"/>
                <div className="p-4 flex items-center justify-between bg-white">
                  <div><div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-black/40">KLIENCI · 90 DNI</div><div className="font-[Cormorant_Garamond] font-light text-[22px] text-black">+187% <span className="text-emerald-600 text-xs">▲</span></div></div>
                  <div className="h-8 w-20 flex items-end gap-1">{[4,6,5,8,6,9].map((h,i)=>(<div key={i} className="flex-1 rounded-sm bg-black" style={{ height: h*3 }} />))}</div>
                </div>
              </div>
            </motion.div>
          </div>
          <Reveal><div className="border-y border-white/[0.05] py-5 flex items-center gap-6 overflow-hidden"><span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.16em] text-white/20 shrink-0">ZBUDOWANE DLA</span><div className="flex items-center gap-8 font-[Space_Grotesk] font-light text-white/40 text-[12px] tracking-[0.14em] whitespace-nowrap"><span>LUMIÈRE</span><span className="h-3 w-px bg-white/5"/><span>FORM</span><span className="h-3 w-px bg-white/5"/><span>MARLOWE</span><span className="hidden sm:inline h-3 w-px bg-white/5"/><span className="hidden sm:inline">FLEUR</span><span className="ml-auto hidden lg:inline font-[JetBrains_Mono] font-light text-[10px] text-white/20">+340 FIRM</span></div></div></Reveal>
        </motion.div>
      </section>

      <section id="services" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-24 lg:py-32">
        <Reveal><div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/[0.06] pb-10"><div><div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.2em] text-[#FF3E0A]">01 — SYSTEM</div><h2 className="mt-4 font-[Cormorant_Garamond] font-light text-[38px] sm:text-[48px] leading-[0.9] tracking-[-0.02em]">Jeden system. <br/><span className="italic text-white/40">Bez nadmiaru.</span></h2></div><p className="max-w-[360px] font-[Inter] font-light text-[13px] leading-7 text-white/35">Sześć modułów. Uruchom jeden lub wszystkie. Start w 20 minut — lekko, precyzyjnie.</p></div></Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.05] rounded-[24px] overflow-hidden">
          {services.map((s,i)=>(
            <motion.div key={s.n} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7, delay:i*0.04, ease:[0.22,1,0.36,1]}} className="group bg-[#0F0F10] p-8 hover:bg-[#141415] transition-colors relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3E0A]/0 to-transparent group-hover:via-[#FF3E0A]/20 transition duration-700"/>
              <div className="flex items-center justify-between"><span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.16em] text-white/15">{s.n}</span><span className="h-7 w-7 grid place-items-center rounded-full border border-white/10 text-white/20 group-hover:border-[#FF3E0A]/30 group-hover:text-[#FF3E0A] transition"><ArrowUpRight className="h-3 w-3"/></span></div>
              <h3 className="mt-6 font-[Cormorant_Garamond] font-light text-[20px] tracking-[-0.01em]">{s.title}</h3>
              <p className="mt-2 font-[Inter] font-light text-[13px] leading-6 text-white/35">{s.desc}</p>
              <div className="mt-6 font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/15 border-t border-white/[0.04] pt-4">{s.line}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 flex justify-between font-[JetBrains_Mono] font-light text-[11px]"><span className="text-white/15 tracking-[0.08em]">OTWARTE DLA KAŻDEGO KLIENTA.</span><button onClick={()=>go("contact")} className="tracking-[0.08em] underline decoration-white/10 underline-offset-4 text-white/30 hover:text-white/60 hover:decoration-[#FF3E0A]/40 transition">DIAGNOSTYKA →</button></div>
      </section>

      <section id="results" className="bg-[#F7F7F5] text-[#0A0A0A] rounded-t-[32px] lg:rounded-t-[40px]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28">
          <Reveal><div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"><div><div className="inline-flex border border-black/10 rounded-full px-3.5 py-1.5 bg-black/[0.02] font-[JetBrains_Mono] font-light text-[10px] tracking-[0.16em]">02 — DOWODY</div><h2 className="mt-5 font-[Cormorant_Garamond] font-light text-[38px] sm:text-[48px] leading-[0.9] tracking-[-0.02em]">Dowody zamiast <span className="italic text-black/30">obietnic.</span></h2></div><div className="flex gap-10">{[["+187%","90 dni"],["14 zł","Za klienta"],["22%","Z własnej bazy"]].map(([k,l])=>(<div key={k} className="text-center"><div className="font-[Cormorant_Garamond] font-light text-[28px] tracking-[-0.02em]">{k}</div><div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-black/30 mt-1">{l}</div></div>))}</div></div></Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {results.map((r,i)=>(
              <motion.div key={r.name} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7, delay:i*0.07, ease:[0.22,1,0.36,1]}} className="group bg-white border border-black/[0.06] rounded-[24px] overflow-hidden hover:border-black/10 hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] transition-all">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <motion.img src={r.img} alt={r.name} className="h-full w-full object-cover" whileHover={{ scale:1.03 }} transition={{ duration:0.8, ease:[0.22,1,0.36,1] }}/>
                  <div className="absolute top-4 left-4 bg-black text-white rounded-full px-3 py-1.5 font-[JetBrains_Mono] font-light text-[10px] tracking-[0.08em]">{r.stat}</div>
                </div>
                <div className="p-6">
                  <div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-black/25">{r.loc}</div>
                  <div className="font-[Cormorant_Garamond] font-light text-[18px] flex items-center gap-2 mt-1">{r.name} <TrendingUp className="h-3.5 w-3.5 text-black/15"/></div>
                  <div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.08em] text-black/30 mt-1">{r.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F7F7F5] text-[#0A0A0A] border-t border-black/5">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-24">
          <Reveal><div className="grid lg:grid-cols-[360px_1fr] gap-12"><div className="lg:sticky lg:top-28 self-start"><div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] text-black/30">03 — PROCES</div><h3 className="mt-4 font-[Cormorant_Garamond] font-light text-[34px] leading-[0.9] tracking-[-0.02em]">Cztery tygodnie <br/><span className="italic text-black/30">do rozpędu.</span></h3><p className="mt-4 font-[Inter] font-light text-[13px] leading-6 text-black/40">Otwarty proces. Cotygodniowe dowody. Bez teatru.</p></div><div className="relative"><motion.div initial={{ scaleY:0 }} whileInView={{ scaleY:1 }} viewport={{ once:true }} transition={{ duration:1.1, ease:[0.22,1,0.36,1] }} className="absolute left-[11px] top-2 bottom-2 w-px bg-black/10 origin-top hidden sm:block"/><div className="space-y-4">{[["01","Audyt — 20 min","Ocena + pierwsza dźwignia."],["02","Blueprint — 1 strona","Pozycjonowanie dla Twojej okolicy."],["03","Budowa — 2–3 tyg.","Tożsamość, strona, materiały."],["04","Skalowanie — co tydzień","Raport w złotówkach."]].map(([n,t,d],i)=>(<motion.div key={n} initial={{ opacity:0, x:10 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.06, duration:0.6 }} className="flex gap-4 group"><div className="hidden sm:grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black text-white font-[JetBrains_Mono] font-light text-[10px]">{n}</div><div className="flex-1 bg-white border border-black/5 rounded-2xl px-6 py-5 group-hover:border-black/10 transition"><div className="font-[Cormorant_Garamond] font-light text-[16px]">{t}</div><div className="font-[Inter] font-light text-[12.5px] text-black/45 mt-1">{d}</div></div></motion.div>))}</div></div></div></Reveal>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-24 lg:py-32">
        <Reveal><div className="text-center max-w-xl mx-auto"><div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.2em] text-[#FF3E0A]">04 — PLANY</div><h2 className="mt-4 font-[Cormorant_Garamond] font-light text-[38px] sm:text-[46px] tracking-[-0.02em] leading-none">Jasne ceny.</h2><p className="mt-4 font-[Inter] font-light text-[13px] leading-6 text-white/30">Miesiąc do miesiąca po 90 dniach. Bez zobowiązań. Wyrafinowane — nie krzykliwe.</p></div></Reveal>
        <div className="mt-12 grid lg:grid-cols-3 gap-5 items-stretch">
          {plans.map((p,i)=>(
            <motion.div key={p.name} initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:i*0.05, ease:[0.22,1,0.36,1]}} className={`rounded-[24px] border p-7 flex flex-col ${p.featured?"bg-white text-black border-white shadow-[0_20px_60px_rgba(255,255,255,0.08)] lg:scale-[1.02]":"bg-white/[0.02] border-white/10 backdrop-blur"}`}>
              <div className="flex items-center justify-between"><span className={`font-[JetBrains_Mono] font-light text-[10px] tracking-[0.16em] ${p.featured?"text-black/40":"text-white/25"}`}>{p.name.toUpperCase()}</span>{p.featured&&<span className="font-[JetBrains_Mono] font-light text-[10px] bg-[#FF3E0A] text-white rounded-full px-3 py-1">WYRÓŻNIONY</span>}</div>
              <div className="mt-6 flex items-baseline gap-1.5"><span className="font-[Cormorant_Garamond] font-light text-[32px] tracking-[-0.02em]">{p.price}</span><span className={`font-[JetBrains_Mono] font-light text-[11px] ${p.featured?"text-black/40":"text-white/25"}`}>{p.sub}</span></div>
              <div className={`font-[Inter] font-light text-[13px] mt-1 ${p.featured?"text-black/50":"text-white/30"}`}>{p.line}</div>
              <ul className="mt-8 space-y-3 flex-1">
                {p.pts.map((x)=>(
                  <li key={x} className={`flex gap-3 font-[Inter] font-light text-[13px] ${p.featured?"text-black/70":"text-white/60"}`}><Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.featured?"text-black/20":"text-[#FF3E0A]/70"}`}/>{x}</li>
                ))}
              </ul>
              <button onClick={()=>go("contact")} className={`mt-8 w-full h-11 rounded-full font-[JetBrains_Mono] font-light text-[11px] tracking-[0.14em] transition ${p.featured?"bg-black text-white hover:bg-black/85":"bg-white text-black hover:bg-white/90"}`}>{p.cta}</button>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center font-[JetBrains_Mono] font-light text-[11px] tracking-[0.06em] text-white/20">Start bez sesji zdjęciowej — dostępna od Skali. Szczegóły na audycie.</div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 lg:px-8 pb-12">
        <Reveal><div className="grid lg:grid-cols-[320px_1fr] gap-10 border-t border-white/[0.06] pt-12"><div><div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] text-white/20">05 — FAQ</div><h3 className="mt-4 font-[Cormorant_Garamond] font-light text-[28px] leading-none">Szybkie odpowiedzi.</h3><p className="mt-3 font-[Inter] font-light text-[13px] leading-6 text-white/30">Jasno i bez żargonu. Resztę dopowiemy na audycie.</p></div><div className="divide-y divide-white/5 border border-white/10 rounded-[20px] overflow-hidden bg-white/[0.02] backdrop-blur">{[["Dla kogo jest QRAFT?","Dla firm, gdzie liczy się miejsce i reputacja. Kawiarnie, studia, butiki, kliniki."],["Jak szybko widać efekty?","2–4 tygodnie by dać się znaleźć. 30–60 dni by urosnąć w środku tygodnia."],["Czy jest zobowiązanie?","Nie. Miesiąc do miesiąca po 90 dniach."],["Czego potrzebujecie na start?","90 minut + dostęp do profilu. Resztą zajmujemy się my."]].map(([q,a],i)=>(<div key={q}><button onClick={()=>setFaqOpen(faqOpen===i?null:i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition"><span className="font-[Cormorant_Garamond] font-light text-[16px] pr-6">{q}</span><span className={`h-7 w-7 grid place-items-center rounded-full border shrink-0 transition ${faqOpen===i?"bg-white text-black border-white":"border-white/10 text-white/20"}`}>{faqOpen===i?<Minus className="h-3.5 w-3.5"/>:<Plus className="h-3.5 w-3.5"/>}</span></button><AnimatePresence>{faqOpen===i && (<motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden"><div className="px-6 pb-6 font-[Inter] font-light text-[13px] leading-6 text-white/30 max-w-[560px]">{a}</div></motion.div>)}</AnimatePresence></div>))}</div></div></Reveal>
      </section>

      <section id="contact" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <Reveal><div className="bg-[#FF3E0A] text-white rounded-[32px] p-8 lg:p-10 relative overflow-hidden min-h-[440px] flex flex-col"><div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"/><div className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.18em] text-white/60">06 — BUDOWA</div><h2 className="mt-6 font-[Cormorant_Garamond] font-light text-[38px] leading-[0.9] tracking-[-0.02em]">Spraw, by każdy<br/><span className="italic text-white/70">klient się liczył.</span></h2><p className="mt-4 font-[Inter] font-light text-[13.5px] leading-7 text-white/70 max-w-[360px]">20 minut. Znajdziemy lukę i zostawimy Ci plan — nawet jeśli nas nie wybierzesz. Otwarte dla wszystkich.</p><div className="mt-8 space-y-3 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.06em] text-white/80"><div className="flex items-center gap-2.5"><Clock className="h-3.5 w-3.5 opacity-70"/> Dwa terminy w tym tygodniu · 20 min</div><div className="flex items-center gap-2.5"><Terminal className="h-3.5 w-3.5 opacity-70"/> Otwarte dla każdego klienta</div></div><div className="mt-auto pt-10 flex gap-2 font-[JetBrains_Mono] font-light text-[10px] tracking-[0.1em]"><span className="border border-white/20 rounded-full px-4 py-2 bg-white/10">BEZ PREZENTACJI</span><span className="border border-white/20 rounded-full px-4 py-2 bg-white/10">BEZ ŻARGONU</span></div></div></Reveal>
          <Reveal delay={0.06}><div className="bg-white/[0.02] backdrop-blur border border-white/10 rounded-[32px] p-7 sm:p-8"><div className="flex items-center justify-between"><h3 className="font-[Cormorant_Garamond] font-light text-[20px]">Rozpocznij budowę</h3><span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/20 border border-white/10 rounded-full px-3 py-1">2 MIN</span></div>{sent ? (<motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="mt-8 bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center"><div className="h-10 w-10 mx-auto grid place-items-center rounded-full bg-[#FF3E0A] text-white"><Check className="h-5 w-5"/></div><div className="mt-4 font-[Cormorant_Garamond] font-light text-[18px]">Zgłoszenie otrzymane.</div><div className="mt-2 font-[Inter] font-light text-[13px] text-white/30">Wyślemy terminy w ciągu kilku godzin.</div><button onClick={()=>setSent(false)} className="mt-5 font-[JetBrains_Mono] font-light text-xs underline decoration-white/20 text-white/40">Wyślij kolejne</button></motion.div>) : (<form onSubmit={submit} className="mt-8 space-y-5"><div className="grid sm:grid-cols-2 gap-4"><label className="space-y-2"><span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/30">IMIĘ I NAZWISKO</span><input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Alex Kowalski" className="w-full h-11 rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FF3E0A]/30 text-white"/></label><label className="space-y-2"><span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/30">FIRMA</span><input value={form.business} onChange={e=>setForm({...form, business:e.target.value})} placeholder="Lumière" className="w-full h-11 rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FF3E0A]/30 text-white"/></label></div><label className="space-y-2 block"><span className="font-[JetBrains_Mono] font-light text-[10px] tracking-[0.12em] text-white/30">EMAIL</span><input required type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="alex@firma.pl" className="w-full h-11 rounded-full border border-white/10 bg-white/[0.02] px-5 font-[Inter] font-light text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FF3E0A]/30 text-white"/></label><button type="submit" className="w-full h-[48px] rounded-full bg-[#FF3E0A] text-white font-[JetBrains_Mono] font-light text-[11px] tracking-[0.14em] hover:bg-[#FF5A2E] transition flex items-center justify-center gap-2">ZAMÓW AUDYT — ZA DARMO <ArrowRight className="h-4 w-4 opacity-70"/></button><div className="text-center font-[JetBrains_Mono] font-light text-[11px] tracking-[0.04em] text-white/20">Lub <button type="button" onClick={()=>navigate("/auth")} className="underline decoration-white/15 text-white/30 hover:text-white/60">zaloguj się</button> by zarządzać budową</div></form>)}</div></Reveal>
        </div>
      </section>

      <footer className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 font-[JetBrains_Mono] font-light text-[11px] tracking-[0.08em] text-white/20">
          <div className="flex items-center gap-3"><div className="h-7 w-7 rounded-[9px] border border-white/10 grid place-items-center font-[Instrument_Serif] text-[14px]">Q</div><span className="font-[Space_Grotesk] font-light tracking-[0.2em] text-white/60 text-xs">QRAFT</span><span className="hidden sm:inline">© {new Date().getFullYear()} · PERFEKCJA BUDUJE MARKI</span></div>
          <div className="flex gap-3"><span>qraft.build</span><span className="opacity-20">·</span><span>Otwarte dla wszystkich</span></div>
        </div>
      </footer>
    </div>
  );
}
