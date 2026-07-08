import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { ConstantsService } from '../../core/constants.service';
import { MenuItem } from '../../data/menu';
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
      {{ (data ? 'menu.editItem' : 'menu.addItem') | translate }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-2 pt-2">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'menu.form.name' | translate }}</mat-label>
          <input matInput formControlName="name" [placeholder]="'menu.form.namePlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.name" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'menu.form.category' | translate }}</mat-label>
          <mat-select formControlName="category">
            @for (c of categories(); track c) {
              <mat-option [value]="c">{{ c }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <app-field-error [control]="form.controls.category" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'menu.form.price' | translate }}</mat-label>
          <input matInput type="number" formControlName="price" [placeholder]="'menu.form.pricePlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.price" />

        <mat-slide-toggle formControlName="active" class="mt-1">
          {{ 'menu.form.active' | translate }}
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
  private readonly constants = inject(ConstantsService);
  protected readonly data = inject<MenuItem | null>(MAT_DIALOG_DATA);

  protected readonly categories = this.constants.menuCategories;

  protected readonly form = this.fb.nonNullable.group({
    name: [this.data?.name ?? '', [Validators.required, Validators.minLength(2)]],
    category: [this.data?.category ?? this.categories()[0], Validators.required],
    price: [this.data?.price ?? null as number | null, [Validators.required, Validators.min(0.01)]],
    active: [this.data?.active ?? true],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const result: MenuItem = {
      id: this.data?.id ?? 'ITM-' + Math.floor(10 + Math.random() * 89),
      name: v.name,
      category: v.category,
      price: Number(v.price),
      active: v.active,
    };
    this.ref.close(result);
  }
}
