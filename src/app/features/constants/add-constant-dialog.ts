import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { ConstantsService } from '../../core/constants.service';

/** Prompts for a name and creates a new custom constant list. */
@Component({
  selector: 'app-add-constant-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'constants.addType.title' | translate }}</h2>

    <mat-dialog-content>
      <form class="flex flex-col gap-2 pt-2">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'constants.addType.nameLabel' | translate }}</mat-label>
          <input
            matInput
            type="text"
            [ngModel]="name()"
            (ngModelChange)="name.set($event)"
            name="name"
            [placeholder]="'constants.addType.namePlaceholder' | translate" />
        </mat-form-field>
        @if (invalid()) {
          <span class="-mt-2 block text-xs text-red-600">{{ 'constants.addType.invalid' | translate }}</span>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="submit()">{{ 'constants.addType.add' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class AddConstantDialog {
  private readonly constants = inject(ConstantsService);
  private readonly ref = inject(MatDialogRef<AddConstantDialog>);

  protected readonly name = signal('');
  protected readonly invalid = signal(false);

  protected submit(): void {
    const created = this.constants.addCustomList(this.name());
    if (!created) {
      this.invalid.set(true);
      return;
    }
    this.ref.close(created);
  }
}
