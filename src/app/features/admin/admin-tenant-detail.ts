import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { LocalDatePipe } from '../../core/localize.pipes';
import { RolesService } from '../../core/roles.service';
import { TeamService } from '../../core/team.service';
import { TenantsService } from '../../core/tenants.service';
import { TenantPlan, TenantStatus } from '../../data/tenants';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-tenant-detail',
  imports: [FormsModule, RouterLink, TranslateModule, LocalDatePipe],
  templateUrl: './admin-tenant-detail.html',
})
export class AdminTenantDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tenantsService = inject(TenantsService);
  private readonly teamService = inject(TeamService);
  private readonly rolesService = inject(RolesService);
  private readonly auditLog = inject(AuditLogService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  private readonly tenantId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly plans: TenantPlan[] = ['starter', 'pro', 'enterprise'];

  protected readonly tenant = computed(() => this.tenantsService.all().find((t) => t.id === this.tenantId()));

  protected readonly members = computed(() => this.teamService.forTenant(this.tenantId()));
  protected readonly roles = computed(() => this.rolesService.forTenant(this.tenantId()));
  protected readonly recentActivity = computed(() =>
    this.auditLog.forTenant(this.tenantId()).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 10),
  );

  protected roleName(roleId: string): string {
    const role = this.roles().find((r) => r.id === roleId);
    if (!role) return '—';
    return role.isSystem ? this.translate.instant(role.name) : role.name;
  }

  protected statusTone(status: TenantStatus): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300';
      case 'trial':
        return 'bg-secondary-container/20 text-secondary';
      default:
        return 'bg-error-container text-error dark:bg-error/15';
    }
  }

  protected changePlan(plan: TenantPlan): void {
    const t = this.tenant();
    if (!t || plan === t.plan) return;
    this.tenantsService.updatePlan(t.id, plan);
    this.auditLog.log({ action: 'planChanged', entityType: 'tenant', entityLabel: `${t.businessName} → ${plan}`, category: 'tenant', tenantId: t.id });
    this.notify('admin.tenants.planChangedSuccess');
  }

  protected toggleStatus(): void {
    const t = this.tenant();
    if (!t) return;
    const next: TenantStatus = t.status === 'suspended' ? 'active' : 'suspended';
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        maxWidth: '95vw',
        data: {
          titleKey: next === 'suspended' ? 'admin.tenants.suspendConfirmTitle' : 'admin.tenants.activateConfirmTitle',
          messageKey: next === 'suspended' ? 'admin.tenants.suspendConfirmText' : 'admin.tenants.activateConfirmText',
        },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.tenantsService.updateStatus(t.id, next);
        this.auditLog.log({
          action: next === 'suspended' ? 'suspended' : 'activated',
          entityType: 'tenant',
          entityLabel: t.businessName,
          category: 'tenant',
          tenantId: t.id,
        });
        this.notify(next === 'suspended' ? 'admin.tenants.suspendSuccess' : 'admin.tenants.activateSuccess');
      });
  }

  protected back(): void {
    this.router.navigate(['/admin/tenants']);
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), { duration: 3000 });
  }
}
