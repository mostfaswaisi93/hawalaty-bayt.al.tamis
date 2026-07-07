import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { Bank, BankEntityType, COUNTRIES } from '../../data/banks';
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
        <mat-form-field appearance="outline">
          <mat-label>{{ 'banks.form.type' | translate }}</mat-label>
          <mat-select formControlName="type" (selectionChange)="onTypeChange($event.value)">
            <mat-option value="bank">{{ 'banks.types.bank' | translate }}</mat-option>
            <mat-option value="wallet">{{ 'banks.types.wallet' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'banks.form.name' | translate }}</mat-label>
          <input matInput formControlName="name" [placeholder]="'banks.form.namePlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.name" />

        <div class="flex flex-col gap-2 sm:flex-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>{{ 'banks.form.code' | translate }}</mat-label>
            <input matInput formControlName="code" [placeholder]="'banks.form.codePlaceholder' | translate" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>{{ 'banks.form.country' | translate }}</mat-label>
            <mat-select formControlName="country">
              @for (c of countries; track c) {
                <mat-option [value]="c">{{ c }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <app-field-error [control]="form.controls.code" />

        @if (form.controls.type.value === 'bank') {
          <mat-form-field appearance="outline">
            <mat-label>{{ 'banks.form.swift' | translate }}</mat-label>
            <input matInput formControlName="swift" [placeholder]="'banks.form.swiftPlaceholder' | translate" />
          </mat-form-field>
          <app-field-error [control]="form.controls.swift" />
        }

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

  protected readonly countries = COUNTRIES;

  protected readonly form = this.fb.nonNullable.group({
    type: [this.data?.type ?? ('bank' as BankEntityType), Validators.required],
    name: [this.data?.name ?? '', [Validators.required, Validators.minLength(2)]],
    code: [this.data?.code ?? '', [Validators.required, Validators.minLength(2)]],
    country: [this.data?.country ?? 'PS', Validators.required],
    swift: [this.data?.swift ?? '', this.data?.type === 'wallet' ? [] : [Validators.required, Validators.minLength(8)]],
    active: [this.data?.active ?? true],
  });

  /** SWIFT is only meaningful (and required) for banks — wallets don't have one. */
  protected onTypeChange(type: BankEntityType): void {
    const swiftControl = this.form.controls.swift;
    if (type === 'wallet') {
      swiftControl.clearValidators();
      swiftControl.setValue('');
    } else {
      swiftControl.setValidators([Validators.required, Validators.minLength(8)]);
    }
    swiftControl.updateValueAndValidity();
  }

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
      country: v.country,
      swift: v.type === 'bank' ? v.swift : undefined,
      active: v.active,
    };
    this.ref.close(result);
  }
}
