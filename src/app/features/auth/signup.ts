import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { AuthService } from '../../core/auth.service';
import { LocalCurrencyPipe } from '../../core/localize.pipes';
import { TeamService } from '../../core/team.service';
import { TenantsService } from '../../core/tenants.service';
import { TeamMember } from '../../data/team-members';
import { FieldError } from '../../shared/field-error/field-error';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';
import { Logo } from '../../shared/logo/logo';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, LanguageSwitcher, Logo, ThemeToggle, FieldError, LocalCurrencyPipe],
  templateUrl: './signup.html',
})
export class Signup {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly tenants = inject(TenantsService);
  private readonly team = inject(TeamService);
  private readonly auditLog = inject(AuditLogService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly loading = signal(false);
  protected readonly hidePassword = signal(true);

  protected readonly steps = ['signup.steps.business', 'signup.steps.owner'];
  protected readonly features = ['signup.feature1', 'signup.feature2', 'signup.feature3'];

  protected readonly form = this.fb.nonNullable.group({
    businessName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(7), Validators.pattern(/^\d[\d\s]*$/)]],
    ownerName: ['', [Validators.required, Validators.minLength(2)]],
    ownerEmail: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', Validators.required],
    terms: [false, Validators.requiredTrue],
  }, { validators: passwordsMatch });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const existing = this.team.findByEmail(this.form.controls.ownerEmail.value);
    if (existing) {
      this.snackbar.open(
        this.translate.instant('signup.emailTaken'),
        this.translate.instant('common.close'),
        { duration: 4000 },
      );
      return;
    }

    const v = this.form.getRawValue();
    this.loading.set(true);

    const { tenant, ownerRoleId } = this.tenants.create({
      businessName: v.businessName,
      ownerName: v.ownerName,
      ownerEmail: v.ownerEmail,
      phone: '+970 ' + v.phone.trim(),
    });

    const owner: TeamMember = {
      id: 'MEM-' + Math.floor(1000 + Math.random() * 9000),
      name: v.ownerName,
      email: v.ownerEmail.trim().toLowerCase(),
      password: v.password,
      tenantId: tenant.id,
      roleId: ownerRoleId,
      active: true,
    };
    this.team.upsert(owner);

    this.auth.completeLogin({
      name: owner.name,
      email: owner.email,
      tenantId: tenant.id,
      roleId: ownerRoleId,
    });
    this.auditLog.log({ action: 'created', entityType: 'tenant', entityLabel: tenant.businessName, category: 'tenant' });

    this.loading.set(false);
    this.snackbar.open(this.translate.instant('signup.welcomeMessage', { name: tenant.businessName }), '', { duration: 3500 });
    this.router.navigate(['/dashboard']);
  }
}
