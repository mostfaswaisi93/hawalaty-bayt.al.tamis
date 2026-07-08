import { Routes } from '@angular/router';
import { authGuard, guestGuard, superAdminGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/signup').then((m) => m.Signup),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'transfers',
        loadComponent: () => import('./features/transfers/transfers').then((m) => m.Transfers),
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/history').then((m) => m.History),
      },
      {
        path: 'banks',
        loadComponent: () => import('./features/banks/banks').then((m) => m.Banks),
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/menu/menu').then((m) => m.Menu),
      },
      {
        path: 'expenses',
        loadComponent: () => import('./features/expenses/expenses').then((m) => m.Expenses),
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'constants',
        loadComponent: () => import('./features/constants/constants').then((m) => m.Constants),
      },
      {
        path: 'team',
        loadComponent: () => import('./features/team/team').then((m) => m.Team),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'devices',
        loadComponent: () => import('./features/devices/devices').then((m) => m.Devices),
      },
      {
        path: 'activity-log',
        loadComponent: () => import('./features/activity-log/activity-log').then((m) => m.ActivityLog),
      },
      {
        path: 'help',
        loadComponent: () => import('./features/help/help').then((m) => m.Help),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [superAdminGuard],
    loadComponent: () => import('./features/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'tenants',
        loadComponent: () => import('./features/admin/admin-tenants').then((m) => m.AdminTenants),
      },
      {
        path: 'tenants/:id',
        loadComponent: () => import('./features/admin/admin-tenant-detail').then((m) => m.AdminTenantDetail),
      },
      {
        path: 'logs',
        loadComponent: () => import('./features/admin/admin-logs').then((m) => m.AdminLogs),
      },
      {
        path: 'backups',
        loadComponent: () => import('./features/admin/admin-backups').then((m) => m.AdminBackups),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/errors/not-found').then((m) => m.NotFound),
  },
];
