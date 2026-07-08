export interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  password: string;
}

export const SUPER_ADMIN_EMAIL = 'superadmin@hawalaty.com';
export const SUPER_ADMIN_PASSWORD = '123456';

/** Kept separate from TeamMember so the platform overseer never appears in any tenant's own /team roster. */
export const MOCK_SUPER_ADMINS: SuperAdmin[] = [
  { id: 'SA-01', name: 'Platform Admin', email: SUPER_ADMIN_EMAIL, password: SUPER_ADMIN_PASSWORD },
];
