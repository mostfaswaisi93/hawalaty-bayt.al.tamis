export type HistStatus = 'completed' | 'processing' | 'cancelled';
export type AmountTone = 'positive' | 'negative' | 'neutral';

export interface HistoryTxn {
  ref: string;
  nameKey: string;
  subKey: string;
  datetime: string; // ISO with time
  typeKey: string;
  status: HistStatus;
  usd: number;
  ils: number;
  avatar?: string; // initials
  icon?: string; // company icon (instead of initials)
  iconTone?: string; // tailwind classes for the icon avatar
  tone: AmountTone;
}

export const MOCK_HISTORY: HistoryTxn[] = [
  { ref: '1R-8829410', nameKey: 'history.names.john', subKey: 'history.subs.intlBank', datetime: '2023-10-24T09:45', typeKey: 'history.types.international', status: 'completed', usd: 2500, ils: 9250, avatar: 'JS', tone: 'positive' },
  { ref: '1R-5541092', nameKey: 'dashboard.parties.sara', subKey: 'history.subs.rinCash', datetime: '2023-10-22T14:15', typeKey: 'history.types.domestic', status: 'processing', usd: 420, ils: 1554, avatar: 'SA', tone: 'neutral' },
  { ref: '1R-1100234', nameKey: 'history.names.asiacell', subKey: 'history.subs.bills', datetime: '2023-10-20T11:00', typeKey: 'history.types.autopay', status: 'completed', usd: 75, ils: 278, icon: 'cell_tower', iconTone: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300', tone: 'neutral' },
  { ref: '1R-9982012', nameKey: 'history.names.mohammedAhmed', subKey: 'history.subs.personal', datetime: '2023-10-18T17:30', typeKey: 'history.types.cash', status: 'cancelled', usd: 1200, ils: 4440, avatar: 'MA', tone: 'negative' },

  { ref: '1R-8814200', nameKey: 'dashboard.parties.rafidain', subKey: 'history.subs.localBank', datetime: '2023-10-16T13:20', typeKey: 'history.types.domestic', status: 'completed', usd: 1800, ils: 6660, icon: 'account_balance', iconTone: 'bg-primary/10 text-primary', tone: 'positive' },
  { ref: '1R-7752300', nameKey: 'dashboard.parties.ali', subKey: 'history.subs.personal', datetime: '2023-10-14T10:05', typeKey: 'history.types.domestic', status: 'completed', usd: 320, ils: 1184, avatar: 'AH', tone: 'neutral' },
  { ref: '1R-7010098', nameKey: 'history.names.asiacell', subKey: 'history.subs.bills', datetime: '2023-10-12T08:30', typeKey: 'history.types.autopay', status: 'processing', usd: 45, ils: 167, icon: 'cell_tower', iconTone: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300', tone: 'neutral' },
  { ref: '1R-6689541', nameKey: 'dashboard.parties.reem', subKey: 'history.subs.rinCash', datetime: '2023-10-10T16:40', typeKey: 'history.types.domestic', status: 'cancelled', usd: 90, ils: 333, avatar: 'RH', tone: 'negative' },

  { ref: '1R-6120087', nameKey: 'dashboard.parties.emirates', subKey: 'history.subs.intlBank', datetime: '2023-10-08T12:00', typeKey: 'history.types.international', status: 'completed', usd: 3400, ils: 12580, icon: 'account_balance', iconTone: 'bg-primary/10 text-primary', tone: 'positive' },
  { ref: '1R-5540012', nameKey: 'dashboard.parties.layla', subKey: 'history.subs.personal', datetime: '2023-10-06T09:15', typeKey: 'history.types.cash', status: 'completed', usd: 200, ils: 740, avatar: 'LA', tone: 'neutral' },
  { ref: '1R-5009923', nameKey: 'dashboard.parties.amazon', subKey: 'history.subs.bills', datetime: '2023-10-04T19:50', typeKey: 'history.types.autopay', status: 'completed', usd: 145, ils: 537, icon: 'shopping_bag', iconTone: 'bg-secondary-container/10 text-secondary', tone: 'negative' },
  { ref: '1R-4488120', nameKey: 'dashboard.parties.mohammed', subKey: 'history.subs.personal', datetime: '2023-10-02T11:25', typeKey: 'history.types.domestic', status: 'processing', usd: 610, ils: 2257, avatar: 'MJ', tone: 'neutral' },
];
