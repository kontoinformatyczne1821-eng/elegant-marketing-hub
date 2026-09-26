import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, Terminal, ShieldCheck, Zap } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

function Auth({ redirectAfterAuth }: { redirectAfterAuth?: string } = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!authLoading && isAuthenticated) navigate(redirect); }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    try { const fd = new FormData(e.currentTarget); await signIn("email-otp", fd); setStep({ email: fd.get("email") as string }); setIsLoading(false); }
    catch (err) { setError(err instanceof Error ? err.message : "Nie uda\u0142o si\u0119 wys\u0142a\u0107 kodu. Spr\u00f3buj ponownie."); setIsLoading(false); }
  };
  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    try { const fd = new FormData(e.currentTarget); await signIn("email-otp", fd); navigate(redirect); }
    catch { setError("Kod jest niepoprawny. Spr\u00f3buj ponownie."); setIsLoading(false); setOtp(""); }
  };
  const handleGuestLogin = async () => {
    setIsLoading(true); setError(null);
    try { await signIn("anonymous"); navigate(redirect); }
    catch (err) { setError(`Dost\u0119p go\u015bcia nieudany: ${err instanceof Error ? err.message : "Nieznany b\u0142\u0105d"}`); setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col relative overflow-hidden antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap');`}</style>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[1000px] -translate-y-1/2 rounded-full opacity-[0.18] blur-[120px]" style={{ background: "radial-gradient(ellipse at center, #FF3E0A 0%, transparent 60%)" }} />
      </div>
      <div className="relative z-10 flex h-[64px] items-center justify-between border-b border-white/[0.06] px-6 lg:px-8 bg-[#070708]/60 backdrop-blur-xl">
        <button onClick={() => navigate("/")} className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-[9px] bg-white text-black grid place-items-center"><span className="font-[Space_Grotesk] font-bold text-[13px]">Q</span></div>
          <span className="font-[Space_Grotesk] font-bold text-[15px]">QRAFT</span>
          <span className="hidden sm:inline font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/30 border-l border-white/10 pl-3 ml-1">PERFEKCJA BUDUJE MARKI</span>
        </button>
        <button onClick={() => navigate("/")} className="font-[JetBrains_Mono] text-[11px] tracking-[0.14em] text-white/40 hover:text-white">\u2190 WR\u00d3\u0106 NA STRON\u0118</button>
      </div>
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 bg-white/[0.04] font-[JetBrains_Mono] text-[10px] tracking-[0.14em] text-white/50"><span className="h-1.5 w-1.5 rounded-full bg-[#FF3E0A] animate-pulse"/> DOST\u0118P \u2014 OTWARTE DLA KA\u017bDEGO KLIENTA</div>
            <h1 className="mt-4 font-[Space_Grotesk] text-[28px] font-bold tracking-[-0.03em]">Wejd\u017a do swojej budowy.</h1>
            <p className="mt-2 text-[13px] leading-5 text-white/50">Bez bramek i ukrytych prog\u00f3w. Zaloguj si\u0119, by \u015bledzi\u0107 system marki, dowody i kolejne kroki.</p>
          </div>
          <div className="bg-[#111113] border border-white/10 rounded-[20px] p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
            {step === "signIn" ? (
              <>
                <div className="flex items-center justify-between"><h2 className="font-[Space_Grotesk] font-bold text-[15px]">Zaloguj si\u0119 do QRAFT</h2><span className="font-[JetBrains_Mono] text-[10px] tracking-[0.12em] text-white/30 border border-white/10 rounded-full px-2 py-1 flex items-center gap-1"><ShieldCheck className="h-3 w-3"/> BEZPIECZNIE</span></div>
                <p className="mt-1 font-[JetBrains_Mono] text-[11px] text-white/40">U\u017cyj s\u0142u\u017cbowego emaila \u2014 wy\u015blemy jednorazowy kod.</p>
                <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30"/><Input name="email" placeholder="alex@firma.pl" type="email" required disabled={isLoading} className="pl-9 h-11 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus-visible:border-[#FF3E0A]/40 focus-visible:ring-0"/></div>
                  {error && <p className="text-xs text-red-400 font-[JetBrains_Mono]">{error}</p>}
                  <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-full bg-[#FF3E0A] text-white font-[Space_Grotesk] font-bold hover:bg-[#FF5A2E] text-[13px]">{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <>Wy\u015blij kod <ArrowRight className="h-4 w-4 ml-1"/></>}</Button>
                  <div className="relative py-1"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"/></div><div className="relative flex justify-center"><span className="bg-[#111113] px-3 font-[JetBrains_Mono] text-[11px] tracking-[0.12em] text-white/30">LUB</span></div></div>
                  <Button type="button" variant="outline" onClick={handleGuestLogin} disabled={isLoading} className="w-full h-11 rounded-full border-white/10 bg-white/[0.04] text-white hover:bg-white hover:text-black font-[Space_Grotesk] text-[13px] font-medium"><Zap className="h-4 w-4"/> Kontynuuj jako go\u015b\u0107 \u2014 pe\u0142ny dost\u0119p</Button>
                  <p className="text-center font-[JetBrains_Mono] text-[10px] leading-4 text-white/25 pt-1">Kontynuuj\u0105c, akceptujesz regulamin. Dost\u0119p go\u015bcia jest otwarty dla wszystkich.</p>
                </form>
              </>
            ) : (
              <>
                <div className="text-center"><div className="h-10 w-10 mx-auto rounded-full bg-[#FF3E0A] text-white grid place-items-center"><Terminal className="h-5 w-5"/></div><h2 className="mt-3 font-[Space_Grotesk] font-bold">Sprawd\u017a email</h2><p className="mt-1 font-[JetBrains_Mono] text-xs text-white/40">Kod wys\u0142any na <span className="text-white">{step.email}</span></p></div>
                <form onSubmit={handleOtpSubmit} className="mt-6">
                  <input type="hidden" name="email" value={step.email}/><input type="hidden" name="code" value={otp}/>
                  <div className="flex justify-center"><InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading}><InputOTPGroup>{Array.from({ length: 6 }).map((_, i) => (<InputOTPSlot key={i} index={i} className="bg-white/[0.04] border-white/10 text-white data-[active=true]:border-[#FF3E0A]/50"/>))}</InputOTPGroup></InputOTP></div>
                  {error && <p className="mt-3 text-xs text-red-400 text-center font-[JetBrains_Mono]">{error}</p>}
                  <Button type="submit" disabled={isLoading || otp.length !== 6} className="w-full mt-6 h-11 rounded-full bg-[#FF3E0A] text-white font-bold hover:bg-[#FF5A2E]">{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <>Zweryfikuj i wejd\u017a <ArrowRight className="h-4 w-4 ml-1"/></>}</Button>
                  <button type="button" onClick={() => setStep("signIn")} disabled={isLoading} className="w-full mt-3 h-10 rounded-full border border-white/10 text-white/60 font-[JetBrains_Mono] text-xs hover:bg-white hover:text-black transition-colors">U\u017cyj innego emaila</button>
                  <p className="text-center font-[JetBrains_Mono] text-[11px] text-white/30 mt-4">Nie dotar\u0142? <button type="button" onClick={() => setStep("signIn")} className="underline decoration-white/20 text-white">Wy\u015blij ponownie</button></p>
                </form>
              </>
            )}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 font-[JetBrains_Mono] text-[10px] tracking-[0.1em] text-white/20"><span className="h-px w-8 bg-white/10"/> QRAFT.BUILD \u00b7 DLA KA\u017bDEGO KLIENTA <span className="h-px w-8 bg-white/10"/></div>
        </div>
      </div>
    </div>
  );
}
export default function AuthPage(props: { redirectAfterAuth?: string }) { return <Suspense><Auth {...props}/></Suspense>; }
