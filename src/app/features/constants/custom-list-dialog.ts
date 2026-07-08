import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { ConstantsService } from '../../core/constants.service';
import { PermissionsService } from '../../core/permissions.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

/** Generic editor for a user-defined custom constant list (add/remove values). */
@Component({
  selector: 'app-custom-list-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>

    <mat-dialog-content>
      <div class="mb-6 flex flex-wrap gap-2">
        @if (items().length === 0) {
          <p class="text-body-sm text-on-surface-variant">{{ 'constants.customList.empty' | translate }}</p>
        }
        @for (v of items(); track v) {
          <span class="inline-flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-body-sm font-semibold">
            {{ v }}
            @if (permissions.can('constants.manage')) {
              <button
                type="button"
                (click)="removeItem(v)"
                [attr.aria-label]="'common.delete' | translate"
                class="flex h-5 w-5 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-error-container hover:text-error">
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            }
          </span>
        }
      </div>

      @if (permissions.can('constants.manage')) {
        <div class="flex items-start gap-2">
          <mat-form-field appearance="outline" class="flex-1" subscriptSizing="dynamic">
            <mat-label>{{ 'constants.customList.newItem' | translate }}</mat-label>
            <input
              matInput
              type="text"
              [ngModel]="newItem()"
              (ngModelChange)="newItem.set($event)"
              name="newItem"
              [placeholder]="'constants.customList.newItemPlaceholder' | translate"
              (keydown.enter)="addItem()" />
          </mat-form-field>
          <button
            mat-mini-fab
            color="primary"
            type="button"
            class="mt-1"
            (click)="addItem()"
            [attr.aria-label]="'constants.customList.add' | translate">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions class="!flex !w-full !items-center !justify-between">
      @if (permissions.can('constants.manage')) {
        <button type="button" (click)="removeType()" class="flex items-center gap-1 rounded-lg px-3 py-2 text-body-sm font-bold text-error transition-colors hover:bg-error-container">
          <span class="material-symbols-outlined text-lg">delete</span>
          {{ 'constants.deleteType' | translate }}
        </button>
      } @else {
        <span></span>
      }
      <button mat-button mat-dialog-close>{{ 'common.close' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class CustomListDialog {
  private readonly constants = inject(ConstantsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly auditLog = inject(AuditLogService);
  protected readonly permissions = inject(PermissionsService);
  private readonly data = inject<{ key: string; title: string }>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<CustomListDialog>);

  protected readonly title = this.data.title;
  protected readonly newItem = signal('');

  protected readonly items = () => this.constants.customLists().find((l) => l.key === this.data.key)?.items ?? [];

  protected addItem(): void {
    const value = this.newItem();
    const added = this.constants.addCustomListItem(this.data.key, value);
    if (!added) {
      this.notify('constants.customList.invalid');
      return;
    }
    this.auditLog.log({ action: 'created', entityType: 'constant', entityLabel: `${this.title}: ${value.trim()}`, category: 'constants' });
    this.newItem.set('');
    this.notify('constants.customList.addSuccess');
  }

  protected removeItem(value: string): void {
    this.constants.removeCustomListItem(this.data.key, value);
    this.auditLog.log({ action: 'deleted', entityType: 'constant', entityLabel: `${this.title}: ${value}`, category: 'constants' });
  }

  protected removeType(): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: {
          titleKey: 'constants.deleteTypeConfirmTitle',
          messageKey: 'constants.deleteTypeConfirmText',
        },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.constants.removeCustomList(this.data.key);
        this.auditLog.log({ action: 'deleted', entityType: 'constant', entityLabel: this.title, category: 'constants' });
        this.notify('constants.deleteTypeSuccess');
        this.ref.close();
      });
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), {
      duration: 3000,
    });
  }
}
