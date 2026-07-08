import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, DEMO_EMAIL, DEMO_PASSWORD } from '../../core/auth.service';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';
import { Logo } from '../../shared/logo/logo';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';
import { FieldError } from '../../shared/field-error/field-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, LanguageSwitcher, Logo, ThemeToggle, FieldError],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly loading = signal(false);
  protected readonly hidePassword = signal(true);

  protected readonly demoEmail = DEMO_EMAIL;
  protected readonly demoPassword = DEMO_PASSWORD;

  protected readonly features = ['login.feature1', 'login.feature2', 'login.feature3'];

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    remember: [true],
  });

  protected fillDemo(): void {
    this.form.patchValue({ email: this.demoEmail, password: this.demoPassword });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);

    this.auth.login(email, password).subscribe({
      next: (user) => {
        this.auth.completeLogin(user);
        this.loading.set(false);
        this.snackbar.open(this.translate.instant('auth.loginSuccess'), '', { duration: 2500 });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.snackbar.open(
          this.translate.instant('auth.invalidCredentials'),
          this.translate.instant('common.close'),
          { duration: 4000 },
        );
      },
    });
  }
}
