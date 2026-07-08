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
import { ConstantsService } from '../../core/constants.service';
import { MenuService } from '../../core/menu.service';
import { menuCategoryBadge, menuCategoryIcon } from '../../core/menu-category-style';
import { LocalCurrencyPipe } from '../../core/localize.pipes';
import { WhatsappService } from '../../core/whatsapp.service';
import { MenuItem } from '../../data/menu';
import { ChangeMethod, PaymentMethod, Transfer, TransferLineItem } from '../../data/transfers';
import { FieldError } from '../../shared/field-error/field-error';

type Step = 'menu' | 'payment';

interface CategoryCard {
  category: string;
  items: MenuItem[];
}

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
  private readonly constants = inject(ConstantsService);
  private readonly banksService = inject(BanksService);
  private readonly translate = inject(TranslateService);
  private readonly whatsapp = inject(WhatsappService);

  protected readonly banks = computed(() => this.banksService.all().filter((b) => b.active && b.type === 'bank'));
  protected readonly wallets = computed(() => this.banksService.all().filter((b) => b.active && b.type === 'wallet'));

  // --- Step 1: browse the menu by category, build the order ---
  protected readonly step = signal<Step>('menu');
  protected readonly activeCategory = signal<string | null>(null);

  private readonly availableItems = computed(() => this.menu.all().filter((i) => i.active));

  /** Categories that currently have at least one available item, in printed-menu order. */
  protected readonly categoryCards = computed<CategoryCard[]>(() =>
    this.constants
      .menuCategories()
      .map((category) => ({ category, items: this.availableItems().filter((i) => i.category === category) }))
      .filter((c) => c.items.length > 0),
  );

  protected readonly activeItems = computed(() => {
    const category = this.activeCategory();
    return category ? this.availableItems().filter((i) => i.category === category) : [];
  });

  protected readonly lines = signal<TransferLineItem[]>([]);
  protected readonly subtotal = computed(() => this.lines().reduce((sum, l) => sum + l.price * l.quantity, 0));
  protected readonly cartCount = computed(() => this.lines().reduce((sum, l) => sum + l.quantity, 0));
  protected readonly submitted = signal(false);
  protected readonly showItemsError = computed(() => this.submitted() && this.lines().length === 0);

  protected openCategory(category: string): void {
    this.activeCategory.set(category);
  }

  protected backToCategories(): void {
    this.activeCategory.set(null);
  }

  protected qtyFor(itemId: string): number {
    return this.lines().find((l) => l.itemId === itemId)?.quantity ?? 0;
  }

  protected addItem(item: MenuItem): void {
    this.lines.update((list) => {
      const idx = list.findIndex((l) => l.itemId === item.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...list, { itemId: item.id, name: item.name, quantity: 1, price: item.price }];
    });
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

  protected categoryIcon(category: string): string {
    return menuCategoryIcon(category);
  }

  protected categoryBadge(category: string): string {
    return menuCategoryBadge(category);
  }

  protected goToPayment(): void {
    if (this.lines().length === 0) {
      this.submitted.set(true);
      return;
    }
    // Default the transferred-amount field to the order total; still editable afterward.
    this.form.controls.transferredAmount.setValue(this.subtotal());
    this.step.set('payment');
  }

  protected backToMenu(): void {
    this.step.set('menu');
  }

  // --- Step 2: payment details (unchanged logic) ---
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
    senderPhone: [''],
    transferredAmount: [null as number | null],

    notes: [''],
  });

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
    const senderPhone = this.form.controls.senderPhone;
    const transferredAmount = this.form.controls.transferredAmount;

    if (method === 'bank') {
      bankId.setValidators([Validators.required]);
      senderName.setValidators([Validators.required, Validators.minLength(2)]);
      senderPhone.setValidators([Validators.required, Validators.minLength(7)]);
      transferredAmount.setValidators([Validators.required, Validators.min(0.01)]);
    } else {
      bankId.clearValidators();
      senderName.clearValidators();
      senderPhone.clearValidators();
      transferredAmount.clearValidators();
    }
    bankId.updateValueAndValidity();
    senderName.updateValueAndValidity();
    senderPhone.updateValueAndValidity();
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
            senderPhone: v.senderPhone,
            transferredAmount: Number(v.transferredAmount),
          }),
    };

    if (paidBank) {
      this.whatsapp.notifyOrder(paidBank, result);
    }
    this.ref.close(result);
  }
}
