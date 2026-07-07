import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BanksService } from '../../core/banks.service';
import { MenuService } from '../../core/menu.service';
import { LocalCurrencyPipe } from '../../core/localize.pipes';
import { ChangeMethod, PaymentMethod, Transfer, TransferLineItem } from '../../data/transfers';
import { FieldError } from '../../shared/field-error/field-error';

@Component({
  selector: 'app-transfer-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    TranslateModule,
    LocalCurrencyPipe,
    FieldError,
  ],
  templateUrl: './transfer-dialog.html',
})
export class TransferDialog {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<TransferDialog>);
  private readonly menu = inject(MenuService);
  private readonly banksService = inject(BanksService);
  private readonly translate = inject(TranslateService);

  protected readonly availableItems = computed(() => this.menu.all().filter((i) => i.active));
  protected readonly banks = computed(() => this.banksService.all().filter((b) => b.active && b.type === 'bank'));
  protected readonly wallets = computed(() => this.banksService.all().filter((b) => b.active && b.type === 'wallet'));

  // --- Cart (items + quantities) ---
  protected readonly pendingItemId = signal<string | null>(null);
  protected readonly lines = signal<TransferLineItem[]>([]);
  protected readonly subtotal = computed(() => this.lines().reduce((sum, l) => sum + l.price * l.quantity, 0));
  protected readonly submitted = signal(false);
  protected readonly showItemsError = computed(() => this.submitted() && this.lines().length === 0);

  protected readonly form = this.fb.nonNullable.group({
    paymentMethod: ['cash' as PaymentMethod, Validators.required],

    // Cash scenario
    hasChange: [false],
    changeMethod: ['cash' as ChangeMethod],
    changeBankId: [null as string | null],
    changeAmount: [null as number | null],

    // Bank/wallet scenario
    bankId: [null as string | null],
    senderName: [''],
    transferredAmount: [null as number | null],

    notes: [''],
  });

  protected addPendingItem(): void {
    const itemId = this.pendingItemId();
    const item = this.availableItems().find((i) => i.id === itemId);
    if (!item) return;

    this.lines.update((list) => {
      const idx = list.findIndex((l) => l.itemId === item.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...list, { itemId: item.id, name: item.name, quantity: 1, price: item.price }];
    });
    this.pendingItemId.set(null);
  }

  protected incrementQty(itemId: string): void {
    this.lines.update((list) =>
      list.map((l) => (l.itemId === itemId ? { ...l, quantity: l.quantity + 1 } : l)),
    );
  }

  protected decrementQty(itemId: string): void {
    this.lines.update((list) =>
      list
        .map((l) => (l.itemId === itemId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  protected removeLine(itemId: string): void {
    this.lines.update((list) => list.filter((l) => l.itemId !== itemId));
  }

  protected setPaymentMethod(method: PaymentMethod): void {
    this.form.controls.paymentMethod.setValue(method);
    this.onPaymentMethodChange(method);
  }

  protected setChangeMethod(method: ChangeMethod): void {
    this.form.controls.changeMethod.setValue(method);
    this.onChangeMethodChange(method);
  }

  /** Bank/wallet fields are only required for the branch currently selected. */
  protected onPaymentMethodChange(method: PaymentMethod): void {
    const bankId = this.form.controls.bankId;
    const senderName = this.form.controls.senderName;
    const transferredAmount = this.form.controls.transferredAmount;

    if (method === 'bank') {
      bankId.setValidators([Validators.required]);
      senderName.setValidators([Validators.required, Validators.minLength(2)]);
      transferredAmount.setValidators([Validators.required, Validators.min(0.01)]);
    } else {
      bankId.clearValidators();
      senderName.clearValidators();
      transferredAmount.clearValidators();
    }
    bankId.updateValueAndValidity();
    senderName.updateValueAndValidity();
    transferredAmount.updateValueAndValidity();
  }

  protected onChangeMethodChange(method: ChangeMethod): void {
    const changeBankId = this.form.controls.changeBankId;
    const changeAmount = this.form.controls.changeAmount;

    if (method === 'bank') {
      changeBankId.setValidators([Validators.required]);
      changeAmount.setValidators([Validators.required, Validators.min(0.01)]);
    } else {
      changeBankId.clearValidators();
      changeAmount.setValidators([Validators.required, Validators.min(0.01)]);
    }
    changeBankId.updateValueAndValidity();
    changeAmount.updateValueAndValidity();
  }

  protected onHasChangeToggle(hasChange: boolean): void {
    if (hasChange) {
      this.onChangeMethodChange(this.form.controls.changeMethod.value);
    } else {
      this.form.controls.changeBankId.clearValidators();
      this.form.controls.changeAmount.clearValidators();
      this.form.controls.changeBankId.updateValueAndValidity();
      this.form.controls.changeAmount.updateValueAndValidity();
    }
  }

  protected submit(): void {
    this.submitted.set(true);

    if (this.form.invalid || this.lines().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const bankLookup = (id: string | null) => this.banksService.all().find((b) => b.id === id);
    const paidBank = v.paymentMethod === 'bank' ? bankLookup(v.bankId) : undefined;
    const changeBank = v.hasChange && v.changeMethod === 'bank' ? bankLookup(v.changeBankId) : undefined;

    const itemName = this.lines().map((l) => `${l.name} ×${l.quantity}`).join('، ');

    // No customer-name field in this form: use the bank sender's name when we
    // have one (bank scenario), otherwise a generic walk-in label.
    const customer =
      v.paymentMethod === 'bank' && v.senderName.trim()
        ? v.senderName.trim()
        : this.translate.instant('form.walkInCustomer');

    const result: Transfer = {
      id: 'TRX-' + Math.floor(1000 + Math.random() * 9000),
      customer,
      date: new Date().toISOString(),
      status: 'pending',
      items: this.lines(),
      amount: this.subtotal(),
      itemName,
      paymentMethod: v.paymentMethod,
      ...(v.paymentMethod === 'cash'
        ? {
            hasChange: v.hasChange,
            ...(v.hasChange
              ? {
                  changeMethod: v.changeMethod,
                  changeAmount: Number(v.changeAmount),
                  ...(v.changeMethod === 'bank'
                    ? { changeBankId: changeBank?.id, changeBankName: changeBank?.name }
                    : {}),
                }
              : {}),
          }
        : {
            bankId: paidBank?.id,
            bankName: paidBank?.name,
            senderName: v.senderName,
            transferredAmount: Number(v.transferredAmount),
          }),
    };

    this.ref.close(result);
  }
}
