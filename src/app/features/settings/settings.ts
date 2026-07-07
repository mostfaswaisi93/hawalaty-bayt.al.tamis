import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { MenuCategoriesDialog } from './menu-categories-dialog';

type SettingsTab = 'account' | 'security' | 'notifications' | 'language' | 'constants';
type ConstantType = 'menuCategories';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, TranslateModule],
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly activeTab = signal<SettingsTab>('account');

  /** Personal, per-user settings. */
  protected readonly tabs: { key: SettingsTab; icon: string; label: string }[] = [
    { key: 'account', icon: 'person', label: 'settings.tabs.account' },
    { key: 'security', icon: 'security', label: 'settings.tabs.security' },
    { key: 'notifications', icon: 'notifications_active', label: 'settings.tabs.notifications' },
    { key: 'language', icon: 'language', label: 'settings.tabs.language' },
  ];

  /**
   * Business-wide constants — kept separate from the personal tabs above.
   * Each entry opens its own editor dialog; add new constant types here.
   */
  protected readonly constantTypes: { key: ConstantType; icon: string; titleKey: string; descKey: string }[] = [
    {
      key: 'menuCategories',
      icon: 'restaurant_menu',
      titleKey: 'settings.constants.menuCategories.title',
      descKey: 'settings.constants.menuCategories.subtitle',
    },
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
    this.notify('messages.saveSuccess');
  }

  protected openConstantType(key: ConstantType): void {
    if (key === 'menuCategories') {
      this.dialog.open(MenuCategoriesDialog, { width: '520px', maxWidth: '95vw' });
    }
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), {
      duration: 3000,
    });
  }
}
