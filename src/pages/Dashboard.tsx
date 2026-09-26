import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  LogOut,
  Terminal,
  Activity,
  Check,
  ArrowUpRight,
  Layers,
  Cpu,
  Clock,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-white antialiased relative overflow-hidden selection:bg-[#D6FF33] selection:text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap');`}</style>

      {/* bg */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute top-0 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(ellipse at center, #D6FF33 0%, transparent 60%)" }}
        />
      </div>

      {/* header */}
      <header className="relative border-b border-white/[0.06] bg-[#08080A]/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[9px] bg-white text-black grid place-items-center">
              <span className="font-[Space_Grotesk] font-bold text-[13px]">Q</span>
            </div>
            <span className="font-[Space_Grotesk] font-bold text-[15px] tracking-[-0.03em]">QRAFT</span>
            <span className="hidden sm:inline font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/30 border-l border-white/10 pl-3 ml-1">
              WORKSPACE
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 font-[JetBrains_Mono] text-[11px] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> SYSTEM — OPERATIONAL
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="rounded-full border-white/10 bg-white/[0.04] text-white hover:bg-white hover:text-black font-[JetBrains_Mono] text-[11px] tracking-wide gap-2 h-9"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1280px] px-6 lg:px-8 py-8 lg:py-10">
        {/* welcome */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 bg-white/[0.04] font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/50">
              <Terminal className="h-3 w-3" /> qraft workspace
            </div>
            <h1 className="mt-4 font-[Space_Grotesk] text-[30px] sm:text-[36px] font-bold tracking-[-0.03em] leading-none">
              Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""} — <span className="text-white/40 font-normal">your build is ready.</span>
            </h1>
            <p className="mt-3 text-[13.5px] leading-6 text-white/50 max-w-[560px]">
              This is your live QRAFT workspace. Every module is open, every result is auditable, and every customer
              outcome is tracked. Your audit and blueprint live here — available to everyone on your team.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-[#D6FF33] text-black rounded-full px-4 h-10 font-[Space_Grotesk] text-xs font-bold">
              <Activity className="h-3.5 w-3.5" /> BUILD STATUS — ACTIVE
            </div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 border border-white/10 rounded-full px-4 h-10 font-[JetBrains_Mono] text-xs text-white/70 hover:bg-white hover:text-black transition-colors"
            >
              View site <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* cards */}
        <div className="mt-8 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#111113] border border-white/10 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-[Space_Grotesk] font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#D6FF33]" /> Your system build
              </h2>
              <span className="font-[JetBrains_Mono] text-[10px] tracking-[0.12em] bg-white text-black rounded-full px-2.5 py-1 font-bold">
                90-DAY SPRINT
              </span>
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {[
                { label: "AUDIT", status: "Complete", desc: "20-min diagnostic", icon: Check, done: true },
                { label: "BLUEPRINT", status: "In build", desc: "One-page system plan", icon: Cpu, done: false },
                { label: "PROOF", status: "Weekly", desc: "Customer scoreboard", icon: Activity, done: false },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-4 border ${s.done ? "bg-[#D6FF33] text-black border-[#D6FF33]" : "bg-white/[0.04] border-white/10"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-[JetBrains_Mono] text-[10px] tracking-[0.12em] font-bold ${s.done ? "text-black/60" : "text-white/40"}`}>{s.label}</span>
                    <s.icon className={`h-3.5 w-3.5 ${s.done ? "text-black" : "text-white/30"}`} />
                  </div>
                  <div className="mt-2 font-[Space_Grotesk] text-sm font-bold">{s.status}</div>
                  <div className={`text-xs font-[JetBrains_Mono] ${s.done ? "text-black/60" : "text-white/40"}`}>{s.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => navigate("/")} className="bg-[#D6FF33] text-black rounded-full px-5 h-9 font-[Space_Grotesk] text-xs font-bold hover:bg-[#E0FF66] transition-colors">
                Continue build →
              </button>
              <span className="inline-flex items-center gap-1.5 border border-white/10 rounded-full px-3 h-9 font-[JetBrains_Mono] text-[11px] text-white/40">
                <Clock className="h-3 w-3" /> Next check-in: this week
              </span>
            </div>
          </div>

          <div className="bg-[#D6FF33] text-black rounded-[20px] p-6 flex flex-col">
            <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-black/50">CUSTOMER IMPACT</div>
            <div className="mt-3 font-[Space_Grotesk] text-[36px] font-bold leading-none tracking-[-0.03em]">Open to all.</div>
            <p className="mt-2 text-[13px] leading-5 text-black/60">
              Every workspace, proof report, and blueprint is accessible to your whole team — and every customer benefits. No hidden tiers.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-black text-white rounded-xl p-3 text-center">
                <div className="font-[Space_Grotesk] text-lg font-bold">340+</div>
                <div className="font-[JetBrains_Mono] text-[10px] text-white/50">BUSINESSES</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-black/5">
                <div className="font-[Space_Grotesk] text-lg font-bold">4.9/5</div>
                <div className="font-[JetBrains_Mono] text-[10px] text-black/40">CUSTOMER RATING</div>
              </div>
            </div>
            <button onClick={() => navigate("/")} className="mt-auto w-full bg-black text-white rounded-full h-10 font-[Space_Grotesk] text-xs font-bold hover:bg-black/90 transition-colors flex items-center justify-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Talk to your builder
            </button>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-4">
          {[
            {
              k: "01",
              t: "System modules",
              d: "Six modules — brand, web, acquisition, content, lifecycle, proof — all visible here as you build.",
            },
            {
              k: "02",
              t: "Proof, not promises",
              d: "Weekly scoreboard tied to real customers and revenue. No vanity metrics, no black boxes.",
            },
            {
              k: "03",
              t: "Built for customers",
              d: "Everything we do is measured by how it earns and keeps customers — the people your business serves.",
            },
          ].map((c) => (
            <div key={c.k} className="bg-[#111113] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
              <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/20">{c.k}</div>
              <div className="mt-2 font-[Space_Grotesk] font-bold">{c.t}</div>
              <div className="mt-1 text-[13px] leading-5 text-white/50">{c.d}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6 font-[JetBrains_Mono] text-[11px] text-white/25">
          <span>QRAFT · qraft.build · Workspace is open to every customer and team member.</span>
          <span className="hidden sm:inline">PERFECTION BUILDS BRANDS</span>
        </div>
      </main>
    </div>
  );
}
