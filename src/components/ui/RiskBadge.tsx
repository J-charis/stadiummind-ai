import { AlertTriangle, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { RiskTier } from '@/types/domain';

const RISK_CONFIG: Record<RiskTier, { label: string; tone: 'low' | 'medium' | 'high' | 'critical'; icon: typeof ShieldCheck }> = {
  low: { label: 'Low risk', tone: 'low', icon: ShieldCheck },
  medium: { label: 'Medium risk', tone: 'medium', icon: TriangleAlert },
  high: { label: 'High risk', tone: 'high', icon: AlertTriangle },
  critical: { label: 'Critical', tone: 'critical', icon: ShieldAlert },
};

/** Risk is always paired with an icon and text label — never color alone. */
export function RiskBadge({ tier }: { tier: RiskTier }) {
  const { label, tone, icon: Icon } = RISK_CONFIG[tier];
  return (
    <Badge tone={tone}>
      <Icon size={12} aria-hidden="true" />
      {label}
    </Badge>
  );
}
