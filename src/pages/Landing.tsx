import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowRight, Menu, X, Check, Minus, Plus, Clock, TrendingUp, Terminal } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const services = [
  { n: "01", title: "System Marki", desc: "Przejrzysty. Wyrazisty. Wybierany jako pierwszy.", line: "Pozycjonowanie \u00b7 To\u017csamo\u015b\u0107 \u00b7 Szyld" },
  { n: "02", title: "Strona & Wydajno\u015b\u0107", desc: "Szybkie strony, kt\u00f3re zamieniaj\u0105 intencj\u0119 w rezerwacj\u0119.", line: "<100ms \u00b7 Mapy \u00b7 Rezerwacje" },
  { n: "03", title: "Pozyskiwanie", desc: "Lokalny zasi\u0119g. Cichy wzrost.", line: "Wyszukiwanie \u00b7 Mapy \u00b7 P\u0142atne" },
  { n: "04", title: "Silnik Tre\u015bci", desc: "Re\u017cyseria i rzemios\u0142o, kt\u00f3re wida\u0107.", line: "Art direction \u00b7 Film" },
  { n: "05", title: "Kampanie", desc: "Oferty, kt\u00f3re wype\u0142niaj\u0105 tydzie\u0144.", line: "Kalendarz \u00b7 Email \u00b7 P\u0119tla" },
  { n: "06", title: "Retencja", desc: "Opinie i przych\u00f3d \u2014 udowodnione.", line: "CRM \u00b7 Raport" },
];

