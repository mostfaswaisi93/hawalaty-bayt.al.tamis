import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '../../core/catalog.service';
import { LocalCurrencyPipe } from '../../core/localize.pipes';
import { CatalogItem, CatalogType } from '../../data/catalog';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ItemDialog } from './item-dialog';

type TypeFilter = 'all' | CatalogType;

@Component({
  selector: 'app-catalog',
  imports: [FormsModule, TranslateModule, LocalCurrencyPipe],
  templateUrl: './catalog.html',
})
export class Catalog {
  private readonly catalog = inject(CatalogService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly query = signal('');
  protected readonly type = signal<TypeFilter>('all');
  protected readonly types: TypeFilter[] = ['all', 'service', 'good'];

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const t = this.type();
    return this.catalog.all().filter((i) => {
      const okType = t === 'all' || i.type === t;
      const okQuery = !q || [i.name, i.category].some((f) => f.toLowerCase().includes(q));
      return okType && okQuery;
    });
  });

  protected setType(t: TypeFilter): void {
    this.type.set(t);
  }

  protected openDialog(item?: CatalogItem): void {
    this.dialog
      .open(ItemDialog, { width: '520px', maxWidth: '95vw', data: item ?? null })
      .afterClosed()
      .subscribe((result?: CatalogItem) => {
        if (!result) return;
        this.catalog.upsert(result);
        this.notify('catalog.saveSuccess');
      });
  }

  protected remove(item: CatalogItem): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: { titleKey: 'catalog.deleteConfirmTitle', messageKey: 'catalog.deleteConfirmText' },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.catalog.remove(item.id);
        this.notify('catalog.deleteSuccess');
      });
  }

  /** Menu items lean on the restaurant brand color (from the logo) instead of the app's navy/amber. */
  protected typeBadgeClass(type: CatalogType): string {
    return type === 'service' ? 'bg-brand text-on-brand' : 'bg-brand/10 text-brand';
  }

  protected typeIcon(type: CatalogType): string {
    return type === 'service' ? 'restaurant_menu' : 'local_pizza';
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), {
      duration: 3000,
    });
  }
}
