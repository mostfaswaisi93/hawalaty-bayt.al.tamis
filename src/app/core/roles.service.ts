import { Injectable, signal } from '@angular/core';
import { createSystemRoles, MOCK_ROLES, Role } from '../data/roles';

/** Shared in-memory roles store. Roles are tenant-scoped — each tenant gets its own clones of the 3 system roles. */
@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly items = signal<Role[]>([...MOCK_ROLES]);
  readonly all = this.items.asReadonly();

  forTenant(tenantId: string): Role[] {
    return this.all().filter((r) => r.tenantId === tenantId);
  }

  upsert(role: Role): void {
    this.items.update((list) => {
      const idx = list.findIndex((r) => r.id === role.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = role;
        return next;
      }
      return [...list, role];
    });
  }

  /** System roles can't be deleted. */
  remove(id: string): void {
    this.items.update((list) => list.filter((r) => r.id !== id || r.isSystem));
  }

  /** Mints and stores the 3 system roles for a newly created tenant, returning the Owner role. */
  createSystemRolesFor(tenantId: string, idSuffix: string): Role {
    const roles = createSystemRoles(tenantId, idSuffix);
    this.items.update((list) => [...list, ...roles]);
    return roles.find((r) => r.key === 'owner')!;
  }
}
