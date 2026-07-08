import { Injectable, signal } from '@angular/core';
import { TeamMember, MOCK_TEAM_MEMBERS } from '../data/team-members';

/**
 * Shared in-memory team-members store, scoped per tenant via `tenantId`.
 * Business rules like "can't remove the last Owner" / "can't remove yourself" live in the
 * Team page component (which has access to AuthService) rather than here, keeping this store
 * dependency-free — same "dumb store, smart component" split used across the app.
 */
@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly items = signal<TeamMember[]>([...MOCK_TEAM_MEMBERS]);
  readonly all = this.items.asReadonly();

  forTenant(tenantId: string): TeamMember[] {
    return this.all().filter((m) => m.tenantId === tenantId);
  }

  findByEmail(email: string): TeamMember | undefined {
    const normalized = email.trim().toLowerCase();
    return this.all().find((m) => m.email.toLowerCase() === normalized);
  }

  upsert(member: TeamMember): void {
    this.items.update((list) => {
      const idx = list.findIndex((m) => m.id === member.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = member;
        return next;
      }
      return [...list, member];
    });
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((m) => m.id !== id));
  }
}
