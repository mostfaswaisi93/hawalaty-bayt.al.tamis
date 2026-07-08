import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { LocalDatePipe, LocalNumberPipe } from '../../core/localize.pipes';
import { TenantsService } from '../../core/tenants.service';
import { AuditAction, AuditCategory } from '../../data/audit-log';

type CategoryFilter = 'all' | AuditCategory;

@Component({
  selector: 'app-admin-logs',
  imports: [FormsModule, TranslateModule, LocalDatePipe, LocalNumberPipe],
  templateUrl: './admin-logs.html',
})
export class AdminLogs {
  private readonly auditLog = inject(AuditLogService);
  private readonly tenantsService = inject(TenantsService);

  protected readonly query = signal('');
  protected readonly category = signal<CategoryFilter>('all');
  protected readonly tenantId = signal('all');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly categories: CategoryFilter[] = [
    'all',
    'tenant',
    'team',
    'transfers',
    'menu',
    'banks',
    'expenses',
    'constants',
    'devices',
    'auth',
  ];

  protected readonly tenants = computed(() => this.tenantsService.all());

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const c = this.category();
    const tId = this.tenantId();
    return this.auditLog
      .all()
      .filter((e) => {
        const okCategory = c === 'all' || e.category === c;
        const okTenant = tId === 'all' || e.tenantId === tId;
        const okQuery = !q || [e.actorName, e.actorEmail, e.entityLabel].some((f) => f.toLowerCase().includes(q));
        return okCategory && okTenant && okQuery;
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  protected readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });
  protected readonly rangeFrom = computed(() => (this.filtered().length === 0 ? 0 : (this.page() - 1) * this.pageSize + 1));
  protected readonly rangeTo = computed(() => Math.min(this.page() * this.pageSize, this.filtered().length));

  protected setQuery(q: string): void {
    this.query.set(q);
    this.page.set(1);
  }

  protected setCategory(c: CategoryFilter): void {
    this.category.set(c);
    this.page.set(1);
  }

  protected setTenant(id: string): void {
    this.tenantId.set(id);
    this.page.set(1);
  }

  protected goPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.page.set(p);
  }

  protected tenantName(tenantId: string): string {
    return this.tenantsService.byId(tenantId)?.businessName ?? '—';
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  protected actionTone(action: AuditAction): string {
    switch (action) {
      case 'created':
      case 'activated':
        return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300';
      case 'deleted':
      case 'suspended':
        return 'bg-error-container text-error dark:bg-error/15';
      case 'updated':
      case 'planChanged':
        return 'bg-secondary-container/20 text-secondary';
      default:
        return 'bg-surface-container-high text-on-surface-variant';
    }
  }
}
