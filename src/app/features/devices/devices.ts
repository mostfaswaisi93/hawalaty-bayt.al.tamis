import { Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { DevicesService } from '../../core/devices.service';
import { PermissionsService } from '../../core/permissions.service';
import { Device } from '../../data/devices';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-devices',
  imports: [TranslateModule],
  templateUrl: './devices.html',
})
export class Devices {
  private readonly devicesService = inject(DevicesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly auditLog = inject(AuditLogService);
  protected readonly permissions = inject(PermissionsService);

  /** Current device always leads, regardless of mock-data / service ordering. */
  protected readonly devices = computed(() =>
    [...this.devicesService.all()].sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent)),
  );
  protected readonly otherCount = computed(() => this.devices().filter((d) => !d.isCurrent).length);

  protected isActiveNow(device: Device): boolean {
    return device.lastActiveKey === 'devices.activity.now';
  }

  protected signOut(device: Device): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: { titleKey: 'devices.signOutConfirmTitle', messageKey: 'devices.signOutConfirmText' },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.devicesService.signOut(device.id);
        this.auditLog.log({ action: 'signedOut', entityType: 'device', entityLabel: device.name, category: 'devices' });
        this.notify('devices.signOutSuccess');
      });
  }

  protected signOutAllOthers(): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: { titleKey: 'devices.signOutAllConfirmTitle', messageKey: 'devices.signOutAllConfirmText' },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.devicesService.signOutAllOthers();
        this.auditLog.log({ action: 'signedOut', entityType: 'device', entityLabel: 'all other devices', category: 'devices' });
        this.notify('devices.signOutSuccess');
      });
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), {
      duration: 3000,
    });
  }
}
