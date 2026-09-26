import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PopNumber } from "@/components/transitions";
import { LogOut, Terminal, Activity, Check, ArrowUpRight, Layers, Cpu, Clock, Mail } from "lucide-react";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => { await signOut(); navigate("/"); };
  return (
    <div className="min-h-screen bg-[#070708] text-white antialiased relative overflow-hidden selection:bg-[#FF3E0A] selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap');`}</style>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-[0.18] blur-[120px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
      </div>
      <header className="relative border-b border-white/[0.06] bg-[#070708]/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[9px] bg-white text-black grid place-items-center"><span className="font-[Space_Grotesk] font-bold text-[13px]">Q</span></div>
            <span className="font-[Space_Grotesk] font-bold text-[15px]">QRAFT</span>
            <span className="hidden sm:inline font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/30 border-l border-white/10 pl-3 ml-1">PANEL</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 font-[JetBrains_Mono] text-[11px] text-white/40"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/> SYSTEM \u2014 DZIA\u0141A</div>
            <Button variant="outline" onClick={handleSignOut} className="rounded-full border-white/10 bg-white/[0.04] text-white hover:bg-white hover:text-black font-[JetBrains_Mono] text-[11px] gap-2 h-9"><LogOut className="h-3.5 w-3.5"/> Wyloguj</Button>
          </div>
        </div>
      </header>
      <main className="relative mx-auto max-w-[1280px] px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 bg-white/[0.04] font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/50"><Terminal className="h-3 w-3"/> panel qraft</div>
            <h1 className="mt-4 font-[Space_Grotesk] text-[30px] sm:text-[36px] font-bold tracking-[-0.03em] leading-none">Witaj{user?.name ? `, ${user.name.split(" ")[0]}` : ""} \u2014 <span className="text-white/40 font-normal">twoja budowa jest gotowa.</span></h1>
            <p className="mt-3 text-[13.5px] leading-6 text-white/50 max-w-[560px]">To Tw\u00f3j panel QRAFT. Ka\u017cdy modu\u0142 jest otwarty, ka\u017cdy wynik audytowalny, ka\u017cdy efekt mierzony w klientach. Audyt i blueprint znajdziesz tutaj.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-[#FF3E0A] text-white rounded-full px-4 h-10 font-[Space_Grotesk] text-xs font-bold"><Activity className="h-3.5 w-3.5"/> STATUS \u2014 AKTYWNY</div>
            <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 border border-white/10 rounded-full px-4 h-10 font-[JetBrains_Mono] text-xs text-white/70 hover:bg-white hover:text-black transition-colors">Strona g\u0142\u00f3wna <ArrowUpRight className="h-3 w-3"/></button>
          </div>
        </div>
        <div className="mt-8 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#111113] border border-white/10 rounded-[20px] p-6">
            <div className="flex items-center justify-between"><h2 className="font-[Space_Grotesk] font-bold flex items-center gap-2"><Layers className="h-4 w-4 text-[#FF3E0A]"/> Twoja budowa</h2><span className="font-[JetBrains_Mono] text-[10px] bg-white text-black rounded-full px-2.5 py-1 font-bold">SPRINT 90 DNI</span></div>
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {[{ label: "AUDYT", status: "Gotowe", desc: "20 min", icon: Check, done: true },{ label: "BLUEPRINT", status: "W budowie", desc: "1 strona", icon: Cpu, done: false },{ label: "DOWODY", status: "Co tydzie\u0144", desc: "Raport klient\u00f3w", icon: Activity, done: false }].map((s)=>(
                <div key={s.label} className={`rounded-2xl p-4 border ${s.done ? "bg-[#FF3E0A] text-white border-[#FF3E0A]" : "bg-white/[0.04] border-white/10"}`}>
                  <div className="flex items-center justify-between"><span className={`font-[JetBrains_Mono] text-[10px] font-bold ${s.done ? "text-white/70" : "text-white/40"}`}>{s.label}</span><s.icon className={`h-3.5 w-3.5 ${s.done ? "text-white" : "text-white/30"}`}/></div>
                  <div className="mt-2 font-[Space_Grotesk] text-sm font-bold">{s.status}</div><div className={`text-xs font-[JetBrains_Mono] ${s.done ? "text-white/70" : "text-white/40"}`}>{s.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => navigate("/")} className="bg-[#FF3E0A] text-white rounded-full px-5 h-9 font-[Space_Grotesk] text-xs font-bold hover:bg-[#FF5A2E]">Kontynuuj budow\u0119 \u2192</button>
              <span className="inline-flex items-center gap-1.5 border border-white/10 rounded-full px-3 h-9 font-[JetBrains_Mono] text-[11px] text-white/40"><Clock className="h-3 w-3"/> Nast\u0119pny kontakt: w tym tygodniu</span>
            </div>
          </div>
          <div className="bg-[#FF3E0A] text-white rounded-[20px] p-6 flex flex-col">
            <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/70">WP\u0141YW NA KLIENT\u00d3W</div>
            <div className="mt-3 font-[Space_Grotesk] text-[30px] font-bold leading-none">Otwarte dla wszystkich.</div>
            <p className="mt-2 text-[13px] leading-5 text-white/80">Ka\u017cdy panel, raport i blueprint dost\u0119pny dla ca\u0142ego zespo\u0142u \u2014 i ka\u017cdego klienta.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-black text-white rounded-xl p-3 text-center"><div className="font-[Space_Grotesk] text-lg font-bold"><PopNumber text="340+" /></div><div className="font-[JetBrains_Mono] text-[10px] text-white/50">FIRM</div></div>
              <div className="bg-white rounded-xl p-3 text-center"><div className="font-[Space_Grotesk] text-lg font-bold text-black"><PopNumber text="4.9/5" /></div><div className="font-[JetBrains_Mono] text-[10px] text-black/40">OCENA</div></div>
            </div>
            <button onClick={() => navigate("/")} className="mt-auto w-full bg-black text-white rounded-full h-10 font-[Space_Grotesk] text-xs font-bold flex items-center justify-center gap-1.5"><Mail className="h-3.5 w-3.5"/> Porozmawiaj z nami</button>
          </div>
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          {[{ k: "01", t: "Modu\u0142y systemu", d: "Sze\u015b\u0107 modu\u0142\u00f3w \u2014 marka, strona, pozyskiwanie, tre\u015b\u0107, kampanie, dowody." },{ k: "02", t: "Dowody, nie obietnice", d: "Cotygodniowy raport powi\u0105zany z klientami i przychodem." },{ k: "03", t: "Zbudowane dla klient\u00f3w", d: "Wszystko mierzymy tym, jak zdobywa i utrzymuje klient\u00f3w." }].map((c)=>(
            <div key={c.k} className="bg-[#111113] border border-white/5 rounded-2xl p-5"><div className="font-[JetBrains_Mono] text-[11px] text-white/20"><PopNumber text={c.k} /></div><div className="mt-2 font-[Space_Grotesk] font-bold">{c.t}</div><div className="mt-1 text-[13px] leading-5 text-white/50">{c.d}</div></div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6 font-[JetBrains_Mono] text-[11px] text-white/25"><span>QRAFT \u00b7 qraft.build \u00b7 Otwarte dla ka\u017cdego.</span><span className="hidden sm:inline">PERFEKCJA BUDUJE MARKI</span></div>
      </main>
    </div>
  );
}
