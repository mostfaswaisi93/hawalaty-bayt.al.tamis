import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuService } from '../../core/menu.service';
import { LocalCurrencyPipe } from '../../core/localize.pipes';
import { MenuItem, MENU_CATEGORIES } from '../../data/menu';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ItemDialog } from './item-dialog';

interface MenuGroup {
  category: string;
  items: MenuItem[];
}

const CATEGORY_STYLE: Record<string, { icon: string; badge: string }> = {
  'بيتزا': { icon: 'local_pizza', badge: 'bg-brand/10 text-brand' },
  'تميس': { icon: 'lunch_dining', badge: 'bg-secondary-container/20 text-secondary' },
  'الوجبات الغربية': { icon: 'dinner_dining', badge: 'bg-primary/10 text-primary' },
  'السلطات والمقبلات': { icon: 'nutrition', badge: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' },
  'المشروبات': { icon: 'local_cafe', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
};
const DEFAULT_STYLE = { icon: 'restaurant_menu', badge: 'bg-brand/10 text-brand' };

@Component({
  selector: 'app-menu',
  imports: [FormsModule, TranslateModule, LocalCurrencyPipe],
  templateUrl: './menu.html',
})
export class Menu {
  private readonly menu = inject(MenuService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly query = signal('');
  protected readonly category = signal<'all' | string>('all');
  protected readonly categories: readonly string[] = MENU_CATEGORIES;

  private readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const c = this.category();
    return this.menu.all().filter((i) => {
      const okCategory = c === 'all' || i.category === c;
      const okQuery = !q || [i.name, i.category].some((f) => f.toLowerCase().includes(q));
      return okCategory && okQuery;
    });
  });

  protected readonly totalCount = computed(() => this.filtered().length);

  /** Items grouped by category, in printed-menu order; empty groups are dropped. */
  protected readonly groups = computed<MenuGroup[]>(() => {
    const items = this.filtered();
    return this.categories
      .map((category) => ({ category, items: items.filter((i) => i.category === category) }))
      .filter((g) => g.items.length > 0);
  });

  protected setCategory(c: 'all' | string): void {
    this.category.set(c);
  }

  protected openDialog(item?: MenuItem): void {
    this.dialog
      .open(ItemDialog, { width: '520px', maxWidth: '95vw', data: item ?? null })
      .afterClosed()
      .subscribe((result?: MenuItem) => {
        if (!result) return;
        this.menu.upsert(result);
        this.notify('menu.saveSuccess');
      });
  }

  protected remove(item: MenuItem): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: { titleKey: 'menu.deleteConfirmTitle', messageKey: 'menu.deleteConfirmText' },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.menu.remove(item.id);
        this.notify('menu.deleteSuccess');
      });
  }

  protected categoryIcon(category: string): string {
    return (CATEGORY_STYLE[category] ?? DEFAULT_STYLE).icon;
  }

  protected categoryBadge(category: string): string {
    return (CATEGORY_STYLE[category] ?? DEFAULT_STYLE).badge;
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), {
      duration: 3000,
    });
  }
}
