import { inject, Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LanguageService } from './language.service';

/**
 * Exports a live DOM element to PDF by rasterizing it with html2canvas.
 *
 * Rasterizing the already-rendered element means Arabic shaping and RTL
 * layout come "for free" from the browser — the PDF looks exactly like the
 * on-screen report in whichever language is active (RTL for Arabic,
 * LTR for English), without embedding Arabic TTF fonts into jsPDF.
 */
@Injectable({ providedIn: 'root' })
export class PdfService {
  private readonly lang = inject(LanguageService);

  async exportElement(element: HTMLElement, fileName = 'report'): Promise<void> {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const margin = 24;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png');

    // The document direction is metadata only; the raster already carries the
    // visual RTL/LTR layout of the source element.
    pdf.setR2L(this.lang.isRtl());

    if (imgHeight <= usableHeight) {
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    } else {
      // Slice a tall report across multiple pages.
      let remaining = imgHeight;
      let position = margin;
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        remaining -= usableHeight;
        if (remaining > 0) {
          pdf.addPage();
          position = margin - (imgHeight - remaining);
        }
      }
    }

    pdf.save(`${fileName}-${this.lang.current()}.pdf`);
  }
}
