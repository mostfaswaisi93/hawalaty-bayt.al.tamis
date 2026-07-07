import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConstantsService } from '../../core/constants.service';
import { MenuService } from '../../core/menu.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

/** Editor for the "Menu categories" constant — one entry in the Constants list. */
@Component({
  selector: 'app-menu-categories-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'settings.constants.menuCategories.title' | translate }}</h2>

    <mat-dialog-content>
      <p class="mb-6 text-body-sm text-on-surface-variant">{{ 'settings.constants.menuCategories.subtitle' | translate }}</p>

      <div class="mb-6 flex flex-wrap gap-2">
        @for (c of constants.menuCategories(); track c) {
          <span class="inline-flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-body-sm font-semibold">
            {{ c }}
            <button
              type="button"
              (click)="removeCategory(c)"
              [attr.aria-label]="'common.delete' | translate"
              class="flex h-5 w-5 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-error-container hover:text-error">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </span>
        }
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div class="flex-1 space-y-2">
          <label class="block font-label-caps text-on-surface-variant">{{ 'settings.constants.menuCategories.newCategory' | translate }}</label>
          <input
            type="text"
            [ngModel]="newCategory()"
            (ngModelChange)="newCategory.set($event)"
            [placeholder]="'settings.constants.menuCategories.newCategoryPlaceholder' | translate"
            class="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <button
          type="button"
          (click)="addCategory()"
          class="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-all hover:shadow-lg active:scale-95">
          <span class="material-symbols-outlined">add</span>
          {{ 'settings.constants.menuCategories.add' | translate }}
        </button>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.close' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class MenuCategoriesDialog {
  protected readonly constants = inject(ConstantsService);
  private readonly menu = inject(MenuService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly ref = inject(MatDialogRef<MenuCategoriesDialog>);

  protected readonly newCategory = signal('');

  protected addCategory(): void {
    const added = this.constants.addMenuCategory(this.newCategory());
    if (!added) {
      this.notify('settings.constants.menuCategories.invalid');
      return;
    }
    this.newCategory.set('');
    this.notify('settings.constants.menuCategories.addSuccess');
  }

  protected removeCategory(category: string): void {
    if (this.menu.all().some((i) => i.category === category)) {
      this.notify('settings.constants.menuCategories.inUse');
      return;
    }

    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: {
          titleKey: 'settings.constants.menuCategories.deleteConfirmTitle',
          messageKey: 'settings.constants.menuCategories.deleteConfirmText',
        },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.constants.removeMenuCategory(category);
        this.notify('settings.constants.menuCategories.deleteSuccess');
      });
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), {
      duration: 3000,
    });
  }
}
