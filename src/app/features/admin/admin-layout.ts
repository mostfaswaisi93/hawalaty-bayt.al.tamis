import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { LanguageService } from '../../core/language.service';
import { LocalDatePipe } from '../../core/localize.pipes';
import { TenantsService } from '../../core/tenants.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';
import { Logo } from '../../shared/logo/logo';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';

type NotificationKind = 'suspended' | 'signup';

interface AdminNotification {
  kind: NotificationKind;
  tenantId: string;
  businessName: string;
  timestamp: string;
}

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
    LocalDatePipe,
  ],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly tenants = inject(TenantsService);

  protected readonly isRtl = inject(LanguageService).isRtl;
  protected readonly sidebarOpen = signal(false);
  protected readonly notificationsOpen = signal(false);

  protected readonly nav = [
    { link: '/admin/dashboard', icon: 'dashboard', key: 'admin.nav.dashboard' },
    { link: '/admin/tenants', icon: 'store', key: 'admin.nav.tenants' },
    { link: '/admin/logs', icon: 'history_toggle_off', key: 'admin.nav.logs' },
    { link: '/admin/backups', icon: 'cloud_upload', key: 'admin.nav.backups' },
  ];

  /** Surfaces the platform events a super admin actually needs to notice: suspensions and new signups. */
  protected readonly notifications = computed<AdminNotification[]>(() => {
    const all = this.tenants.all();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const cutoff = threeDaysAgo.toISOString().slice(0, 10);

    const suspended = all
      .filter((t) => t.status === 'suspended')
      .map((t): AdminNotification => ({ kind: 'suspended', tenantId: t.id, businessName: t.businessName, timestamp: t.createdAt }));

    const recentSignups = all
      .filter((t) => t.createdAt >= cutoff)
      .map((t): AdminNotification => ({ kind: 'signup', tenantId: t.id, businessName: t.businessName, timestamp: t.createdAt }));

    return [...suspended, ...recentSignups].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 8);
  });

  protected toggleNotifications(): void {
    this.notificationsOpen.set(!this.notificationsOpen());
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
