import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { Role } from '../../data/roles';
import { TeamMember } from '../../data/team-members';
import { FieldError } from '../../shared/field-error/field-error';

export interface TeamDialogData {
  member: TeamMember | null;
  tenantId: string;
  roles: Role[];
}

@Component({
  selector: 'app-team-dialog',
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
      {{ (data.member ? 'team.editMember' : 'team.addMember') | translate }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-2 pt-2">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'team.form.name' | translate }}</mat-label>
          <input matInput formControlName="name" [placeholder]="'team.form.namePlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.name" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'team.form.email' | translate }}</mat-label>
          <input matInput type="email" formControlName="email" dir="ltr" placeholder="name@example.com" />
        </mat-form-field>
        <app-field-error [control]="form.controls.email" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'team.form.password' | translate }}</mat-label>
          <input matInput type="password" formControlName="password" dir="ltr" [placeholder]="(data.member ? 'team.form.passwordKeepPlaceholder' : 'team.form.passwordPlaceholder') | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.password" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'team.form.role' | translate }}</mat-label>
          <mat-select formControlName="roleId">
            @for (r of data.roles; track r.id) {
              <mat-option [value]="r.id">{{ r.isSystem ? (r.name | translate) : r.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <app-field-error [control]="form.controls.roleId" />

        <mat-slide-toggle formControlName="active" class="mt-1">
          {{ 'team.form.active' | translate }}
        </mat-slide-toggle>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="submit()">{{ 'common.save' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class TeamDialog {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<TeamDialog>);
  protected readonly data = inject<TeamDialogData>(MAT_DIALOG_DATA);

  protected readonly form = this.fb.nonNullable.group({
    name: [this.data.member?.name ?? '', [Validators.required, Validators.minLength(2)]],
    email: [this.data.member?.email ?? '', [Validators.required, Validators.email]],
    password: [
      '',
      this.data.member ? [] : [Validators.required, Validators.minLength(4)],
    ],
    roleId: [this.data.member?.roleId ?? this.data.roles[0]?.id ?? '', Validators.required],
    active: [this.data.member?.active ?? true],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const result: TeamMember = {
      id: this.data.member?.id ?? 'MEM-' + Math.floor(1000 + Math.random() * 9000),
      name: v.name,
      email: v.email.trim().toLowerCase(),
      password: v.password.trim() || this.data.member?.password || '123456',
      tenantId: this.data.tenantId,
      roleId: v.roleId,
      active: v.active,
    };
    this.ref.close(result);
  }
}
