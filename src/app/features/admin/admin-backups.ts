import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { BackupsService } from '../../core/backups.service';
import { LocalDatePipe, LocalNumberPipe } from '../../core/localize.pipes';
import { Backup, BackupStatus } from '../../data/backups';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-backups',
  imports: [FormsModule, TranslateModule, LocalDatePipe, LocalNumberPipe],
  templateUrl: './admin-backups.html',
})
export class AdminBackups {
  private readonly backupsService = inject(BackupsService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly creating = signal(false);
  protected readonly query = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 6;

  protected readonly usedStorageMb = this.backupsService.usedStorageMb;
  protected readonly capacityMb = this.backupsService.capacityMb;
  protected readonly usedPercent = this.backupsService.usedPercent;
  protected readonly lastSuccessful = this.backupsService.lastSuccessful;

  protected readonly nextScheduled = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(2, 0, 0, 0);
    return d;
  })();

  protected readonly hoursSinceLastSuccess = computed(() => {
    const last = this.lastSuccessful();
    if (!last) return null;
    return Math.max(0, Math.round((Date.now() - new Date(last.createdAt).getTime()) / (1000 * 60 * 60)));
  });

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return [...this.backupsService.all()]
      .filter((b) => !q || b.id.toLowerCase().includes(q) || b.actorName.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  protected readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });
  protected readonly rangeFrom = computed(() => (this.filtered().length === 0 ? 0 : (this.page() - 1) * this.pageSize + 1));
  protected readonly rangeTo = computed(() => Math.min(this.page() * this.pageSize, this.filtered().length));

  protected setQuery(q: string): void {
    this.query.set(q);
    this.page.set(1);
  }

  protected goPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.page.set(p);
  }

  protected actorLabel(backup: Backup): string {
    return backup.trigger === 'scheduled' ? this.translate.instant('admin.backups.automatedSystem') : backup.actorName;
  }

  protected statusTone(status: BackupStatus): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300';
      case 'failed':
        return 'bg-error-container text-error dark:bg-error/15';
      default:
        return 'bg-secondary-container/20 text-secondary';
    }
  }

  protected createBackup(): void {
    if (this.creating()) return;
    this.creating.set(true);
    const actorName = this.auth.user()?.name ?? 'Super Admin';
    setTimeout(() => {
      const last = this.filtered()[0];
      const nextNumber = last ? parseInt(last.id.split('-').pop() ?? '0', 10) + 1 : 1;
      const sizeMb = Math.round(400 + Math.random() * 80);
      const backup: Backup = {
        id: `BKP-2026-${String(nextNumber).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        sizeMb,
        trigger: 'manual',
        actorName,
        status: 'completed',
      };
      this.backupsService.add(backup);
      this.creating.set(false);
      this.notify('admin.backups.createSuccess');
    }, 1400);
  }

  protected restoreBackup(backup: Backup): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        maxWidth: '95vw',
        data: { titleKey: 'admin.backups.restoreConfirmTitle', messageKey: 'admin.backups.restoreConfirmText' },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.notify('admin.backups.restoreSuccess', { id: backup.id });
      });
  }

  protected deleteBackup(backup: Backup): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: { titleKey: 'admin.backups.deleteConfirmTitle', messageKey: 'admin.backups.deleteConfirmText' },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.backupsService.remove(backup.id);
        this.notify('admin.backups.deleteSuccess');
      });
  }

  protected downloadBackup(backup: Backup): void {
    const payload = {
      id: backup.id,
      createdAt: backup.createdAt,
      sizeMb: backup.sizeMb,
      trigger: backup.trigger,
      status: backup.status,
      note: 'Simulated backup manifest — Hawalaty demo environment.',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backup.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private notify(key: string, params?: Record<string, unknown>): void {
    this.snackbar.open(this.translate.instant(key, params), this.translate.instant('common.close'), { duration: 3000 });
  }
}
