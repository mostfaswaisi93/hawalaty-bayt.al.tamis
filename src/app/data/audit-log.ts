export type AuditCategory = 'auth' | 'tenant' | 'team' | 'banks' | 'menu' | 'expenses' | 'constants' | 'devices' | 'transfers';
export type AuditAction = 'created' | 'updated' | 'deleted' | 'signedOut' | 'suspended' | 'activated' | 'planChanged' | 'loggedIn';
export type AuditEntityType = 'expense' | 'bank' | 'menuItem' | 'constant' | 'device' | 'order' | 'teamMember' | 'role' | 'tenant';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  actorName: string;
  actorEmail: string;
  /** Translation key suffix under `auditLog.actions.*`. */
  action: AuditAction;
  /** Translation key suffix under `auditLog.entities.*`. */
  entityType: AuditEntityType;
  /** Plain, human-readable label of the affected record (its own name/description/id). */
  entityLabel: string;
  category: AuditCategory;
  timestamp: string; // ISO datetime
}

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'LOG-01', tenantId: 'TEN-01', actorName: 'Admin', actorEmail: 'admin@hawalaty.com', action: 'created', entityType: 'tenant', entityLabel: 'بيت التميس', category: 'tenant', timestamp: '2026-05-01T09:00:00' },
  { id: 'LOG-02', tenantId: 'TEN-01', actorName: 'Admin', actorEmail: 'admin@hawalaty.com', action: 'created', entityType: 'teamMember', entityLabel: 'Sara Youssef', category: 'team', timestamp: '2026-05-02T10:15:00' },
  { id: 'LOG-03', tenantId: 'TEN-01', actorName: 'Admin', actorEmail: 'admin@hawalaty.com', action: 'created', entityType: 'teamMember', entityLabel: 'Ahmad Ali', category: 'team', timestamp: '2026-05-02T10:20:00' },
  { id: 'LOG-04', tenantId: 'TEN-01', actorName: 'Admin', actorEmail: 'admin@hawalaty.com', action: 'created', entityType: 'bank', entityLabel: 'بنك فلسطين', category: 'banks', timestamp: '2026-05-03T11:00:00' },
  { id: 'LOG-05', tenantId: 'TEN-01', actorName: 'Admin', actorEmail: 'admin@hawalaty.com', action: 'created', entityType: 'menuItem', entityLabel: 'بيتزا مارغريتا', category: 'menu', timestamp: '2026-05-05T12:30:00' },
  { id: 'LOG-06', tenantId: 'TEN-01', actorName: 'Sara Youssef', actorEmail: 'manager@hawalaty.com', action: 'created', entityType: 'expense', entityLabel: 'أسطوانة غاز 2 كيلو', category: 'expenses', timestamp: '2026-07-01T08:40:00' },
  { id: 'LOG-07', tenantId: 'TEN-01', actorName: 'Sara Youssef', actorEmail: 'manager@hawalaty.com', action: 'created', entityType: 'expense', entityLabel: 'طحين ومكونات بيتزا', category: 'expenses', timestamp: '2026-07-02T09:10:00' },
  { id: 'LOG-08', tenantId: 'TEN-01', actorName: 'Ahmad Ali', actorEmail: 'staff@hawalaty.com', action: 'created', entityType: 'order', entityLabel: 'TRX-1001', category: 'transfers', timestamp: '2026-07-01T13:05:00' },
  { id: 'LOG-09', tenantId: 'TEN-01', actorName: 'Ahmad Ali', actorEmail: 'staff@hawalaty.com', action: 'created', entityType: 'order', entityLabel: 'TRX-1002', category: 'transfers', timestamp: '2026-07-02T14:20:00' },
  { id: 'LOG-10', tenantId: 'TEN-01', actorName: 'Admin', actorEmail: 'admin@hawalaty.com', action: 'created', entityType: 'constant', entityLabel: 'حلويات', category: 'constants', timestamp: '2026-07-03T10:00:00' },
  { id: 'LOG-11', tenantId: 'TEN-01', actorName: 'Admin', actorEmail: 'admin@hawalaty.com', action: 'signedOut', entityType: 'device', entityLabel: 'Windows PC', category: 'devices', timestamp: '2026-07-05T16:45:00' },
  { id: 'LOG-12', tenantId: 'TEN-01', actorName: 'Admin', actorEmail: 'admin@hawalaty.com', action: 'loggedIn', entityType: 'teamMember', entityLabel: 'Admin', category: 'auth', timestamp: '2026-07-07T08:00:00' },
  { id: 'LOG-13', tenantId: 'TEN-02', actorName: 'Yousef Amer', actorEmail: 'owner@alasala.com', action: 'created', entityType: 'tenant', entityLabel: 'مطعم الأصالة', category: 'tenant', timestamp: '2026-06-20T09:00:00' },
  { id: 'LOG-14', tenantId: 'TEN-02', actorName: 'Yousef Amer', actorEmail: 'owner@alasala.com', action: 'created', entityType: 'teamMember', entityLabel: 'Lina Kareem', category: 'team', timestamp: '2026-06-21T09:30:00' },
  { id: 'LOG-15', tenantId: 'TEN-02', actorName: 'Lina Kareem', actorEmail: 'staff@alasala.com', action: 'created', entityType: 'order', entityLabel: 'TRX-2001', category: 'transfers', timestamp: '2026-06-25T12:00:00' },
  { id: 'LOG-16', tenantId: 'TEN-02', actorName: 'Yousef Amer', actorEmail: 'owner@alasala.com', action: 'created', entityType: 'expense', entityLabel: 'صيانة الثلاجة', category: 'expenses', timestamp: '2026-06-28T15:00:00' },
];
