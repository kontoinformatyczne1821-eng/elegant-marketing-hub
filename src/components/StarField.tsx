import { useEffect, useRef } from "react";

/* Pole gwiazd z okazjonalnymi spadającymi gwiazdami — lekkie tło pod sekcją SYSTEM.
   Jedno płótno, jedna pętla rAF, zero zależności. Gwiazdy delikatnie migoczą,
   meteory przelatują losowo co kilka-kilkanaście sekund. Przy
   prefers-reduced-motion zostaje statyczne niebo bez meteorów. */

type Star = { x: number; y: number; r: number; a: number; tw: number; ph: number };
type Meteor = { x: number; y: number; vx: number; vy: number; len: number; born: number; life: number };

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
    let meteors: Meteor[] = [];
    let nextMeteorAt = performance.now() + 2600;
    let raf = 0;

    const seed = () => {
      /* gęstość z powierzchni, z limitem — żeby długie strony nie kosztowały */
      const count = Math.min(240, Math.round((w * h) / 9000));
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

    const spawnMeteor = (now: number) => {
      const fromLeft = Math.random() < 0.5;
      const speed = 420 + Math.random() * 280;
      const slope = 0.3 + Math.random() * 0.22; /* kąt padania w dół */
      meteors.push({
        x: w * (0.12 + Math.random() * 0.72),
        y: h * (0.04 + Math.random() * 0.32),
        vx: (fromLeft ? 1 : -1) * Math.cos(slope) * speed,
        vy: Math.sin(slope) * speed,
        len: 90 + Math.random() * 100,
        born: now,
        life: 850 + Math.random() * 550,
      });
    };

    const paintStars = (t: number) => {
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

    const paintMeteors = (now: number) => {
      if (now >= nextMeteorAt && meteors.length < 2) {
        spawnMeteor(now);
        nextMeteorAt = now + 3500 + Math.random() * 6000;
      }
      meteors = meteors.filter((m) => now - m.born < m.life);
      for (const m of meteors) {
        const age = (now - m.born) / 1000;
        const hx = m.x + m.vx * age;
        const hy = m.y + m.vy * age;
        const sp = Math.hypot(m.vx, m.vy);
        const nx = m.vx / sp;
        const ny = m.vy / sp;
        /* koperta alfy: meteor wchodzi i wychodzi miękko */
        const fade = Math.sin(Math.min(1, (now - m.born) / m.life) * Math.PI);
        const tail = m.len * (0.4 + 0.6 * fade);
        const tx = hx - nx * tail;
        const ty = hy - ny * tail;
        const grad = ctx.createLinearGradient(tx, ty, hx, hy);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.7, `rgba(255,236,214,${0.5 * fade})`);
        grad.addColorStop(1, `rgba(255,255,255,${0.9 * fade})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.globalAlpha = fade;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(hx, hy, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      paintStars(now / 1000);
      paintMeteors(now);
      raf = requestAnimationFrame(draw);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      paintStars(0);
    };

    resize();
    if (reduce) drawStatic();
    else raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
