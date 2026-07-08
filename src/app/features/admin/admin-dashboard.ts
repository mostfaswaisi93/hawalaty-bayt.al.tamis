import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { TenantsService } from '../../core/tenants.service';
import { LocalDatePipe } from '../../core/localize.pipes';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, TranslateModule, LocalDatePipe],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard {
  private readonly tenants = inject(TenantsService);
  private readonly auditLog = inject(AuditLogService);

  protected readonly stats = computed(() => {
    const all = this.tenants.all();
    return {
      total: all.length,
      active: all.filter((t) => t.status === 'active').length,
      trial: all.filter((t) => t.status === 'trial').length,
      suspended: all.filter((t) => t.status === 'suspended').length,
    };
  });

  protected readonly recentTenants = computed(() =>
    [...this.tenants.all()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
  );

  protected readonly recentActivity = computed(() =>
    [...this.auditLog.all()].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6),
  );

  protected statusTone(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300';
      case 'trial':
        return 'bg-secondary-container/20 text-secondary';
      default:
        return 'bg-error-container text-error dark:bg-error/15';
    }
  }
}
