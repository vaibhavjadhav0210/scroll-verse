import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMouseParallax } from "@/hooks/use-mouse-parallax";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Depth of Things — Parallax Experience" },
      {
        name: "description",
        content:
          "A visually stunning interactive parallax journey through six dimensions of depth, layers, and motion.",
      },
      { property: "og:title", content: "The Depth of Things — Parallax Experience" },
      {
        property: "og:description",
        content: "Scroll through layers of depth. Pure CSS & JS parallax magic.",
      },
    ],
  }),
  component: ParallaxPage,
});

// ───────────────────────────── Helpers ─────────────────────────────

function useRandomParticles(count: number, seed: number) {
  return useMemo(() => {
    let s = seed;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, () => ({
      x: rnd() * 100,
      y: rnd() * 100,
      o: 0.1 + rnd() * 0.7,
      d: rnd() * 4,
      s: 0.5 + rnd() * 1.5,
    }));
  }, [count, seed]);
}

type ParticleColor = string;
function ParticleField({
  particles,
  color,
  y,
}: {
  particles: ReturnType<typeof useRandomParticles>;
  color: ParticleColor;
  y: MotionValue<number>;
}) {
  return (
    <motion.div className="absolute inset-0" style={{ y, willChange: "transform" }}>
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.s}px`,
            height: `${p.s}px`,
            backgroundColor: color,
            opacity: p.o,
          }}
        />
      ))}
    </motion.div>
  );
}

// ───────────────────────── Section Wrapper ─────────────────────────

function useSectionParallax(targetRef: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const y0 = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const y1 = useTransform(scrollYProgress, [0, 1], [-150, 150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-250, 250]);
  const y3 = useTransform(scrollYProgress, [0, 1], [-400, 400]);
  const yUp = useTransform(scrollYProgress, [0, 1], [200, -200]);
  return { y0, y1, y2, y3, yUp };
}

// ───────────────────────────── Page ────────────────────────────────

const SECTIONS = [
  { id: "hero", label: "DEPTH" },
  { id: "layers", label: "LAYERS" },
  { id: "nature", label: "ORGANIC" },
  { id: "pulse", label: "PULSE" },
  { id: "void", label: "VOID" },
  { id: "cta", label: "BEGIN" },
] as const;

function ParallaxPage() {
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [active, setActive] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setHintVisible(false), 3500);
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight / 2;
      let i = 0;
      SECTIONS.forEach((s, idx) => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= y) i = idx;
      });
      setActive(i);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <main className="font-sans bg-black text-white antialiased overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 h-[3px] z-50"
        style={{
          width: progressWidth,
          background:
            "linear-gradient(90deg, #6366F1, #EC4899, #F59E0B, #10B981, #06B6D4)",
        }}
      />

      {/* Section dots nav */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-5">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() =>
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })
            }
            className="group relative flex items-center justify-end"
          >
            <span
              className="absolute right-6 text-[9px] tracking-[0.3em] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              {s.label}
            </span>
            <span
              className={`rounded-full transition-all duration-300 ${
                active === i ? "w-3 h-3 bg-white" : "w-2 h-2 bg-white/30"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Scroll hint */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 transition-opacity duration-700 ${
          hintVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <span className="block w-px h-10 bg-white/40 animate-bounce" />
        <span
          className="text-[9px] tracking-[0.4em] text-white/50"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          SCROLL
        </span>
      </div>

      <HeroSection />
      <Transition from="#0D0D1A" to="#1A0A00" />
      <LayersSection />
      <Transition from="#1A0A00" to="#001A0A" />
      <NatureSection />
      <Transition from="#001A0A" to="#1A0010" />
      <PulseSection />
      <Transition from="#1A0010" to="#00101A" />
      <VoidSection />
      <Transition from="#00101A" to="#050505" />
      <CtaSection />
    </main>
  );
}

// ─────────────────────────── Transition ────────────────────────────

function Transition({ from, to }: { from: string; to: string }) {
  return (
    <div
      className="relative h-32 w-full flex items-center justify-center"
      style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }}
    >
      <span className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />
      <span className="relative block w-3 h-3 rotate-45 border border-white/40 bg-black spin-slow" />
    </div>
  );
}

