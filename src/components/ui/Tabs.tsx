import { useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ tabs, defaultTabId }: { tabs: Tab[]; defaultTabId?: string }) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === activeId);

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeId}
            onClick={() => setActiveId(tab.id)}
            className={cn(
              'relative px-3.5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary',
              tab.id === activeId && 'text-text-primary',
            )}
          >
            {tab.label}
            {tab.id === activeId && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-signal" />
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">
        {activeTab?.content}
      </div>
    </div>
  );
}
