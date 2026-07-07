import { inject, Pipe, PipeTransform } from '@angular/core';
import { FormatService } from './format.service';

/**
 * Impure pipes so bound values re-format on every change-detection pass,
 * which includes language switches (they do not change the input reference).
 */

@Pipe({ name: 'localNumber', standalone: true, pure: false })
export class LocalNumberPipe implements PipeTransform {
  private readonly format = inject(FormatService);
  transform(value: number | null | undefined, options?: Intl.NumberFormatOptions): string {
    return value == null ? '' : this.format.number(value, options);
  }
}

@Pipe({ name: 'localCurrency', standalone: true, pure: false })
export class LocalCurrencyPipe implements PipeTransform {
  private readonly format = inject(FormatService);
  transform(value: number | null | undefined, currency = 'ILS'): string {
    return value == null ? '' : this.format.currency(value, currency);
  }
}

@Pipe({ name: 'localDate', standalone: true, pure: false })
export class LocalDatePipe implements PipeTransform {
  private readonly format = inject(FormatService);
  transform(
    value: Date | string | number | null | undefined,
    options?: Intl.DateTimeFormatOptions,
  ): string {
    return value == null ? '' : this.format.date(value, options);
  }
}
