import { Injectable, computed, inject } from '@angular/core';
import { PermissionKey } from '../data/roles';
import { AuthService } from './auth.service';
import { RolesService } from './roles.service';

/** Resolves whether the current user's role grants a given permission. Super admins can do everything. */
@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly auth = inject(AuthService);
  private readonly rolesService = inject(RolesService);

  private readonly currentPermissions = computed<ReadonlySet<PermissionKey>>(() => {
    const user = this.auth.user();
    if (!user?.roleId) return new Set();
    const role = this.rolesService.all().find((r) => r.id === user.roleId);
    return new Set(role?.permissions ?? []);
  });

  can(key: PermissionKey): boolean {
    return this.auth.user()?.isSuperAdmin === true || this.currentPermissions().has(key);
  }
}
