import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslateModule, LanguageSwitcher, ThemeToggle],
  template: `
    <div class="flex min-h-screen flex-col bg-surface text-on-surface">
      <header class="flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-inline-md shadow-sm md:px-inline-lg">
        <span class="font-display-lg text-display-lg font-bold leading-none text-primary">{{ 'app.name' | translate }}</span>
        <div class="flex items-center gap-2">
          <app-language-switcher />
          <app-theme-toggle />
        </div>
      </header>

      <main class="flex flex-1 flex-col items-center justify-center px-inline-md py-16 text-center">
        <div class="relative mb-6">
          <span class="font-display-lg text-[120px] font-bold leading-none text-primary/10">404</span>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <span class="material-symbols-outlined text-5xl">travel_explore</span>
            </div>
          </div>
        </div>
        <h1 class="mb-2 font-display-lg text-display-lg text-primary">{{ 'notFound.title' | translate }}</h1>
        <p class="mb-8 max-w-md font-body-lg text-on-surface-variant">{{ 'notFound.subtitle' | translate }}</p>
        <a
          routerLink="/dashboard"
          class="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-headline-md text-headline-md text-on-primary shadow-lg transition-all hover:bg-primary-container hover:text-on-primary-container active:scale-95">
          <span class="material-symbols-outlined">home</span>
          {{ 'notFound.backHome' | translate }}
        </a>
      </main>
    </div>
  `,
})
export class NotFound {}
