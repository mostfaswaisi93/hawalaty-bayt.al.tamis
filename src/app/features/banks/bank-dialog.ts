import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { Bank, BankEntityType } from '../../data/banks';
import { FieldError } from '../../shared/field-error/field-error';

@Component({
  selector: 'app-bank-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    TranslateModule,
    FieldError,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ (data ? 'banks.editEntity' : 'banks.addEntity') | translate }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-2 pt-2">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'banks.form.type' | translate }}</mat-label>
          <mat-select formControlName="type">
            <mat-option value="bank">{{ 'banks.types.bank' | translate }}</mat-option>
            <mat-option value="wallet">{{ 'banks.types.wallet' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'banks.form.name' | translate }}</mat-label>
          <input matInput formControlName="name" [placeholder]="'banks.form.namePlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.name" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'banks.form.code' | translate }}</mat-label>
          <input matInput formControlName="code" [placeholder]="'banks.form.codePlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.code" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'banks.form.phone' | translate }}</mat-label>
          <input matInput formControlName="phone" dir="ltr" [placeholder]="'banks.form.phonePlaceholder' | translate" />
          <mat-hint>{{ 'banks.form.phoneHint' | translate }}</mat-hint>
        </mat-form-field>

        <mat-slide-toggle formControlName="active" class="mt-1">
          {{ 'banks.form.active' | translate }}
        </mat-slide-toggle>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="submit()">{{ 'common.save' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class BankDialog {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<BankDialog>);
  protected readonly data = inject<Bank | null>(MAT_DIALOG_DATA);

  protected readonly form = this.fb.nonNullable.group({
    type: [this.data?.type ?? ('bank' as BankEntityType), Validators.required],
    name: [this.data?.name ?? '', [Validators.required, Validators.minLength(2)]],
    code: [this.data?.code ?? '', [Validators.required, Validators.minLength(2)]],
    phone: [this.data?.phone ?? ''],
    active: [this.data?.active ?? true],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const result: Bank = {
      id: this.data?.id ?? (v.type === 'wallet' ? 'WLT-' : 'BNK-') + Math.floor(10 + Math.random() * 89),
      type: v.type,
      name: v.name,
      code: v.code,
      active: v.active,
      ...(v.phone.trim() ? { phone: v.phone.trim() } : {}),
    };
    this.ref.close(result);
  }
}
