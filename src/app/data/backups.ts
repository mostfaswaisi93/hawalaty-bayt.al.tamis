export type BackupStatus = 'completed' | 'failed' | 'inProgress';
export type BackupTrigger = 'manual' | 'scheduled';

export interface Backup {
  id: string;
  createdAt: string; // ISO datetime
  /** null while in progress, or when a failed run never finished producing a file. */
  sizeMb: number | null;
  trigger: BackupTrigger;
  /** Plain actor name for manual backups; empty for scheduled ones (rendered via a translation key instead). */
  actorName: string;
  status: BackupStatus;
}

/** Total simulated storage budget for the platform's backup archive. */
export const BACKUP_STORAGE_CAPACITY_MB = 15 * 1024;

export const MOCK_BACKUPS: Backup[] = [
  { id: 'BKP-2026-045', createdAt: '2026-07-08T02:00:00', sizeMb: 452, trigger: 'scheduled', actorName: '', status: 'completed' },
  { id: 'BKP-2026-044', createdAt: '2026-07-07T14:12:00', sizeMb: 450, trigger: 'manual', actorName: 'Platform Admin', status: 'completed' },
  { id: 'BKP-2026-043', createdAt: '2026-07-07T02:00:00', sizeMb: 448, trigger: 'scheduled', actorName: '', status: 'completed' },
  { id: 'BKP-2026-042', createdAt: '2026-07-06T02:00:00', sizeMb: null, trigger: 'scheduled', actorName: '', status: 'failed' },
  { id: 'BKP-2026-041', createdAt: '2026-07-05T02:00:00', sizeMb: 441, trigger: 'scheduled', actorName: '', status: 'completed' },
  { id: 'BKP-2026-040', createdAt: '2026-07-04T02:00:00', sizeMb: 439, trigger: 'scheduled', actorName: '', status: 'completed' },
  { id: 'BKP-2026-039', createdAt: '2026-07-03T09:47:00', sizeMb: 437, trigger: 'manual', actorName: 'Platform Admin', status: 'completed' },
  { id: 'BKP-2026-038', createdAt: '2026-07-03T02:00:00', sizeMb: 436, trigger: 'scheduled', actorName: '', status: 'completed' },
  { id: 'BKP-2026-037', createdAt: '2026-07-02T02:00:00', sizeMb: 433, trigger: 'scheduled', actorName: '', status: 'completed' },
  { id: 'BKP-2026-036', createdAt: '2026-07-01T02:00:00', sizeMb: null, trigger: 'scheduled', actorName: '', status: 'failed' },
  { id: 'BKP-2026-035', createdAt: '2026-06-30T02:00:00', sizeMb: 428, trigger: 'scheduled', actorName: '', status: 'completed' },
  { id: 'BKP-2026-034', createdAt: '2026-06-29T02:00:00', sizeMb: 425, trigger: 'scheduled', actorName: '', status: 'completed' },
];
