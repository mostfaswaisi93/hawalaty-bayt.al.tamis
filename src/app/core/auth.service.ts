import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_SUPER_ADMINS } from '../data/super-admins';
import { TeamService } from './team.service';

export interface AuthUser {
  name: string;
  email: string;
  /** null for super admins — they aren't scoped to any one tenant. */
  tenantId: string | null;
  /** null for super admins. */
  roleId: string | null;
  isSuperAdmin?: boolean;
}

/** Demo credentials for the seeded Owner account of the first tenant (بيت التميس). */
export const DEMO_EMAIL = 'admin@hawalaty.com';
export const DEMO_PASSWORD = '123456';

const STORAGE_KEY = 'hawalaty.auth';

/**
 * Client-side auth for the demo: validates against the seeded team-member/super-admin
 * rosters and persists the session in localStorage. Swap `login()` for an HTTP call and
 * store a real token when a backend is available.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly document = inject(DOCUMENT);
  private readonly team = inject(TeamService);

  readonly user = signal<AuthUser | null>(this.restore());
  readonly isAuthenticated = computed(() => this.user() !== null);

  /** Simulated async login. Emits the signed-in user, or errors on bad creds. */
  login(email: string, password: string): Observable<AuthUser> {
    const normalized = email.trim().toLowerCase();

    const superAdmin = MOCK_SUPER_ADMINS.find((s) => s.email === normalized && s.password === password);
    if (superAdmin) {
      const user: AuthUser = { name: superAdmin.name, email: superAdmin.email, tenantId: null, roleId: null, isSuperAdmin: true };
      return of(user).pipe(delay(600));
    }

    const member = this.team.findByEmail(normalized);
    if (member && member.password === password && member.active) {
      const user: AuthUser = { name: member.name, email: member.email, tenantId: member.tenantId, roleId: member.roleId };
      return of(user).pipe(delay(600));
    }

    // Simulated rejected network call.
    return new Observable<AuthUser>((sub) => {
      const t = setTimeout(() => sub.error(new Error('invalid_credentials')), 600);
      return () => clearTimeout(t);
    });
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
