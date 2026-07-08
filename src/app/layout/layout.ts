import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../core/audit-log.service';
import { AuthService } from '../core/auth.service';
import { LanguageService } from '../core/language.service';
import { PermissionsService } from '../core/permissions.service';
import { TransferDialog } from '../features/dashboard/transfer-dialog';
import { PermissionKey } from '../data/roles';
import { Transfer } from '../data/transfers';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';
import { LanguageSwitcher } from '../shared/language-switcher/language-switcher';
import { Logo } from '../shared/logo/logo';
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
    Logo,
    ThemeToggle,
  ],
  templateUrl: './layout.html',
})
export class Layout {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly auditLog = inject(AuditLogService);
  protected readonly permissions = inject(PermissionsService);

  /** Direction decides which way the mobile drawer slides off-screen. */
  protected readonly isRtl = inject(LanguageService).isRtl;
  protected readonly sidebarOpen = signal(false);

  private readonly nav: { link: string; icon: string; key: string; permission?: PermissionKey }[] = [
    { link: '/dashboard', icon: 'dashboard', key: 'nav.dashboard' },
    { link: '/transfers', icon: 'send', key: 'nav.transfers', permission: 'transfers.create' },
    { link: '/history', icon: 'history', key: 'nav.history' },
    { link: '/banks', icon: 'account_balance', key: 'nav.banks', permission: 'banks.manage' },
    { link: '/menu', icon: 'restaurant_menu', key: 'nav.foodMenu', permission: 'menu.manage' },
    { link: '/expenses', icon: 'payments', key: 'nav.expenses', permission: 'expenses.manage' },
    { link: '/reports', icon: 'assessment', key: 'nav.reports' },
    { link: '/constants', icon: 'tune', key: 'nav.constants', permission: 'constants.manage' },
    { link: '/team', icon: 'group', key: 'nav.team', permission: 'team.manage' },
    { link: '/settings', icon: 'settings', key: 'nav.settings' },
  ];

  /** Sidebar entries filtered to what the current user's role actually grants. */
  protected readonly visibleNav = computed(() =>
    this.nav.filter((item) => !item.permission || this.permissions.can(item.permission)),
  );

  protected newOrder(): void {
    this.dialog
      .open(TransferDialog, { width: '560px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((result?: Transfer) => {
        if (!result) return;
        this.auditLog.log({ action: 'created', entityType: 'order', entityLabel: result.id, category: 'transfers' });
        this.snackbar.open(
          this.translate.instant('messages.saveSuccess'),
          this.translate.instant('common.close'),
          { duration: 3000 },
        );
      });
  }

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
