import { Injectable, signal } from '@angular/core';
import { CatalogItem, MOCK_CATALOG } from '../data/catalog';

/**
 * Shared in-memory catalog store so items added/edited on the Catalog page
 * are immediately selectable from the New Transfer dialog (single source of
 * truth instead of each feature holding its own copy).
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly items = signal<CatalogItem[]>([...MOCK_CATALOG]);
  readonly all = this.items.asReadonly();

  upsert(item: CatalogItem): void {
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
