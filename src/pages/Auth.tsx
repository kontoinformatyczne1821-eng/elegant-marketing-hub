import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ArrowRight, Loader2, Mail, ShieldCheck, Zap } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

const AMP = "#ff6105";
const AMP_SHADOW =
  "rgba(255, 97, 5, 0.6) 1px 6px 14px 0px, rgba(0, 0, 0, 0.06) 0px 1px 4px 0px";

const field =
  "w-full h-14 rounded-[50px] border border-hairline bg-white pl-5 pr-5 font-amp text-[15px] text-ink placeholder:text-ash outline-none transition-[border-color,box-shadow] focus:border-[#ff6105] focus:shadow-[0_0_0_3px_rgba(255,97,5,0.16)]";

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

function BtnPrimary({
  children,
  type = "button",
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`inline-flex items-center justify-center gap-2 rounded-[50px] font-amp font-medium text-[15px] tracking-[-0.01em] text-white transition-all duration-300 disabled:opacity-60 ${
        hover ? "-translate-y-[1px]" : ""
      } ${className}`}
      style={{ backgroundColor: hover ? "#e25704" : AMP, boxShadow: AMP_SHADOW }}
    >
      {children}
    </button>
  );
}

function BtnSecondary({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`inline-flex items-center justify-center gap-2 rounded-[24px] font-amp text-[15px] transition-colors duration-300 disabled:opacity-60 ${className}`}
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

function Auth({ redirectAfterAuth }: { redirectAfterAuth?: string } = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate(redirect);
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      await signIn("email-otp", fd);
      setStep({ email: fd.get("email") as string });
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nie udało się wysłać kodu. Spróbuj ponownie.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      await signIn("email-otp", fd);
      navigate(redirect);
    } catch {
      setError("Kod jest niepoprawny. Spróbuj ponownie.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (err) {
      setError(
        `Dostęp gościa nieudany: ${err instanceof Error ? err.message : "Nieznany błąd"}`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-ink antialiased flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');`}</style>

      <header className="border-b border-hairline bg-white">
        <div className="mx-auto max-w-[1200px] px-6 h-[68px] flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
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
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-[14px] text-carbon transition-colors duration-300"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0a0a0a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#292b2a")}
          >
            <ArrowLeft className="h-4 w-4" /> Wróć na stronę
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[440px]">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-[8px] border border-hairline px-3 py-1.5 text-[12px] text-slate">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: AMP }}
              />
              Dostęp otwarty dla każdego klienta
            </div>
            <h1 className="mt-6 font-amp font-light text-[34px] sm:text-[40px] leading-[1.1] tracking-[-0.03em] text-ink">
              Wejdź do swojej budowy.
            </h1>
            <p className="mt-4 font-amp text-[15px] leading-[1.56] text-slate">
              Bez bramek i ukrytych progów. Zaloguj się, żeby śledzić system
              marki, dowody i kolejne kroki.
            </p>
          </div>

          <div className="mt-10 rounded-[5px] border border-hairline bg-white p-7">
            {step === "signIn" ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-amp text-[20px] font-medium tracking-[-0.02em] text-ink">
                    Zaloguj się do QRAFT
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-hairline px-2.5 py-1 text-[11px] text-ash">
                    <ShieldCheck className="h-3 w-3" /> BEZPIECZNIE
                  </span>
                </div>
                <p className="mt-2 font-amp text-[14px] text-slate">
                  Użyj służbowego emaila — wyślemy jednorazowy kod.
                </p>

                <form onSubmit={handleEmailSubmit} className="mt-7 space-y-4">
                  <label className="block space-y-2">
                    <span className="block text-[12px] uppercase tracking-[0.12em] text-ash font-medium">
                      Email
                    </span>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
                      <input
                        name="email"
                        placeholder="alex@firma.pl"
                        type="email"
                        required
                        disabled={isLoading}
                        className={`${field} pl-12`}
                      />
                    </div>
                  </label>

                  {error && <p className="text-[13px] text-[#d93b0b]">{error}</p>}

                  <BtnPrimary
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 text-[15px]"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Wyślij kod <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </BtnPrimary>

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-hairline" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-[12px] text-ash">
                        lub
                      </span>
                    </div>
                  </div>

                  <BtnSecondary
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                    className="w-full h-14 border"
                  >
                    <Zap className="h-4 w-4" /> Kontynuuj jako gość
                  </BtnSecondary>

                  <p className="text-center text-[12px] leading-[1.5] text-ash pt-1">
                    Kontynuując, akceptujesz regulamin. Dostęp gościa jest
                    otwarty dla wszystkich.
                  </p>
                </form>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div
                    className="h-10 w-10 mx-auto rounded-[50px] grid place-items-center text-white"
                    style={{ backgroundColor: AMP }}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 font-amp text-[24px] font-medium tracking-[-0.02em] text-ink">
                    Sprawdź email
                  </h2>
                  <p className="mt-2 font-amp text-[14px] text-slate">
                    Kod wysłaliśmy na{" "}
                    <span className="text-ink">{step.email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="mt-7">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                    >
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="h-14 w-11 rounded-[8px] border border-hairline bg-white text-[18px] font-amp text-ink shadow-none first:rounded-[8px] first:border-l last:rounded-[8px] data-[active=true]:border-[#ff6105] data-[active=true]:ring-[3px] data-[active=true]:ring-[#ff6105]/20"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error && (
                    <p className="mt-4 text-center text-[13px] text-[#d93b0b]">
                      {error}
                    </p>
                  )}

                  <BtnPrimary
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full mt-6 h-14 text-[15px]"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Zweryfikuj i wejdź <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </BtnPrimary>

                  <BtnSecondary
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="w-full mt-3 h-12 border"
                  >
                    Użyj innego emaila
                  </BtnSecondary>
                </form>
              </>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-[12px] text-ash">
            <span className="h-px w-8 bg-hairline" />
            QRAFT.BUILD · DLA KAŻDEGO KLIENTA
            <span className="h-px w-8 bg-hairline" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage(props: { redirectAfterAuth?: string }) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
