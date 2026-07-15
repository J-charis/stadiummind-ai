import { Tabs } from '@/components/ui/Tabs';

const VIEWS = [
  { id: 'occupancy', label: 'Occupancy' },
  { id: 'queues', label: 'Queues' },
  { id: 'incidents', label: 'Incidents' },
];

/** View-mode toggle for the twin. Filtering logic attaches to tab selection in a later milestone. */
export function TwinToolbar() {
  return (
    <Tabs
      defaultTabId="occupancy"
      tabs={VIEWS.map((v) => ({ id: v.id, label: v.label, content: null }))}
    />
  );
}
