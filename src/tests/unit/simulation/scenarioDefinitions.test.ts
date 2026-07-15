import { describe, it, expect } from 'vitest';
import {
  SCENARIO_DEFINITIONS,
  intensityAtMinute,
  riskTierFromIntensity,
} from '@/services/simulation/scenarioDefinitions';

describe('intensityAtMinute', () => {
  const def = SCENARIO_DEFINITIONS.metro_delay; // peak 0.95 at minute 6, resolves at 18

  it('is zero before the scenario starts', () => {
    expect(intensityAtMinute(def, 0)).toBe(0);
    expect(intensityAtMinute(def, -5)).toBe(0);
  });

  it('ramps up linearly to the peak intensity', () => {
    expect(intensityAtMinute(def, 3)).toBeCloseTo(def.peakIntensity / 2, 5);
    expect(intensityAtMinute(def, def.peakAtMinute)).toBeCloseTo(def.peakIntensity, 5);
  });

  it('decays linearly back toward zero after the peak', () => {
    const midDecay = def.peakAtMinute + (def.resolvesAtMinute - def.peakAtMinute) / 2;
    expect(intensityAtMinute(def, midDecay)).toBeCloseTo(def.peakIntensity / 2, 1);
  });

  it('is exactly zero at and beyond the resolution minute', () => {
    expect(intensityAtMinute(def, def.resolvesAtMinute)).toBe(0);
    expect(intensityAtMinute(def, def.resolvesAtMinute + 10)).toBe(0);
  });

  it('is a pure function — identical inputs always produce identical output', () => {
    const a = intensityAtMinute(def, 4.5);
    const b = intensityAtMinute(def, 4.5);
    expect(a).toBe(b);
  });

  it('never produces a negative or NaN intensity across the full timeline', () => {
    for (let minute = -5; minute <= def.resolvesAtMinute + 5; minute += 0.5) {
      const intensity = intensityAtMinute(def, minute);
      expect(intensity).toBeGreaterThanOrEqual(0);
      expect(Number.isNaN(intensity)).toBe(false);
    }
  });
});

describe('riskTierFromIntensity', () => {
  it('buckets intensity into the correct discrete risk tier', () => {
    expect(riskTierFromIntensity(0)).toBe('low');
    expect(riskTierFromIntensity(0.1)).toBe('low');
    expect(riskTierFromIntensity(0.25)).toBe('medium');
    expect(riskTierFromIntensity(0.49)).toBe('medium');
    expect(riskTierFromIntensity(0.5)).toBe('high');
    expect(riskTierFromIntensity(0.74)).toBe('high');
    expect(riskTierFromIntensity(0.75)).toBe('critical');
    expect(riskTierFromIntensity(1)).toBe('critical');
  });
});

describe('SCENARIO_DEFINITIONS', () => {
  it('defines every scenario with a peak strictly before its resolution', () => {
    for (const def of Object.values(SCENARIO_DEFINITIONS)) {
      expect(def.peakAtMinute).toBeGreaterThan(0);
      expect(def.resolvesAtMinute).toBeGreaterThan(def.peakAtMinute);
      expect(def.peakIntensity).toBeGreaterThan(0);
      expect(def.peakIntensity).toBeLessThanOrEqual(1);
    }
  });

  it('keys match each definition\'s own id field', () => {
    for (const [key, def] of Object.entries(SCENARIO_DEFINITIONS)) {
      expect(def.id).toBe(key);
    }
  });
});
