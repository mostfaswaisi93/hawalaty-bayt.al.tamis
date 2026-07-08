import { Component, ElementRef, computed, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { PdfService } from '../../core/pdf.service';
import { TenantsService } from '../../core/tenants.service';
import { ThemeService } from '../../core/theme.service';
import { LocalDatePipe, LocalNumberPipe } from '../../core/localize.pipes';
import { AddTenantResult, AdminAddTenantDialog } from './admin-add-tenant-dialog';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, TranslateModule, LocalDatePipe, LocalNumberPipe],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard {
  private readonly tenants = inject(TenantsService);
  private readonly auditLog = inject(AuditLogService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly pdf = inject(PdfService);
  private readonly themeService = inject(ThemeService);

  protected exporting = false;
  protected readonly report = viewChild<ElementRef<HTMLElement>>('report');

  protected readonly stats = computed(() => {
    const all = this.tenants.all();
    return {
      total: all.length,
      active: all.filter((t) => t.status === 'active').length,
      trial: all.filter((t) => t.status === 'trial').length,
      suspended: all.filter((t) => t.status === 'suspended').length,
    };
  });

  /** Purely a trust-building indicator: flags attention when any tenant is suspended. */
  protected readonly platformHealthy = computed(() => this.stats().suspended === 0);

  protected readonly recentTenants = computed(() =>
    [...this.tenants.all()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
  );

  protected readonly recentActivity = computed(() =>
    [...this.auditLog.all()].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6),
  );

  /** Platform-wide audit-log volume for each of the last 7 days. */
  protected readonly activityByDay = computed(() => {
    const counts = new Map<string, number>();
    for (const e of this.auditLog.all()) {
      const day = e.timestamp.slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    const days: { date: string; count: number; dayKey: string }[] = [];
    const cursor = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(cursor);
      d.setDate(d.getDate() - i);
      const iso = toLocalIsoDate(d);
      days.push({ date: iso, count: counts.get(iso) ?? 0, dayKey: DAY_KEYS[d.getDay()] });
    }
    return days;
  });

  protected readonly maxDailyActivity = computed(() => Math.max(1, ...this.activityByDay().map((d) => d.count)));

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

  protected openAddTenant(): void {
    this.dialog
      .open(AdminAddTenantDialog, { width: '480px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((result?: AddTenantResult) => {
        if (!result) return;
        this.snackbar.open(
          this.translate.instant('admin.dashboard.tenantAdded', { name: result.businessName }),
          this.translate.instant('common.close'),
          { duration: 3500 },
        );
      });
  }

  protected async exportReport(): Promise<void> {
    const reportEl = this.report()?.nativeElement;
    if (!reportEl) return;
    this.exporting = true;
    const wasDark = this.themeService.isDark();
    if (wasDark) this.themeService.set('light');
    try {
      if (wasDark) await new Promise((resolve) => requestAnimationFrame(resolve));
      await this.pdf.exportElement(reportEl, 'platform-overview');
    } finally {
      if (wasDark) this.themeService.set('dark');
      this.exporting = false;
    }
  }
}
