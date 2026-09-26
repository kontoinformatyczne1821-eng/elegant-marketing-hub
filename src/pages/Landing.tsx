import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Check,
  Minus,
  Plus,
  Quote,
  Clock,
  TrendingUp,
  Cpu,
  Layers,
  Zap,
  Activity,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const services = [
  {
    n: "01",
    title: "Brand System",
    desc: "A rigorous identity that makes you the clear choice before a customer walks in.",
    points: ["Positioning & architecture", "Visual language & signage", "System for every touchpoint"],
  },
  {
    n: "02",
    title: "Web & Performance",
    desc: "Fast, precise websites that turn intent into action — search, scan, book.",
    points: ["Engineered site — <100ms", "Business profile & maps", "Booking flow, frictionless"],
  },
  {
    n: "03",
    title: "Acquisition Infra",
    desc: "Built for your radius, not the internet at large. Local-first growth, measured.",
    points: ["Local search & maps pack", "Radius-paid, tightly scoped", "Partnerships that compound"],
  },
  {
    n: "04",
    title: "Content Engine",
    desc: "Direction, photography, and film that make craft tangible to future customers.",
    points: ["Art direction on-site", "Film & short-form suite", "Asset library you own"],
  },
  {
    n: "05",
    title: "Lifecycle Campaigns",
    desc: "Offers and launches designed to fill the week — and bring customers back.",
    points: ["Seasonal calendar", "Email & SMS, restrained", "Store-to-digital loop"],
  },
  {
    n: "06",
    title: "Retention & Proof",
    desc: "The compounding layer: reviews, referrals, and reporting in plain language.",
    points: ["Review velocity system", "Loyalty & CRM", "Weekly scoreboard — real £"],
  },
];

const results = [
  {
    name: "Lumière — Café & Bakery",
    loc: "WEST VILLAGE · CAFÉ",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop",
    stat: "+187%",
    statLabel: "footfall — 90 days",
    detail: "Full system rebuild: identity, windows, menu, maps. From second page to top three for ‘bakery near me’.",
    tags: ["BRAND", "MAPS", "CONTENT"],
  },
  {
    name: "Form — Pilates Studio",
    loc: "NOTTING HILL · WELLNESS",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop",
    stat: "2.4×",
    statLabel: "customer enquiries",
    detail: "New site and trial funnel. £14 to acquire, 68% convert to membership. Mornings fully booked.",
    tags: ["WEB", "FUNNEL", "LIFECYCLE"],
  },
  {
    name: "Marlowe — Restaurant",
    loc: "SHOREDITCH · 32 COVERS",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop",
    stat: "+41%",
    statLabel: "mid-week customers",
    detail: "Mid-week programme: set menu, creator dinners, owned list. Email now drives 22% of revenue.",
    tags: ["CAMPAIGNS", "EMAIL", "PARTNERSHIPS"],
  },
];

const packages = [
  {
    name: "Core",
    price: "1,900",
    cadence: "/ mo",
    for: "Foundation. You need to be found, understood, and trusted by new customers.",
    features: ["Brand tidy & system guidance", "Site care + maps optimisation", "Quarterly shoot", "Monthly proof report"],
    cta: "Start with Core",
    featured: false,
  },
  {
    name: "Scale",
    price: "3,800",
    cadence: "/ mo",
    for: "The system at full pressure. Built to fill the calendar with the right customers.",
    features: [
      "Everything in Core",
      "Local search + paid within 3 km",
      "Campaign & content engine",
      "Email, SMS & review velocity",
      "Bi-weekly build review",
    ],
    cta: "Start with Scale",
    featured: true,
  },
  {
    name: "Qraft Lab",
    price: "Custom",
    cadence: "",
    for: "For launches, rebrands, and multi-site. A dedicated build team.",
    features: ["Brand & space from zero", "Film & photo atelier", "Launch & partnerships", "On-site, weekly sprints"],
    cta: "Enquire — Lab",
    featured: false,
  },
];

const faqs = [
  {
    q: "Who is QRAFT for?",
    a: "Businesses where the customer relationship is everything — cafés, restaurants, studios, clinics, boutiques, and specialist trades. If your customers choose you by place, proximity, and reputation, we are built for you.",
  },
  {
    q: "How fast do customers feel the difference?",
    a: "Discoverability lifts in two to four weeks. Paid and campaign impact in 30 to 60 days. Brand and content compound across a quarter. You get a weekly scoreboard with real revenue attribution, not vanity metrics.",
  },
  {
    q: "Are we locked in for a year?",
    a: "No. Month-to-month after a focused 90-day build. We earn retention through performance. Most partners stay well beyond a year because local growth compounds.",
  },
  {
    q: "What do you need from us to begin?",
    a: "Ninety minutes for a systems audit, access to your business profile, website, and booking tools, and a single point of contact. We handle the rest — direction, build, and proof.",
  },
  {
    q: "Do you handle the creative itself?",
    a: "Yes. Art direction, photography, film, and copy are included in Scale and Lab. We work on-site with minimal disruption and leave you with a complete asset library you own.",
  },
];

