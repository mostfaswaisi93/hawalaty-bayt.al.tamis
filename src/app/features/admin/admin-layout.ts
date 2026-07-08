import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { LanguageService } from '../../core/language.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';
import { Logo } from '../../shared/logo/logo';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule,
    TranslateModule,
    LanguageSwitcher,
    Logo,
    ThemeToggle,
  ],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly isRtl = inject(LanguageService).isRtl;
  protected readonly sidebarOpen = signal(false);

  protected readonly nav = [
    { link: '/admin/dashboard', icon: 'dashboard', key: 'admin.nav.dashboard' },
    { link: '/admin/tenants', icon: 'store', key: 'admin.nav.tenants' },
    { link: '/admin/logs', icon: 'history_toggle_off', key: 'admin.nav.logs' },
  ];

  protected logout(): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: { titleKey: 'user.logoutConfirmTitle', messageKey: 'user.logoutConfirmText' },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.auth.logout();
        this.snackbar.open(this.translate.instant('auth.logoutSuccess'), '', { duration: 2500 });
        this.router.navigate(['/login']);
      });
  }
}
