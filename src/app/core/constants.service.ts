import { Injectable, signal } from '@angular/core';
import { MENU_CATEGORIES } from '../data/menu';

export interface CustomConstantList {
  key: string;
  title: string;
  items: string[];
}

/**
 * Shared, editable business constants. Holds the built-in menu categories
 * (seeded from the real printed menu) plus any user-defined custom constant
 * lists (added from the Constants page), so the business can keep adding new
 * kinds of constants without further code changes.
 */
@Injectable({ providedIn: 'root' })
export class ConstantsService {
  private readonly categories = signal<string[]>([...MENU_CATEGORIES]);
  readonly menuCategories = this.categories.asReadonly();

  /** Returns false if the name is empty or already exists (case-insensitive). */
  addMenuCategory(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (this.categories().some((c) => c.toLowerCase() === trimmed.toLowerCase())) return false;
    this.categories.update((list) => [...list, trimmed]);
    return true;
  }

  removeMenuCategory(name: string): void {
    this.categories.update((list) => list.filter((c) => c !== name));
  }

  private readonly custom = signal<CustomConstantList[]>([]);
  readonly customLists = this.custom.asReadonly();

  /** Returns null if the title is empty or already used by another custom list. */
  addCustomList(title: string): CustomConstantList | null {
    const trimmed = title.trim();
    if (!trimmed) return null;
    if (this.custom().some((l) => l.title.toLowerCase() === trimmed.toLowerCase())) return null;
    const list: CustomConstantList = { key: 'custom-' + Date.now().toString(36), title: trimmed, items: [] };
    this.custom.update((lists) => [...lists, list]);
    return list;
  }

  removeCustomList(key: string): void {
    this.custom.update((lists) => lists.filter((l) => l.key !== key));
  }

  /** Returns false if the value is empty or already exists in that list (case-insensitive). */
  addCustomListItem(key: string, value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;
    let added = false;
    this.custom.update((lists) =>
      lists.map((l) => {
        if (l.key !== key) return l;
        if (l.items.some((i) => i.toLowerCase() === trimmed.toLowerCase())) return l;
        added = true;
        return { ...l, items: [...l.items, trimmed] };
      }),
    );
    return added;
  }

  removeCustomListItem(key: string, value: string): void {
    this.custom.update((lists) =>
      lists.map((l) => (l.key === key ? { ...l, items: l.items.filter((i) => i !== value) } : l)),
    );
  }
}
