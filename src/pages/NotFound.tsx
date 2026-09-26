import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

const AMP = "#ff6105";
const AMP_SHADOW =
  "rgba(255, 97, 5, 0.6) 1px 6px 14px 0px, rgba(0, 0, 0, 0.06) 0px 1px 4px 0px";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white text-ink antialiased flex flex-col"
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');`}</style>

      <header className="border-b border-hairline">
        <div className="mx-auto max-w-[1200px] px-6 h-[68px] flex items-center">
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
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center">
          <div className="text-[12px] uppercase tracking-[0.16em] text-ash font-medium">
            Błąd 404
          </div>
          <h1 className="mt-6 font-amp font-light text-[44px] sm:text-[64px] leading-[1.05] tracking-[-0.036em] text-ink">
            Tej strony tu nie ma.
          </h1>
          <div
            className="mt-8 h-[3px] w-[120px] mx-auto"
            style={{ backgroundColor: AMP }}
          />
          <p className="mt-8 font-amp text-[15px] leading-[1.56] text-slate max-w-[420px] mx-auto">
            Adres mógł się zmienić albo strona została przeniesiona. Wróć na
            stronę główną i zacznij od systemu.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-[50px] h-14 px-8 font-amp font-medium text-[15px] text-white"
            style={{ backgroundColor: AMP, boxShadow: AMP_SHADOW }}
          >
            <ArrowLeft className="h-4 w-4" /> Wróć na stronę główną
          </button>
        </div>
      </div>
    </motion.main>
  );
}
