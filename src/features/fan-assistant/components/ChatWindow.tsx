import { useContext, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { useFanChat } from '@/features/fan-assistant/hooks/useFanChat';
import { useCurrentOperationalContext } from '@/api/useCurrentOperationalContext';
import { LocaleContext } from '@/contexts/LocaleContext';
import { cn } from '@/utils/cn';

export function ChatWindow() {
  const { locale } = useContext(LocaleContext);
  const context = useCurrentOperationalContext();
  const { messages, isThinking, sendMessage } = useFanChat(locale);
  const [input, setInput] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    void sendMessage(input.trim(), context);
    setInput('');
  }

  return (
    <div className="flex h-[560px] flex-col rounded-xl border border-border bg-surface-raised">
      <div className="flex-1 space-y-3 overflow-y-auto p-5" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-signal text-surface-base'
                  : 'border border-border bg-surface-overlay text-text-primary',
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isThinking && <Loader label="Fan Assistant is thinking" />}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <label htmlFor="fan-chat-input" className="sr-only">
          Ask the Fan Assistant a question
        </label>
        <input
          id="fan-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about seating, restrooms, food, navigation…"
          className="flex-1 rounded-lg border border-border-strong bg-surface-overlay px-3.5 py-2.5 text-sm text-text-primary outline-none focus-visible:border-signal"
        />
        <Button type="submit" size="md" aria-label="Send message">
          <Send size={16} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
