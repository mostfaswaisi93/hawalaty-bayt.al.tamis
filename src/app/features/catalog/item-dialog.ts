import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { CatalogItem, CatalogType } from '../../data/catalog';
import { CURRENCIES } from '../../data/transfers';
import { FieldError } from '../../shared/field-error/field-error';

@Component({
  selector: 'app-item-dialog',
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
      {{ (data ? 'catalog.editItem' : 'catalog.addItem') | translate }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-2 pt-2">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'catalog.form.name' | translate }}</mat-label>
          <input matInput formControlName="name" [placeholder]="'catalog.form.namePlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.name" />

        <div class="flex flex-col gap-2 sm:flex-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>{{ 'catalog.form.type' | translate }}</mat-label>
            <mat-select formControlName="type">
              <mat-option value="service">{{ 'catalog.types.service' | translate }}</mat-option>
              <mat-option value="good">{{ 'catalog.types.good' | translate }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>{{ 'catalog.form.category' | translate }}</mat-label>
            <input matInput formControlName="category" [placeholder]="'catalog.form.categoryPlaceholder' | translate" />
          </mat-form-field>
        </div>
        <app-field-error [control]="form.controls.category" />

        <div class="flex flex-col gap-2 sm:flex-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>{{ 'catalog.form.price' | translate }}</mat-label>
            <input matInput type="number" formControlName="price" [placeholder]="'catalog.form.pricePlaceholder' | translate" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>{{ 'catalog.form.currency' | translate }}</mat-label>
            <mat-select formControlName="currency">
              @for (c of currencies; track c) {
                <mat-option [value]="c">{{ c }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <app-field-error [control]="form.controls.price" />

        <mat-slide-toggle formControlName="active" class="mt-1">
          {{ 'catalog.form.active' | translate }}
        </mat-slide-toggle>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="submit()">{{ 'common.save' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class ItemDialog {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<ItemDialog>);
  protected readonly data = inject<CatalogItem | null>(MAT_DIALOG_DATA);

  protected readonly currencies = CURRENCIES;

  protected readonly form = this.fb.nonNullable.group({
    name: [this.data?.name ?? '', [Validators.required, Validators.minLength(2)]],
    type: [this.data?.type ?? ('service' as CatalogType), Validators.required],
    category: [this.data?.category ?? '', [Validators.required, Validators.minLength(2)]],
    price: [this.data?.price ?? null as number | null, [Validators.required, Validators.min(0.01)]],
    currency: [this.data?.currency ?? 'ILS', Validators.required],
    active: [this.data?.active ?? true],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const result: CatalogItem = {
      id: this.data?.id ?? 'ITM-' + Math.floor(10 + Math.random() * 89),
      name: v.name,
      type: v.type,
      category: v.category,
      price: Number(v.price),
      currency: v.currency,
      active: v.active,
    };
    this.ref.close(result);
  }
}
