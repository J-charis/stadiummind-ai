import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LABELS: Record<string, string> = {
  'command-center': 'Command Center',
  'digital-twin': 'Digital Twin',
  'crowd-intelligence': 'Crowd Intelligence',
  volunteer: 'Volunteer Copilot',
  'simulation-lab': 'Simulation Lab',
  assistant: 'Fan Assistant',
};

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-tertiary">
      <Link to="/" className="hover:text-text-secondary">
        StadiumMind AI
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight size={12} aria-hidden="true" />
            {isLast ? (
              <span aria-current="page" className="text-text-secondary">
                {LABELS[seg] ?? seg}
              </span>
            ) : (
              <Link to={path} className="hover:text-text-secondary">
                {LABELS[seg] ?? seg}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
