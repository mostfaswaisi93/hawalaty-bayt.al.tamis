import { Component, inject } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatTooltipModule, TranslateModule],
  template: `
    <button
      type="button"
      (click)="theme.toggle()"
      [matTooltip]="(theme.isDark() ? 'theme.light' : 'theme.dark') | translate"
      [attr.aria-label]="(theme.isDark() ? 'theme.light' : 'theme.dark') | translate"
      class="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary">
      <span class="material-symbols-outlined">{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</span>
    </button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
}
