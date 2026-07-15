import type { Gate, StadiumSection } from '@/types/domain';

export const mockSections: StadiumSection[] = [
  { id: 'sec-a', code: 'A', label: 'North Stand', capacity: 12000, polygonSvgId: 'zone-a', sectionType: 'stand' },
  { id: 'sec-b', code: 'B', label: 'East Concourse', capacity: 6000, polygonSvgId: 'zone-b', sectionType: 'concourse' },
  { id: 'sec-c', code: 'C', label: 'South Stand', capacity: 12000, polygonSvgId: 'zone-c', sectionType: 'stand' },
  { id: 'sec-d', code: 'D', label: 'West Concourse', capacity: 6000, polygonSvgId: 'zone-d', sectionType: 'concourse' },
  { id: 'sec-vip', code: 'VIP', label: 'VIP Terrace', capacity: 800, polygonSvgId: 'zone-vip', sectionType: 'vip' },
  { id: 'sec-med', code: 'MED-1', label: 'Medical Bay 1', capacity: 40, polygonSvgId: 'zone-med', sectionType: 'medical_bay' },
];

export const mockGates: Gate[] = [
  { id: 'gate-3', code: 'G3', label: 'Gate 3', sectionId: 'sec-a', status: 'open', capacityPerMin: 180 },
  { id: 'gate-4', code: 'G4', label: 'Gate 4', sectionId: 'sec-a', status: 'open', capacityPerMin: 180 },
  { id: 'gate-5', code: 'G5', label: 'Gate 5', sectionId: 'sec-b', status: 'open', capacityPerMin: 150 },
  { id: 'gate-6', code: 'G6', label: 'Gate 6', sectionId: 'sec-b', status: 'closed', capacityPerMin: 150 },
  { id: 'gate-7', code: 'G7', label: 'Gate 7', sectionId: 'sec-c', status: 'open', capacityPerMin: 180 },
  { id: 'gate-8', code: 'G8', label: 'Gate 8', sectionId: 'sec-d', status: 'open', capacityPerMin: 150 },
];
