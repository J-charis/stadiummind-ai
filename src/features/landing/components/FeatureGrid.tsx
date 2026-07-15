import { LayoutGrid, Map, Activity, MessageCircle, Users, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: LayoutGrid, title: 'AI Command Center', body: 'Risk-ranked incidents and AI recommendations in one operational view, with reasoning attached to every card.' },
  { icon: Map, title: 'Digital Stadium Twin', body: 'An interactive SVG stadium showing live zone health, queues, and incidents at a glance.' },
  { icon: Activity, title: 'Crowd Intelligence', body: 'Continuous congestion forecasting with gate-level recommendations before thresholds are breached.' },
  { icon: MessageCircle, title: 'Fan Assistant', body: 'Multilingual navigation, seating, and accessibility guidance grounded in real venue data.' },
  { icon: Users, title: 'Volunteer Copilot', body: 'AI-assigned tasks with contextual guidance, kept in sync with what Command Center already knows.' },
  { icon: FlaskConical, title: 'Simulation Lab', body: 'Trigger heavy rain, gate closures, medical emergencies, and more — watch the AI reason live.' },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 max-w-xl">
        <h2 className="font-display text-2xl font-semibold text-text-primary">
          Six modules. One reasoning engine.
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Every module below renders the same underlying AI judgments — nothing is a disconnected
          integration.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-xl border border-border bg-surface-raised p-5"
          >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-signal-soft text-signal">
              <f.icon size={17} aria-hidden="true" />
            </span>
            <h3 className="mb-1.5 font-display text-sm font-semibold text-text-primary">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