const results = [
  { name: "Lumi\u00e8re", loc: "KAWIARNIA", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=80&auto=format&fit=crop", stat: "+187%", label: "Ruch" },
  { name: "Form", loc: "STUDIO", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop", stat: "2.4\u00d7", label: "Zapytania" },
  { name: "Marlowe", loc: "RESTAURACJA", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80&auto=format&fit=crop", stat: "+41%", label: "\u015arodek tygodnia" },
];

const plans = [
  { name: "Start", price: "1 900 z\u0142", sub: "/mies.", line: "Fundamenty, by da\u0107 si\u0119 znale\u017a\u0107.", pts: ["Uporz\u0105dkowanie marki", "Strona + Mapy", "Opieka i raport"], featured: false, cta: "Wybierz Start" },
  { name: "Skala", price: "3 800 z\u0142", sub: "/mies.", line: "Pe\u0142ny system. Wype\u0142nia kalendarz.", pts: ["Wszystko ze Startu", "Zasi\u0119g + p\u0142atne w promieniu", "Silnik tre\u015bci + lista"], featured: true, cta: "Wybierz Skal\u0119" },
  { name: "Lab", price: "Wycena", sub: "", line: "Starty, rebrandingi, wiele lokalizacji.", pts: ["Od zera", "Atelier foto & film", "Sprinty co tydzie\u0144"], featured: false, cta: "Zapytaj o Lab" },
];

function SynapseBG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg viewBox="0 0 1200 560" className="absolute inset-0 w-full h-full opacity-[0.34]" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="q1" cx="50%" cy="50%"><stop offset="0%" stopColor="#FF3E0A" stopOpacity="0.95"/><stop offset="100%" stopColor="#FF3E0A" stopOpacity="0"/></radialGradient>
          <filter id="qglow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <g fill="none" stroke="white" strokeOpacity="0.07" strokeWidth="1.1">
          <path d="M90 280 C 250 170, 380 210, 500 280" />
          <path d="M500 280 C 620 360, 760 330, 880 280" />
          <path d="M200 400 C 320 360, 410 340, 500 280" />
          <path d="M170 185 C 280 220, 380 250, 500 280" />
          <path d="M500 280 C 640 230, 730 195, 860 185" />
          <path d="M880 280 C 960 245, 1020 210, 1100 165" />
        </g>
        {["M90 280 C 250 170, 380 210, 500 280","M500 280 C 620 360, 760 330, 880 280","M200 400 C 320 360, 410 340, 500 280","M170 185 C 280 220, 380 250, 500 280"].map((d,i)=>(
          <motion.path key={d} d={d} fill="none" stroke="#FF3E0A" strokeWidth="1.25" strokeLinecap="round" filter="url(#qglow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0,1,0], opacity: [0,0.9,0] }} transition={{ duration: 3.6, delay: i*0.45, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }} />
        ))}
        {[[90,280],[200,400],[170,185],[500,280],[880,280],[1100,165],[860,185]].map(([x,y],i)=>(
          <g key={String(i)}>
            <circle cx={x} cy={y} r={i===3?9:5} fill={i===3?"#FF3E0A":"white"} fillOpacity={i===3?1:0.9}/>
            <motion.circle cx={x} cy={y} r={i===3?18:12} fill="url(#q1)" animate={{ scale: [1,1.22,1], opacity: [0.5,0.12,0.5] }} transition={{ duration: 2.8, delay: i*0.18, repeat: Infinity, ease:"easeInOut" }}/>
          </g>
        ))}
      </svg>
      <motion.div className="absolute h-[6px] w-[6px] rounded-full bg-[#FF3E0A] shadow-[0_0_16px_#FF3E0A] blur-[0.5px]" animate={{ x: [90,500,880,1100], y: [280,280,280,165] }} transition={{ duration: 6, repeat: Infinity, ease:"easeInOut", times:[0,0.36,0.7,1] }}/>
    </div>
  );
}

function Reveal({ children, delay=0, y=22 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-12%" }} transition={{ duration: 0.8, delay, ease: [0.22,1,0.36,1] }}>{children}</motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", business: "", email: "" });
  const [sent, setSent] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0,0.22], [0,-60]);
  const progress = useTransform(scrollYProgress, [0,1], [0,1]);
  // desktop parallax for card
  const cardY = useTransform(scrollYProgress, [0,0.3], [0, -18]);
  const cardRotate = useTransform(scrollYProgress, [0,0.25], [0, -1.2]);

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
    <div className="min-h-screen bg-[#070708] text-[#F5F5F3] antialiased selection:bg-[#FF3E0A] selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&family=Instrument+Serif:ital@0;1&display=swap'); html{scroll-behavior:smooth}`}</style>
      <motion.div className="fixed top-0 inset-x-0 h-[2px] bg-[#FF3E0A] z-50 origin-left" style={{ scaleX: progress }} />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#070708]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[1200px] -translate-y-1/2 rounded-full opacity-[0.16] blur-[130px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
        <div className="absolute top-[40%] right-0 h-[520px] w-[520px] rounded-full opacity-[0.07] blur-[110px]" style={{ background: "radial-gradient(ellipse at center, #7C3AED 0%, transparent 60%)" }} />
      </div>

      <header className="sticky top-0 z-40 bg-[#070708]/55 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[60px] flex items-center justify-between">
          <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[9px] bg-white text-black grid place-items-center"><span className="font-[Space_Grotesk] font-bold text-[13px]">Q</span></div>
            <span className="font-[Space_Grotesk] font-bold tracking-[-0.03em]">QRAFT</span>
            <span className="hidden lg:inline font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/30 border-l border-white/10 pl-3 ml-1">PERFEKCJA BUDUJE MARKI</span>
          </button>
          <nav className="hidden lg:flex gap-7 font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/35">
            {[["SYSTEM","services"],["DOWODY","results"],["PLANY","pricing"]].map(([l,id])=>(
              <button key={id} onClick={()=>go(id)} className="hover:text-white transition">/ {l}</button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 font-[JetBrains_Mono] text-[11px] text-white/25"><Terminal className="h-3 w-3"/> qraft.build</span>
            <button onClick={()=>go("contact")} className="hidden sm:inline-flex bg-[#FF3E0A] text-white font-[Space_Grotesk] font-bold text-[11px] tracking-[0.08em] px-5 h-9 rounded-full hover:bg-[#FF5A2E] transition">ROZPOCZNIJ BUDOW\u0118</button>
            <button onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden h-9 w-9 grid place-items-center rounded-full border border-white/10 bg-white/[0.03]">{mobileOpen?<X className="h-4 w-4"/>:<Menu className="h-4 w-4"/>}</button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="lg:hidden border-t border-white/5 bg-[#0B0B0D]">
              <div className="px-6 py-6 space-y-1 font-[JetBrains_Mono] text-xs tracking-[0.12em]">
                {[["SYSTEM","services"],["DOWODY","results"],["PLANY","pricing"],["KONTAKT","contact"]].map(([l,id])=>(
                  <button key={id} onClick={()=>go(id)} className="w-full text-left py-3 border-b border-white/[0.04] text-white/70">/ {l}</button>
                ))}
                <button onClick={()=>navigate("/auth")} className="mt-4 w-full bg-[#FF3E0A] text-white py-3.5 rounded-full font-bold font-[Space_Grotesk]">Zaloguj si\u0119</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section className="relative overflow-hidden">
        <SynapseBG />
        <motion.div style={{ y: heroY }} className="mx-auto max-w-[1280px] px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-10 lg:gap-10 pt-14 lg:pt-24 pb-10 lg:pb-14 items-center min-h-[520px]">
            <div>
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, ease:[0.22,1,0.36,1] }} className="inline-flex items-center gap-2 border border-white/10 rounded-full px-1.5 py-1 bg-white/[0.04] backdrop-blur">
                <span className="bg-[#FF3E0A] text-white font-[JetBrains_Mono] font-bold text-[10px] tracking-[0.12em] px-2.5 py-1 rounded-full">QRAFT</span>
                <span className="font-[JetBrains_Mono] text-[11px] tracking-[0.08em] text-white/60 pr-2">Stworzone dla klient\u00f3w Twojej firmy.</span>
              </motion.div>
              <motion.h1 initial={{ opacity:0, y:16, filter:"blur(8px)" }} animate={{ opacity:1, y:0, filter:"blur(0px)" }} transition={{ duration:0.9, delay:0.08, ease:[0.22,1,0.36,1] }} className="mt-6 font-[Space_Grotesk] font-bold tracking-[-0.04em] leading-[0.86]">
                <span className="block font-[JetBrains_Mono] text-[11px] tracking-[0.2em] text-[#FF3E0A] mb-3 font-medium">PERFEKCJA BUDUJE MARKI</span>
                <span className="block text-[46px] sm:text-[58px] lg:text-[76px]">Perfekcja</span>
                <span className="block text-[46px] sm:text-[58px] lg:text-[76px] flex items-baseline gap-3">buduje <span className="font-[Instrument_Serif] italic font-normal text-white/40 text-[44px] sm:text-[56px] lg:text-[72px]">marki.</span></span>
              </motion.h1>
              <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3, duration:0.7 }} className="mt-6 max-w-[440px] text-[14px] leading-6 text-white/50">Techniczne atelier marketingu. Jeden system \u2014 od marki po retencj\u0119. Mniej chaosu. Wi\u0119cej klient\u00f3w.</motion.p>
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.42 }} className="mt-8 flex flex-wrap gap-3">
                <button onClick={()=>go("contact")} className="group bg-[#FF3E0A] text-white px-7 h-[46px] rounded-full font-[Space_Grotesk] font-bold text-[13px] inline-flex items-center gap-2 hover:bg-[#FF5A2E] transition">ZACZNIJ \u2014 DARMOWY AUDYT <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"/></button>
                <button onClick={()=>go("results")} className="bg-white/[0.06] border border-white/10 px-6 h-[46px] rounded-full text-[13px] font-medium backdrop-blur hover:bg-white/[0.08] transition inline-flex items-center gap-2">Dowody <span className="h-6 w-6 grid place-items-center rounded-full bg-white text-black"><ArrowUpRight className="h-3 w-3"/></span></button>
              </motion.div>
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.58 }} className="mt-10 flex gap-8 border-t border-white/5 pt-6 max-w-[380px]">
                {[["340+","Zbudowanych"],["4.9","Ocena"],["14 mies.","\u015arednio"]].map(([v,l])=>(
                  <div key={v}><div className="font-[Space_Grotesk] font-bold text-[18px]">{v}</div><div className="font-[JetBrains_Mono] text-[10px] tracking-[0.12em] text-white/30">{l}</div></div>
                ))}
              </motion.div>
            </div>
            <motion.div style={{ y: cardY, rotate: cardRotate }} initial={{ opacity:0, y:20, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:0.9, delay:0.2, ease:[0.22,1,0.36,1]}} className="relative hidden lg:block">
              <div className="bg-[#111113]/75 backdrop-blur-xl border border-white/10 rounded-[28px] p-3 shadow-[0_32px_80px_rgba(0,0,0,0.55)]">
                <div className="flex items-center justify-between px-2 pb-3 font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/35">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/> QRAFT_LIVE</span>
                  <span className="flex gap-1"><span className="h-2 w-2 rounded-full bg-white/15"/><span className="h-2 w-2 rounded-full bg-white/15"/><span className="h-2 w-2 rounded-full bg-[#FF3E0A]"/></span>
                </div>
                <div className="rounded-[20px] overflow-hidden bg-[#0A0A0B] border border-white/[0.06]">
                  <div className="aspect-[4/2.45] relative overflow-hidden">
                    <motion.img style={{ y: useTransform(scrollYProgress, [0,0.3], [0,16]) }} src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000&q=80&auto=format&fit=crop" alt="Atelier" className="h-full w-full object-cover opacity-85 scale-[1.04]"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent"/>
                    <div className="absolute bottom-3 left-3 right-3 bg-white rounded-2xl p-3 flex items-center justify-between">
                      <div><div className="font-[JetBrains_Mono] text-[10px] tracking-[0.1em] text-black/40">KLIENCI \u00b7 90 DNI</div><div className="font-[Space_Grotesk] font-bold text-[22px] leading-none mt-0.5 text-black">+187% <span className="text-[11px] font-medium text-emerald-600">\u25b2</span></div></div>
                      <div className="h-9 w-[84px] flex items-end gap-[3px]">
                        {[4,6,5,8,6,9,7,10].map((h,i)=>(
                          <motion.div key={i} initial={{ height:6 }} whileInView={{ height: h*3.4 }} viewport={{ once:true }} transition={{ duration:0.7, delay:i*0.04, ease:[0.22,1,0.36,1]}} className="flex-1 rounded-t-sm" style={{ background: i===7?"#FF3E0A": i>5?"#7C3AED":"black" }}/>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-white/5 bg-[#111113]">
                    {[["#1","MAPY"],["2.4\u00d7","ZAPYTANIA"],["+41%","\u015ARODEK TYG."]].map(([k,v])=>(
                      <div key={k} className="py-3 text-center"><div className="font-[Space_Grotesk] font-bold text-white text-[15px]">{k}</div><div className="font-[JetBrains_Mono] text-[9px] tracking-[0.08em] text-white/35">{v}</div></div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 hidden sm:flex items-center justify-between bg-[#FF3E0A] rounded-2xl px-4 py-3">
                  <div><div className="font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/80">NAST\u0118PNY AUDYT</div><div className="font-[Space_Grotesk] font-bold text-white text-sm">Dwa terminy w tym tygodniu</div></div>
                  <button onClick={()=>go("contact")} className="h-8 w-8 grid place-items-center rounded-full bg-white text-[#FF3E0A]"><ArrowUpRight className="h-4 w-4"/></button>
                </div>
              </div>
              <div className="mt-3 text-center font-[JetBrains_Mono] text-[11px] text-white/20">Przewi\u0144 \u2014 synapsa buduje si\u0119 w rytmie scrolla.</div>
            </motion.div>
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }} className="lg:hidden bg-[#111113] border border-white/10 rounded-[24px] p-3">
              <div className="rounded-[16px] overflow-hidden bg-[#0A0A0B] border border-white/5">
                <img src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80&auto=format&fit=crop" alt="Atelier" className="h-48 w-full object-cover opacity-80"/>
                <div className="p-4 flex items-center justify-between bg-white">
                  <div><div className="font-[JetBrains_Mono] text-[10px] text-black/40">KLIENCI \u00b7 90 DNI</div><div className="font-[Space_Grotesk] font-bold text-lg">+187% <span className="text-emerald-600 text-xs">\u25b2</span></div></div>
                  <div className="h-8 w-20 flex items-end gap-1">{[4,6,5,8,6,9].map((h,i)=>(<div key={i} className="flex-1 rounded-t-sm bg-black" style={{ height: h*3 }} />))}</div>
                </div>
              </div>
            </motion.div>
          </div>
          <Reveal><div className="border-y border-white/[0.06] py-4 flex items-center gap-6 overflow-hidden"><span className="font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/25 shrink-0">ZBUDOWANE DLA</span><div className="flex items-center gap-8 font-[Space_Grotesk] font-bold text-white/50 text-[13px] tracking-[0.06em] whitespace-nowrap"><span>LUMI\u00c8RE</span><span className="h-3 w-px bg-white/10"/><span>FORM</span><span className="h-3 w-px bg-white/10"/><span>MARLOWE</span><span className="hidden sm:inline h-3 w-px bg-white/10"/><span className="hidden sm:inline">FLEUR</span><span className="ml-auto hidden lg:inline font-[JetBrains_Mono] font-normal text-[11px] text-white/25">+340 FIRM</span></div></div></Reveal>
        </motion.div>
      </section>

      <section id="services" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28">
        <Reveal><div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-8"><div><div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-[#FF3E0A]">01 \u2014 SYSTEM</div><h2 className="mt-3 font-[Space_Grotesk] font-bold text-[34px] sm:text-[42px] leading-[0.9] tracking-[-0.03em]">Jeden system. <br/><span className="font-[Instrument_Serif] italic font-normal text-white/40">Bez nadmiaru.</span></h2></div><p className="max-w-[340px] text-[13px] leading-6 text-white/40">Sze\u015b\u0107 modu\u0142\u00f3w. Uruchom jeden lub wszystkie. Start w 20 minut.</p></div></Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-[1px] bg-white/[0.06] border border-white/[0.06] rounded-[22px] overflow-hidden">
          {services.map((s,i)=>(
            <motion.div key={s.n} initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:i*0.05, ease:[0.22,1,0.36,1]}} className="group bg-[#111113] p-7 hover:bg-[#151518] transition relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3E0A]/0 to-transparent group-hover:via-[#FF3E0A]/25 transition"/>
              <div className="flex items-center justify-between"><span className="font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/20">{s.n}</span><span className="h-6 w-6 grid place-items-center rounded-full border border-white/10 text-white/30 group-hover:bg-[#FF3E0A] group-hover:text-white group-hover:border-[#FF3E0A] transition"><ArrowUpRight className="h-3 w-3"/></span></div>
              <h3 className="mt-5 font-[Space_Grotesk] font-bold text-[16px]">{s.title}</h3>
              <p className="mt-1.5 text-[13px] leading-5 text-white/40">{s.desc}</p>
              <div className="mt-4 font-[JetBrains_Mono] text-[11px] text-white/20 border-t border-white/5 pt-3">{s.line}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 flex justify-between font-[JetBrains_Mono] text-[11px]"><span className="text-white/20">Otwarte dla ka\u017cdego klienta.</span><button onClick={()=>go("contact")} className="underline decoration-white/15 text-white/60 hover:decoration-[#FF3E0A]">Diagnostyka \u2192</button></div>
      </section>

      <section id="results" className="bg-[#F7F7F5] text-[#111110] rounded-t-[32px] lg:rounded-t-[40px]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16 lg:py-24">
          <Reveal><div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8"><div><div className="inline-flex border border-black/10 rounded-full px-3 py-1 bg-black/[0.02] font-[JetBrains_Mono] text-[11px] tracking-[0.14em]">02 \u2014 DOWODY</div><h2 className="mt-4 font-[Space_Grotesk] font-bold text-[34px] sm:text-[44px] leading-[0.9] tracking-[-0.03em]">Dowody zamiast <span className="font-[Instrument_Serif] italic font-normal text-black/30">obietnic.</span></h2></div><div className="flex gap-8">{[["+187%","90 dni"],["14 z\u0142","Za klienta"],["22%","Z w\u0142asnej bazy"]].map(([k,l])=>(<div key={k} className="text-center"><div className="font-[Space_Grotesk] font-bold text-[22px]">{k}</div><div className="font-[JetBrains_Mono] text-[10px] text-black/40">{l}</div></div>))}</div></div></Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {results.map((r,i)=>(
              <motion.div key={r.name} initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.65, delay:i*0.07, ease:[0.22,1,0.36,1]}} className="group bg-white border border-black/5 rounded-[20px] overflow-hidden hover:border-black/10 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <motion.img src={r.img} alt={r.name} className="h-full w-full object-cover" whileHover={{ scale:1.04 }} transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}/>
                  <div className="absolute top-3 left-3 bg-black text-white rounded-full px-3 py-1 font-[JetBrains_Mono] text-[11px] font-medium">{r.stat}</div>
                </div>
                <div className="p-5">
                  <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.08em] text-black/30">{r.loc}</div>
                  <div className="font-[Space_Grotesk] font-bold flex items-center gap-2">{r.name} <TrendingUp className="h-3.5 w-3.5 text-black/20"/></div>
                  <div className="font-[JetBrains_Mono] text-[11px] text-black/40 mt-1">{r.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F7F7F5] text-[#111110] border-t border-black/5">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16 lg:py-20">
          <Reveal><div className="grid lg:grid-cols-[320px_1fr] gap-10"><div className="lg:sticky lg:top-24 self-start"><div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-black/40">03 \u2014 PROCES</div><h3 className="mt-3 font-[Space_Grotesk] font-bold text-[30px] leading-[0.9] tracking-[-0.03em]">Cztery tygodnie <br/><span className="font-[Instrument_Serif] italic font-normal text-black/30">do rozp\u0119du.</span></h3><p className="mt-3 text-[13px] leading-5 text-black/50">Otwarty proces. Cotygodniowe dowody.</p></div><div className="relative"><motion.div initial={{ scaleY:0 }} whileInView={{ scaleY:1 }} viewport={{ once:true }} transition={{ duration:1, ease:[0.22,1,0.36,1] }} className="absolute left-[11px] top-2 bottom-2 w-px bg-black/10 origin-top hidden sm:block"/><div className="space-y-4">{[["01","Audyt \u2014 20 min","Ocena + pierwsza d\u017awignia."],["02","Blueprint \u2014 1 strona","Pozycjonowanie dla Twojej okolicy."],["03","Budowa \u2014 2\u20133 tyg.","To\u017csamo\u015b\u0107, strona, materia\u0142y."],["04","Skalowanie \u2014 co tydzie\u0144","Raport w z\u0142ot\u00f3wkach."]].map(([n,t,d],i)=>(<motion.div key={n} initial={{ opacity:0, x:10 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.06, duration:0.55 }} className="flex gap-4 group"><div className="hidden sm:grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black text-white font-[JetBrains_Mono] text-[10px] font-bold">{n}</div><div className="flex-1 bg-white border border-black/5 rounded-2xl px-5 py-4 group-hover:border-black/10 transition"><div className="font-[Space_Grotesk] font-bold text-[14px]">{t}</div><div className="text-[12.5px] text-black/55 mt-1">{d}</div></div></motion.div>))}</div></div></div></Reveal>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28">
        <Reveal><div className="text-center max-w-xl mx-auto"><div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-[#FF3E0A]">04 \u2014 PLANY</div><h2 className="mt-3 font-[Space_Grotesk] font-bold text-[34px] sm:text-[42px] tracking-[-0.03em] leading-none">Jasne ceny.</h2><p className="mt-3 text-[13px] leading-6 text-white/40">Miesi\u0105c do miesi\u0105ca po 90 dniach. Bez zobowi\u0105za\u0144.</p></div></Reveal>
        <div className="mt-10 grid lg:grid-cols-3 gap-5 items-stretch">
          {plans.map((p,i)=>(
            <motion.div key={p.name} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:i*0.05, ease:[0.22,1,0.36,1]}} className={`rounded-[22px] border p-6 flex flex-col ${p.featured?"bg-[#FF3E0A] text-white border-[#FF3E0A] shadow-[0_20px_60px_rgba(255,62,10,0.2)] lg:scale-[1.02]":"bg-[#111113] border-white/10"}`}>
              <div className="flex items-center justify-between"><span className={`font-[JetBrains_Mono] text-[11px] tracking-[0.14em] font-bold ${p.featured?"text-white/70":"text-white/30"}`}>{p.name.toUpperCase()}</span>{p.featured&&<span className="font-[JetBrains_Mono] text-[10px] bg-white text-[#FF3E0A] rounded-full px-2 py-1 font-bold">POPULARNY</span>}</div>
              <div className="mt-4 flex items-baseline gap-1"><span className="font-[Space_Grotesk] font-bold text-[28px]">{p.price}</span><span className={`font-[JetBrains_Mono] text-xs ${p.featured?"text-white/70":"text-white/30"}`}>{p.sub}</span></div>
              <div className={`text-[13px] mt-1 ${p.featured?"text-white/80":"text-white/40"}`}>{p.line}</div>
              <ul className="mt-6 space-y-2 flex-1">
                {p.pts.map((x)=>(
                  <li key={x} className={`flex gap-2 text-[13px] ${p.featured?"text-white":"text-white/65"}`}><Check className={`h-3.5 w-3.5 mt-0.5 ${p.featured?"text-white":"text-[#FF3E0A]"}`}/>{x}</li>
                ))}
              </ul>
              <button onClick={()=>go("contact")} className={`mt-6 w-full h-11 rounded-full font-[Space_Grotesk] font-bold text-[12px] ${p.featured?"bg-white text-[#FF3E0A] hover:bg-white/90":"bg-white text-black hover:bg-white/90"} transition`}>{p.cta}</button>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center font-[JetBrains_Mono] text-[11px] text-white/25">W pakiecie Start nie ma sesji zdj\u0119ciowej \u2014 dost\u0119pna od Skali. Szczeg\u00f3\u0142y na audycie.</div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 lg:px-8 pb-10">
        <Reveal><div className="grid lg:grid-cols-[280px_1fr] gap-8 border-t border-white/5 pt-10"><div><div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-white/25">05 \u2014 FAQ</div><h3 className="mt-3 font-[Space_Grotesk] font-bold text-[24px]">Szybkie odpowiedzi.</h3></div><div className="divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden bg-[#111113]">{[["Dla kogo jest QRAFT?","Dla firm, gdzie liczy si\u0119 miejsce i reputacja. Kawiarnie, studia, butiki, kliniki."],["Jak szybko wida\u0107 efekty?","2\u20134 tygodnie by da\u0107 si\u0119 znale\u017a\u0107. 30\u201360 dni by urosn\u0105\u0107 w \u015brodku tygodnia."],["Czy jest zobowi\u0105zanie?","Nie. Miesi\u0105c do miesi\u0105ca po 90 dniach."],["Czego potrzebujecie na start?","90 minut + dost\u0119p do profilu. Reszt\u0105 zajmujemy si\u0119 my."]].map(([q,a],i)=>(<div key={q}><button onClick={()=>setFaqOpen(faqOpen===i?null:i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition"><span className="font-[Space_Grotesk] font-bold text-[14px] pr-4">{q}</span><span className={`h-7 w-7 grid place-items-center rounded-full border shrink-0 ${faqOpen===i?"bg-[#FF3E0A] text-white border-[#FF3E0A]":"border-white/10 text-white/30"}`}>{faqOpen===i?<Minus className="h-3.5 w-3.5"/>:<Plus className="h-3.5 w-3.5"/>}</span></button><AnimatePresence>{faqOpen===i && (<motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden"><div className="px-5 pb-5 text-[13px] leading-6 text-white/40 max-w-[560px]">{a}</div></motion.div>)}</AnimatePresence></div>))}</div></div></Reveal>
      </section>

      <section id="contact" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <Reveal><div className="bg-[#FF3E0A] text-white rounded-[28px] p-8 lg:p-10 relative overflow-hidden min-h-[400px] flex flex-col"><div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"/><div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-white/70">06 \u2014 BUDOWA</div><h2 className="mt-4 font-[Space_Grotesk] font-bold text-[34px] leading-[0.9] tracking-[-0.03em]">Spraw, by ka\u017cdy<br/><span className="font-[Instrument_Serif] italic font-normal text-white/70">klient si\u0119 liczy\u0142.</span></h2><p className="mt-4 text-[13.5px] leading-6 text-white/80 max-w-[360px]">20 minut. Znajdziemy luk\u0119 i zostawimy Ci plan \u2014 nawet je\u015bli nas nie wybierzesz.</p><div className="mt-8 space-y-2 font-[JetBrains_Mono] text-[11px] text-white/90"><div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5"/> Dwa terminy w tym tygodniu \u00b7 20 min</div><div className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5"/> Otwarte dla ka\u017cdego klienta</div></div><div className="mt-auto pt-8 flex gap-2 font-[JetBrains_Mono] text-[11px] font-medium"><span className="border border-white/20 rounded-full px-3 py-1.5 bg-white/10">Bez prezentacji</span><span className="border border-white/20 rounded-full px-3 py-1.5 bg-white/10">Bez \u017cargonu</span></div></div></Reveal>
          <Reveal delay={0.06}><div className="bg-[#111113] border border-white/10 rounded-[28px] p-6 sm:p-8"><div className="flex items-center justify-between"><h3 className="font-[Space_Grotesk] font-bold">Rozpocznij budow\u0119</h3><span className="font-[JetBrains_Mono] text-[11px] text-white/25 border border-white/10 rounded-full px-2.5 py-1">2 MIN</span></div>{sent ? (<motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="mt-8 bg-white/[0.04] border border-white/10 rounded-2xl p-8 text-center"><div className="h-10 w-10 mx-auto grid place-items-center rounded-full bg-[#FF3E0A] text-white"><Check className="h-5 w-5"/></div><div className="mt-4 font-[Space_Grotesk] font-bold">Zg\u0142oszenie otrzymane.</div><div className="mt-2 text-[13px] text-white/40">Wy\u015blemy terminy w ci\u0105gu kilku godzin.</div><button onClick={()=>setSent(false)} className="mt-5 font-[JetBrains_Mono] text-xs underline decoration-white/20 text-white/50">Wy\u015blij kolejne</button></motion.div>) : (<form onSubmit={submit} className="mt-6 space-y-4"><div className="grid sm:grid-cols-2 gap-4"><label className="space-y-1.5"><span className="font-[JetBrains_Mono] text-[11px] text-white/50">IMI\u0118 I NAZWISKO</span><input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Alex Kowalski" className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#FF3E0A]/40 text-white"/></label><label className="space-y-1.5"><span className="font-[JetBrains_Mono] text-[11px] text-white/50">FIRMA</span><input value={form.business} onChange={e=>setForm({...form, business:e.target.value})} placeholder="Lumi\u00e8re" className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#FF3E0A]/40 text-white"/></label></div><label className="space-y-1.5 block"><span className="font-[JetBrains_Mono] text-[11px] text-white/50">EMAIL</span><input required type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="alex@firma.pl" className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#FF3E0A]/40 text-white"/></label><button type="submit" className="w-full h-12 rounded-full bg-[#FF3E0A] text-white font-[Space_Grotesk] font-bold text-[13px] hover:bg-[#FF5A2E] transition flex items-center justify-center gap-2">ZAM\u00d3W AUDYT \u2014 ZA DARMO <ArrowRight className="h-4 w-4"/></button><div className="text-center font-[JetBrains_Mono] text-[11px] text-white/25">Lub <button type="button" onClick={()=>navigate("/auth")} className="underline decoration-white/15 text-white/50">zaloguj si\u0119</button> by zarz\u0105dza\u0107 budow\u0105</div></form>)}</div></Reveal>
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-[JetBrains_Mono] text-[11px] text-white/25">
          <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-[7px] bg-white text-black grid place-items-center font-[Space_Grotesk] font-bold text-[11px]">Q</div><span className="font-[Space_Grotesk] font-bold text-white text-xs">QRAFT</span><span className="hidden sm:inline">\u00a9 {new Date().getFullYear()} \u00b7 PERFEKCJA BUDUJE MARKI</span></div>
          <div className="flex gap-3"><span>qraft.build</span><span className="opacity-30">\u00b7</span><span>Otwarte dla wszystkich</span></div>
        </div>
      </footer>
    </div>
  );
}
