import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'hawalaty.theme';

/**
 * Owns the light/dark theme: toggles the `dark` class on <html> (which swaps the
 * whole CSS-variable palette), and persists the choice. Falls back to the OS
 * preference when nothing is stored.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>('light');
  readonly isDark = computed(() => this.theme() === 'dark');

  /** Call once on app start. */
  init(): void {
    this.set(this.readStored() ?? this.systemPreference());
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    this.document.documentElement.classList.toggle('dark', theme === 'dark');
    this.persist(theme);
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private systemPreference(): Theme {
    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private persist(theme: Theme): void {
    try {
      this.document.defaultView?.localStorage?.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }

  private readStored(): Theme | null {
    try {
      const v = this.document.defaultView?.localStorage?.getItem(STORAGE_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch {
      return null;
    }
  }
}
