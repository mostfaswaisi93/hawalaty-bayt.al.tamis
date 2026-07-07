import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MOCK_TRANSFERS, Transfer } from '../../data/transfers';
import { LanguageService } from '../../core/language.service';
import { PdfService } from '../../core/pdf.service';
import { LocalCurrencyPipe, LocalDatePipe, LocalNumberPipe } from '../../core/localize.pipes';

@Component({
  selector: 'app-reports',
  imports: [TranslateModule, LocalCurrencyPipe, LocalDatePipe, LocalNumberPipe],
  templateUrl: './reports.html',
})
export class Reports {
  private readonly pdf = inject(PdfService);
  protected readonly language = inject(LanguageService);

  protected readonly report = viewChild.required<ElementRef<HTMLElement>>('report');

  protected readonly transfers: Transfer[] = MOCK_TRANSFERS;
  protected readonly now = new Date();
  protected exporting = false;

  protected get total(): number {
    return this.transfers.reduce((sum, t) => sum + t.amount, 0);
  }

  protected get count(): number {
    return this.transfers.length;
  }

  protected get average(): number {
    return this.count === 0 ? 0 : this.total / this.count;
  }

  protected async exportPdf(): Promise<void> {
    this.exporting = true;
    try {
      await this.pdf.exportElement(this.report().nativeElement, 'transfers-report');
    } finally {
      this.exporting = false;
    }
  }
}
