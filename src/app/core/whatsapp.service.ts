import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Bank } from '../data/banks';
import { Transfer } from '../data/transfers';

/**
 * Announces a new bank/wallet-paid order to that account's registered WhatsApp number.
 * Opens a `wa.me` deep link pre-filled with the order details — no backend/API key needed,
 * consistent with this app's "simulate everything, but keep it genuinely usable" approach.
 */
@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly translate = inject(TranslateService);

  /** No-ops if the bank/wallet has no registered phone number. */
  notifyOrder(bank: Bank, transfer: Transfer): void {
    const digits = bank.phone?.replace(/\D/g, '');
    if (!digits) return;

    const amount = (transfer.transferredAmount ?? transfer.amount).toFixed(2);
    const lines = [
      this.translate.instant('whatsapp.orderMessage.title', { id: transfer.id }),
      this.translate.instant('whatsapp.orderMessage.customer', { name: transfer.customer }),
      transfer.itemName ? this.translate.instant('whatsapp.orderMessage.items', { items: transfer.itemName }) : null,
      this.translate.instant('whatsapp.orderMessage.amount', { amount }),
      transfer.senderName ? this.translate.instant('whatsapp.orderMessage.sender', { name: transfer.senderName }) : null,
      transfer.senderPhone ? this.translate.instant('whatsapp.orderMessage.senderPhone', { phone: transfer.senderPhone }) : null,
    ].filter((line): line is string => !!line);

    const url = `https://wa.me/${digits}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  }
}
