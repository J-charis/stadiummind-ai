import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

/** Ambient animated stadium-bowl visualization built from concentric arcs — no external assets. */
function StadiumAmbient() {
  const rings = [220, 260, 300, 340];
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 800 800" className="h-[140%] w-[140%] opacity-[0.35]" aria-hidden="true">
        <defs>
          <radialGradient id="fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4FD1C5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#4FD1C5" stopOpacity="0" />
          </radialGradient>
        </defs>
        {rings.map((r, i) => (
          <motion.circle
            key={r}
            cx="400"
            cy="400"
            r={r}
            fill="none"
            stroke="#4FD1C5"
            strokeOpacity={0.12 + i * 0.02}
            strokeWidth={1.5}
            strokeDasharray="4 10"
            animate={{ rotate: 360 }}
            transition={{ duration: 60 + i * 20, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '400px 400px' }}
          />
        ))}
        <circle cx="400" cy="400" r="140" fill="url(#fade)" />
      </svg>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border px-6 py-28">
      <StadiumAmbient />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-signal-dim bg-signal-soft px-3.5 py-1.5 text-xs font-medium text-signal"
        >
          <Sparkles size={13} aria-hidden="true" />
          AI Decision Intelligence, not another chatbot
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="font-display text-4xl font-semibold leading-tight tracking-tight text-text-primary sm:text-5xl"
        >
          One AI brain.
          <br />
          <span className="text-signal">Thousands of decisions.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary"
        >
          StadiumMind AI continuously reasons about crowd flow, incidents, and operations across
          a FIFA World Cup 2026 stadium — explaining every recommendation before a human ever has
          to ask.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to={ROUTES.login}>
            <Button size="lg">
              Enter operations console
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </Link>
          <Link to={ROUTES.assistant}>
            <Button size="lg" variant="secondary">
              Try the fan assistant
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
