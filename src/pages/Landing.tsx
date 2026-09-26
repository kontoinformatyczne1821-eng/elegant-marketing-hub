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
  MapPin,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

// ——— data ———
const services = [
  {
    n: "01",
    title: "Brand & Identity",
    desc: "A clear, memorable identity that makes you the obvious choice on your street.",
    points: ["Positioning & naming", "Visual identity & signage", "Menu / collateral system"],
  },
  {
    n: "02",
    title: "Website & Presence",
    desc: "Fast, elegant sites that turn searches and strolls into bookings.",
    points: ["Editorial website", "Google Business & maps", "Booking & ordering flow"],
  },
  {
    n: "03",
    title: "Local Growth",
    desc: "Campaigns built for neighbourhood radius, not vanity metrics.",
    points: ["Local SEO & Maps pack", "Neighbourhood paid search", "Community partnerships"],
  },
  {
    n: "04",
    title: "Content & Image",
    desc: "Photography and film that makes your craft tangible — before they walk in.",
    points: ["Art direction & shoots", "Short film / Reels", "Menu & product stills"],
  },
  {
    n: "05",
    title: "Campaigns that Convert",
    desc: "Offers and launches engineered to fill the week, not just the weekend.",
    points: ["Seasonal calendars", "Email & SMS — restrained", "In-store to online loop"],
  },
  {
    n: "06",
    title: "Retention & Reviews",
    desc: "The quiet work that compounds: regulars, referrals, and five-star momentum.",
    points: ["Review system", "Loyalty & CRM", "Reporting in plain English"],
  },
];

const results = [
  {
    name: "Atelier Lumière — Café & Bakery",
    loc: "West Village · Local café",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop",
    stat: "+187%",
    statLabel: "footfall in 90 days",
    detail: "Rebrand, window & menu system, Maps dominance for “bakery near me”. From page 2 to top 3.",
    tags: ["Brand", "Local SEO", "Photography"],
  },
  {
    name: "Form — Pilates Studio",
    loc: "Notting Hill · Wellness",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop",
    stat: "2.4×",
    statLabel: "membership enquiries",
    detail: "New site + intro offer funnel. £14 CAC, 68% trial-to-member. Fully booked mornings.",
    tags: ["Website", "Campaigns", "CRM"],
  },
  {
    name: "Marlowe — Neighbourhood Restaurant",
    loc: "Shoreditch · 32 covers",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop",
    stat: "41%",
    statLabel: "more mid-week covers",
    detail: "Mid-week series: set menu, creator dinners, list building. Email now drives 22% of revenue.",
    tags: ["Content", "Email", "Partnerships"],
  },
];

const packages = [
  {
    name: "Essential",
    price: "1,900",
    cadence: "/ month",
    for: "For steady hands — you need to be found and trusted.",
    features: ["Brand tidy & signage guidance", "Website care + Maps optimisation", "1 shoot / quarter", "Monthly report, no jargon"],
    cta: "Start Essential",
    featured: false,
  },
  {
    name: "Growth",
    price: "3,800",
    cadence: "/ month",
    for: "Our most chosen. Built to fill the calendar.",
    features: [
      "Everything in Essential",
      "Local SEO + paid within 3km",
      "Campaign & content calendar",
      "Email / SMS & review engine",
      "Bi-weekly strategy call",
    ],
    cta: "Start Growth",
    featured: true,
  },
  {
    name: "Atelier",
    price: "Custom",
    cadence: "",
    for: "For openings, rebrands, multi-site. A dedicated atelier.",
    features: ["Brand & space from scratch", "Film & photography suite", "Launch campaign & PR", "On-site team, weekly"],
    cta: "Enquire",
    featured: false,
  },
];

const faqs = [
  {
    q: "Do you only work with local businesses?",
    a: "Yes. We specialise in businesses where place matters — cafés, restaurants, studios, clinics, boutiques, trades. If your customers find you by neighbourhood, we are built for you.",
  },
  {
    q: "How quickly will we see results?",
    a: "Maps and presence fixes often show in 2–4 weeks. Paid and campaign lift in 30–60 days. Full brand and content compounds over a quarter. We report weekly, in plain numbers.",
  },
  {
    q: "Do we need to commit for a year?",
    a: "No. Month-to-month after an initial 90-day sprint. We earn retention. Most clients stay 14+ months because neighbourhood growth compounds.",
  },
  {
    q: "What do you need from us to start?",
    a: "90 minutes for an audit, access to your Google Business, site, and booking system, and a point of contact. We handle the rest — shoots, copy, build, and reporting.",
  },
  {
    q: "Do you shoot and write everything?",
    a: "Yes. Art direction, photography, film, and copy are included in Growth and Atelier. We work on-site, minimally disruptive, and leave you with a full asset library.",
  },
];

