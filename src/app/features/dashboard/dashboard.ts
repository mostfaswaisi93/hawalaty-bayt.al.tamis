import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalNumberPipe, LocalDatePipe } from '../../core/localize.pipes';
import { Transfer } from '../../data/transfers';
import { TransferDialog } from './transfer-dialog';

interface ScheduledItem {
  nameKey: string;
  noteKey: string;
  amount: number;
  dueDate?: string;
  dueKey?: string;
  icon: string;
}

interface Txn {
  nameKey: string;
  noteKey: string;
  date: string;
  status: 'completed' | 'pending';
  typeKey: string;
  amount: number;
  direction: 'in' | 'out' | 'neutral';
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatIconModule, TranslateModule, LocalNumberPipe, LocalDatePipe],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly currency = 'ILS';
  protected readonly balance = 12450.0;
  protected readonly accountTail = '8824';
  protected readonly monthlySpending = 4120;

  protected readonly bars = [40, 65, 85, 50, 30];
  protected readonly days = ['sat', 'sun', 'mon', 'tue', 'wed'];

  protected readonly scheduled: ScheduledItem[] = [
    { nameKey: 'dashboard.parties.sara', noteKey: 'dashboard.scheduled.rent', amount: 500, dueDate: '2023-10-25', icon: 'person' },
    { nameKey: 'dashboard.parties.electricity', noteKey: 'dashboard.scheduled.utilities', amount: 75, dueKey: 'dashboard.scheduled.tomorrow', icon: 'bolt' },
  ];

  protected readonly transactions: Txn[] = [
    { nameKey: 'dashboard.parties.amazon', noteKey: 'dashboard.transactions.online', date: '2023-10-20', status: 'completed', typeKey: 'dashboard.transactions.direct', amount: -145, direction: 'out', icon: 'shopping_bag' },
    { nameKey: 'dashboard.parties.rafidain', noteKey: 'dashboard.transactions.incoming', date: '2023-10-18', status: 'completed', typeKey: 'dashboard.transactions.bankTransfer', amount: 2500, direction: 'in', icon: 'account_balance' },
    { nameKey: 'dashboard.parties.jasim', noteKey: 'dashboard.transactions.expenseShare', date: '2023-10-15', status: 'pending', typeKey: 'dashboard.transactions.requestType', amount: 50, direction: 'neutral', icon: 'person' },
  ];

  protected txnIconClass(direction: Txn['direction']): string {
    switch (direction) {
      case 'out':
        return 'bg-secondary-container/10 text-secondary';
      case 'in':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-surface-dim/40 text-on-surface-variant';
    }
  }

  protected txnAmountClass(direction: Txn['direction']): string {
    switch (direction) {
      case 'out':
        return 'text-error';
      case 'in':
        return 'text-primary';
      default:
        return 'text-on-surface';
    }
  }

  protected newTransfer(): void {
    this.dialog
      .open(TransferDialog, { width: '480px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((result?: Transfer) => {
        if (!result) return;
        this.snackbar.open(
          this.translate.instant('messages.saveSuccess'),
          this.translate.instant('common.close'),
          { duration: 3000 },
        );
      });
  }
}
