import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HistoryTxn, HistStatus, MOCK_HISTORY } from '../../data/history';
import { LocalNumberPipe, LocalDatePipe } from '../../core/localize.pipes';

type StatusFilter = 'all' | HistStatus;
type TypeFilter = 'all' | string;

@Component({
  selector: 'app-history',
  imports: [FormsModule, RouterLink, TranslateModule, LocalNumberPipe, LocalDatePipe],
  templateUrl: './history.html',
})
export class History {
  protected readonly all = signal<HistoryTxn[]>([...MOCK_HISTORY]);

  protected readonly status = signal<StatusFilter>('all');
  protected readonly type = signal<TypeFilter>('all');
  protected readonly page = signal(1);
  protected readonly pageSize = 4;

  /** Static summary shown in the mockup. */
  protected readonly monthlyTotal = 12450;
  protected readonly changePct = 14.2;

  protected readonly statuses: StatusFilter[] = ['all', 'completed', 'processing', 'cancelled'];
  protected readonly types: TypeFilter[] = ['all', 'international', 'domestic', 'autopay', 'cash'];

  protected readonly filtered = computed(() => {
    const s = this.status();
    const t = this.type();
    return this.all().filter((r) => {
      const okStatus = s === 'all' || r.status === s;
      const okType = t === 'all' || r.typeKey === 'history.types.' + t;
      return okStatus && okType;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );
  protected readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );
  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });
  protected readonly rangeFrom = computed(() =>
    this.filtered().length === 0 ? 0 : (this.page() - 1) * this.pageSize + 1,
  );
  protected readonly rangeTo = computed(() =>
    Math.min(this.page() * this.pageSize, this.filtered().length),
  );

  protected setStatus(s: StatusFilter): void {
    this.status.set(s);
    this.page.set(1);
  }

  protected setType(t: TypeFilter): void {
    this.type.set(t);
    this.page.set(1);
  }

  protected goPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.page.set(p);
  }

  protected statusPill(status: HistStatus): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300';
      case 'processing':
        return 'bg-secondary-container/20 text-secondary';
      default:
        return 'bg-error-container text-error dark:bg-error/15';
    }
  }

  protected statusDot(status: HistStatus): string {
    return status === 'completed' ? 'bg-green-500' : status === 'processing' ? 'bg-secondary-container' : 'bg-error';
  }

  protected amountClass(tone: HistoryTxn['tone']): string {
    return tone === 'positive' ? 'text-green-600 dark:text-green-400' : tone === 'negative' ? 'text-error' : 'text-on-surface';
  }
}
