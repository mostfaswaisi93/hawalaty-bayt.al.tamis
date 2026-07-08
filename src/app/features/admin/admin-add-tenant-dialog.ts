import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { TeamService } from '../../core/team.service';
import { TenantsService } from '../../core/tenants.service';
import { TenantPlan } from '../../data/tenants';
import { TeamMember } from '../../data/team-members';
import { FieldError } from '../../shared/field-error/field-error';

export interface AddTenantResult {
  businessName: string;
}

@Component({
  selector: 'app-admin-add-tenant-dialog',
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, TranslateModule, FieldError],
  template: `
    <h2 mat-dialog-title>{{ 'admin.tenants.addTenant' | translate }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-2 pt-2">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'signup.form.businessName' | translate }}</mat-label>
          <input matInput formControlName="businessName" [placeholder]="'signup.form.businessNamePlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.businessName" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'admin.tenantDetail.phone' | translate }}</mat-label>
          <input matInput dir="ltr" formControlName="phone" placeholder="+970 59 000 0000" />
        </mat-form-field>
        <app-field-error [control]="form.controls.phone" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'signup.form.ownerName' | translate }}</mat-label>
          <input matInput formControlName="ownerName" [placeholder]="'signup.form.ownerNamePlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.ownerName" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'signup.form.ownerEmail' | translate }}</mat-label>
          <input matInput type="email" dir="ltr" formControlName="ownerEmail" placeholder="name@example.com" />
        </mat-form-field>
        <app-field-error [control]="form.controls.ownerEmail" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'team.form.password' | translate }}</mat-label>
          <input matInput type="password" dir="ltr" formControlName="password" [placeholder]="'team.form.passwordPlaceholder' | translate" />
        </mat-form-field>
        <app-field-error [control]="form.controls.password" />

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'admin.tenants.columns.plan' | translate }}</mat-label>
          <mat-select formControlName="plan">
            @for (p of plans; track p) {
              <mat-option [value]="p">{{ 'admin.tenants.plans.' + p | translate }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="submit()">{{ 'common.save' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class AdminAddTenantDialog {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<AdminAddTenantDialog>);
  private readonly tenantsService = inject(TenantsService);
  private readonly teamService = inject(TeamService);
  private readonly auditLog = inject(AuditLogService);

  protected readonly plans: TenantPlan[] = ['starter', 'pro', 'enterprise'];

  protected readonly form = this.fb.nonNullable.group({
    businessName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    ownerName: ['', [Validators.required, Validators.minLength(2)]],
    ownerEmail: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    plan: ['starter' as TenantPlan, Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const { tenant, ownerRoleId } = this.tenantsService.create({
      businessName: v.businessName,
      ownerName: v.ownerName,
      ownerEmail: v.ownerEmail,
      phone: v.phone,
    });
    if (v.plan !== 'starter') {
      this.tenantsService.updatePlan(tenant.id, v.plan);
    }

    const owner: TeamMember = {
      id: 'MEM-' + Math.floor(1000 + Math.random() * 9000),
      name: v.ownerName,
      email: v.ownerEmail.trim().toLowerCase(),
      password: v.password,
      tenantId: tenant.id,
      roleId: ownerRoleId,
      active: true,
    };
    this.teamService.upsert(owner);

    this.auditLog.log({
      action: 'created',
      entityType: 'tenant',
      entityLabel: tenant.businessName,
      category: 'tenant',
      tenantId: tenant.id,
    });

    const result: AddTenantResult = { businessName: tenant.businessName };
    this.ref.close(result);
  }
}
