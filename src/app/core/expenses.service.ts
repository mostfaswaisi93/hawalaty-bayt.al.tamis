import { Injectable, signal } from '@angular/core';
import { Expense, MOCK_EXPENSES } from '../data/expenses';

/** Shared in-memory expenses store — mirrors MenuService/BanksService. */
@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private readonly items = signal<Expense[]>([...MOCK_EXPENSES]);
  readonly all = this.items.asReadonly();

  upsert(expense: Expense): void {
    this.items.update((list) => {
      const idx = list.findIndex((e) => e.id === expense.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = expense;
        return next;
      }
      return [expense, ...list];
    });
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((e) => e.id !== id));
  }
}
