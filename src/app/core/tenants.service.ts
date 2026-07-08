import { Injectable, inject, signal } from '@angular/core';
import { Tenant, TenantPlan, TenantStatus, MOCK_TENANTS } from '../data/tenants';
import { RolesService } from './roles.service';

export interface CreateTenantInput {
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
}

/** Shared in-memory tenants store — the platform's list of independent businesses using the system. */
@Injectable({ providedIn: 'root' })
export class TenantsService {
  private readonly rolesService = inject(RolesService);

  private readonly items = signal<Tenant[]>([...MOCK_TENANTS]);
  readonly all = this.items.asReadonly();

  byId(id: string): Tenant | undefined {
    return this.all().find((t) => t.id === id);
  }

  updateStatus(id: string, status: TenantStatus): void {
    this.items.update((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  updatePlan(id: string, plan: TenantPlan): void {
    this.items.update((list) => list.map((t) => (t.id === id ? { ...t, plan } : t)));
  }

  /** Creates a new tenant and clones its 3 system roles. Returns the tenant and its minted Owner role id. */
  create(input: CreateTenantInput): { tenant: Tenant; ownerRoleId: string } {
    const idSuffix = Date.now().toString(36).toUpperCase();
    const tenant: Tenant = {
      id: `TEN-${idSuffix}`,
      businessName: input.businessName,
      ownerName: input.ownerName,
      ownerEmail: input.ownerEmail.trim().toLowerCase(),
      phone: input.phone,
      plan: 'starter',
      status: 'trial',
      createdAt: new Date().toISOString().slice(0, 10),
      usersCount: 1,
    };
    this.items.update((list) => [...list, tenant]);
    const ownerRole = this.rolesService.createSystemRolesFor(tenant.id, idSuffix);
    return { tenant, ownerRoleId: ownerRole.id };
  }
}
