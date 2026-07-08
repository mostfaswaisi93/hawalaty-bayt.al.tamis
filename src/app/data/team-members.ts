export interface TeamMember {
  id: string;
  /** Plain, user-entered name — not a translation key. */
  name: string;
  email: string;
  password: string;
  tenantId: string;
  roleId: string;
  active: boolean;
}

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  // Tenant 1 (بيت التميس) — the Owner here is the pre-existing demo account (admin@hawalaty.com).
  { id: 'MEM-01', name: 'Admin', email: 'admin@hawalaty.com', password: '123456', tenantId: 'TEN-01', roleId: 'ROL-01-owner', active: true },
  { id: 'MEM-02', name: 'Sara Youssef', email: 'manager@hawalaty.com', password: '123456', tenantId: 'TEN-01', roleId: 'ROL-01-manager', active: true },
  { id: 'MEM-03', name: 'Ahmad Ali', email: 'staff@hawalaty.com', password: '123456', tenantId: 'TEN-01', roleId: 'ROL-01-staff', active: true },
  // Tenant 2 (مطعم الأصالة)
  { id: 'MEM-04', name: 'Yousef Amer', email: 'owner@alasala.com', password: '123456', tenantId: 'TEN-02', roleId: 'ROL-02-owner', active: true },
  { id: 'MEM-05', name: 'Lina Kareem', email: 'staff@alasala.com', password: '123456', tenantId: 'TEN-02', roleId: 'ROL-02-staff', active: true },
];
