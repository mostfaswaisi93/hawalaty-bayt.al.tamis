import { Injectable, signal } from '@angular/core';
import { Device, MOCK_DEVICES } from '../data/devices';

/** Shared in-memory store for the current user's logged-in devices. */
@Injectable({ providedIn: 'root' })
export class DevicesService {
  private readonly items = signal<Device[]>([...MOCK_DEVICES]);
  readonly all = this.items.asReadonly();

  signOut(id: string): void {
    this.items.update((list) => list.filter((d) => d.id !== id));
  }

  signOutAllOthers(): void {
    this.items.update((list) => list.filter((d) => d.isCurrent));
  }
}