const testimonials = [
  {
    quote: "We went from quiet Tuesdays to a waitlist. They understood our street, our regulars, our margins — and built marketing around that, not vanity metrics.",
    name: "Sofia Leclerc",
    role: "Owner, Lumière",
  },
  {
    quote: "Finally an agency that speaks like a shop owner. No dashboards we don't need. Just more bookings, better reviews, and a site we're proud of.",
    name: "James Park",
    role: "Founder, Form Pilates",
  },
  {
    quote: "Our mid-week is now our strongest. The campaign calendar alone paid for the retainer three times over.",
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
    <div className="min-h-screen bg-[#FCFCFB] text-[#111110] antialiased selection:bg-black selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;1,6..72,300&display=swap');`}</style>

      {/* Top hairline */}
      <div className="h-[1px] w-full bg-black/[0.08]" />

      {/* NAV */}
      <header className="sticky top-0 z-40 bg-[#FCFCFB]/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full border border-black/15 flex items-center justify-center">
                <span className="text-[11px] tracking-[0.18em] font-medium">N—</span>
              </div>
              <span className="hidden sm:inline text-[13px] tracking-[0.18em] font-medium">NORD ATELIER</span>
              <span className="hidden sm:inline text-[10px] tracking-[0.14em] text-black/40 border-l border-black/10 pl-3 ml-1">
                LOCAL MARKETING
              </span>
            </button>

            <nav className="hidden lg:flex items-center gap-7 text-[12px] tracking-[0.12em] font-medium text-black/60">
              <button onClick={() => scrollTo("services")} className="hover:text-black transition-colors py-2">
                SERVICES
              </button>
              <button onClick={() => scrollTo("results")} className="hover:text-black transition-colors py-2">
                RESULTS
              </button>
              <button onClick={() => scrollTo("process")} className="hover:text-black transition-colors py-2">
                PROCESS
              </button>
              <button onClick={() => scrollTo("pricing")} className="hover:text-black transition-colors py-2">
                PRICING
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-[11px] text-black/50">
              <MapPin className="h-3 w-3" /> <span className="tracking-wide">London · Paris · Remote</span>
            </div>
            <button
              onClick={() => scrollTo("contact")}
              className="hidden sm:inline-flex items-center gap-2 bg-black text-white text-[12px] tracking-[0.1em] font-medium px-5 h-9 rounded-full hover:bg-black/90 transition-colors"
            >
              START A PROJECT <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden h-9 w-9 grid place-items-center rounded-full border border-black/10"
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
              className="lg:hidden border-t border-black/5 bg-white"
            >
              <div className="px-6 py-6 flex flex-col gap-1">
                {[
                  ["Services", "services"],
                  ["Results", "results"],
                  ["Process", "process"],
                  ["Pricing", "pricing"],
                  ["Contact", "contact"],
                ].map(([label, id]) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="text-left py-3 text-sm tracking-[0.12em] font-medium border-b border-black/[0.04] last:border-0"
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => navigate("/auth")}
                  className="mt-4 w-full bg-black text-white py-3.5 rounded-full text-sm tracking-wide font-medium"
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
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-12 pt-10 lg:pt-16 pb-10 lg:pb-12 items-start">
          {/* left copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 border border-black/10 rounded-full px-3 py-1.5 bg-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
              <span className="text-[11px] tracking-[0.14em] font-medium">FOR AMBITIOUS LOCAL BUSINESSES</span>
              <span className="hidden sm:inline text-[11px] text-black/40">— Cafés · Studios · Clinics · Boutiques</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.6 }}
              className="mt-6 font-[Instrument_Serif] text-[44px] sm:text-[56px] lg:text-[74px] leading-[0.92] tracking-[-0.03em] font-normal"
            >
              <span className="block font-light italic text-black/70 text-[32px] sm:text-[40px] lg:text-[52px] tracking-[-0.02em]">
                Premium & elegant
              </span>
              <span className="block">marketing that</span>
              <span className="block">
                makes your{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">street</span>
                  <span className="absolute left-0 right-0 bottom-[0.18em] h-[0.32em] bg-black/10" />
                </span>
              </span>
              <span className="block">the main street —</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.6 }}
              className="mt-6 max-w-[560px] text-[15px] leading-7 text-black/60 font-[Inter]"
            >
              Nord Atelier is a boutique marketing atelier for local businesses who care about craft. We lead with{" "}
              <span className="text-black font-medium">services + measurable results</span> — brand, presence, and campaigns built to fill rooms, lists, and till.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={() => scrollTo("contact")}
                className="inline-flex items-center gap-2 bg-black text-white px-7 h-[46px] rounded-full text-[13px] tracking-[0.06em] font-medium hover:bg-black/90 transition"
              >
                BOOK A 20-MIN AUDIT <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollTo("results")}
                className="inline-flex items-center gap-2 bg-white border border-black/10 px-7 h-[46px] rounded-full text-[13px] tracking-[0.06em] font-medium hover:bg-black/[0.02] transition"
              >
                SEE RESULTS <span className="h-5 w-5 grid place-items-center rounded-full border border-black/10"><ArrowUpRight className="h-3 w-3" /></span>
              </button>
            </motion.div>

            <div className="mt-8 flex flex-wrap gap-6 border-t border-black/5 pt-6">
              {[
                ["340+", "local businesses grown"],
                ["4.9/5", "average review score"],
                ["14 mo", "average partnership"],
              ].map(([v, l]) => (
                <div key={v} className="flex items-baseline gap-2">
                  <span className="text-[18px] font-medium tracking-tight">{v}</span>
                  <span className="text-[11px] tracking-[0.08em] text-black/50">{l}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3 text-[11px] tracking-[0.1em] text-black/40">
              <span className="h-px w-10 bg-black/10" /> EST. 2018 · INDEPENDENT ATELIER
            </div>
          </div>

          {/* right visual */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative lg:sticky lg:top-[84px]"
          >
            <div className="bg-white border border-black/10 rounded-[24px] p-3 sm:p-4 shadow-[0_24px_64px_rgba(0,0,0,0.08)]">
              <div className="rounded-[16px] overflow-hidden bg-[#F6F6F3] border border-black/[0.06]">
                <div className="aspect-[4/2.6] relative">
                  <img
                    src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000&q=80&auto=format&fit=crop"
                    alt="Minimal café interior"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-2 text-[11px] font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> LIVE · Lumière — Today
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-white rounded-[14px] p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] tracking-[0.1em] text-black/50">FOOTFALL · 90 DAYS</div>
                      <div className="text-[22px] font-medium leading-none mt-1">+187% <span className="text-[11px] font-normal text-emerald-600">▲ vs previous</span></div>
                    </div>
                    <div className="h-10 w-[84px] flex items-end gap-[2px]">
                      {[3, 5, 4, 7, 5, 8, 6, 9, 7, 11].map((h, i) => (
                        <div key={i} className="flex-1 bg-black rounded-t-sm" style={{ height: `${h * 3.6}px` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-black/5">
                  {[
                    ["#1", "Maps for 'bakery near me'"],
                    ["2.4×", "enquiries / week"],
                    ["+41%", "mid-week covers"],
                  ].map(([k, v]) => (
                    <div key={k} className="px-4 py-4 text-center">
                      <div className="text-[16px] font-medium tracking-tight">{k}</div>
                      <div className="text-[10px] leading-3 tracking-[0.06em] text-black/50 mt-1">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                <div className="bg-[#0F0F0F] text-white rounded-[14px] px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] tracking-[0.14em] text-white/60">NEXT AVAILABILITY</div>
                    <div className="text-sm font-medium mt-0.5">Two audit slots this week</div>
                  </div>
                  <button onClick={() => scrollTo("contact")} className="h-8 w-8 grid place-items-center rounded-full bg-white text-black">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="hidden sm:flex bg-white border border-black/10 rounded-[14px] px-3 items-center gap-2 text-[11px] font-medium">
                  <Clock className="h-3.5 w-3.5 text-black/50" /> 20 min · No pitch deck
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-black/50">
              <Sparkles className="h-3 w-3" /> Real client dashboard — updated weekly. No vanity metrics.
            </div>
          </motion.div>
        </div>

        {/* Trust strip */}
        <div className="border-y border-black/[0.06] py-5 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="text-[11px] tracking-[0.14em] font-medium text-black/40 shrink-0">TRUSTED BY LOCAL FAVOURITES —</div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] tracking-[0.06em] font-medium text-black/70">
            <span>LUMIÈRE</span> <span className="h-px w-4 bg-black/10 hidden sm:block" />
            <span>FORM PILATES</span> <span className="h-px w-4 bg-black/10 hidden sm:block" />
            <span>MARLOWE</span> <span className="h-px w-4 bg-black/10 hidden sm:block" />
            <span>ATELIER FLEUR</span> <span className="h-px w-4 bg-black/10 hidden sm:block" />
            <span>GOOD ROOM</span>
            <span className="ml-auto text-[11px] tracking-normal font-normal text-black/40 hidden lg:inline">and 340+ neighbourhood businesses</span>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black/5 pb-8">
          <div>
            <div className="text-[11px] tracking-[0.16em] font-medium text-black/40">01 — SERVICES</div>
            <h2 className="mt-3 font-[Instrument_Serif] text-[36px] sm:text-[44px] leading-[0.95] tracking-[-0.02em]">
              Everything you need. <br />
              <span className="italic font-light text-black/60">Nothing you don’t.</span>
            </h2>
          </div>
          <p className="max-w-[420px] text-[14px] leading-6 text-black/60">
            Six disciplined services. Pick one or run them as a system. Every engagement starts with a 20-minute audit — we show you exactly where growth is hiding.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-black/[0.06] border border-black/[0.06] rounded-[20px] overflow-hidden">
          {services.map((s) => (
            <div key={s.n} className="bg-white p-7 sm:p-8 group hover:bg-[#FCFCFB] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-[0.14em] font-medium text-black/30">{s.n}</span>
                <span className="h-6 w-6 grid place-items-center rounded-full border border-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
              <h3 className="mt-4 text-[18px] font-medium tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[13.5px] leading-6 text-black/60">{s.desc}</p>
              <ul className="mt-5 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-[12px] text-black/70">
                    <Minus className="h-3 w-3 text-black/20" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-[12px]">
          <span className="text-black/50">Not sure where to start?</span>
          <button onClick={() => scrollTo("contact")} className="underline decoration-black/20 underline-offset-4 hover:decoration-black font-medium">
            Take the 3-question audit →
          </button>
          <span className="ml-auto hidden sm:inline-flex items-center gap-2 border border-black/10 rounded-full px-3 py-1.5 bg-white text-[11px] tracking-wide">
            <Check className="h-3 w-3" /> No retainers for audits · Flat-fee sprints available
          </span>
        </div>
      </section>

      {/* RESULTS */}
      <section id="results" className="bg-[#0F0F0F] text-white mt-4">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 border border-white/15 rounded-full px-3 py-1">
                <TrendingUp className="h-3 w-3" /> <span className="text-[11px] tracking-[0.14em]">02 — RESULTS</span>
              </div>
              <h2 className="mt-4 font-[Instrument_Serif] text-[36px] sm:text-[48px] leading-[0.9] tracking-[-0.02em]">
                Services mean nothing <br />
                <span className="italic font-light text-white/60">without proof.</span>
              </h2>
            </div>
            <div className="lg:text-right">
              <div className="grid grid-cols-3 gap-6 lg:gap-10 border-t lg:border-t-0 border-white/10 pt-6 lg:pt-0">
                {[
                  ["+187%", "avg footfall lift (90d)"],
                  ["£14", "avg cost per new customer"],
                  ["22%", "of revenue from owned list"],
                ].map(([k, l]) => (
                  <div key={k}>
                    <div className="text-[28px] font-light tracking-tight">{k}</div>
                    <div className="text-[11px] tracking-wide text-white/50">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 hidden lg:block text-[11px] tracking-[0.1em] text-white/40">FIGURES FROM LAST 12 MONTHS · N= 86 LOCAL CLIENTS</div>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {results.map((r) => (
              <div key={r.name} className="bg-white text-black rounded-[18px] overflow-hidden group">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={r.image} alt={r.name} className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-700" />
                  <div className="absolute top-3 left-3 bg-black text-white rounded-full px-3 py-1 text-[11px] tracking-wide">
                    {r.stat} {r.statLabel}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[12px] tracking-[0.08em] font-medium text-black/50">{r.loc}</div>
                  <div className="mt-1 text-[15px] font-medium leading-tight">{r.name}</div>
                  <p className="mt-2 text-[13px] leading-5 text-black/60">{r.detail}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {r.tags.map((t) => (
                      <span key={t} className="text-[10px] tracking-[0.08em] border border-black/10 rounded-full px-2 py-1">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="text-sm text-white/70">Full case studies with P&L impact — shared on the audit call.</div>
            <button onClick={() => scrollTo("contact")} className="inline-flex items-center gap-2 bg-white text-black px-6 h-10 rounded-full text-[12px] tracking-[0.08em] font-medium hover:bg-white/90 transition">
              REQUEST CASE BOOK <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[380px_1fr] gap-10">
          <div className="lg:sticky lg:top-[88px] self-start">
            <div className="text-[11px] tracking-[0.16em] font-medium text-black/40">03 — PROCESS</div>
            <h2 className="mt-3 font-[Instrument_Serif] text-[38px] leading-[0.95] tracking-[-0.02em]">
              Four weeks to <br />
              <span className="italic font-light text-black/60">momentum.</span>
            </h2>
            <p className="mt-4 text-[14px] leading-6 text-black/60">
              No big reveals. We work in the open, on-site when needed, with a weekly scoreboard you’ll actually understand.
            </p>
            <button onClick={() => scrollTo("contact")} className="mt-6 inline-flex items-center gap-2 border border-black/10 px-5 h-10 rounded-full text-[12px] tracking-wide font-medium bg-white hover:bg-black hover:text-white hover:border-black transition-colors">
              See a sample scoreboard <ArrowUpRight className="h-3.5 w-3.5" />
            </button>

            <div className="mt-8 hidden lg:block border border-black/5 rounded-2xl p-4 bg-white">
              <div className="text-[11px] tracking-[0.1em] text-black/40">SCOREBOARD PREVIEW</div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#F6F6F3] rounded-xl py-3">
                  <div className="text-xs text-black/50">Enquiries</div>
                  <div className="text-lg font-medium">+34</div>
                  <div className="text-[10px] text-emerald-600">▲ 18% WoW</div>
                </div>
                <div className="bg-[#F6F6F3] rounded-xl py-3">
                  <div className="text-xs text-black/50">Maps views</div>
                  <div className="text-lg font-medium">12.4k</div>
                  <div className="text-[10px] text-emerald-600">▲ 9% WoW</div>
                </div>
                <div className="bg-black text-white rounded-xl py-3">
                  <div className="text-xs text-white/60">Revenue tie</div>
                  <div className="text-lg font-medium">£8.2k</div>
                  <div className="text-[10px] text-white/60">from list + maps</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-black/10 hidden sm:block" />
            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Audit — 20 minutes",
                  desc: "We map your street: search, maps, site, reviews, and walk-in. You get a scored sheet and the one lever to pull first.",
                  meta: "On call or in-store · No prep needed",
                },
                {
                  step: "02",
                  title: "Strategy — one page",
                  desc: "One page, not a deck. Positioning, offer, calendar, and channel plan for your radius. You approve or we refine — same day.",
                  meta: "Fixed price · 72-hour turnaround",
                },
                {
                  step: "03",
                  title: "Craft — make it real",
                  desc: "Identity, site, signage, and shoot. We build in public, with sign-offs that take minutes, not meetings.",
                  meta: "2–3 weeks · On-site shoots",
                },
                {
                  step: "04",
                  title: "Grow — weekly scoreboard",
                  desc: "Launch, learn, and compound. Campaigns, list, and reviews — reported every Monday in plain English and pounds.",
                  meta: "Month-to-month · 90-day sprint to start",
                },
              ].map((s) => (
                <div key={s.step} className="relative flex gap-4 sm:gap-6 group">
                  <div className="hidden sm:grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black text-white text-[11px] font-medium z-10">
                    {s.step}
                  </div>
                  <div className="flex-1 bg-white border border-black/5 rounded-[16px] p-6 hover:border-black/10 transition-colors">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[16px] font-medium">{s.title}</h3>
                      <span className="hidden sm:inline text-[11px] tracking-wide text-black/40 border border-black/10 rounded-full px-2 py-1">
                        {s.meta}
                      </span>
                    </div>
                    <p className="mt-2 text-[13.5px] leading-6 text-black/60">{s.desc}</p>
                    <div className="sm:hidden mt-3 text-[11px] text-black/40">{s.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-center justify-between">
            <div className="text-[11px] tracking-[0.16em] font-medium text-black/40">VOICES — LOCAL OWNERS</div>
            <div className="flex gap-1">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all ${i === activeTestimonial ? "w-6 bg-black" : "w-1.5 bg-black/15"}`}
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
                  <Quote className="h-6 w-6 text-black/10" />
                  <p className="mt-4 font-[Instrument_Serif] text-[26px] sm:text-[30px] leading-[1.15] tracking-[-0.01em]">
                    “{testimonials[activeTestimonial].quote}”
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-black text-white grid place-items-center text-xs font-medium">
                      {testimonials[activeTestimonial].name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{testimonials[activeTestimonial].name}</div>
                      <div className="text-xs text-black/50">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="bg-[#F6F6F3] rounded-[20px] p-6 border border-black/5">
              <div className="text-[11px] tracking-[0.1em] text-black/40">WHAT OWNERS SAY MOST</div>
              <ul className="mt-4 space-y-3 text-[13.5px] leading-6 text-black/70">
                <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-black/40" /> “They treat our margins like their own.”</li>
                <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-black/40" /> “Reports I can read in 60 seconds.”</li>
                <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-black/40" /> “Shoot day was seamless. Assets we still use a year later.”</li>
              </ul>
              <div className="mt-6 flex gap-2">
                <button onClick={() => setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length)} className="h-9 w-9 grid place-items-center rounded-full border border-black/10 bg-white hover:bg-black hover:text-white transition-colors">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
                <button onClick={() => setActiveTestimonial((p) => (p + 1) % testimonials.length)} className="h-9 w-9 grid place-items-center rounded-full bg-black text-white hover:bg-black/90 transition-colors">
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
          <div className="text-[11px] tracking-[0.16em] font-medium text-black/40">04 — PRICING</div>
          <h2 className="mt-3 font-[Instrument_Serif] text-[36px] sm:text-[44px] leading-none tracking-[-0.02em]">Simple, calm pricing.</h2>
          <p className="mt-3 text-[14px] leading-6 text-black/60">
            Month-to-month. No lock-in after the 90-day sprint. Choose the level of atelier you need.
          </p>
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`rounded-[20px] border p-7 flex flex-col ${pkg.featured ? "bg-black text-white border-black shadow-[0_20px_60px_rgba(0,0,0,0.18)] lg:scale-[1.02]" : "bg-white border-black/10"}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] tracking-[0.14em] font-medium opacity-60">{pkg.name.toUpperCase()}</div>
                {pkg.featured && <span className="text-[11px] tracking-wide bg-white text-black rounded-full px-2.5 py-1 font-medium">Most chosen</span>}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                {pkg.price === "Custom" ? (
                  <span className="text-[32px] font-light tracking-tight">Custom</span>
                ) : (
                  <>
                    <span className="text-[13px] opacity-60">£</span>
                    <span className="text-[32px] font-light tracking-tight">{pkg.price}</span>
                    <span className="text-[13px] opacity-60">{pkg.cadence}</span>
                  </>
                )}
              </div>
              <div className={`mt-2 text-[13px] leading-5 ${pkg.featured ? "text-white/70" : "text-black/60"}`}>{pkg.for}</div>

              <ul className="mt-6 space-y-3 flex-1">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[13px]">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${pkg.featured ? "text-white/60" : "text-black/30"}`} />
                    <span className={pkg.featured ? "text-white/90" : "text-black/70"}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => scrollTo("contact")}
                className={`mt-8 w-full h-11 rounded-full text-[12px] tracking-[0.08em] font-medium transition-colors ${pkg.featured ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"}`}
              >
                {pkg.cta}
              </button>

              <div className={`mt-3 text-center text-[11px] ${pkg.featured ? "text-white/50" : "text-black/40"}`}>30-day out · No questions asked</div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-[11px] tracking-wide text-black/40">
          All packages include the 20-minute audit and one-page strategy. VAT where applicable. <button onClick={() => scrollTo("contact")} className="underline decoration-black/20 underline-offset-4">Need something bespoke?</button>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[1280px] px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-[360px_1fr] gap-10 border-t border-black/5 pt-12">
          <div>
            <div className="text-[11px] tracking-[0.16em] font-medium text-black/40">05 — FAQ</div>
            <h3 className="mt-3 font-[Instrument_Serif] text-[30px] leading-none tracking-[-0.01em]">Straight answers.</h3>
            <p className="mt-3 text-[13.5px] leading-6 text-black/60">If it’s not here, ask on the audit call — we’ll answer in plain English.</p>
            <button onClick={() => scrollTo("contact")} className="mt-6 hidden lg:inline-flex items-center gap-2 border border-black/10 px-5 h-9 rounded-full text-xs font-medium hover:bg-black hover:text-white hover:border-black transition-colors">
              Ask a question <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-black/5 border border-black/5 rounded-2xl overflow-hidden bg-white">
            {faqs.map((f, i) => (
              <div key={f.q} className="group">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between gap-6 p-5 sm:p-6 text-left hover:bg-black/[0.01] transition-colors"
                >
                  <span className="text-[14px] font-medium leading-6 pr-4">{f.q}</span>
                  <span className={`h-7 w-7 grid place-items-center rounded-full border shrink-0 transition-colors ${faqOpen === i ? "bg-black text-white border-black" : "border-black/10 bg-white"}`}>
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
                      <div className="px-5 sm:px-6 pb-6 text-[13.5px] leading-6 text-black/60 max-w-[640px]">{f.a}</div>
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
          <div className="bg-black text-white rounded-[24px] p-7 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/[0.06] blur-3xl" />
            <div className="text-[11px] tracking-[0.16em] text-white/50">06 — START</div>
            <h2 className="mt-4 font-[Instrument_Serif] text-[36px] sm:text-[44px] leading-[0.9] tracking-[-0.02em]">
              Let’s make your <br />
              <span className="italic font-light text-white/60">street famous.</span>
            </h2>
            <p className="mt-4 text-[14px] leading-6 text-white/60 max-w-[420px]">
              20 minutes. We audit your presence, show you the gap, and leave you with a one-page plan — even if you don’t hire us.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="h-8 w-8 grid place-items-center rounded-full bg-white/10 border border-white/10"><Clock className="h-4 w-4" /></span>
                <div>
                  <div className="text-sm font-medium">Two slots this week</div>
                  <div className="text-xs text-white/60">Tue & Thu · 20 minutes · Google Meet or in-store</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="h-8 w-8 grid place-items-center rounded-full bg-white/10 border border-white/10"><MapPin className="h-4 w-4" /></span>
                <div>
                  <div className="text-sm font-medium">We come to you</div>
                  <div className="text-xs text-white/60">London zones 1–3 on request. Otherwise remote, beautifully run.</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-[11px]">
              <span className="border border-white/15 rounded-full px-3 py-1.5 bg-white/5">No deck</span>
              <span className="border border-white/15 rounded-full px-3 py-1.5 bg-white/5">No jargon</span>
              <span className="border border-white/15 rounded-full px-3 py-1.5 bg-white/5">Plain-English report</span>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex items-center gap-3 text-xs text-white/50">
              <span>Or email directly</span>
              <a href="mailto:hello@nordatelier.studio" className="text-white underline decoration-white/20 underline-offset-4">
                hello@nordatelier.studio
              </a>
            </div>
          </div>

          <div className="bg-white border border-black/10 rounded-[24px] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-medium tracking-tight">Book your 20-minute audit</h3>
              <span className="text-[11px] tracking-wide text-black/40 border border-black/10 rounded-full px-2.5 py-1">2 min · No spam</span>
            </div>

            {sent ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-[#F6F6F3] border border-black/5 rounded-2xl p-8 text-center">
                <div className="h-10 w-10 mx-auto grid place-items-center rounded-full bg-black text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[16px] font-medium">You’re on the list.</div>
                <div className="mt-2 text-[13px] leading-5 text-black/60">
                  We’ll email you within a few hours with times. If you’re in a hurry, write to hello@nordatelier.studio.
                </div>
                <button onClick={() => setSent(false)} className="mt-5 text-xs underline decoration-black/20 underline-offset-4">
                  Send another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <span className="text-[11px] tracking-[0.08em] font-medium text-black/60">YOUR NAME</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Alex Morgan"
                      className="w-full h-11 rounded-xl border border-black/10 bg-[#FCFCFB] px-4 text-sm placeholder:text-black/30 focus:outline-none focus:border-black/20 focus:bg-white transition-colors"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[11px] tracking-[0.08em] font-medium text-black/60">BUSINESS NAME</span>
                    <input
                      value={form.business}
                      onChange={(e) => setForm({ ...form, business: e.target.value })}
                      placeholder="Lumière — Café"
                      className="w-full h-11 rounded-xl border border-black/10 bg-[#FCFCFB] px-4 text-sm placeholder:text-black/30 focus:outline-none focus:border-black/20 focus:bg-white transition-colors"
                    />
                  </label>
                </div>

                <label className="space-y-1.5 block">
                  <span className="text-[11px] tracking-[0.08em] font-medium text-black/60">WORK EMAIL</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="alex@lumiere.cafe"
                    className="w-full h-11 rounded-xl border border-black/10 bg-[#FCFCFB] px-4 text-sm placeholder:text-black/30 focus:outline-none focus:border-black/20 focus:bg-white transition-colors"
                  />
                </label>

                <label className="space-y-1.5 block">
                  <span className="text-[11px] tracking-[0.08em] font-medium text-black/60">WHAT’S THE GOAL? — optional</span>
                  <textarea
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    placeholder="e.g. ‘We’re great on weekends, dead Tue–Thu. Need more mid-week covers.’"
                    rows={3}
                    className="w-full rounded-xl border border-black/10 bg-[#FCFCFB] px-4 py-3 text-sm placeholder:text-black/30 focus:outline-none focus:border-black/20 focus:bg-white transition-colors resize-none"
                  />
                </label>

                <div className="flex items-center gap-2 text-[11px] text-black/50">
                  <Check className="h-3 w-3" /> We reply within hours. No newsletter unless you ask.
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-black text-white text-[13px] tracking-[0.06em] font-medium hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
                >
                  REQUEST AUDIT — IT’S FREE <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center text-[11px] text-black/40">Or <button type="button" onClick={() => navigate("/auth")} className="underline decoration-black/20 underline-offset-4 hover:decoration-black">sign in</button> to manage your project</div>
              </form>
            )}

            <div className="mt-6 flex items-center gap-2 text-[11px] text-black/40 border-t border-black/5 pt-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Average reply: 3 hours · Mon–Fri, 9–18
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full border border-black/15 grid place-items-center">
                  <span className="text-[11px] tracking-[0.18em] font-medium">N—</span>
                </div>
                <span className="text-[13px] tracking-[0.16em] font-medium">NORD ATELIER</span>
                <span className="text-[11px] tracking-wide text-black/40">© {new Date().getFullYear()}</span>
              </div>
              <div className="mt-3 max-w-[420px] text-[12.5px] leading-5 text-black/50">
                A premium, minimal marketing atelier for local businesses. We make neighbourhood favourites impossible to ignore — with services that prove themselves and results you can count in the till.
              </div>
            </div>

            <div className="flex gap-10 sm:gap-16 text-[12px]">
              <div>
                <div className="tracking-[0.12em] font-medium text-black/40 text-[11px]">STUDIO</div>
                <div className="mt-3 space-y-1.5 text-black/70">
                  <div>London — Shoreditch</div>
                  <div>Paris — Le Marais</div>
                  <a href="mailto:hello@nordatelier.studio" className="block hover:text-black">hello@nordatelier.studio</a>
                </div>
              </div>
              <div>
                <div className="tracking-[0.12em] font-medium text-black/40 text-[11px]">INDEX</div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <button onClick={() => scrollTo("services")} className="text-left hover:text-black text-black/70">Services</button>
                  <button onClick={() => scrollTo("results")} className="text-left hover:text-black text-black/70">Results</button>
                  <button onClick={() => scrollTo("process")} className="text-left hover:text-black text-black/70">Process</button>
                  <button onClick={() => navigate("/auth")} className="text-left hover:text-black text-black/70">Sign in</button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/5 pt-6 text-[11px] tracking-wide text-black/40">
            <div>MINIMALISM · PRECISE · LOCAL-FIRST · © NORD ATELIER LTD.</div>
            <div className="flex gap-4">
              <span>Privacy — minimal & honest</span>
              <span className="hidden sm:inline">·</span>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
