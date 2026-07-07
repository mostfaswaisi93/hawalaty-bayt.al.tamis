import { inject, Injectable } from '@angular/core';
import { LanguageService } from './language.service';

/**
 * Locale-aware formatting via the Intl API so numbers, dates and currency
 * re-format instantly when the language changes — no LOCALE_ID re-provisioning.
 *
 * Numbers use Western (Latin) digits in both languages — matching the product
 * design — while Arabic keeps its localized text (month names, currency names).
 */
@Injectable({ providedIn: 'root' })
export class FormatService {
  private readonly lang = inject(LanguageService);

  private get locale(): string {
    return this.lang.locale();
  }

  number(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, { numberingSystem: 'latn', ...options }).format(value);
  }

  currency(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      numberingSystem: 'latn',
    }).format(value);
  }

  date(value: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, {
      numberingSystem: 'latn',
      ...(options ?? { dateStyle: 'medium' }),
    }).format(new Date(value));
  }
}
