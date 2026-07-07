import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, RouterLink, TranslateModule],
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly auth = inject(AuthService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly form = signal({
    fullName: this.auth.user()?.name ?? '',
    email: this.auth.user()?.email ?? '',
    phone: '770 123 4567',
    dob: '1985-05-12',
    bio: '',
  });

  protected update(key: 'fullName' | 'email' | 'phone' | 'dob' | 'bio', value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected save(): void {
    this.snackbar.open(
      this.translate.instant('messages.saveSuccess'),
      this.translate.instant('common.close'),
      { duration: 3000 },
    );
  }
}
