import { Injectable, signal } from '@angular/core';
import { MENU_CATEGORIES } from '../data/menu';

/**
 * Shared, editable business constants. Currently holds the menu categories
 * (seeded from the real printed menu); a natural place to add more editable
 * constants later without another rename.
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
}
