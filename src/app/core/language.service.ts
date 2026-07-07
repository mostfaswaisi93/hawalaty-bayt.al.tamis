import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface LanguageMeta {
  code: AppLanguage;
  dir: Direction;
  /** BCP-47 locale used for Intl number/date/currency formatting. */
  locale: string;
  /** CSS font-family stack applied to --app-font. */
  font: string;
  /** Native label shown in the switcher. */
  label: string;
}

const STORAGE_KEY = 'hawalaty.lang';

/**
 * Single source of truth for the active language.
 * Owns: ngx-translate active lang, document dir/lang/font, <title>,
 * and localStorage persistence. Everything reactive hangs off `current`.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  readonly languages: Record<AppLanguage, LanguageMeta> = {
    ar: {
      code: 'ar',
      dir: 'rtl',
      locale: 'ar-EG',
      font: "'Cairo', system-ui, sans-serif",
      label: 'العربية',
    },
    en: {
      code: 'en',
      dir: 'ltr',
      locale: 'en-US',
      font: "'Inter', system-ui, sans-serif",
      label: 'English',
    },
  };

  /** Reactive active language. */
  readonly current = signal<AppLanguage>('ar');
  readonly meta = computed<LanguageMeta>(() => this.languages[this.current()]);
  readonly dir = computed<Direction>(() => this.meta().dir);
  readonly isRtl = computed(() => this.dir() === 'rtl');
  readonly locale = computed(() => this.meta().locale);

  constructor() {
    this.translate.addLangs(['ar', 'en']);
    // Arabic is the fallback for any missing key.
    this.translate.setDefaultLang('ar');
  }

  /** Call once on app start: restores the saved language or defaults to Arabic. */
  init(): void {
    this.use(this.readStored() ?? 'ar');
  }

  /** Switch language instantly (no page reload). */
  use(lang: AppLanguage): void {
    const meta = this.languages[lang];
    this.current.set(lang);
    this.translate.use(lang);
    this.applyToDocument(meta);
    this.persist(lang);

    // Keep the browser tab title in sync with the active language.
    this.translate.get('app.name').subscribe((name: string) => this.title.setTitle(name));
  }

  toggle(): void {
    this.use(this.current() === 'ar' ? 'en' : 'ar');
  }

  private applyToDocument(meta: LanguageMeta): void {
    const html = this.document.documentElement;
    html.setAttribute('lang', meta.code);
    html.setAttribute('dir', meta.dir);
    html.classList.remove('lang-ar', 'lang-en');
    html.classList.add(`lang-${meta.code}`);
    html.style.setProperty('--app-font', meta.font);
  }

  private persist(lang: AppLanguage): void {
    try {
      this.document.defaultView?.localStorage?.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage may be unavailable (private mode) — ignore */
    }
  }

  private readStored(): AppLanguage | null {
    try {
      const value = this.document.defaultView?.localStorage?.getItem(STORAGE_KEY);
      return value === 'ar' || value === 'en' ? value : null;
    } catch {
      return null;
    }
  }
}
