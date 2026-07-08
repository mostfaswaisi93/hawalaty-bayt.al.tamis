import { Injectable, inject, signal } from '@angular/core';
import { AuditAction, AuditCategory, AuditEntityType, AuditLogEntry, MOCK_AUDIT_LOG } from '../data/audit-log';
import { AuthService } from './auth.service';

export interface LogInput {
  action: AuditAction;
  entityType: AuditEntityType;
  entityLabel: string;
  category: AuditCategory;
}

/** Shared in-memory audit-log store. `log()` fills actor/tenant/timestamp from the current session. */
@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly auth = inject(AuthService);

  private readonly items = signal<AuditLogEntry[]>([...MOCK_AUDIT_LOG]);
  readonly all = this.items.asReadonly();

  forTenant(tenantId: string): AuditLogEntry[] {
    return this.all().filter((e) => e.tenantId === tenantId);
  }

  log(entry: LogInput): void {
    const user = this.auth.user();
    if (!user?.tenantId) return; // super-admin actions aren't tenant-scoped; nothing to attribute yet
    const full: AuditLogEntry = {
      id: 'LOG-' + Date.now().toString(36).toUpperCase(),
      tenantId: user.tenantId,
      actorName: user.name,
      actorEmail: user.email,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.items.update((list) => [full, ...list]);
  }
}
