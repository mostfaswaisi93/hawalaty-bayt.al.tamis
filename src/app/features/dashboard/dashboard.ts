import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocalCurrencyPipe, LocalDatePipe, LocalNumberPipe } from '../../core/localize.pipes';
import { ExpensesService } from '../../core/expenses.service';
import { PermissionsService } from '../../core/permissions.service';
import { MOCK_TRANSFERS, Transfer } from '../../data/transfers';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatIconModule, TranslateModule, LocalCurrencyPipe, LocalNumberPipe, LocalDatePipe],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly expensesService = inject(ExpensesService);
  protected readonly permissions = inject(PermissionsService);

  private readonly allTransfers: Transfer[] = MOCK_TRANSFERS;

  private readonly todaysTransfers = this.allTransfers.filter((t) => t.date === toLocalIsoDate(new Date()));
  protected readonly todaysSales = this.todaysTransfers.reduce((sum, t) => sum + t.amount, 0);
  protected readonly todaysOrderCount = this.todaysTransfers.length;

  protected readonly recentTransfers = [...this.allTransfers].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  protected readonly dailySales = (() => {
    const totals = new Map<string, number>();
    for (const t of this.allTransfers) {
      totals.set(t.date, (totals.get(t.date) ?? 0) + t.amount);
    }
    return [...totals.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-5)
      .map(([date, amount]) => ({ date, amount, dayKey: WEEKDAY_KEYS[new Date(`${date}T00:00:00`).getDay()] }));
  })();

  protected readonly weeklyTotal = this.dailySales.reduce((sum, d) => sum + d.amount, 0);
  protected readonly maxDailySale = Math.max(1, ...this.dailySales.map((d) => d.amount));

  protected readonly recentExpenses = computed(() =>
    [...this.expensesService.all()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
  );

  protected statusPillClass(status: Transfer['status']): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300';
      case 'pending':
        return 'bg-secondary-container/20 text-secondary';
      default:
        return 'bg-error-container text-error dark:bg-error/15';
    }
  }

  protected statusDotClass(status: Transfer['status']): string {
    return status === 'completed' ? 'bg-green-500' : status === 'pending' ? 'bg-secondary-container' : 'bg-error';
  }
}
