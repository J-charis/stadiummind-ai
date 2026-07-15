const STAGES = [
  'Operational Data',
  'Context Builder',
  'AI Orchestrator',
  'Specialized Agents',
  'Explainability Layer',
  'Human Decision',
];

export function ArchitectureOverview() {
  return (
    <section className="border-y border-border bg-surface-raised/40 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-xl">
          <h2 className="font-display text-2xl font-semibold text-text-primary">
            How the reasoning pipeline works
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Every AI judgment in the platform passes through the same six-stage pipeline before
            it ever reaches a screen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center gap-2">
              <div className="rounded-lg border border-border-strong bg-surface-overlay px-4 py-2.5 font-mono text-xs text-text-primary">
                {stage}
              </div>
              {i < STAGES.length - 1 && <span className="text-text-tertiary">&rarr;</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
