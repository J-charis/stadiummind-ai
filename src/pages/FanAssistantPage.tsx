import { ChatWindow, LocaleSelector } from '@/features/fan-assistant';

export default function FanAssistantPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-primary">Fan Assistant</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Ask about seating, navigation, accessibility, or anything else — grounded in live
            venue data.
          </p>
        </div>
        <LocaleSelector />
      </div>

      <ChatWindow />
    </div>
  );
}
