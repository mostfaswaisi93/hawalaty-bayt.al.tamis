import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../core/auth.service';
import { LanguageService } from '../core/language.service';
import { LanguageSwitcher } from '../shared/language-switcher/language-switcher';
import { ThemeToggle } from '../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule,
    TranslateModule,
    LanguageSwitcher,
    ThemeToggle,
  ],
  templateUrl: './layout.html',
})
export class Layout {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  /** Direction decides which way the mobile drawer slides off-screen. */
  protected readonly isRtl = inject(LanguageService).isRtl;
  protected readonly sidebarOpen = signal(false);

  protected readonly nav = [
    { link: '/dashboard', icon: 'dashboard', key: 'nav.dashboard' },
    { link: '/transfers', icon: 'send', key: 'nav.transfers' },
    { link: '/history', icon: 'history', key: 'nav.history' },
    { link: '/banks', icon: 'account_balance', key: 'nav.banks' },
    { link: '/catalog', icon: 'inventory_2', key: 'nav.catalog' },
    { link: '/reports', icon: 'assessment', key: 'nav.reports' },
    { link: '/settings', icon: 'settings', key: 'nav.settings' },
  ];

  protected logout(): void {
    this.auth.logout();
    this.snackbar.open(this.translate.instant('auth.logoutSuccess'), '', { duration: 2500 });
    this.router.navigate(['/login']);
  }
}
