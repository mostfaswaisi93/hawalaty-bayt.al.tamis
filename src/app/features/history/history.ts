import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MOCK_TRANSFERS, PaymentMethod, Transfer, TransferStatus } from '../../data/transfers';
import { LocalCurrencyPipe, LocalDatePipe, LocalNumberPipe } from '../../core/localize.pipes';

type StatusFilter = 'all' | TransferStatus;
type PaymentFilter = 'all' | PaymentMethod;

@Component({
  selector: 'app-history',
  imports: [FormsModule, RouterLink, TranslateModule, LocalNumberPipe, LocalCurrencyPipe, LocalDatePipe],
  templateUrl: './history.html',
})
export class History {
  private readonly all: Transfer[] = MOCK_TRANSFERS;

  protected readonly query = signal('');
  protected readonly status = signal<StatusFilter>('all');
  protected readonly paymentMethod = signal<PaymentFilter>('all');
  protected readonly page = signal(1);
  protected readonly pageSize = 4;

  protected readonly statuses: StatusFilter[] = ['all', 'completed', 'pending', 'failed'];
  protected readonly paymentMethods: PaymentFilter[] = ['all', 'cash', 'bank'];

  protected readonly totalRevenue = this.all.reduce((sum, t) => sum + t.amount, 0);
  protected readonly orderCount = this.all.length;

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const s = this.status();
    const p = this.paymentMethod();
    return this.all
      .filter((t) => {
        const okStatus = s === 'all' || t.status === s;
        const okPayment = p === 'all' || t.paymentMethod === p;
        const okQuery = !q || [t.id, t.customer, t.itemName ?? ''].some((f) => f.toLowerCase().includes(q));
        return okStatus && okPayment && okQuery;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
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

  protected setStatus(s: StatusFilter): void {
    this.status.set(s);
    this.page.set(1);
  }

  protected setPaymentMethod(p: PaymentFilter): void {
    this.paymentMethod.set(p);
    this.page.set(1);
  }

  protected goPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.page.set(p);
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

  protected statusPill(status: TransferStatus): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300';
      case 'pending':
        return 'bg-secondary-container/20 text-secondary';
      default:
        return 'bg-error-container text-error dark:bg-error/15';
    }
  }

  protected statusDot(status: TransferStatus): string {
    return status === 'completed' ? 'bg-green-500' : status === 'pending' ? 'bg-secondary-container' : 'bg-error';
  }
}
