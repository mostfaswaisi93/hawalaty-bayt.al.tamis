import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { ConstantsService } from '../../core/constants.service';
import { menuCategoryIcon } from '../../core/menu-category-style';
import { MenuService } from '../../core/menu.service';
import { PermissionsService } from '../../core/permissions.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

/** Editor for the "Menu categories" constant — one entry in the Constants list. */
@Component({
  selector: 'app-menu-categories-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title class="!flex !items-center !gap-3">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <mat-icon>restaurant_menu</mat-icon>
      </span>
      {{ 'constants.menuCategories.title' | translate }}
    </h2>

    <mat-dialog-content>
      <p class="mb-5 text-body-sm text-on-surface-variant">{{ 'constants.menuCategories.subtitle' | translate }}</p>

      <div class="mb-6 flex flex-wrap gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4">
        @for (c of constants.menuCategories(); track c) {
          <span class="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest py-1.5 ps-3 pe-2 text-body-sm font-semibold shadow-sm">
            <span class="material-symbols-outlined text-base text-outline">{{ categoryIcon(c) }}</span>
            {{ c }}
            @if (isInUse(c)) {
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-outline/60"
                [matTooltip]="'constants.menuCategories.inUseTooltip' | translate">
                <span class="material-symbols-outlined text-sm">lock</span>
              </span>
            } @else if (permissions.can('constants.manage')) {
              <button
                type="button"
                (click)="removeCategory(c)"
                [attr.aria-label]="'common.delete' | translate"
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-error-container hover:text-error">
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            }
          </span>
        }
        @if (constants.menuCategories().length === 0) {
          <p class="text-body-sm text-on-surface-variant">{{ 'constants.customList.empty' | translate }}</p>
        }
      </div>

      @if (permissions.can('constants.manage')) {
        <div class="flex items-start gap-2">
          <mat-form-field appearance="outline" class="flex-1" subscriptSizing="dynamic">
            <mat-label>{{ 'constants.menuCategories.newCategory' | translate }}</mat-label>
            <input
              matInput
              type="text"
              [ngModel]="newCategory()"
              (ngModelChange)="newCategory.set($event)"
              name="newCategory"
              [placeholder]="'constants.menuCategories.newCategoryPlaceholder' | translate"
              (keydown.enter)="addCategory()" />
          </mat-form-field>
          <button
            mat-mini-fab
            color="primary"
            type="button"
            class="mt-1"
            (click)="addCategory()"
            [attr.aria-label]="'constants.menuCategories.add' | translate">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      }
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
  private readonly auditLog = inject(AuditLogService);
  protected readonly permissions = inject(PermissionsService);

  protected readonly newCategory = signal('');

  protected categoryIcon(category: string): string {
    return menuCategoryIcon(category);
  }

  protected isInUse(category: string): boolean {
    return this.menu.all().some((i) => i.category === category);
  }

  protected addCategory(): void {
    const value = this.newCategory();
    const added = this.constants.addMenuCategory(value);
    if (!added) {
      this.notify('constants.menuCategories.invalid');
      return;
    }
    this.auditLog.log({ action: 'created', entityType: 'constant', entityLabel: value.trim(), category: 'constants' });
    this.newCategory.set('');
    this.notify('constants.menuCategories.addSuccess');
  }

  protected removeCategory(category: string): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: {
          titleKey: 'constants.menuCategories.deleteConfirmTitle',
          messageKey: 'constants.menuCategories.deleteConfirmText',
        },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.constants.removeMenuCategory(category);
        this.auditLog.log({ action: 'deleted', entityType: 'constant', entityLabel: category, category: 'constants' });
        this.notify('constants.menuCategories.deleteSuccess');
      });
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), {
      duration: 3000,
    });
  }
}
