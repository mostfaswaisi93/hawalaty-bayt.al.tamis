import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { TenantsService } from '../../core/tenants.service';
import { Tenant, TenantPlan, TenantStatus } from '../../data/tenants';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { AddTenantResult, AdminAddTenantDialog } from './admin-add-tenant-dialog';

type StatusFilter = 'all' | TenantStatus;

@Component({
  selector: 'app-admin-tenants',
  imports: [FormsModule, RouterLink, TranslateModule],
  templateUrl: './admin-tenants.html',
})
export class AdminTenants {
  private readonly tenants = inject(TenantsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly auditLog = inject(AuditLogService);

  protected readonly query = signal('');
  protected readonly status = signal<StatusFilter>('all');
  protected readonly statuses: StatusFilter[] = ['all', 'trial', 'active', 'suspended'];
  protected readonly plans: TenantPlan[] = ['starter', 'pro', 'enterprise'];

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const s = this.status();
    return this.tenants
      .all()
      .filter((t) => {
        const okStatus = s === 'all' || t.status === s;
        const okQuery = !q || [t.businessName, t.ownerName, t.ownerEmail].some((f) => f.toLowerCase().includes(q));
        return okStatus && okQuery;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  protected setQuery(q: string): void {
    this.query.set(q);
  }

  protected setStatus(s: StatusFilter): void {
    this.status.set(s);
  }

  protected openAddTenant(): void {
    this.dialog
      .open(AdminAddTenantDialog, { width: '480px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((result?: AddTenantResult) => {
        if (!result) return;
        this.notify('admin.dashboard.tenantAdded', { name: result.businessName });
      });
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

  protected changePlan(tenant: Tenant, plan: TenantPlan): void {
    if (plan === tenant.plan) return;
    this.tenants.updatePlan(tenant.id, plan);
    this.auditLog.log({ action: 'planChanged', entityType: 'tenant', entityLabel: `${tenant.businessName} → ${plan}`, category: 'tenant', tenantId: tenant.id });
    this.notify('admin.tenants.planChangedSuccess');
  }

  protected toggleStatus(tenant: Tenant): void {
    const next: TenantStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
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
        this.tenants.updateStatus(tenant.id, next);
        this.auditLog.log({
          action: next === 'suspended' ? 'suspended' : 'activated',
          entityType: 'tenant',
          entityLabel: tenant.businessName,
          category: 'tenant',
          tenantId: tenant.id,
        });
        this.notify(next === 'suspended' ? 'admin.tenants.suspendSuccess' : 'admin.tenants.activateSuccess');
      });
  }

  private notify(key: string, params?: Record<string, unknown>): void {
    this.snackbar.open(this.translate.instant(key, params), this.translate.instant('common.close'), { duration: 3000 });
  }
}
