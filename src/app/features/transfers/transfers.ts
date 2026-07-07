import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalNumberPipe } from '../../core/localize.pipes';

interface Contact {
  nameKey: string;
  initials: string;
}

@Component({
  selector: 'app-transfers',
  imports: [FormsModule, TranslateModule, LocalNumberPipe],
  templateUrl: './transfers.html',
})
export class Transfers {
  private readonly snackbar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly rate = 3.7; // 1 USD = 3.70 ILS
  protected readonly availableBalance = 5240;
  protected readonly transferFee = 12.5;
  protected readonly serviceFee = 2;

  protected readonly contacts: Contact[] = [
    { nameKey: 'dashboard.parties.reem', initials: 'RH' },
    { nameKey: 'dashboard.parties.mohammed', initials: 'MJ' },
    { nameKey: 'dashboard.parties.ali', initials: 'AH' },
    { nameKey: 'dashboard.parties.layla', initials: 'LA' },
    { nameKey: 'dashboard.parties.yassin', initials: 'YO' },
  ];

  protected readonly selected = signal(2);
  protected readonly amount = signal(1500);
  protected readonly note = signal('');

  protected readonly receiverAmount = computed(() => this.amount() * this.rate);
  protected readonly total = computed(() => this.amount() + this.transferFee + this.serviceFee);

  protected select(index: number): void {
    this.selected.set(index);
  }

  protected confirm(): void {
    this.snackbar.open(
      this.translate.instant('messages.saveSuccess'),
      this.translate.instant('common.close'),
      { duration: 3000 },
    );
  }
}
