import type { AIAgentResponse, OperationalReportPayload } from '@/types/ai';

/**
 * Converts an Operational Report Agent response into a printable,
 * PDF-friendly markdown document — used by Shift Handover and Post-Match
 * Report exports (implementation milestone §3/§4).
 */
export function reportToMarkdown(response: AIAgentResponse): string {
  const payload = response.payload as unknown as OperationalReportPayload;
  const title =
    payload.reportType === 'handover'
      ? 'Shift Handover Report'
      : payload.reportType === 'post_match'
        ? 'Post-Match Report'
        : payload.reportType === 'briefing'
          ? 'Operational Briefing'
          : 'Situation Report';

  const lines: string[] = [
    `# ${title}`,
    '',
    `_Generated ${new Date(response.createdAt).toLocaleString()} — StadiumMind AI_`,
    '',
    `**Summary:** ${response.summary}`,
    '',
    `**Overall risk:** ${response.riskTier}`,
    '',
    '---',
    '',
  ];

  for (const section of payload.sections) {
    lines.push(`## ${section.heading}`, '', section.body, '');
  }

  lines.push('---', '', `**Confidence:** ${Math.round(response.confidenceScore * 100)}%`, '', `**Expected outcome:** ${response.expectedOutcome}`);

  return lines.join('\n');
}

export function downloadMarkdown(filename: string, markdown: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
