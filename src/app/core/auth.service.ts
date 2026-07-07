import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

/** Demo credentials — replace with a real backend call in `login()`. */
export const DEMO_EMAIL = 'admin@hawalaty.com';
export const DEMO_PASSWORD = '123456';

const STORAGE_KEY = 'hawalaty.auth';

/**
 * Client-side auth for the demo: validates against hard-coded credentials and
 * persists the session in localStorage. Swap `login()` for an HTTP call and
 * store a real token when a backend is available.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly document = inject(DOCUMENT);

  readonly user = signal<AuthUser | null>(this.restore());
  readonly isAuthenticated = computed(() => this.user() !== null);

  /** Simulated async login. Emits the signed-in user, or errors on bad creds. */
  login(email: string, password: string): Observable<AuthUser> {
    const ok =
      email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;

    if (!ok) {
      // Simulated rejected network call.
      return new Observable<AuthUser>((sub) => {
        const t = setTimeout(() => sub.error(new Error('invalid_credentials')), 600);
        return () => clearTimeout(t);
      });
    }

    const user: AuthUser = { name: 'Admin', email: email.trim().toLowerCase(), role: 'user.role' };
    return of(user).pipe(delay(600));
  }

  completeLogin(user: AuthUser): void {
    this.persist(user);
    this.user.set(user);
  }

  logout(): void {
    this.user.set(null);
    try {
      this.document.defaultView?.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  initials(): string {
    const u = this.user();
    if (!u) return '';
    const source = u.name?.trim() || u.email;
    return source.slice(0, 2).toUpperCase();
  }

  private persist(user: AuthUser): void {
    try {
      this.document.defaultView?.localStorage?.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
  }

  private restore(): AuthUser | null {
    try {
      const raw = this.document.defaultView?.localStorage?.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
