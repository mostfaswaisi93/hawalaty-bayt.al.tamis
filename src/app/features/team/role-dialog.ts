import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { PERMISSION_CATALOG, PermissionKey, Role } from '../../data/roles';
import { FieldError } from '../../shared/field-error/field-error';

export interface RoleDialogData {
  role: Role | null;
  tenantId: string;
}

interface PermissionGroup {
  groupKey: string;
  permissions: { key: PermissionKey; labelKey: string }[];
}

@Component({
  selector: 'app-role-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    FieldError,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ (data.role ? 'roles.editRole' : 'roles.addRole') | translate }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-2 pt-2">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'roles.form.name' | translate }}</mat-label>
          <input matInput formControlName="name" [placeholder]="'roles.form.namePlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.name" />

        <p class="mb-1 mt-4 font-label-caps text-[11px] uppercase tracking-wider text-outline">{{ 'roles.form.permissions' | translate }}</p>
        <div class="flex flex-col gap-4">
          @for (group of groups; track group.groupKey) {
            <div class="rounded-xl border border-outline-variant/40 p-4">
              <p class="mb-2 text-body-sm font-bold text-on-surface-variant">{{ group.groupKey | translate }}</p>
              <div class="flex flex-col gap-1">
                @for (p of group.permissions; track p.key) {
                  <mat-checkbox [checked]="isChecked(p.key)" (change)="toggle(p.key)">{{ p.labelKey | translate }}</mat-checkbox>
                }
              </div>
            </div>
          }
        </div>
        @if (submitted() && selected().size === 0) {
          <p class="text-body-sm text-error">{{ 'roles.form.permissionsRequired' | translate }}</p>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="submit()">{{ 'common.save' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class RoleDialog {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<RoleDialog>);
  protected readonly data = inject<RoleDialogData>(MAT_DIALOG_DATA);

  protected readonly groups: PermissionGroup[] = Array.from(
    new Set(PERMISSION_CATALOG.map((p) => p.groupKey)),
  ).map((groupKey) => ({
    groupKey,
    permissions: PERMISSION_CATALOG.filter((p) => p.groupKey === groupKey).map((p) => ({ key: p.key, labelKey: p.labelKey })),
  }));

  protected readonly form = this.fb.nonNullable.group({
    name: [this.data.role?.name ?? '', [Validators.required, Validators.minLength(2)]],
  });

  protected readonly selected = signal<Set<PermissionKey>>(new Set(this.data.role?.permissions ?? []));
  protected readonly submitted = signal(false);

  protected isChecked(key: PermissionKey): boolean {
    return this.selected().has(key);
  }

  protected toggle(key: PermissionKey): void {
    this.selected.update((set) => {
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.selected().size === 0) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const result: Role = {
      id: this.data.role?.id ?? 'ROL-C-' + Math.floor(1000 + Math.random() * 9000),
      tenantId: this.data.tenantId,
      key: null,
      name: v.name,
      isSystem: false,
      permissions: Array.from(this.selected()),
    };
    this.ref.close(result);
  }
}
