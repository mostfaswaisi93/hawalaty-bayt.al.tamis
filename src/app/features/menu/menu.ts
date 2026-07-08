import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { MenuService } from '../../core/menu.service';
import { ConstantsService } from '../../core/constants.service';
import { LocalCurrencyPipe } from '../../core/localize.pipes';
import { menuCategoryBadge, menuCategoryIcon } from '../../core/menu-category-style';
import { PermissionsService } from '../../core/permissions.service';
import { MenuItem } from '../../data/menu';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ItemDialog } from './item-dialog';

interface MenuGroup {
  category: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-menu',
  imports: [FormsModule, TranslateModule, LocalCurrencyPipe],
  templateUrl: './menu.html',
})
export class Menu {
  private readonly menu = inject(MenuService);
  private readonly constants = inject(ConstantsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly auditLog = inject(AuditLogService);
  protected readonly permissions = inject(PermissionsService);

  protected readonly query = signal('');
  protected readonly category = signal<'all' | string>('all');
  protected readonly categories = this.constants.menuCategories;

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
    return this.categories()
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
        const isNew = !this.menu.all().some((i) => i.id === result.id);
        this.menu.upsert(result);
        this.auditLog.log({ action: isNew ? 'created' : 'updated', entityType: 'menuItem', entityLabel: result.name, category: 'menu' });
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
        this.auditLog.log({ action: 'deleted', entityType: 'menuItem', entityLabel: item.name, category: 'menu' });
        this.notify('menu.deleteSuccess');
      });
  }

  protected categoryIcon(category: string): string {
    return menuCategoryIcon(category);
  }

  protected categoryBadge(category: string): string {
    return menuCategoryBadge(category);
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), {
      duration: 3000,
    });
  }
}
