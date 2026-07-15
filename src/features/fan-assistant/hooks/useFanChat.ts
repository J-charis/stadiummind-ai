import { useState } from 'react';
import type { AIConversationMessage } from '@/types/ai';
import { runFanAssistantAgent } from '@/services/ai/agents/fanAssistantAgent';
import { resolveGeminiService } from '@/services/ai/geminiService';
import type { OperationalContext } from '@/services/ai/operationalContextBuilder';

const gemini = resolveGeminiService(() => 'MOCK_RESPONSE_NOT_YET_SCHEMA_COMPLIANT');

/**
 * Fan Assistant chat state, backed by the real Fan Assistant Agent
 * (implementation §7). Answers are grounded in whatever OperationalContext
 * is passed to `sendMessage` at call time, so if the stadium state changes
 * mid-conversation the next answer automatically reflects it — the hook
 * itself holds no stale copy of venue data.
 */
export function useFanChat(locale: string) {
  const [messages, setMessages] = useState<AIConversationMessage[]>([
    {
      id: 'm-0',
      conversationId: 'demo',
      role: 'assistant',
      content: "Hi! I'm the StadiumMind Fan Assistant. Ask me about seating, restrooms, food, parking, accessibility, or navigation.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  async function sendMessage(content: string, context: OperationalContext | null) {
    const userMessage: AIConversationMessage = {
      id: `m-${Date.now()}`,
      conversationId: 'demo',
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      let replyText: string;

      if (context) {
        const response = await runFanAssistantAgent(gemini, context, content, locale);
        const escalation = (response.payload as { escalation?: boolean }).escalation;
        replyText = escalation
          ? "This sounds urgent — I've flagged it for a staff member to follow up immediately. If you're in immediate danger, please find the nearest steward or security point right away."
          : response.reasoning;
      } else {
        replyText = "I'm still loading the current venue state — please try asking again in a moment.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-r`,
          conversationId: 'demo',
          role: 'assistant',
          content: replyText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  return { messages, isThinking, sendMessage };
}
