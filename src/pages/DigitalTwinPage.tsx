import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StadiumSvgCanvas, SectionDetailPanel, TwinToolbar } from '@/features/digital-twin';

export default function DigitalTwinPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-primary">Digital Stadium Twin</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Click any zone to see live metrics and the AI's reasoning about it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live zone map</CardTitle>
        </CardHeader>
        <TwinToolbar />
        <div className="mt-4">
          <StadiumSvgCanvas />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-risk-low" /> Low occupancy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-risk-medium" /> Medium occupancy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-risk-high" /> High occupancy
          </span>
        </div>
      </Card>

      <SectionDetailPanel />
    </div>
  );
}