// ─────────────────────────── Hero ──────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { y0, y1, y2, y3, yUp } = useSectionParallax(ref);
  const stars = useRandomParticles(200, 11);
  const mouse = useMouseParallax(20);
  const mouseFg = useMouseParallax(5);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{ backgroundColor: "#0D0D1A" }}
    >
      {/* Layer 0 — stars */}
      <ParticleField particles={stars} color="white" y={y0} />

      {/* Layer 1 — large geometric shapes */}
      <motion.div className="absolute inset-0" style={{ y: y1, willChange: "transform" }}>
        <div
          className="absolute -top-20 -left-20 rounded-full border-2 spin-slow"
          style={{ width: 600, height: 600, borderColor: "rgba(99,102,241,0.15)" }}
        />
        <div
          className="absolute bottom-0 -right-32 rounded-full border-2"
          style={{ width: 500, height: 500, borderColor: "rgba(236,72,153,0.10)" }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 rounded-full border-2"
          style={{ width: 300, height: 300, borderColor: "rgba(167,139,250,0.08)" }}
        />
      </motion.div>

      {/* Layer 2 — gradient orbs */}
      <motion.div className="absolute inset-0" style={{ y: y2, willChange: "transform" }}>
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full bg-pink-600/15 blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px]" />
      </motion.div>

      {/* Layer 3 — floating geometric (mouse parallax) */}
      <motion.div
        className="absolute inset-0"
        style={{ y: y3, x: mouse.x, willChange: "transform" }}
      >
        <svg
          className="absolute top-16 right-24 float"
          width="160"
          height="160"
          viewBox="0 0 100 100"
        >
          <polygon
            points="50,5 95,90 5,90"
            fill="none"
            stroke="rgba(99,102,241,0.5)"
            strokeWidth="1"
          />
        </svg>
        <svg
          className="absolute top-1/2 left-10 float float-delay-1"
          width="100"
          height="100"
          viewBox="0 0 100 100"
        >
          <polygon
            points="50,5 95,50 50,95 5,50"
            fill="none"
            stroke="rgba(236,72,153,0.45)"
            strokeWidth="1"
          />
        </svg>
        <svg
          className="absolute bottom-20 left-1/4 float float-delay-2"
          width="120"
          height="120"
          viewBox="0 0 100 100"
        >
          <polygon
            points="50,5 90,28 90,72 50,95 10,72 10,28"
            fill="none"
            stroke="rgba(167,139,250,0.45)"
            strokeWidth="1"
          />
        </svg>
        <div
          className="absolute top-24 left-16 w-10 h-10 float float-delay-1"
          style={{ backgroundColor: "rgba(99,102,241,0.2)" }}
        />
        <div
          className="absolute bottom-32 right-1/4 w-16 h-16 rounded-full border float float-delay-2"
          style={{ borderColor: "rgba(255,255,255,0.2)" }}
        />
      </motion.div>

      {/* Floating upward (negative) layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: yUp, willChange: "transform" }}
      >
        <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-indigo-400/60" />
        <div className="absolute top-1/2 left-1/4 w-1 h-1 rounded-full bg-pink-400/60" />
      </motion.div>

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-6xl mx-auto px-8"
        style={{ transform: `translate3d(${mouseFg.x}px, ${mouseFg.y}px, 0)` }}
      >
        <p
          className="text-[11px] tracking-[0.4em] uppercase text-indigo-400 mb-6 reveal"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          001 / Parallax Experience
        </p>

        <h1
          className="font-display font-black leading-[0.9]"
          style={{ letterSpacing: "-0.04em", fontFamily: "Playfair Display, serif" }}
        >
          <span className="overflow-hidden block">
            <span
              className="block text-white/40 reveal"
              style={{ fontSize: "clamp(80px,15vw,180px)" }}
            >
              THE
            </span>
          </span>
          <span className="overflow-hidden block -mt-4">
            <span
              className="block gradient-text reveal"
              style={{
                fontSize: "clamp(80px,15vw,180px)",
                animationDelay: "0.15s",
                opacity: 0,
                background: "linear-gradient(135deg, #6366F1, #EC4899)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              DEPTH
            </span>
          </span>
          <span className="overflow-hidden block -mt-2">
            <span
              className="block text-white reveal"
              style={{
                fontSize: "clamp(40px,8vw,96px)",
                animationDelay: "0.3s",
                opacity: 0,
              }}
            >
              OF THINGS
            </span>
          </span>
        </h1>

        <p className="font-light text-[18px] text-white/50 max-w-md leading-relaxed mt-8">
          Scroll through layers of depth. Watch the world move at different speeds.
          Experience true parallax.
        </p>

        <ChevronDown className="mt-16 text-white/40 animate-bounce" size={32} />
      </div>
    </section>
  );
}

// ─────────────────────────── Layers ────────────────────────────────

function LayersSection() {
  const ref = useRef<HTMLElement>(null);
  const { y0, y1, y2, y3 } = useSectionParallax(ref);
  const parts = useRandomParticles(100, 22);
  const mouse = useMouseParallax(15);

  const cards = [
    { label: "BACKGROUND", speed: "0.1x", w: "10%", rot: -8, z: -60 },
    { label: "MIDGROUND", speed: "0.3x", w: "30%", rot: -2, z: 0 },
    { label: "FOREGROUND", speed: "0.6x", w: "60%", rot: 6, z: 60 },
  ];

  return (
    <section
      id="layers"
      ref={ref}
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{ backgroundColor: "#1A0A00" }}
    >
      <ParticleField particles={parts} color="#F59E0B" y={y0} />

      <motion.div className="absolute inset-0" style={{ y: y1 }}>
        <div
          className="absolute -top-40 -left-40 rounded-full border spin-slow"
          style={{ width: 700, height: 500, borderColor: "rgba(245,158,11,0.10)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 rounded-full border"
          style={{ width: 800, height: 600, borderColor: "rgba(249,115,22,0.10)" }}
        />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: y2 }}>
        <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-amber-600/20 blur-[150px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-orange-500/15 blur-[100px]" />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: y3, x: mouse.x }}>
        <span
          className="absolute top-10 left-10 font-black select-none pointer-events-none"
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 400,
            color: "rgba(245,158,11,0.05)",
            lineHeight: 1,
          }}
        >
          02
        </span>
        <svg
          className="absolute top-1/3 right-20 float"
          width="180"
          height="2"
        >
          <line x1="0" y1="1" x2="180" y2="1" stroke="rgba(245,158,11,0.3)" />
        </svg>
        <svg
          className="absolute bottom-1/4 left-32 float float-delay-1"
          width="100"
          height="100"
        >
          <line
            x1="0"
            y1="100"
            x2="100"
            y2="0"
            stroke="rgba(249,115,22,0.3)"
          />
        </svg>
        <div className="absolute top-20 right-1/3 flex gap-2 float float-delay-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amber-400/50"
            />
          ))}
        </div>
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-20 py-32 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p
            className="text-[11px] tracking-[0.4em] uppercase text-amber-400 mb-6"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            002 / Layers
          </p>
          <h2
            className="font-black leading-[0.95]"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(48px,7vw,96px)",
              letterSpacing: "-0.04em",
            }}
          >
            <span className="block text-white">MOTION</span>
            <span
              className="block gradient-text"
              style={{
                background: "linear-gradient(135deg,#F59E0B,#EA580C)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              IN
            </span>
            <span className="block text-white">LAYERS</span>
          </h2>
          <p className="font-light text-base text-white/50 max-w-sm mt-8 leading-relaxed">
            Every element exists on its own plane. Background whispers. Midground
            speaks. Foreground commands. This is dimensional design.
          </p>
        </div>

        <div
          className="relative h-[500px]"
          style={{ perspective: "1200px" }}
        >
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="absolute inset-x-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8"
              style={{
                top: `${i * 90}px`,
                transform: `rotateY(${c.rot}deg) translateZ(${c.z}px)`,
              }}
            >
              <div className="flex justify-between items-baseline">
                <span
                  className="text-[11px] tracking-[0.3em] text-amber-400"
                  style={{ fontFamily: "Space Mono, monospace" }}
                >
                  {c.label}
                </span>
                <span
                  className="text-2xl text-white"
                  style={{ fontFamily: "Space Mono, monospace" }}
                >
                  {c.speed}
                </span>
              </div>
              <div className="mt-6 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: c.w,
                    background: "linear-gradient(90deg,#F59E0B,#EA580C)",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────── Nature ────────────────────────────────

function NatureSection() {
  const ref = useRef<HTMLElement>(null);
  const { y0, y1, y2, y3 } = useSectionParallax(ref);
  const parts = useRandomParticles(80, 33);
  const mouse = useMouseParallax(15);

  const marqueeText =
    "PARALLAX · DEPTH · MOTION · LAYERS · SCROLL · EXPERIENCE · DESIGN · FLOW · ";

  return (
    <section
      id="nature"
      ref={ref}
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{ backgroundColor: "#001A0A" }}
    >
      <ParticleField particles={parts} color="#10B981" y={y0} />

      <motion.div className="absolute inset-0 flex items-center justify-center" style={{ y: y1 }}>
        {[400, 550, 700].map((s) => (
          <div
            key={s}
            className="absolute rounded-full border"
            style={{ width: s, height: s, borderColor: "rgba(16,185,129,0.08)" }}
          />
        ))}
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: y2 }}>
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-600/20 blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-teal-500/15 blur-[100px]" />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: y3, x: mouse.x }}>
        <span
          className="absolute top-20 right-10 font-black select-none pointer-events-none"
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 400,
            color: "rgba(16,185,129,0.05)",
            lineHeight: 1,
          }}
        >
          03
        </span>
        <svg className="absolute top-1/4 left-20 float" width="200" height="200" viewBox="0 0 200 200">
          <path d="M20,180 C40,80 120,40 180,20" stroke="rgba(16,185,129,0.25)" strokeWidth="1" fill="none" />
        </svg>
        <svg className="absolute bottom-1/4 right-20 float float-delay-1" width="240" height="180" viewBox="0 0 240 180">
          <path d="M10,90 C60,10 180,170 230,90" stroke="rgba(20,184,166,0.25)" strokeWidth="1" fill="none" />
        </svg>
        <svg className="absolute top-1/2 left-1/3 float float-delay-2" width="160" height="200" viewBox="0 0 160 200">
          <path d="M80,10 C140,60 140,140 80,190 C20,140 20,60 80,10 Z" stroke="rgba(16,185,129,0.20)" strokeWidth="1" fill="none" />
        </svg>
      </motion.div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 text-center py-40">
        <p
          className="text-[11px] tracking-[0.4em] uppercase text-emerald-400 mb-6"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          003 / Organic
        </p>
        <h2
          className="font-black leading-[0.9]"
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(60px,11vw,160px)",
            letterSpacing: "-0.04em",
          }}
        >
          <span className="block text-white">NATURE</span>
          <span
            className="block gradient-text"
            style={{
              background: "linear-gradient(135deg,#10B981,#14B8A6)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            BREATHES
          </span>
        </h2>

        <div className="mt-10 overflow-hidden">
          <div
            className="marquee whitespace-nowrap text-emerald-400/30 text-[12px]"
            style={{ fontFamily: "Space Mono, monospace", letterSpacing: "0.3em" }}
          >
            {marqueeText.repeat(8)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-20 max-w-2xl mx-auto">
          {[
            { n: "6", l: "PARALLAX LAYERS" },
            { n: "∞", l: "SCROLL DEPTH" },
            { n: "60", l: "FPS SMOOTH" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur"
            >
              <div
                className="font-bold gradient-text"
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: 48,
                  background: "linear-gradient(135deg,#10B981,#14B8A6)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                {s.n}
              </div>
              <div
                className="text-[10px] tracking-[0.3em] text-white/40 mt-2"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────── Pulse ─────────────────────────────────

function PulseSection() {
  const ref = useRef<HTMLElement>(null);
  const { y0, y1, y2, y3 } = useSectionParallax(ref);
  const parts = useRandomParticles(120, 44);
  const mouse = useMouseParallax(15);

  const features = [
    { t: "Scroll Velocity", d: "Speed affects depth perception" },
    { t: "Layer Separation", d: "Z-axis creates true 3D feel" },
    { t: "Mouse Tracking", d: "Cursor moves the world around you" },
  ];

  return (
    <section
      id="pulse"
      ref={ref}
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{ backgroundColor: "#1A0010" }}
    >
      <ParticleField particles={parts} color="#EC4899" y={y0} />

      <motion.div className="absolute inset-0" style={{ y: y1 }}>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diag" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(236,72,153,0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
        </svg>
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: y2 }}>
        <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-pink-600/20 blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-rose-500/15 blur-[100px]" />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: y3, x: mouse.x }}>
        <span
          className="absolute bottom-0 left-10 font-black select-none pointer-events-none"
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 400,
            color: "rgba(236,72,153,0.05)",
            lineHeight: 1,
          }}
        >
          04
        </span>
        {[
          { t: "10%", l: "15%", w: 200, h: 120, r: -8 },
          { t: "30%", l: "70%", w: 160, h: 200, r: 6 },
          { t: "60%", l: "20%", w: 240, h: 160, r: 4 },
          { t: "65%", l: "75%", w: 140, h: 140, r: -6 },
        ].map((b, i) => (
          <div
            key={i}
            className={`absolute border border-pink-400/20 rounded-lg float ${
              i % 3 === 1 ? "float-delay-1" : i % 3 === 2 ? "float-delay-2" : ""
            }`}
            style={{
              top: b.t,
              left: b.l,
              width: b.w,
              height: b.h,
              transform: `rotate(${b.r}deg)`,
            }}
          />
        ))}
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-20 py-32 grid lg:grid-cols-2 gap-16 items-center">
        {/* Visual */}
        <div className="relative h-[500px] flex items-center justify-center order-2 lg:order-1">
          <span className="absolute w-[400px] h-[400px] rounded-full border border-pink-400/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "1s" }} />
          <span className="absolute w-[280px] h-[280px] rounded-full border border-pink-400/30 animate-ping" style={{ animationDuration: "1.5s", animationDelay: "0.5s" }} />
          <span className="absolute w-[160px] h-[160px] rounded-full border-2 border-pink-400/60 animate-ping" style={{ animationDuration: "1s" }} />
          <span className="relative w-20 h-20 rounded-full bg-pink-500 shadow-[0_0_60px_rgba(236,72,153,0.6)]" />
        </div>
        {/* Content */}
        <div className="order-1 lg:order-2">
          <p
            className="text-[11px] tracking-[0.4em] uppercase text-pink-400 mb-6"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            004 / Pulse
          </p>
          <h2
            className="font-black leading-[0.9]"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(56px,9vw,128px)",
              letterSpacing: "-0.04em",
            }}
          >
            <span className="block text-white">FEEL THE</span>
            <span
              className="block gradient-text"
              style={{
                background: "linear-gradient(135deg,#EC4899,#F43F5E)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              PULSE
            </span>
          </h2>
          <p className="font-light text-base text-white/50 max-w-sm mt-8 leading-relaxed">
            Depth is not just visual. It is felt. Every layer has weight, rhythm,
            and intention.
          </p>

          <ul className="flex flex-col gap-4 mt-10">
            {features.map((f) => (
              <li key={f.t} className="flex gap-4 items-start">
                <span className="w-1 h-6 bg-pink-400 rounded mt-1 shrink-0" />
                <div>
                  <div className="font-medium text-white">{f.t}</div>
                  <div className="text-sm font-light text-white/50">{f.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────── Void ──────────────────────────────────

function VoidSection() {
  const ref = useRef<HTMLElement>(null);
  const { y0, y1, y2, y3 } = useSectionParallax(ref);
  const parts = useRandomParticles(150, 55);
  const mouse = useMouseParallax(15);

  const cards = [
    { t: "SPIRAL", d: "Concentric rotating squares unfold endlessly." },
    { t: "WAVE", d: "Sine ripples ride along a frozen current." },
    { t: "GRID", d: "A distorted lattice bends through space." },
    { t: "BURST", d: "Radial energy explodes from a central point." },
    { t: "SEQUENCE", d: "Fibonacci unwinds the geometry of growth." },
  ];

  return (
    <section
      id="void"
      ref={ref}
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{ backgroundColor: "#00101A" }}
    >
      <ParticleField particles={parts} color="#7DD3FC" y={y0} />

      <motion.div className="absolute inset-0" style={{ y: y1 }}>
        <svg className="w-full h-full">
          <defs>
            <pattern id="iso" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 L30 0 L60 30 L30 60 Z" fill="none" stroke="rgba(6,182,212,0.07)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#iso)" />
        </svg>
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: y2 }}>
        <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-sky-600/15 blur-[120px]" />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: y3, x: mouse.x }}>
        <span
          className="absolute top-10 right-10 font-black select-none pointer-events-none"
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 400,
            color: "rgba(6,182,212,0.05)",
            lineHeight: 1,
          }}
        >
          05
        </span>
        <svg className="absolute inset-0 m-auto spin-slow" width="500" height="500" viewBox="-100 -100 200 200">
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const x = Math.cos(a) * 80;
            const y = Math.sin(a) * 80;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="2.5" fill="rgba(6,182,212,0.4)" />
                {Array.from({ length: 10 }).map((_, j) => {
                  if (j <= i) return null;
                  const a2 = (j / 10) * Math.PI * 2;
                  return (
                    <line
                      key={j}
                      x1={x}
                      y1={y}
                      x2={Math.cos(a2) * 80}
                      y2={Math.sin(a2) * 80}
                      stroke="rgba(6,182,212,0.08)"
                      strokeWidth="0.5"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </motion.div>

      <div className="relative z-10 w-full text-center py-40">
        <p
          className="text-[11px] tracking-[0.4em] uppercase text-cyan-400 mb-6"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          005 / Void
        </p>
        <h2
          className="leading-[0.9]"
          style={{
            fontFamily: "Playfair Display, serif",
            letterSpacing: "-0.05em",
          }}
        >
          <span
            className="block font-normal text-white/60"
            style={{ fontSize: "clamp(40px,7vw,96px)", fontWeight: 400 }}
          >
            INTO THE
          </span>
          <span
            className="block font-black gradient-text"
            style={{
              fontSize: "clamp(80px,15vw,200px)",
              background: "linear-gradient(135deg,#06B6D4,#0EA5E9)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            VOID
          </span>
        </h2>

        <div className="mt-20 overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 px-8 lg:px-20 w-max">
            {cards.map((c, i) => (
              <div
                key={c.t}
                className="group w-72 h-96 shrink-0 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur p-0 overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:border-cyan-400/40"
              >
                <div className="h-48 flex items-center justify-center">
                  <CardArt index={i} />
                </div>
                <div className="p-6 text-left">
                  <div
                    className="text-[12px] tracking-[0.3em] text-cyan-400"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  >
                    {c.t}
                  </div>
                  <div className="text-[13px] text-white/50 mt-2 font-light leading-relaxed">
                    {c.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CardArt({ index }: { index: number }) {
  const stroke = "rgba(6,182,212,0.6)";
  if (index === 0) {
    return (
      <svg width="140" height="140" viewBox="-70 -70 140 140" className="spin-slow">
        {[60, 48, 36, 24, 12].map((s, i) => (
          <rect
            key={i}
            x={-s}
            y={-s}
            width={s * 2}
            height={s * 2}
            fill="none"
            stroke={stroke}
            strokeOpacity={0.2 + i * 0.12}
            transform={`rotate(${i * 15})`}
          />
        ))}
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg width="160" height="120" viewBox="0 0 160 120">
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d="M0 60 Q40 0 80 60 T160 60"
            fill="none"
            stroke={stroke}
            strokeOpacity={0.7 - i * 0.15}
            transform={`translate(0 ${i * 8 - 12})`}
          />
        ))}
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg width="160" height="160" viewBox="0 0 160 160">
        {Array.from({ length: 9 }).map((_, i) =>
          Array.from({ length: 9 }).map((_, j) => {
            const dx = Math.sin((i + j) * 0.5) * 4;
            return (
              <circle
                key={`${i}-${j}`}
                cx={i * 18 + 8 + dx}
                cy={j * 18 + 8}
                r="1.5"
                fill={stroke}
              />
            );
          })
        )}
      </svg>
    );
  }
  if (index === 3) {
    return (
      <svg width="160" height="160" viewBox="-80 -80 160 160">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={Math.cos(a) * 20}
              y1={Math.sin(a) * 20}
              x2={Math.cos(a) * 70}
              y2={Math.sin(a) * 70}
              stroke={stroke}
              strokeOpacity={0.6}
            />
          );
        })}
      </svg>
    );
  }
  // fibonacci
  return (
    <svg width="160" height="160" viewBox="-80 -80 160 160">
      <path
        d={(() => {
          let d = "M0 0";
          for (let i = 0; i < 200; i++) {
            const a = i * 0.3;
            const r = a * 2;
            d += ` L${Math.cos(a) * r} ${Math.sin(a) * r}`;
          }
          return d;
        })()}
        fill="none"
        stroke={stroke}
      />
    </svg>
  );
}

// ─────────────────────────── CTA ───────────────────────────────────

function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const { y0 } = useSectionParallax(ref);
  const stars = useRandomParticles(300, 77);

  return (
    <section
      id="cta"
      ref={ref}
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{ backgroundColor: "#050505" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[200px]" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[200px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[200px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-pink-500/10 blur-[200px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-500/06 blur-[200px]" />
      </div>

      <ParticleField particles={stars} color="white" y={y0} />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 text-center py-40">
        <p
          className="text-[11px] tracking-[0.4em] uppercase text-white/30 mb-8"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          006 / The End is the Beginning
        </p>

        <h2
          className="font-black leading-[0.9]"
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(60px,12vw,150px)",
            letterSpacing: "-0.04em",
          }}
        >
          <span className="block text-white">BEGIN</span>
          <span
            className="block text-white/30"
            style={{ fontSize: "clamp(48px,9vw,120px)" }}
          >
            THE
          </span>
          <span
            className="block gradient-text gradient-shift"
            style={{
              background:
                "linear-gradient(90deg,#6366F1,#EC4899,#F59E0B,#10B981,#06B6D4,#6366F1)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            JOURNEY
          </span>
        </h2>

        <p className="font-light text-[20px] text-white/40 max-w-lg mx-auto mt-8 leading-relaxed">
          You have experienced six dimensions of depth. The parallax never ends —
          it only begins again.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-12">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-full border border-white/20 px-10 py-4 text-[14px] font-medium text-white/60 hover:border-white/60 hover:text-white transition-all"
          >
            SCROLL AGAIN
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-10 py-4 text-[14px] font-semibold text-black hover:bg-white/90 hover:scale-[1.02] transition-all"
          >
            VIEW SOURCE
          </a>
        </div>

        <p
          className="text-[11px] tracking-[0.3em] text-white/20 mt-20"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          Made with parallax magic ✦
        </p>
      </div>
    </section>
  );
}