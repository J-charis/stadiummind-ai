import { SignalMark } from '@/components/layout-primitives/SignalMark';

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <SignalMark size={16} />
          StadiumMind AI — built for the Google Prompt Wars Virtual Challenge
        </div>
        <p className="text-xs text-text-tertiary">
          All operational data shown is simulated for demonstration purposes.
        </p>
      </div>
    </footer>
  );
}
