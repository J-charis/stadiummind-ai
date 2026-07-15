export function SignalMark({ size = 22 }: { size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-signal" />
      <span className="absolute inset-[30%] rounded-full bg-signal" />
    </span>
  );
}
