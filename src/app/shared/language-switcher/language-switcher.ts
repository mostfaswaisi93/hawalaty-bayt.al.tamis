import { Component, inject } from '@angular/core';
import { AppLanguage, LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-language-switcher',
  template: `
    <div class="flex items-center gap-4 text-body-sm">
      @for (lang of languages; track lang.code) {
        <button
          type="button"
          (click)="select(lang.code)"
          [class]="
            language.current() === lang.code
              ? 'text-primary font-bold border-b-2 border-primary pb-1'
              : 'text-on-surface-variant hover:text-primary transition-colors'
          ">
          {{ lang.label }}
        </button>
      }
    </div>
  `,
})
export class LanguageSwitcher {
  protected readonly language = inject(LanguageService);
  protected readonly languages = Object.values(this.language.languages);

  protected select(code: AppLanguage): void {
    this.language.use(code);
  }
}
