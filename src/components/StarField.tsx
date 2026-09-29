import { useEffect, useRef } from "react";

/* Czyste pole gwiazd — lekkie tło pod sekcją SYSTEM. Jedno płótno, jedna pętla
   rAF, zero zależności. Gwiazdy różnej wielkości i jasności delikatnie migoczą.
   Przy prefers-reduced-motion zostaje statyczne niebo. */

type Star = { x: number; y: number; r: number; a: number; tw: number; ph: number };

export default function StarField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;

    const seed = () => {
      /* gęstość z powierzchni, z limitem — żeby długie strony nie kosztowały */
      const count = Math.min(260, Math.round((w * h) / 8000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.1,
        a: 0.22 + Math.random() * 0.6,
        tw: 0.4 + Math.random() * 1.5,
        ph: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const paintStars = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduce ? s.a : s.a * (0.72 + 0.28 * Math.sin(t * s.tw + s.ph));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#EDEDF2";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      paintStars(now / 1000);
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduce) paintStars(0);
    else raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
