import { motion } from 'framer-motion';
import { Drawer } from '@/components/ui/Drawer';
import { MetricTile } from '@/components/ui/MetricTile';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { Badge } from '@/components/ui/Badge';
import { useUIStore } from '@/store/uiStore';
import { useSections, useCrowdMetrics, useQueueMetrics, useGates } from '@/api/zones.api';
import { useAIRecommendations } from '@/api/aiRecommendations.api';
import { useIncidents } from '@/api/incidents.api';
import { formatPercent } from '@/utils/formatters';
import { HeartPulse, Shield } from 'lucide-react';

/**
 * Zone detail drawer (implementation §8): every zone shows crowd, queue,
 * risk, medical/security relevance, and the current AI recommendation for
 * that zone, with animated transitions on status change.
 */
export function SectionDetailPanel() {
  const selectedZoneId = useUIStore((s) => s.selectedZoneId);
  const setSelectedZone = useUIStore((s) => s.setSelectedZone);
  const { data: sections } = useSections();
  const { data: metrics } = useCrowdMetrics();
  const { data: gates } = useGates();
  const { data: queueMetrics } = useQueueMetrics();
  const { data: recommendations } = useAIRecommendations();
  const { data: incidents } = useIncidents();

  const section = sections?.find((s) => s.id === selectedZoneId);
  const metric = metrics?.find((m) => m.sectionId === selectedZoneId);
  const sectionGates = gates?.filter((g) => g.sectionId === selectedZoneId) ?? [];
  const sectionQueue = queueMetrics?.filter((q) => sectionGates.some((g) => g.id === q.gateId)) ?? [];
  const relatedRecommendation = recommendations?.find(
    (r) => 'sectionId' in r.payload && r.payload.sectionId === selectedZoneId,
  );
  const relatedIncidents = incidents?.filter((i) => i.sectionId === selectedZoneId) ?? [];
  const riskTier =
    (metric?.occupancy ?? 0) >= 0.8 ? 'critical' : (metric?.occupancy ?? 0) >= 0.65 ? 'high' : (metric?.occupancy ?? 0) >= 0.5 ? 'medium' : 'low';

  return (
    <Drawer open={Boolean(section)} onClose={() => setSelectedZone(null)} title={section?.label ?? 'Zone detail'}>
      {section && metric && (
        <div className="space-y-5">
          <motion.div
            key={riskTier}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <RiskBadge tier={riskTier} />
            {relatedIncidents.length > 0 && <Badge tone="high">{relatedIncidents.length} active incident(s)</Badge>}
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <motion.div key={`occ-${metric.occupancy}`} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <MetricTile
                label="Crowd occupancy"
                value={formatPercent(metric.occupancy)}
                tone={metric.occupancy > 0.75 ? 'danger' : metric.occupancy > 0.55 ? 'warning' : 'default'}
              />
            </motion.div>
            <MetricTile label="Flow rate" value={`${metric.flowRate}/min`} />
            <MetricTile label="Walking speed" value={`${metric.walkingSpeed.toFixed(1)} m/s`} />
            <MetricTile label="Capacity" value={section.capacity.toLocaleString()} />
          </div>

          {sectionQueue.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Gate queues
              </div>
              <div className="grid grid-cols-2 gap-3">
                {sectionQueue.map((q) => {
                  const gate = sectionGates.find((g) => g.id === q.gateId);
                  return (
                    <MetricTile
                      key={q.id}
                      label={gate?.label ?? q.gateId}
                      value={`${q.queueLength} · ${Math.round(q.avgWaitSeconds / 60)}m`}
                      tone={q.queueLength > 60 ? 'warning' : 'default'}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <HeartPulse size={14} className="text-risk-low" aria-hidden="true" />
              Medical coverage nominal
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-signal" aria-hidden="true" />
              Security coverage nominal
            </span>
          </div>

          {relatedRecommendation && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Current AI recommendation for this zone
              </div>
              <AIInsightCard response={relatedRecommendation} interactive />
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
