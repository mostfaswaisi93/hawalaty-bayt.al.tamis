import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MOCK_TRANSFERS, Transfer } from '../../data/transfers';
import { LanguageService } from '../../core/language.service';
import { PdfService } from '../../core/pdf.service';
import { LocalCurrencyPipe, LocalDatePipe } from '../../core/localize.pipes';

@Component({
  selector: 'app-reports',
  imports: [TranslateModule, LocalCurrencyPipe, LocalDatePipe],
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

  protected async exportPdf(): Promise<void> {
    this.exporting = true;
    try {
      await this.pdf.exportElement(this.report().nativeElement, 'transfers-report');
    } finally {
      this.exporting = false;
    }
  }
}
