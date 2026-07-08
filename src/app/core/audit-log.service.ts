import { Injectable, inject, signal } from '@angular/core';
import { AuditAction, AuditCategory, AuditEntityType, AuditLogEntry, MOCK_AUDIT_LOG } from '../data/audit-log';
import { AuthService } from './auth.service';

export interface LogInput {
  action: AuditAction;
  entityType: AuditEntityType;
  entityLabel: string;
  category: AuditCategory;
  /** Overrides the actor's own tenant — needed for super-admin actions performed *on* a tenant (suspend, plan change). */
  tenantId?: string;
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
    const tenantId = entry.tenantId ?? user?.tenantId;
    if (!user || !tenantId) return; // no actor, or a super-admin action with no target tenant to attribute it to
    const { tenantId: _override, ...rest } = entry;
    const full: AuditLogEntry = {
      id: 'LOG-' + Date.now().toString(36).toUpperCase(),
      tenantId,
      actorName: user.name,
      actorEmail: user.email,
      timestamp: new Date().toISOString(),
      ...rest,
    };
    this.items.update((list) => [full, ...list]);
  }
}
