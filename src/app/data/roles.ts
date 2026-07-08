export type PermissionKey =
  | 'transfers.create'
  | 'menu.manage'
  | 'banks.manage'
  | 'expenses.manage'
  | 'constants.manage'
  | 'devices.manage'
  | 'team.manage';

export type RoleKey = 'owner' | 'manager' | 'staff';

export interface Role {
  id: string;
  tenantId: string;
  /** null for custom, tenant-created roles; a system key for the 3 built-in roles. */
  key: RoleKey | null;
  /** Translation key for system roles (isSystem: true); a plain, user-entered name for custom roles. */
  name: string;
  isSystem: boolean;
  permissions: PermissionKey[];
}

export interface PermissionCatalogEntry {
  key: PermissionKey;
  groupKey: string;
  labelKey: string;
}

/** Drives the checkbox-matrix UI in the Roles & Permissions editor. */
export const PERMISSION_CATALOG: PermissionCatalogEntry[] = [
  { key: 'transfers.create', groupKey: 'roles.groups.orders', labelKey: 'roles.permissions.transfersCreate' },
  { key: 'menu.manage', groupKey: 'roles.groups.menu', labelKey: 'roles.permissions.menuManage' },
  { key: 'banks.manage', groupKey: 'roles.groups.banks', labelKey: 'roles.permissions.banksManage' },
  { key: 'expenses.manage', groupKey: 'roles.groups.expenses', labelKey: 'roles.permissions.expensesManage' },
  { key: 'constants.manage', groupKey: 'roles.groups.constants', labelKey: 'roles.permissions.constantsManage' },
  { key: 'devices.manage', groupKey: 'roles.groups.devices', labelKey: 'roles.permissions.devicesManage' },
  { key: 'team.manage', groupKey: 'roles.groups.team', labelKey: 'roles.permissions.teamManage' },
];

const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_CATALOG.map((p) => p.key);

/** Default permission sets for the 3 built-in roles — cloned into real per-tenant `Role`s at tenant-creation time. */
export const SYSTEM_ROLE_TEMPLATES: { key: RoleKey; nameKey: string; permissions: PermissionKey[] }[] = [
  { key: 'owner', nameKey: 'roles.systemRoles.owner', permissions: ALL_PERMISSIONS },
  { key: 'manager', nameKey: 'roles.systemRoles.manager', permissions: ALL_PERMISSIONS.filter((p) => p !== 'team.manage') },
  { key: 'staff', nameKey: 'roles.systemRoles.staff', permissions: ['transfers.create'] },
];

/** Mints the 3 system roles for one tenant, with IDs `ROL-<idSuffix>-owner/manager/staff`. */
export function createSystemRoles(tenantId: string, idSuffix: string): Role[] {
  return SYSTEM_ROLE_TEMPLATES.map((t) => ({
    id: `ROL-${idSuffix}-${t.key}`,
    tenantId,
    key: t.key,
    name: t.nameKey,
    isSystem: true,
    permissions: [...t.permissions],
  }));
}

export const MOCK_ROLES: Role[] = [
  ...createSystemRoles('TEN-01', '01'),
  ...createSystemRoles('TEN-02', '02'),
];
