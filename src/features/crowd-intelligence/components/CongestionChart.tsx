import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSections, useCrowdMetrics } from '@/api/zones.api';

export function CongestionChart() {
  const { data: sections, isLoading: sLoading } = useSections();
  const { data: metrics, isLoading: mLoading } = useCrowdMetrics();

  if (sLoading || mLoading || !sections || !metrics) {
    return <Skeleton className="h-72 w-full" />;
  }

  const data = metrics.map((m) => ({
    section: sections.find((s) => s.id === m.sectionId)?.code ?? m.sectionId,
    occupancy: Math.round(m.occupancy * 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy by section</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232B3D" vertical={false} />
          <XAxis dataKey="section" stroke="#5B6478" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#5B6478" fontSize={12} tickLine={false} axisLine={false} unit="%" />
          <Tooltip
            contentStyle={{
              background: '#121826',
              border: '1px solid #2F3A52',
              borderRadius: 8,
              fontSize: 12,
              color: '#E6EAF2',
            }}
            cursor={{ fill: 'rgba(79, 209, 197, 0.06)' }}
          />
          <Bar dataKey="occupancy" radius={[4, 4, 0, 0]} fill="#4FD1C5" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
