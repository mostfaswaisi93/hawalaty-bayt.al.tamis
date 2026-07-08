import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuditLogService } from '../../core/audit-log.service';
import { BanksService } from '../../core/banks.service';
import { ExpensesService } from '../../core/expenses.service';
import { LocalCurrencyPipe, LocalDatePipe, LocalNumberPipe } from '../../core/localize.pipes';
import { PermissionsService } from '../../core/permissions.service';
import { Expense } from '../../data/expenses';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ExpenseDialog } from './expense-dialog';

@Component({
  selector: 'app-expenses',
  imports: [FormsModule, TranslateModule, LocalCurrencyPipe, LocalDatePipe, LocalNumberPipe],
  templateUrl: './expenses.html',
})
export class Expenses {
  private readonly expensesService = inject(ExpensesService);
  private readonly banksService = inject(BanksService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly auditLog = inject(AuditLogService);
  protected readonly permissions = inject(PermissionsService);

  protected readonly query = signal('');
  protected readonly bankId = signal<'all' | string>('all');

  protected readonly payers = computed(() => {
    const used = new Set(this.expensesService.all().map((e) => e.bankId));
    return this.banksService.all().filter((b) => used.has(b.id));
  });

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const b = this.bankId();
    return this.expensesService
      .all()
      .filter((e) => {
        const okBank = b === 'all' || e.bankId === b;
        const okQuery = !q || [e.description, e.bankName].some((f) => f.toLowerCase().includes(q));
        return okBank && okQuery;
      })
      .sort((a, c) => c.date.localeCompare(a.date));
  });

  protected readonly totalCount = computed(() => this.filtered().length);
  protected readonly totalAmount = computed(() => this.filtered().reduce((sum, e) => sum + e.amount, 0));
  protected readonly averageAmount = computed(() => (this.totalCount() === 0 ? 0 : this.totalAmount() / this.totalCount()));

  protected setBank(id: 'all' | string): void {
    this.bankId.set(id);
  }

  protected payerIcon(id: string): string {
    return this.banksService.all().find((b) => b.id === id)?.type === 'wallet' ? 'account_balance_wallet' : 'account_balance';
  }

  protected openDialog(expense?: Expense): void {
    this.dialog
      .open(ExpenseDialog, { width: '480px', maxWidth: '95vw', data: expense ?? null })
      .afterClosed()
      .subscribe((result?: Expense) => {
        if (!result) return;
        const isNew = !this.expensesService.all().some((e) => e.id === result.id);
        this.expensesService.upsert(result);
        this.auditLog.log({ action: isNew ? 'created' : 'updated', entityType: 'expense', entityLabel: result.description, category: 'expenses' });
        this.notify('expenses.saveSuccess');
      });
  }

  protected remove(expense: Expense): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '400px',
        maxWidth: '95vw',
        data: { titleKey: 'expenses.deleteConfirmTitle', messageKey: 'expenses.deleteConfirmText' },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return;
        this.expensesService.remove(expense.id);
        this.auditLog.log({ action: 'deleted', entityType: 'expense', entityLabel: expense.description, category: 'expenses' });
        this.notify('expenses.deleteSuccess');
      });
  }

  private notify(key: string): void {
    this.snackbar.open(this.translate.instant(key), this.translate.instant('common.close'), {
      duration: 3000,
    });
  }
}
