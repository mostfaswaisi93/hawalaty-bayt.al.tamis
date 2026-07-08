export type TenantPlan = 'starter' | 'pro' | 'enterprise';
export type TenantStatus = 'trial' | 'active' | 'suspended';

export interface Tenant {
  id: string;
  /** Plain, user-entered business name — not a translation key, matches how bank/menu-item names work. */
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  plan: TenantPlan;
  status: TenantStatus;
  createdAt: string; // ISO date
  usersCount: number;
}

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'TEN-01',
    businessName: 'بيت التميس',
    ownerName: 'Admin',
    ownerEmail: 'admin@hawalaty.com',
    phone: '+970 59 123 4567',
    plan: 'pro',
    status: 'active',
    createdAt: '2026-05-01',
    usersCount: 3,
  },
  {
    id: 'TEN-02',
    businessName: 'مطعم الأصالة',
    ownerName: 'Yousef Amer',
    ownerEmail: 'owner@alasala.com',
    phone: '+970 59 987 6543',
    plan: 'starter',
    status: 'trial',
    createdAt: '2026-06-20',
    usersCount: 2,
  },
];
