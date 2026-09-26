import { useAuth } from "@/hooks/use-auth";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Cpu,
  Layers,
  LogOut,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

const AMP = "#ff6105";
const AMP_SHADOW =
  "rgba(255, 97, 5, 0.6) 1px 6px 14px 0px, rgba(0, 0, 0, 0.06) 0px 1px 4px 0px";

function BtnPrimary({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`inline-flex items-center justify-center gap-2 rounded-[50px] font-amp font-medium text-[15px] text-white transition-transform duration-300 ${
        hover ? "-translate-y-[1px]" : ""
      } ${className}`}
      style={{ backgroundColor: hover ? "#e25704" : AMP, boxShadow: AMP_SHADOW }}
    >
      {children}
    </button>
  );
}

function BtnDark({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`inline-flex items-center justify-center gap-2 rounded-[50px] font-amp font-medium text-[15px] text-white transition-transform duration-300 ${className}`}
      style={{ backgroundColor: hover ? "#0a0a0a" : "#202120" }}
    >
      {children}
    </button>
  );
}

function BtnSecondary({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`inline-flex items-center justify-center gap-2 rounded-[24px] border font-amp text-[15px] transition-colors duration-300 ${className}`}
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

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white text-ink antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');`}</style>

      <header className="sticky top-0 z-40 bg-white border-b border-hairline">
        <div className="mx-auto max-w-[1200px] px-6 h-[68px] flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
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
            <span className="hidden sm:inline ml-2 text-[12px] uppercase tracking-[0.16em] text-ash font-medium">
              Panel
            </span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-2 rounded-[50px] border border-hairline px-3 py-1.5 text-[12px] text-slate">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: AMP }}
              />
              System działa
            </div>
            <BtnSecondary onClick={handleSignOut} className="h-10 px-4 text-[14px]">
              <LogOut className="h-4 w-4" /> Wyloguj
            </BtnSecondary>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="text-[12px] uppercase tracking-[0.16em] text-ash font-medium">
              Panel klienta
            </div>
            <h1 className="mt-6 font-amp font-light text-[34px] sm:text-[48px] leading-[1.05] tracking-[-0.036em] text-ink">
              Witaj{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
              <span className="text-ash"> Twoja budowa jest gotowa.</span>
            </h1>
            <p className="mt-5 font-amp text-[15px] leading-[1.56] text-slate max-w-[560px]">
              Każdy moduł jest otwarty, każdy wynik audytowalny, każdy efekt
              mierzony w klientach. Audyt i blueprint znajdziesz tutaj.
            </p>
          </div>
          <BtnSecondary onClick={() => navigate("/")} className="h-12 px-6 text-[14px] self-start lg:self-auto">
            Strona główna <ArrowUpRight className="h-4 w-4" />
          </BtnSecondary>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-5">
          {/* build tracker */}
          <div className="lg:col-span-2 rounded-[5px] border border-hairline bg-white p-7 lg:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-amp text-[24px] font-medium tracking-[-0.02em] text-ink flex items-center gap-3">
                <Layers className="h-5 w-5" style={{ color: AMP }} /> Twoja budowa
              </h2>
              <span className="rounded-[8px] bg-charcoal px-3 py-1.5 text-[11px] font-medium text-white">
                Sprint 90 dni
              </span>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {[
                { label: "Audyt", status: "Gotowe", desc: "20 minut", icon: Check, done: true },
                { label: "Blueprint", status: "W budowie", desc: "1 strona", icon: Cpu, done: false },
                { label: "Dowody", status: "Co tydzień", desc: "Raport klientów", icon: Activity, done: false },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-[5px] border border-hairline p-5"
                  style={s.done ? { backgroundColor: "#ffdfcd", borderColor: "transparent" } : undefined}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-[0.12em] text-slate font-medium">
                      {s.label}
                    </span>
                    <s.icon className="h-4 w-4" style={{ color: s.done ? AMP : "#a2a3a2" }} />
                  </div>
                  <div className="mt-4 font-amp text-[16px] font-medium text-ink">
                    {s.status}
                  </div>
                  <div className="mt-1 font-amp text-[13px] text-slate">{s.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-hairline flex flex-wrap items-center gap-3">
              <BtnPrimary onClick={() => navigate("/")} className="h-12 px-6 text-[15px]">
                Kontynuuj budowę <ArrowRight className="h-4 w-4" />
              </BtnPrimary>
              <span className="inline-flex items-center gap-2 rounded-[24px] border border-hairline px-4 h-12 text-[13px] text-slate">
                <Clock className="h-4 w-4 text-ash" /> Następny kontakt: w tym
                tygodniu
              </span>
            </div>
          </div>

          {/* peach featured card */}
          <div
            className="rounded-[5px] p-7 lg:p-8 flex flex-col"
            style={{ backgroundColor: "#ffdfcd" }}
          >
            <div className="text-[12px] uppercase tracking-[0.16em] text-ink/55 font-medium">
              Wpływ na klientów
            </div>
            <div className="mt-5 font-amp font-light text-[28px] leading-[1.15] tracking-[-0.03em] text-ink">
              Otwarte dla wszystkich.
            </div>
            <p className="mt-3 font-amp text-[14px] leading-[1.56] text-ink/65">
              Każdy panel, raport i blueprint dostępny dla całego zespołu — i dla
              każdego klienta.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-[5px] border border-white/70 bg-white/60 p-4 text-center">
                <div className="font-amp font-light text-[26px] leading-none tracking-[-0.03em] text-ink">
                  340+
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-ink/50 font-medium">
                  Firm
                </div>
              </div>
              <div className="rounded-[5px] border border-white/70 bg-white/60 p-4 text-center">
                <div className="font-amp font-light text-[26px] leading-none tracking-[-0.03em] text-ink">
                  4.9/5
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-ink/50 font-medium">
                  Ocena
                </div>
              </div>
            </div>
            <div className="mt-8 pt-0">
              <BtnDark onClick={() => navigate("/")} className="w-full h-12 text-[15px]">
                <Mail className="h-4 w-4" /> Porozmawiaj z nami
              </BtnDark>
            </div>
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-5">
          {[
            {
              k: "01",
              t: "Moduły systemu",
              d: "Sześć modułów — marka, strona, pozyskiwanie, treść, kampanie, dowody.",
            },
            {
              k: "02",
              t: "Dowody, nie obietnice",
              d: "Cotygodniowy raport powiązany z klientami i przychodem.",
            },
            {
              k: "03",
              t: "Zbudowane dla klientów",
              d: "Wszystko mierzymy tym, jak zdobywa i utrzymuje klientów.",
            },
          ].map((c) => (
            <div key={c.k} className="rounded-[5px] border border-hairline bg-white p-6">
              <div className="text-[12px] tracking-[0.12em] text-ash">{c.k}</div>
              <div className="mt-4 font-amp text-[18px] font-medium tracking-[-0.02em] text-ink">
                {c.t}
              </div>
              <div className="mt-2 font-amp text-[14px] leading-[1.56] text-slate">
                {c.d}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-ash">
          <span>QRAFT · qraft.build</span>
          <span className="flex items-center gap-3">
            <span className="h-[2px] w-6" style={{ backgroundColor: AMP }} />
            Precyzja buduje marki
          </span>
        </div>
      </main>
    </div>
  );
}
