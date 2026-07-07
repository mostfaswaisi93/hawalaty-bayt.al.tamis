import { Injectable, signal } from '@angular/core';
import { Bank, MOCK_BANKS } from '../data/banks';

/**
 * Shared in-memory banks/wallets store — mirrors MenuService so entries
 * added/edited on the Banks & Wallets page are immediately selectable
 * wherever a bank or wallet needs to be chosen (e.g. the transfer dialog).
 */
@Injectable({ providedIn: 'root' })
export class BanksService {
  private readonly items = signal<Bank[]>([...MOCK_BANKS]);
  readonly all = this.items.asReadonly();

  upsert(bank: Bank): void {
    this.items.update((list) => {
      const idx = list.findIndex((b) => b.id === bank.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = bank;
        return next;
      }
      return [bank, ...list];
    });
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((b) => b.id !== id));
  }
}
