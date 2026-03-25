"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.7,
    delay,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
});

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* ── Background product images (blurred, decorative) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Left */}
        <motion.div
          className="absolute bottom-0 left-0 w-64 sm:w-80 h-[55%] hidden sm:block"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 0.9, ease: "easeOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-left.png" alt="" className="w-full h-full object-cover object-center opacity-[0.22] blur-[3px] scale-105" />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(to right, transparent 40%, white 85%), linear-gradient(to top, transparent 25%, white 65%)" }} />
        </motion.div>

        {/* Center */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-[42%] hidden lg:block"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1.1, ease: "easeOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-center.png" alt="" className="w-full h-full object-cover object-top opacity-[0.18] blur-[3px] scale-105" />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(to right, white 5%, transparent 25%, transparent 75%, white 95%), linear-gradient(to top, transparent 20%, white 65%)" }} />
        </motion.div>

        {/* Right */}
        <motion.div
          className="absolute bottom-0 right-0 w-64 sm:w-80 h-[55%] hidden sm:block"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 0.9, ease: "easeOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-right.png" alt="" className="w-full h-full object-cover object-center opacity-[0.22] blur-[3px] scale-105" />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(to left, transparent 40%, white 85%), linear-gradient(to top, transparent 25%, white 65%)" }} />
        </motion.div>
      </div>

      {/* ── Gradient blobs ── */}
      <motion.div
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-brand-pink/20 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-brand-yellow/25 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full bg-brand-orange/15 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Logo */}
        <motion.div {...fadeUp(0.05)} className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Dulce Pecado"
            width={110}
            height={110}
            className="rounded-full drop-shadow-xl"
            priority
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.div {...fadeUp(0.1)}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-muted text-brand-pink text-sm font-semibold mb-6 border border-brand-pink/20">
            <Sparkles className="w-3.5 h-3.5" />
            Postres deliciosos · Turrialba, Nuevos Horizontes
          </span>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          className="font-brand text-7xl md:text-8xl lg:text-9xl font-bold leading-none mb-4"
          {...fadeUp(0.2)}
        >
          <span className="gradient-text">Dulce</span>
          <br />
          <span className="text-brand-dark">Pecado</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl md:text-2xl text-brand-dark/60 font-light mb-3 tracking-wide"
          {...fadeUp(0.35)}
        >
          El placer en cada cucharada
        </motion.p>

        {/* Sub-tagline */}
        <motion.p
          className="text-base text-brand-dark/40 mb-10 max-w-md mx-auto"
          {...fadeUp(0.45)}
        >
          Gelatinas mosaico artesanales y apretados gourmet hechos con amor en Costa Rica 🇨🇷
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          {...fadeUp(0.55)}
        >
          <Button
            size="lg"
            onClick={() =>
              document
                .getElementById("productos")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Ver productos
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              document
                .getElementById("nosotros")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Nuestra historia
          </Button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <span className="text-xs text-brand-dark/30 uppercase tracking-widest">
            Descubre más
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-5 h-5 text-brand-pink/50" />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Decorative emoji floaters ── */}
      <motion.span
        className="absolute top-[15%] left-[8%] text-4xl select-none hidden md:block"
        animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🍮
      </motion.span>
      <motion.span
        className="absolute top-[20%] right-[10%] text-3xl select-none hidden md:block"
        animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        🍓
      </motion.span>
      <motion.span
        className="absolute bottom-[20%] left-[12%] text-3xl select-none hidden md:block"
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        🍫
      </motion.span>
      <motion.span
        className="absolute bottom-[25%] right-[8%] text-4xl select-none hidden md:block"
        animate={{ y: [0, -14, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        ✨
      </motion.span>
    </section>
  );
}
