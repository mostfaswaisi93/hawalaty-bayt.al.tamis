import { Injectable, signal } from '@angular/core';
import { MenuItem, MOCK_MENU } from '../data/menu';

/**
 * Shared in-memory menu store so items added/edited on the Menu page are
 * immediately selectable from the New Transfer dialog (single source of
 * truth instead of each feature holding its own copy).
 */
@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly items = signal<MenuItem[]>([...MOCK_MENU]);
  readonly all = this.items.asReadonly();

  upsert(item: MenuItem): void {
    this.items.update((list) => {
      const idx = list.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = item;
        return next;
      }
      return [item, ...list];
    });
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((i) => i.id !== id));
  }
}
