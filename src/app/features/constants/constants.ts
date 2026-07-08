import { Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { ConstantsService, CustomConstantList } from '../../core/constants.service';
import { PermissionsService } from '../../core/permissions.service';
import { AddConstantDialog } from './add-constant-dialog';
import { CustomListDialog } from './custom-list-dialog';
import { MenuCategoriesDialog } from './menu-categories-dialog';

interface ConstantCard {
  key: string;
  icon: string;
  /** Translation key for the built-in card, or the raw title for a user-added one. */
  titleKey?: string;
  title?: string;
  descKey?: string;
  itemCount?: number;
}

@Component({
  selector: 'app-constants',
  imports: [TranslateModule],
  templateUrl: './constants.html',
})
export class Constants {
  protected readonly constants = inject(ConstantsService);
  private readonly dialog = inject(MatDialog);
  private readonly auditLog = inject(AuditLogService);
  protected readonly permissions = inject(PermissionsService);

  protected readonly cards = computed<ConstantCard[]>(() => [
    { key: 'menuCategories', icon: 'restaurant_menu', titleKey: 'constants.menuCategories.title', descKey: 'constants.menuCategories.subtitle' },
    ...this.constants.customLists().map((l) => ({ key: l.key, icon: 'list_alt', title: l.title, itemCount: l.items.length })),
  ]);

  protected openConstantType(key: string): void {
    if (key === 'menuCategories') {
      this.dialog.open(MenuCategoriesDialog, { width: '560px', maxWidth: '95vw' });
      return;
    }
    const list = this.constants.customLists().find((l) => l.key === key);
    if (!list) return;
    this.dialog.open(CustomListDialog, { width: '520px', maxWidth: '95vw', data: { key: list.key, title: list.title } });
  }

  protected openAddConstant(): void {
    this.dialog
      .open(AddConstantDialog, { width: '420px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((created?: CustomConstantList) => {
        if (!created) return;
        this.auditLog.log({ action: 'created', entityType: 'constant', entityLabel: created.title, category: 'constants' });
        this.dialog.open(CustomListDialog, { width: '520px', maxWidth: '95vw', data: { key: created.key, title: created.title } });
      });
  }
}
