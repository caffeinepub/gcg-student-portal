import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const count = 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = theme === "dark";

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(6, 182, 212, ${p.opacity})`
          : `rgba(6, 120, 180, ${p.opacity * 0.5})`;
        ctx.fill();
      }

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(6, 182, 212, ${0.08 * (1 - dist / 100)})`
              : `rgba(6, 120, 180, ${0.05 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <>
      {/* Gradient background */}
      <div className="fixed inset-0 -z-20 dark:bg-[#050d1a] bg-[#e8f4ff]" />
      {/* Orbs */}
      <div className="fixed -z-10 inset-0 overflow-hidden pointer-events-none">
        <div className="animate-pulse-glow absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div
          className="animate-pulse-glow absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-[80px]"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="animate-pulse-glow absolute top-3/4 left-1/2 w-64 h-64 rounded-full bg-cyan-400/5 blur-[60px]"
          style={{ animationDelay: "4s" }}
        />
        {/* Floating glass shapes */}
        <div className="animate-float absolute top-20 right-20 w-32 h-32 rounded-2xl glass opacity-30" />
        <div className="animate-float2 absolute bottom-40 left-20 w-24 h-24 rounded-full glass opacity-20" />
        <div
          className="animate-float3 absolute top-1/2 right-1/3 w-20 h-20 rounded-xl glass opacity-25"
          style={{ transform: "rotate(45deg)" }}
        />
      </div>
      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none"
      />
    </>
  );
}
