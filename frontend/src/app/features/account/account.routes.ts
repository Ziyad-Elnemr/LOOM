import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./account-shell.component').then(m => m.AccountShellComponent),
        children: [
            { path: '', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
            { path: 'orders', loadComponent: () => import('./order-history/order-history.component').then(m => m.OrderHistoryComponent) }
        ]
    }
];
