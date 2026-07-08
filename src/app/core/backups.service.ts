import { Injectable, computed, signal } from '@angular/core';
import { Backup, BACKUP_STORAGE_CAPACITY_MB, MOCK_BACKUPS } from '../data/backups';

/** Shared in-memory backup-archive store for the Super Admin's platform-wide backup management. */
@Injectable({ providedIn: 'root' })
export class BackupsService {
  private readonly items = signal<Backup[]>([...MOCK_BACKUPS]);
  readonly all = this.items.asReadonly();

  readonly usedStorageMb = computed(() => this.all().reduce((sum, b) => sum + (b.sizeMb ?? 0), 0));
  readonly capacityMb = BACKUP_STORAGE_CAPACITY_MB;
  readonly usedPercent = computed(() => Math.min(100, Math.round((this.usedStorageMb() / this.capacityMb) * 100)));

  readonly lastSuccessful = computed(() =>
    [...this.all()].filter((b) => b.status === 'completed').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
  );

  add(backup: Backup): void {
    this.items.update((list) => [backup, ...list]);
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((b) => b.id !== id));
  }
}
