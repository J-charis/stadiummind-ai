import type { UserRole } from '@/types/domain';

export const ROLE_LABELS: Record<UserRole, string> = {
  ops_manager: 'Operations Manager',
  security: 'Security',
  medical: 'Medical',
  volunteer: 'Volunteer',
  fan: 'Fan',
};

export const STAFF_ROLES: UserRole[] = ['ops_manager', 'security', 'medical', 'volunteer'];
