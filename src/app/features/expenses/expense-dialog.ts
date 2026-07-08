import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { BanksService } from '../../core/banks.service';
import { Expense } from '../../data/expenses';
import { FieldError } from '../../shared/field-error/field-error';

@Component({
  selector: 'app-expense-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
    FieldError,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ (data ? 'expenses.editExpense' : 'expenses.addExpense') | translate }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-2 pt-2">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'expenses.form.description' | translate }}</mat-label>
          <input matInput formControlName="description" [placeholder]="'expenses.form.descriptionPlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.description" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'expenses.form.amount' | translate }}</mat-label>
          <input matInput type="number" formControlName="amount" [placeholder]="'expenses.form.amountPlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.amount" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'expenses.form.paidFrom' | translate }}</mat-label>
          <mat-select formControlName="bankId">
            <mat-optgroup [label]="'banks.types.bank' | translate">
              @for (b of banks(); track b.id) {
                <mat-option [value]="b.id">{{ b.name }}</mat-option>
              }
            </mat-optgroup>
            <mat-optgroup [label]="'banks.types.wallet' | translate">
              @for (w of wallets(); track w.id) {
                <mat-option [value]="w.id">{{ w.name }}</mat-option>
              }
            </mat-optgroup>
          </mat-select>
        </mat-form-field>
        <app-field-error [control]="form.controls.bankId" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'expenses.form.date' | translate }}</mat-label>
          <input matInput type="date" formControlName="date" />
        </mat-form-field>
        <app-field-error [control]="form.controls.date" />
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="submit()">{{ 'common.save' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class ExpenseDialog {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<ExpenseDialog>);
  private readonly banksService = inject(BanksService);
  protected readonly data = inject<Expense | null>(MAT_DIALOG_DATA);

  protected readonly banks = computed(() => this.banksService.all().filter((b) => b.active && b.type === 'bank'));
  protected readonly wallets = computed(() => this.banksService.all().filter((b) => b.active && b.type === 'wallet'));

  protected readonly form = this.fb.nonNullable.group({
    description: [this.data?.description ?? '', [Validators.required, Validators.minLength(2)]],
    amount: [this.data?.amount ?? null as number | null, [Validators.required, Validators.min(0.01)]],
    bankId: [this.data?.bankId ?? null as string | null, Validators.required],
    date: [this.data?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10), Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const bank = this.banksService.all().find((b) => b.id === v.bankId);
    const result: Expense = {
      id: this.data?.id ?? 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      description: v.description,
      amount: Number(v.amount),
      bankId: v.bankId!,
      bankName: bank?.name ?? '',
      date: v.date,
    };
    this.ref.close(result);
  }
}
