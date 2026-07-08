import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { AuthService } from '../../core/auth.service';
import { PermissionsService } from '../../core/permissions.service';
import { RolesService } from '../../core/roles.service';
import { TeamService } from '../../core/team.service';
import { PERMISSION_CATALOG, PermissionKey, Role } from '../../data/roles';
import { TeamMember } from '../../data/team-members';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { RoleDialog } from './role-dialog';
import { TeamDialog } from './team-dialog';

type Tab = 'members' | 'roles';

@Component({
  selector: 'app-team',
  imports: [FormsModule, MatTooltipModule, TranslateModule],
  templateUrl: './team.html',
})
export class Team {
  private readonly teamService = inject(TeamService);
  private readonly rolesService = inject(RolesService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly auditLog = inject(AuditLogService);
  protected readonly permissions = inject(PermissionsService);

  protected readonly tab = signal<Tab>('members');
  protected readonly query = signal('');

  private readonly tenantId = computed(() => this.auth.user()?.tenantId ?? '');

  protected readonly roles = computed(() => this.rolesService.forTenant(this.tenantId()));

  protected readonly members = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.teamService
      .forTenant(this.tenantId())
      .filter((m) => !q || [m.name, m.email].some((f) => f.toLowerCase().includes(q)));
  });

  protected setTab(t: Tab): void {
    this.tab.set(t);
  }

  protected roleName(roleId: string): string {
    const role = this.roles().find((r) => r.id === roleId);
    if (!role) return '—';
    return role.isSystem ? this.translate.instant(role.name) : role.name;
  }

  protected isSelf(member: TeamMember): boolean {
    return this.auth.user()?.email === member.email;
  }

  protected permissionLabel(key: PermissionKey): string {
    return PERMISSION_CATALOG.find((p) => p.key === key)?.labelKey ?? key;
  }

  protected openMemberDialog(member?: TeamMember): void {
    this.dialog
      .open(TeamDialog, { width: '480px', maxWidth: '95vw', data: { member: member ?? null, tenantId: this.tenantId(), roles: this.roles() } })
      .afterClosed()
      .subscribe((result?: TeamMember) => {
        if (!result) return;
        const isNew = !this.teamService.all().some((m) => m.id === result.id);
        this.teamService.upsert(result);
        this.auditLog.log({ action: isNew ? 'created' : 'updated', entityType: 'teamMember', entityLabel: result.name, category: 'team' });
        this.notify('team.saveSuccess');
      });
  }

  protected removeMember(member: TeamMember): void {
    if (this.isSelf(member)) {
      this.notify('team.cannotRemoveSelf');
      return;
    }
    const role = this.roles().find((r) => r.id === member.roleId);
    const isLastOwner = role?.key === 'owner' && this.members().filter((m) => m.roleId === member.roleId).length <= 1;
    if (isLastOwner) {
      this.notify('team.cannotRemoveLastOwner');
      return;
    }
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: { titleKey: 'team.deleteConfirmTitle', messageKey: 'team.deleteConfirmText' },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.teamService.remove(member.id);
        this.auditLog.log({ action: 'deleted', entityType: 'teamMember', entityLabel: member.name, category: 'team' });
        this.notify('team.deleteSuccess');
      });
  }

  protected openRoleDialog(role?: Role): void {
    this.dialog
      .open(RoleDialog, { width: '520px', maxWidth: '95vw', data: { role: role ?? null, tenantId: this.tenantId() } })
      .afterClosed()
      .subscribe((result?: Role) => {
        if (!result) return;
        const isNew = !this.rolesService.all().some((r) => r.id === result.id);
        this.rolesService.upsert(result);
        this.auditLog.log({ action: isNew ? 'created' : 'updated', entityType: 'role', entityLabel: result.name, category: 'team' });
        this.notify('roles.saveSuccess');
      });
  }

  protected removeRole(role: Role): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: { titleKey: 'roles.deleteConfirmTitle', messageKey: 'roles.deleteConfirmText' },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.rolesService.remove(role.id);
        this.auditLog.log({ action: 'deleted', entityType: 'role', entityLabel: role.name, category: 'team' });
        this.notify('roles.deleteSuccess');
      });
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), { duration: 3000 });
  }
}
