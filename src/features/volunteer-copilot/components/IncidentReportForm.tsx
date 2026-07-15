import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useSections } from '@/api/zones.api';
import { useSimulationStore } from '@/store/simulationStore';

const schema = z.object({
  sectionId: z.string().min(1, 'Select a section'),
  type: z.enum(['medical', 'security', 'lost_child', 'crowd_surge', 'other']),
  description: z.string().min(10, 'Please describe the incident in a bit more detail'),
});

type FormValues = z.infer<typeof schema>;

/**
 * Volunteer incident reporting (implementation §6). Submits to the
 * operational timeline immediately — in production this writes a row to
 * `incidents` (Blueprint §7) and triggers the Emergency Response Agent via
 * the orchestrator.
 */
export function IncidentReportForm() {
  const { data: sections } = useSections();
  const pushTimelineEntry = useSimulationStore((s) => s.pushTimelineEntry);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const sectionLabel = sections?.find((s) => s.id === values.sectionId)?.label ?? 'reported section';
    pushTimelineEntry({
      timestamp: new Date().toISOString(),
      label: `Incident reported by volunteer: ${values.type.replace('_', ' ')} near ${sectionLabel}`,
      kind: 'detection',
    });
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report an incident</CardTitle>
      </CardHeader>

      {submitted && (
        <div className="mb-4">
          <Alert tone="success">Incident reported. It now appears in the operational timeline.</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div>
          <label htmlFor="sectionId" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Section
          </label>
          <select
            id="sectionId"
            className="w-full rounded-lg border border-border-strong bg-surface-overlay px-3 py-2.5 text-sm text-text-primary outline-none focus-visible:border-signal"
            {...register('sectionId')}
          >
            <option value="">Select a section…</option>
            {sections?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {errors.sectionId && <p className="mt-1 text-xs text-risk-high">{errors.sectionId.message}</p>}
        </div>

        <div>
          <label htmlFor="type" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Incident type
          </label>
          <select
            id="type"
            className="w-full rounded-lg border border-border-strong bg-surface-overlay px-3 py-2.5 text-sm text-text-primary outline-none focus-visible:border-signal"
            {...register('type')}
          >
            <option value="medical">Medical</option>
            <option value="security">Security</option>
            <option value="lost_child">Lost child</option>
            <option value="crowd_surge">Crowd surge</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-lg border border-border-strong bg-surface-overlay px-3 py-2.5 text-sm text-text-primary outline-none focus-visible:border-signal"
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-xs text-risk-high">{errors.description.message}</p>}
        </div>

        <Button type="submit" size="sm" disabled={isSubmitting}>
          <Send size={14} aria-hidden="true" />
          {isSubmitting ? 'Submitting…' : 'Submit report'}
        </Button>
      </form>

      <div className="mt-3 flex items-start gap-2 text-xs text-text-tertiary">
        <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        For active emergencies, contact your team lead directly in addition to filing this report.
      </div>
    </Card>
  );
}
