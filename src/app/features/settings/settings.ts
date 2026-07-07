import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';

type SettingsTab = 'account' | 'security' | 'notifications' | 'language';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, TranslateModule],
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly auth = inject(AuthService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly activeTab = signal<SettingsTab>('account');

  protected readonly tabs: { key: SettingsTab; icon: string; label: string }[] = [
    { key: 'account', icon: 'person', label: 'settings.tabs.account' },
    { key: 'security', icon: 'security', label: 'settings.tabs.security' },
    { key: 'notifications', icon: 'notifications_active', label: 'settings.tabs.notifications' },
    { key: 'language', icon: 'language', label: 'settings.tabs.language' },
  ];

  protected readonly form = signal({
    fullName: this.auth.user()?.name ?? '',
    email: this.auth.user()?.email ?? '',
    phone: '770 123 4567',
    dob: '1985-05-12',
    bio: '',
  });

  protected setTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }

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
