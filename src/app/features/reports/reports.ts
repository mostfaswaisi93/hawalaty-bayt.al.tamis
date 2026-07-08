import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MOCK_TRANSFERS, Transfer } from '../../data/transfers';
import { LanguageService } from '../../core/language.service';
import { PdfService } from '../../core/pdf.service';
import { ThemeService } from '../../core/theme.service';
import { LocalCurrencyPipe, LocalDatePipe, LocalNumberPipe } from '../../core/localize.pipes';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'all';

function startOfDay(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfWeek(d: Date): Date {
  const date = startOfDay(d);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Formats using local date components (not toISOString, which shifts across UTC day boundaries). */
function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@Component({
  selector: 'app-reports',
  imports: [FormsModule, TranslateModule, LocalCurrencyPipe, LocalDatePipe, LocalNumberPipe],
  templateUrl: './reports.html',
})
export class Reports {
  private readonly pdf = inject(PdfService);
  private readonly themeService = inject(ThemeService);
  protected readonly language = inject(LanguageService);

  protected readonly report = viewChild.required<ElementRef<HTMLElement>>('report');

  private readonly allTransfers: Transfer[] = MOCK_TRANSFERS;
  protected readonly now = new Date();
  protected exporting = false;

  protected readonly periods: ReportPeriod[] = ['daily', 'weekly', 'monthly', 'all'];
  protected readonly period = signal<ReportPeriod>('monthly');
  protected readonly anchor = signal<Date>(new Date());

  protected readonly rangeStart = computed(() => {
    const a = this.anchor();
    switch (this.period()) {
      case 'daily':
        return startOfDay(a);
      case 'weekly':
        return startOfWeek(a);
      case 'monthly':
      case 'all':
        return startOfMonth(a);
    }
  });

  protected readonly rangeEnd = computed(() => {
    const start = new Date(this.rangeStart());
    switch (this.period()) {
      case 'daily':
        start.setDate(start.getDate() + 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() + 7);
        break;
      case 'monthly':
      case 'all':
        start.setMonth(start.getMonth() + 1);
        break;
    }
    return start;
  });

  /** Last calendar day included in the range (inclusive), for display purposes. */
  protected readonly rangeEndInclusive = computed(() => {
    const end = new Date(this.rangeEnd());
    end.setDate(end.getDate() - 1);
    return end;
  });

  protected readonly selectedDateValue = computed(() => toLocalIsoDate(this.rangeStart()));

  protected readonly transfers = computed(() => {
    if (this.period() === 'all') {
      return this.allTransfers;
    }
    const start = this.rangeStart().getTime();
    const end = this.rangeEnd().getTime();
    return this.allTransfers.filter((t) => {
      const time = new Date(t.date).getTime();
      return time >= start && time < end;
    });
  });

  protected get total(): number {
    return this.transfers().reduce((sum, t) => sum + t.amount, 0);
  }

  protected get count(): number {
    return this.transfers().length;
  }

  protected get average(): number {
    return this.count === 0 ? 0 : this.total / this.count;
  }

  protected setPeriod(p: ReportPeriod): void {
    this.period.set(p);
    this.anchor.set(new Date());
  }

  protected shift(step: number): void {
    const a = new Date(this.anchor());
    switch (this.period()) {
      case 'daily':
        a.setDate(a.getDate() + step);
        break;
      case 'weekly':
        a.setDate(a.getDate() + step * 7);
        break;
      case 'monthly':
        a.setMonth(a.getMonth() + step);
        break;
      case 'all':
        return;
    }
    this.anchor.set(a);
  }

  protected goToday(): void {
    this.anchor.set(new Date());
  }

  protected pickDate(value: string): void {
    if (!value) return;
    this.anchor.set(new Date(`${value}T00:00:00`));
  }

  protected async exportPdf(): Promise<void> {
    this.exporting = true;
    // The on-screen report card follows the app theme; the exported PDF should always
    // read like a clean printable page, so force light mode just for the capture.
    const wasDark = this.themeService.isDark();
    if (wasDark) this.themeService.set('light');
    try {
      if (wasDark) await new Promise((resolve) => requestAnimationFrame(resolve));
      await this.pdf.exportElement(this.report().nativeElement, `transfers-report-${this.period()}`);
    } finally {
      if (wasDark) this.themeService.set('dark');
      this.exporting = false;
    }
  }
}
