import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { ConstantsService } from '../../core/constants.service';
import { MenuService } from '../../core/menu.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

type SettingsTab = 'account' | 'security' | 'notifications' | 'language' | 'constants';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, TranslateModule],
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly auth = inject(AuthService);
  protected readonly constants = inject(ConstantsService);
  private readonly menu = inject(MenuService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly activeTab = signal<SettingsTab>('account');

  protected readonly tabs: { key: SettingsTab; icon: string; label: string }[] = [
    { key: 'account', icon: 'person', label: 'settings.tabs.account' },
    { key: 'security', icon: 'security', label: 'settings.tabs.security' },
    { key: 'notifications', icon: 'notifications_active', label: 'settings.tabs.notifications' },
    { key: 'language', icon: 'language', label: 'settings.tabs.language' },
    { key: 'constants', icon: 'tune', label: 'settings.tabs.constants' },
  ];

  protected readonly newCategory = signal('');

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

  protected addCategory(): void {
    const added = this.constants.addMenuCategory(this.newCategory());
    if (!added) {
      this.notify('settings.constants.menuCategories.invalid');
      return;
    }
    this.newCategory.set('');
    this.notify('settings.constants.menuCategories.addSuccess');
  }

  protected removeCategory(category: string): void {
    if (this.menu.all().some((i) => i.category === category)) {
      this.notify('settings.constants.menuCategories.inUse');
      return;
    }

    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: {
          titleKey: 'settings.constants.menuCategories.deleteConfirmTitle',
          messageKey: 'settings.constants.menuCategories.deleteConfirmText',
        },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.constants.removeMenuCategory(category);
        this.notify('settings.constants.menuCategories.deleteSuccess');
      });
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), {
      duration: 3000,
    });
  }
}