const testimonials = [
  {
    quote: "Quiet Tuesdays became waitlists. QRAFT understood our street, our margins, and our regulars — and engineered marketing around customers, not clicks.",
    name: "Sofia Leclerc",
    role: "Owner, Lumière",
  },
  {
    quote: "Finally an agency that talks like an operator. No dashboards for the sake of it. Just more of the right customers, better reviews, and a site we're proud to send people to.",
    name: "James Park",
    role: "Founder, Form",
  },
  {
    quote: "Our mid-week is now our strongest stretch. The campaign system alone repaid the retainer three times over.",
    name: "Daniel Marlowe",
    role: "Chef-Owner, Marlowe",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [form, setForm] = useState({ name: "", business: "", email: "", goal: "" });
  const [sent, setSent] = useState(false);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name) return;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F5F5F3] antialiased selection:bg-[#D6FF33] selection:text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');`}</style>

      {/* subtle grid + gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#08080A]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1200px] -translate-y-1/2 rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(ellipse at center, #D6FF33 0%, transparent 60%)" }} />
        <div className="absolute top-[40%] right-0 h-[500px] w-[600px] rounded-full opacity-[0.12] blur-[100px]" style={{ background: "radial-gradient(ellipse at center, #7C3AED 0%, transparent 60%)" }} />
      </div>

      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#08080A]/70 border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-[9px] bg-white text-black grid place-items-center">
                <span className="font-[Space_Grotesk] font-bold text-[13px] tracking-[-0.04em]">Q</span>
              </div>
              <span className="font-[Space_Grotesk] font-bold tracking-[-0.03em] text-[15px]">QRAFT</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] font-[JetBrains_Mono] text-white/40 border-l border-white/10 pl-3 ml-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D6FF33] animate-pulse" /> PERFECTION BUILDS BRANDS
              </span>
            </button>

            <nav className="hidden lg:flex items-center gap-6 font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/50">
              {[
                ["SYSTEM", "services"],
                ["PROOF", "results"],
                ["PROCESS", "process"],
                ["PLANS", "pricing"],
              ].map(([label, id]) => (
                <button key={id} onClick={() => scrollTo(id)} className="hover:text-white transition-colors py-2 flex items-center gap-1">
                  <span className="text-white/20">/</span> {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 font-[JetBrains_Mono] text-[11px] text-white/40">
              <span className="flex items-center gap-1.5"><Terminal className="h-3 w-3" /> qraft.build v2.1</span>
              <span className="h-3 w-px bg-white/10" />
              <span>LDN · PRS · REMOTE</span>
            </div>
            <button
              onClick={() => scrollTo("contact")}
              className="hidden sm:inline-flex items-center gap-2 bg-[#D6FF33] text-black text-[11px] tracking-[0.1em] font-[Space_Grotesk] font-bold px-5 h-9 rounded-full hover:bg-[#E0FF66] transition-colors"
            >
              START YOUR BUILD <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden h-9 w-9 grid place-items-center rounded-full border border-white/10 bg-white/[0.04]"
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
              className="lg:hidden border-t border-white/5 bg-[#0F0F11]"
            >
              <div className="px-6 py-6 flex flex-col gap-1 font-[JetBrains_Mono] text-xs tracking-[0.12em]">
                {[
                  ["SYSTEM", "services"],
                  ["PROOF", "results"],
                  ["PROCESS", "process"],
                  ["PLANS", "pricing"],
                  ["BUILD", "contact"],
                ].map(([label, id]) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="text-left py-3 border-b border-white/[0.04] last:border-0 text-white/80"
                  >
                    / {label}
                  </button>
                ))}
                <button
                  onClick={() => navigate("/auth")}
                  className="mt-4 w-full bg-[#D6FF33] text-black py-3.5 rounded-full text-sm font-bold tracking-wide font-[Space_Grotesk]"
                >
                  Sign in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.12fr_0.88fr] gap-10 lg:gap-12 pt-10 lg:pt-16 pb-10 lg:pb-12 items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex flex-wrap items-center gap-2 border border-white/10 rounded-full px-1.5 py-1.5 bg-white/[0.04] backdrop-blur"
            >
              <span className="bg-[#D6FF33] text-black text-[10px] tracking-[0.12em] font-bold font-[JetBrains_Mono] px-2.5 py-1 rounded-full">
                QRAFT SYSTEM
              </span>
              <span className="text-[11px] tracking-[0.08em] font-[JetBrains_Mono] text-white/70 pr-2">
                BUILT FOR BUSINESSES OBSESSED WITH THEIR CUSTOMERS
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.6 }}
              className="mt-6 font-[Space_Grotesk] leading-[0.88] tracking-[-0.04em] font-bold"
            >
              <span className="block text-[12px] tracking-[0.2em] font-[JetBrains_Mono] font-medium text-[#D6FF33] mb-3">
                PERFECTION BUILDS BRANDS —
              </span>
              <span className="block text-[44px] sm:text-[56px] lg:text-[72px]">Perfection</span>
              <span className="block text-[44px] sm:text-[56px] lg:text-[72px] flex items-center gap-3">
                builds <span className="font-[Instrument_Serif] font-normal italic tracking-[-0.02em] text-white/60 text-[42px] sm:text-[54px] lg:text-[68px]">brands.</span>
              </span>
              <span className="block text-[16px] sm:text-[18px] font-medium tracking-[-0.02em] text-white/50 mt-3 font-[Inter] flex items-center gap-2">
                <span className="h-px w-10 bg-[#D6FF33]/60" /> QRAFT engineers how you earn every customer.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.6 }}
              className="mt-6 max-w-[560px] text-[15px] leading-7 text-white/60 font-[Inter]"
            >
              We are a technical marketing atelier. Not campaigns for their own sake — but a{" "}
              <span className="text-white font-medium">complete system</span> that turns intent into customers, and customers into advocates. Services and measurable results, fully in the open. Everyone can see the work. Everyone can use it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={() => scrollTo("contact")}
                className="inline-flex items-center gap-2 bg-[#D6FF33] text-black px-7 h-[46px] rounded-full text-[13px] tracking-[0.02em] font-bold font-[Space_Grotesk] hover:bg-[#E0FF66] transition"
              >
                START YOUR BUILD — FREE AUDIT <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollTo("results")}
                className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 px-7 h-[46px] rounded-full text-[13px] tracking-[0.06em] font-medium hover:bg-white/[0.08] transition backdrop-blur text-white"
              >
                VIEW PROOF <span className="h-6 w-6 grid place-items-center rounded-full bg-white text-black"><ArrowUpRight className="h-3 w-3" /></span>
              </button>
            </motion.div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6 max-w-[520px]">
              {[
                ["340+", "BUSINESSES BUILT"],
                ["4.9/5", "CUSTOMER RATING"],
                ["14 mo", "AVG. PARTNERSHIP"],
              ].map(([v, l]) => (
                <div key={v}>
                  <div className="text-[20px] font-bold tracking-tight font-[Space_Grotesk]">{v}</div>
                  <div className="text-[10px] tracking-[0.1em] font-[JetBrains_Mono] text-white/40 mt-1">{l}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/25">
              <span className="h-px w-10 bg-white/10" /> EST. 2018 · SYSTEMS ATELIER · QRAFT.BUILD
            </div>
          </div>

          {/* technical card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative lg:sticky lg:top-[84px]"
          >
            <div className="bg-[#111113] border border-white/10 rounded-[24px] p-3 sm:p-4 shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* header bar */}
              <div className="flex items-center justify-between px-1 pb-3">
                <div className="flex items-center gap-2 font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/40">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> QRAFT_LIVE
                  </span>
                  <span className="hidden sm:inline text-white/20">— LUMIÈRE / PROD</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D6FF33]" />
                </div>
              </div>

              <div className="rounded-[16px] overflow-hidden bg-[#0A0A0B] border border-white/[0.06]">
                <div className="aspect-[4/2.55] relative">
                  <img
                    src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000&q=80&auto=format&fit=crop"
                    alt="Atelier interior"
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  {/* code overlay */}
                  <div className="absolute top-3 left-3 font-[JetBrains_Mono] text-[10px] leading-3 bg-black/70 backdrop-blur border border-white/10 rounded-lg px-2.5 py-2 text-white/80 hidden sm:block">
                    <div className="text-[#D6FF33]">qraft.ingest --source maps --radius 3km</div>
                    <div className="text-white/50">› indexing 1,247 customer signals… done</div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-white rounded-[14px] p-3 flex items-center justify-between">
                    <div>
                      <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.1em] text-black/50 flex items-center gap-1.5">
                        <Activity className="h-3 w-3" /> CUSTOMER FOOTFALL · 90D
                      </div>
                      <div className="font-[Space_Grotesk] text-[22px] font-bold leading-none mt-1 text-black">
                        +187% <span className="text-[11px] font-medium text-emerald-600">▲ vs baseline</span>
                      </div>
                    </div>
                    <div className="h-10 w-[84px] flex items-end gap-[2px]">
                      {[3, 5, 4, 7, 5, 8, 6, 9, 7, 11].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h * 3.6}px`, background: i === 9 ? "#D6FF33" : i > 6 ? "#7C3AED" : "black" }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-white/5">
                  {[
                    ["#1", "MAPS · bakery near me"],
                    ["2.4×", "CUSTOMER ENQUIRIES"],
                    ["+41%", "MID-WEEK COVERS"],
                  ].map(([k, v]) => (
                    <div key={k} className="px-3 py-4 text-center bg-[#111113]">
                      <div className="font-[Space_Grotesk] text-[16px] font-bold tracking-tight text-white">{k}</div>
                      <div className="font-[JetBrains_Mono] text-[9px] leading-3 tracking-[0.06em] text-white/40 mt-1">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                <div className="bg-[#D6FF33] text-black rounded-[14px] px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-[JetBrains_Mono] text-[10px] tracking-[0.14em]">NEXT BUILD SLOTS</div>
                    <div className="font-[Space_Grotesk] text-sm font-bold mt-0.5">Two audits this week — open</div>
                  </div>
                  <button onClick={() => scrollTo("contact")} className="h-8 w-8 grid place-items-center rounded-full bg-black text-[#D6FF33]">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="hidden sm:flex bg-white text-black rounded-[14px] px-3 items-center gap-2 font-[JetBrains_Mono] text-[11px] font-medium">
                  <Clock className="h-3.5 w-3.5" /> 20 MIN · NO DECK
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 font-[JetBrains_Mono] text-[11px] text-white/30">
              <Cpu className="h-3 w-3" /> Live customer system — updated weekly. Auditable.
            </div>
          </motion.div>
        </div>

        {/* Trust strip */}
        <div className="border-y border-white/[0.06] py-5 flex flex-col lg:flex-row lg:items-center gap-4 backdrop-blur">
          <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/30 shrink-0">CUSTOMERS WE BUILD FOR —</div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-[Space_Grotesk] text-[13px] tracking-[0.06em] font-bold text-white/70">
            <span>LUMIÈRE</span> <span className="h-px w-4 bg-white/10 hidden sm:block" />
            <span>FORM</span> <span className="h-px w-4 bg-white/10 hidden sm:block" />
            <span>MARLOWE</span> <span className="h-px w-4 bg-white/10 hidden sm:block" />
            <span>FLEUR ATELIER</span> <span className="h-px w-4 bg-white/10 hidden sm:block" />
            <span>GOOD ROOM</span>
            <span className="ml-auto font-[JetBrains_Mono] text-[11px] tracking-normal font-normal text-white/30 hidden lg:inline">340+ BUSINESSES · ALL OPEN TO CUSTOMERS</span>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-[#D6FF33] flex items-center gap-2">
              <Layers className="h-3 w-3" /> 01 — SYSTEM
            </div>
            <h2 className="mt-3 font-[Space_Grotesk] text-[36px] sm:text-[44px] leading-[0.9] tracking-[-0.03em] font-bold">
              Everything to earn
              <br />
              <span className="font-[Instrument_Serif] font-normal italic text-white/50">customers. Nothing extra.</span>
            </h2>
          </div>
          <p className="max-w-[420px] text-[14px] leading-6 text-white/50 font-[Inter]">
            Six technical modules. Run one or run the system. Every build starts with a 20-minute audit — we show you exactly where customers are being lost.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/[0.06] border border-white/[0.06] rounded-[20px] overflow-hidden">
          {services.map((s) => (
            <div key={s.n} className="bg-[#111113] p-7 sm:p-8 group hover:bg-[#151518] transition-colors relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D6FF33]/0 to-transparent group-hover:via-[#D6FF33]/30 transition-colors" />
              <div className="flex items-center justify-between">
                <span className="font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/25">{s.n}</span>
                <span className="h-6 w-6 grid place-items-center rounded-full border border-white/10 text-white/40 group-hover:bg-[#D6FF33] group-hover:text-black group-hover:border-[#D6FF33] transition-colors">
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
              <h3 className="mt-4 font-[Space_Grotesk] text-[18px] font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[13.5px] leading-6 text-white/50">{s.desc}</p>
              <ul className="mt-5 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 font-[JetBrains_Mono] text-[11px] text-white/60">
                    <span className="h-1 w-1 rounded-full bg-[#D6FF33]" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-[12px] font-[JetBrains_Mono]">
          <span className="text-white/30">Unsure where the leak is?</span>
          <button onClick={() => scrollTo("contact")} className="underline decoration-white/20 underline-offset-4 hover:decoration-[#D6FF33] font-medium text-white">
            Run the 3-question diagnostic →
          </button>
          <span className="ml-auto hidden sm:inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1.5 bg-white/[0.04] text-[11px] tracking-wide text-white/60">
            <Check className="h-3 w-3 text-[#D6FF33]" /> No retainer for audits · Sprints available to all
          </span>
        </div>
      </section>

      {/* RESULTS */}
      <section id="results" className="bg-white text-black mt-4 rounded-t-[32px] lg:rounded-t-[40px] overflow-hidden">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 border border-black/10 rounded-full px-3 py-1 bg-black/[0.02]">
                <TrendingUp className="h-3 w-3" /> <span className="font-[JetBrains_Mono] text-[11px] tracking-[0.14em] font-medium">02 — PROOF</span>
              </div>
              <h2 className="mt-4 font-[Space_Grotesk] text-[36px] sm:text-[48px] leading-[0.9] tracking-[-0.03em] font-bold">
                Services mean nothing
                <br />
                <span className="font-[Instrument_Serif] font-normal italic text-black/40">without customers.</span>
              </h2>
            </div>
            <div className="lg:text-right">
              <div className="grid grid-cols-3 gap-6 lg:gap-10 border-t lg:border-t-0 border-black/10 pt-6 lg:pt-0">
                {[
                  ["+187%", "avg. customer lift (90d)"],
                  ["£14", "to acquire a customer"],
                  ["22%", "revenue from owned list"],
                ].map(([k, l]) => (
                  <div key={k}>
                    <div className="font-[Space_Grotesk] text-[28px] font-bold tracking-tight">{k}</div>
                    <div className="font-[JetBrains_Mono] text-[11px] tracking-wide text-black/50">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 hidden lg:block font-[JetBrains_Mono] text-[11px] tracking-[0.1em] text-black/30">LAST 12 MONTHS · N=86 CUSTOMER BUSINESSES</div>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {results.map((r) => (
              <div key={r.name} className="bg-[#F6F6F3] border border-black/5 rounded-[18px] overflow-hidden group hover:border-black/10 transition-colors">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={r.image} alt={r.name} className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-700" />
                  <div className="absolute top-3 left-3 bg-black text-[#D6FF33] rounded-full px-3 py-1 font-[JetBrains_Mono] text-[11px] tracking-wide font-medium">
                    {r.stat} {r.statLabel}
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.08em] font-medium text-black/40">{r.loc}</div>
                  <div className="mt-1 font-[Space_Grotesk] text-[15px] font-bold leading-tight">{r.name}</div>
                  <p className="mt-2 text-[13px] leading-5 text-black/60">{r.detail}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {r.tags.map((t) => (
                      <span key={t} className="font-[JetBrains_Mono] text-[10px] tracking-[0.08em] border border-black/10 bg-white rounded-full px-2 py-1">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/5 pt-6">
            <div className="text-sm text-black/60 font-[Inter]">Full case files with P&L — shared openly on every audit. Available to all.</div>
            <button onClick={() => scrollTo("contact")} className="inline-flex items-center gap-2 bg-black text-white px-6 h-10 rounded-full font-[JetBrains_Mono] text-[12px] tracking-[0.08em] font-medium hover:bg-black/90 transition">
              REQUEST CASE BOOK <ArrowUpRight className="h-4 w-4 text-[#D6FF33]" />
            </button>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="bg-white text-black border-t border-black/5">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-[380px_1fr] gap-10">
            <div className="lg:sticky lg:top-[88px] self-start">
              <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-black/40 flex items-center gap-2">
                <Zap className="h-3 w-3" /> 03 — PROCESS
              </div>
              <h2 className="mt-3 font-[Space_Grotesk] text-[38px] leading-[0.9] tracking-[-0.03em] font-bold">
                Four weeks to
                <br />
                <span className="font-[Instrument_Serif] font-normal italic text-black/40">momentum.</span>
              </h2>
              <p className="mt-4 text-[14px] leading-6 text-black/60">
                No theatre. We work in the open, on-site when needed, with a weekly scoreboard anyone on your team can read.
              </p>
              <button onClick={() => scrollTo("contact")} className="mt-6 inline-flex items-center gap-2 border border-black/10 px-5 h-10 rounded-full font-[JetBrains_Mono] text-[12px] tracking-wide font-medium bg-white hover:bg-black hover:text-white hover:border-black transition-colors">
                See a live scoreboard <ArrowUpRight className="h-3.5 w-3.5" />
              </button>

              <div className="mt-8 hidden lg:block border border-black/5 rounded-2xl p-4 bg-[#F6F6F3]">
                <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.1em] text-black/40 flex items-center gap-2">
                  <Activity className="h-3 w-3" /> SCOREBOARD — LIVE
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-xl py-3 border border-black/5">
                    <div className="font-[JetBrains_Mono] text-[10px] text-black/40">ENQUIRIES</div>
                    <div className="font-[Space_Grotesk] text-lg font-bold">+34</div>
                    <div className="font-[JetBrains_Mono] text-[10px] text-emerald-600">▲ 18% WoW</div>
                  </div>
                  <div className="bg-white rounded-xl py-3 border border-black/5">
                    <div className="font-[JetBrains_Mono] text-[10px] text-black/40">MAPS VIEWS</div>
                    <div className="font-[Space_Grotesk] text-lg font-bold">12.4k</div>
                    <div className="font-[JetBrains_Mono] text-[10px] text-emerald-600">▲ 9% WoW</div>
                  </div>
                  <div className="bg-black text-white rounded-xl py-3">
                    <div className="font-[JetBrains_Mono] text-[10px] text-white/50">REVENUE TIED</div>
                    <div className="font-[Space_Grotesk] text-lg font-bold">£8.2k</div>
                    <div className="font-[JetBrains_Mono] text-[10px] text-[#D6FF33]">owned list + maps</div>
                  </div>
                </div>
                <div className="mt-3 font-[JetBrains_Mono] text-[10px] text-black/30 text-center">Every customer source tracked. No black boxes.</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-black/10 hidden sm:block" />
              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Audit — 20 minutes",
                    desc: "We map how customers find you: search, maps, site, reviews, and in-store. You leave with a scored sheet and the single lever to pull first.",
                    meta: "On call or in-store · No prep",
                  },
                  {
                    step: "02",
                    title: "Blueprint — one page",
                    desc: "One page, not a deck. Positioning, offer, calendar, and channel plan for your radius. You approve or we refine — same day.",
                    meta: "Fixed price · 72h turnaround",
                  },
                  {
                    step: "03",
                    title: "Build — make it real",
                    desc: "Identity, site, signage, and shoot. Built in public, with approvals that take minutes, not meetings.",
                    meta: "2–3 weeks · On-site",
                  },
                  {
                    step: "04",
                    title: "Scale — weekly proof",
                    desc: "Launch, learn, compound. Campaigns, list, and reviews — reported every Monday in plain language and real revenue.",
                    meta: "Month-to-month · 90-day build",
                  },
                ].map((s) => (
                  <div key={s.step} className="relative flex gap-4 sm:gap-6 group">
                    <div className="hidden sm:grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black text-[#D6FF33] font-[JetBrains_Mono] text-[11px] font-bold z-10">
                      {s.step}
                    </div>
                    <div className="flex-1 bg-[#F6F6F3] border border-black/5 rounded-[16px] p-6 group-hover:border-black/10 group-hover:bg-white transition-colors">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-[Space_Grotesk] text-[16px] font-bold">{s.title}</h3>
                        <span className="hidden sm:inline font-[JetBrains_Mono] text-[11px] tracking-wide text-black/40 border border-black/10 rounded-full px-2 py-1 bg-white">
                          {s.meta}
                        </span>
                      </div>
                      <p className="mt-2 text-[13.5px] leading-6 text-black/60">{s.desc}</p>
                      <div className="sm:hidden mt-3 font-[JetBrains_Mono] text-[11px] text-black/40">{s.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#08080A] text-white border-y border-white/5">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-center justify-between">
            <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-white/30">VOICES — CUSTOMERS & OWNERS</div>
            <div className="flex gap-1">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all ${i === activeTestimonial ? "w-6 bg-[#D6FF33]" : "w-1.5 bg-white/15"}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div className="relative min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                >
                  <Quote className="h-6 w-6 text-white/10" />
                  <p className="mt-4 font-[Space_Grotesk] text-[24px] sm:text-[28px] leading-[1.15] tracking-[-0.02em] font-medium">
                    “{testimonials[activeTestimonial].quote}”
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-white text-black grid place-items-center font-[Space_Grotesk] text-xs font-bold">
                      {testimonials[activeTestimonial].name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-bold font-[Space_Grotesk]">{testimonials[activeTestimonial].name}</div>
                      <div className="font-[JetBrains_Mono] text-xs text-white/40">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="bg-white/[0.04] rounded-[20px] p-6 border border-white/10 backdrop-blur">
              <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.1em] text-white/40">WHAT TEAMS REPORT MOST</div>
              <ul className="mt-4 space-y-3 text-[13.5px] leading-6 text-white/70 font-[Inter]">
                <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-[#D6FF33]" /> “They protect our margins like their own.”</li>
                <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-[#D6FF33]" /> “A report the whole team can read in 60 seconds.”</li>
                <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-[#D6FF33]" /> “Assets we still send to customers a year later.”</li>
              </ul>
              <div className="mt-6 flex gap-2">
                <button onClick={() => setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length)} className="h-9 w-9 grid place-items-center rounded-full border border-white/10 bg-white/[0.06] hover:bg-white hover:text-black transition-colors text-white">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
                <button onClick={() => setActiveTestimonial((p) => (p + 1) % testimonials.length)} className="h-9 w-9 grid place-items-center rounded-full bg-[#D6FF33] text-black hover:bg-[#E0FF66] transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-[#D6FF33]">04 — PLANS</div>
          <h2 className="mt-3 font-[Space_Grotesk] text-[36px] sm:text-[44px] leading-none tracking-[-0.03em] font-bold">Progress, priced plainly.</h2>
          <p className="mt-3 text-[14px] leading-6 text-white/50">
            Month-to-month after the 90-day build. No lock-in. Choose how much system you need — all plans are open to every customer.
          </p>
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`rounded-[20px] border p-7 flex flex-col ${pkg.featured ? "bg-[#D6FF33] text-black border-[#D6FF33] shadow-[0_20px_60px_rgba(214,255,51,0.22)] lg:scale-[1.02]" : "bg-[#111113] border-white/10 text-white"}`}
            >
              <div className="flex items-center justify-between">
                <div className={`font-[JetBrains_Mono] text-[11px] tracking-[0.14em] font-bold ${pkg.featured ? "text-black/60" : "text-white/40"}`}>{pkg.name.toUpperCase()}</div>
                {pkg.featured && <span className="font-[JetBrains_Mono] text-[11px] tracking-wide bg-black text-[#D6FF33] rounded-full px-2.5 py-1 font-bold">MOST CHOSEN</span>}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                {pkg.price === "Custom" ? (
                  <span className="font-[Space_Grotesk] text-[32px] font-bold tracking-tight">Custom</span>
                ) : (
                  <>
                    <span className="text-[13px] opacity-60">£</span>
                    <span className="font-[Space_Grotesk] text-[32px] font-bold tracking-tight">{pkg.price}</span>
                    <span className={`text-[13px] font-[JetBrains_Mono] ${pkg.featured ? "text-black/50" : "text-white/40"}`}>{pkg.cadence}</span>
                  </>
                )}
              </div>
              <div className={`mt-2 text-[13px] leading-5 ${pkg.featured ? "text-black/60" : "text-white/50"}`}>{pkg.for}</div>

              <ul className="mt-6 space-y-3 flex-1">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[13px]">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${pkg.featured ? "text-black/40" : "text-[#D6FF33]"}`} />
                    <span className={pkg.featured ? "text-black/80" : "text-white/80"}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => scrollTo("contact")}
                className={`mt-8 w-full h-11 rounded-full font-[Space_Grotesk] text-[12px] tracking-[0.08em] font-bold transition-colors ${pkg.featured ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"}`}
              >
                {pkg.cta}
              </button>

              <div className={`mt-3 text-center font-[JetBrains_Mono] text-[11px] ${pkg.featured ? "text-black/40" : "text-white/30"}`}>30-DAY OUT · NO QUESTIONS</div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center font-[JetBrains_Mono] text-[11px] tracking-wide text-white/30">
          All plans include the audit and one-page blueprint. Ex VAT. <button onClick={() => scrollTo("contact")} className="underline decoration-white/20 underline-offset-4 hover:decoration-[#D6FF33] text-white/60">Need something specific?</button>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[1280px] px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-[360px_1fr] gap-10 border-t border-white/5 pt-12">
          <div>
            <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-white/30">05 — FAQ</div>
            <h3 className="mt-3 font-[Space_Grotesk] text-[30px] leading-none tracking-[-0.02em] font-bold">Direct answers.</h3>
            <p className="mt-3 text-[13.5px] leading-6 text-white/50">If it is not here, we will answer it on the audit — plainly, in minutes.</p>
            <button onClick={() => scrollTo("contact")} className="mt-6 hidden lg:inline-flex items-center gap-2 border border-white/10 px-5 h-9 rounded-full font-[JetBrains_Mono] text-xs font-medium hover:bg-white hover:text-black hover:border-white transition-colors text-white">
              Ask anything <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden bg-[#111113]">
            {faqs.map((f, i) => (
              <div key={f.q} className="group">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between gap-6 p-5 sm:p-6 text-left hover:bg-white/[0.03] transition-colors"
                >
                  <span className="font-[Space_Grotesk] text-[14px] font-bold leading-6 pr-4">{f.q}</span>
                  <span className={`h-7 w-7 grid place-items-center rounded-full border shrink-0 transition-colors ${faqOpen === i ? "bg-[#D6FF33] text-black border-[#D6FF33]" : "border-white/10 bg-white/[0.04] text-white/60"}`}>
                    {faqOpen === i ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 text-[13.5px] leading-6 text-white/50 max-w-[640px]">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10">
          <div className="bg-[#D6FF33] text-black rounded-[24px] p-7 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-black/[0.06] blur-2xl" />
            <div className="absolute bottom-0 right-0 opacity-[0.04] font-[JetBrains_Mono] text-[120px] leading-none font-bold tracking-tighter hidden lg:block">QRAFT</div>
            <div className="font-[JetBrains_Mono] text-[11px] tracking-[0.16em] text-black/50">06 — BUILD</div>
            <h2 className="mt-4 font-[Space_Grotesk] text-[36px] sm:text-[44px] leading-[0.9] tracking-[-0.03em] font-bold">
              Make your
              <br />
              <span className="font-[Instrument_Serif] font-normal italic text-black/50">customers count.</span>
            </h2>
            <p className="mt-4 text-[14px] leading-6 text-black/60 max-w-[420px]">
              Twenty minutes. We audit your customer system, show you the leak, and leave you with a one-page blueprint — even if you never work with us. Open to all.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="h-8 w-8 grid place-items-center rounded-full bg-black text-[#D6FF33]"><Clock className="h-4 w-4" /></span>
                <div>
                  <div className="font-[Space_Grotesk] text-sm font-bold">Two build slots this week</div>
                  <div className="font-[JetBrains_Mono] text-xs text-black/60">Tue & Thu · 20 minutes · Meet or in-store</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="h-8 w-8 grid place-items-center rounded-full bg-black text-[#D6FF33]"><Terminal className="h-4 w-4" /></span>
                <div>
                  <div className="font-[Space_Grotesk] text-sm font-bold">We plug into your stack</div>
                  <div className="font-[JetBrains_Mono] text-xs text-black/60">Maps, site, booking, reviews — we handle integration.</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 font-[JetBrains_Mono] text-[11px] font-medium">
              <span className="border border-black/10 rounded-full px-3 py-1.5 bg-black/[0.04]">No deck</span>
              <span className="border border-black/10 rounded-full px-3 py-1.5 bg-black/[0.04]">No jargon</span>
              <span className="border border-black/10 rounded-full px-3 py-1.5 bg-black/[0.04]">Built for customers</span>
            </div>

            <div className="mt-10 pt-6 border-t border-black/10 flex items-center gap-3 font-[JetBrains_Mono] text-xs text-black/50">
              <span>Direct</span>
              <a href="mailto:hello@qraft.build" className="text-black font-bold underline decoration-black/20 underline-offset-4">
                hello@qraft.build
              </a>
            </div>
          </div>

          <div className="bg-[#111113] border border-white/10 rounded-[24px] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-[Space_Grotesk] text-[15px] font-bold tracking-tight">Start your build</h3>
              <span className="font-[JetBrains_Mono] text-[11px] tracking-wide text-white/30 border border-white/10 rounded-full px-2.5 py-1">2 MIN · OPEN TO ALL</span>
            </div>

            {sent ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-white/[0.04] border border-white/10 rounded-2xl p-8 text-center">
                <div className="h-10 w-10 mx-auto grid place-items-center rounded-full bg-[#D6FF33] text-black">
                  <Check className="h-5 w-5" />
                </div>
                <div className="mt-4 font-[Space_Grotesk] text-[16px] font-bold">Build request received.</div>
                <div className="mt-2 text-[13px] leading-5 text-white/50">
                  We will email you within hours with times. In a hurry? Write to hello@qraft.build — we reply the same day.
                </div>
                <button onClick={() => setSent(false)} className="mt-5 font-[JetBrains_Mono] text-xs underline decoration-white/20 underline-offset-4 text-white/60">
                  Send another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <span className="font-[JetBrains_Mono] text-[11px] tracking-[0.08em] font-medium text-white/60">YOUR NAME</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Alex Morgan"
                      className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#D6FF33]/40 focus:bg-white/[0.06] transition-colors text-white"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="font-[JetBrains_Mono] text-[11px] tracking-[0.08em] font-medium text-white/60">BUSINESS</span>
                    <input
                      value={form.business}
                      onChange={(e) => setForm({ ...form, business: e.target.value })}
                      placeholder="Lumière — Café"
                      className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#D6FF33]/40 focus:bg-white/[0.06] transition-colors text-white"
                    />
                  </label>
                </div>

                <label className="space-y-1.5 block">
                  <span className="font-[JetBrains_Mono] text-[11px] tracking-[0.08em] font-medium text-white/60">WORK EMAIL</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="alex@lumiere.cafe"
                    className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#D6FF33]/40 focus:bg-white/[0.06] transition-colors text-white"
                  />
                </label>

                <label className="space-y-1.5 block">
                  <span className="font-[JetBrains_Mono] text-[11px] tracking-[0.08em] font-medium text-white/60">CUSTOMER GOAL — optional</span>
                  <textarea
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    placeholder="e.g. ‘We serve customers well on weekends but need more of them Tue–Thu.’"
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#D6FF33]/40 focus:bg-white/[0.06] transition-colors resize-none text-white"
                  />
                </label>

                <div className="flex items-center gap-2 font-[JetBrains_Mono] text-[11px] text-white/30">
                  <Check className="h-3 w-3 text-[#D6FF33]" /> Reply within hours. No newsletter unless you ask. Access is open to all.
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#D6FF33] text-black font-[Space_Grotesk] text-[13px] tracking-[0.02em] font-bold hover:bg-[#E0FF66] transition-colors flex items-center justify-center gap-2"
                >
                  REQUEST AUDIT — FREE <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center font-[JetBrains_Mono] text-[11px] text-white/30">Or <button type="button" onClick={() => navigate("/auth")} className="underline decoration-white/20 underline-offset-4 hover:decoration-[#D6FF33] text-white/60">sign in</button> to manage your build</div>
              </form>
            )}

            <div className="mt-6 flex items-center gap-2 font-[JetBrains_Mono] text-[11px] text-white/25 border-t border-white/5 pt-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Avg. reply: 3 hours · Mon–Fri, 09:00–18:00
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#08080A]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-[8px] bg-white text-black grid place-items-center">
                  <span className="font-[Space_Grotesk] text-[11px] font-bold">Q</span>
                </div>
                <span className="font-[Space_Grotesk] text-[13px] tracking-[-0.02em] font-bold">QRAFT</span>
                <span className="font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/30 border-l border-white/10 pl-3 ml-1">PERFECTION BUILDS BRANDS</span>
                <span className="font-[JetBrains_Mono] text-[11px] tracking-wide text-white/20 ml-2">© {new Date().getFullYear()}</span>
              </div>
              <div className="mt-3 max-w-[460px] text-[12.5px] leading-5 text-white/40">
                QRAFT is a technical marketing system for businesses that put customers first. Premium, serious, and auditable — we build brands the way engineers build products.
              </div>
              <div className="mt-4 flex gap-2 font-[JetBrains_Mono] text-[10px] tracking-[0.1em] text-white/25">
                <span className="border border-white/10 rounded-full px-2.5 py-1">SERIOUS</span>
                <span className="border border-white/10 rounded-full px-2.5 py-1">DARK</span>
                <span className="border border-white/10 rounded-full px-2.5 py-1">TECHNICAL</span>
                <span className="bg-[#D6FF33] text-black rounded-full px-2.5 py-1 font-bold">BOLD</span>
              </div>
            </div>

            <div className="flex gap-10 sm:gap-16 font-[JetBrains_Mono] text-[12px]">
              <div>
                <div className="tracking-[0.12em] font-bold text-white/30 text-[11px]">SYSTEM</div>
                <div className="mt-3 space-y-1.5 text-white/60">
                  <div>London — Shoreditch</div>
                  <div>Paris — Le Marais</div>
                  <a href="mailto:hello@qraft.build" className="block hover:text-white">hello@qraft.build</a>
                </div>
              </div>
              <div>
                <div className="tracking-[0.12em] font-bold text-white/30 text-[11px]">INDEX</div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <button onClick={() => scrollTo("services")} className="text-left hover:text-white text-white/60">System</button>
                  <button onClick={() => scrollTo("results")} className="text-left hover:text-white text-white/60">Proof</button>
                  <button onClick={() => scrollTo("process")} className="text-left hover:text-white text-white/60">Process</button>
                  <button onClick={() => navigate("/auth")} className="text-left hover:text-white text-white/60">Sign in</button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 pt-6 font-[JetBrains_Mono] text-[11px] tracking-wide text-white/25">
            <div className="flex items-center gap-2">
              <span>QRAFT.BUILD</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>ALL SYSTEMS OPEN · BUILT FOR EVERY CUSTOMER</span>
            </div>
            <div className="flex gap-4">
              <span>Privacy — minimal</span>
              <span className="hidden sm:inline">·</span>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
