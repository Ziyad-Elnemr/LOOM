import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const APP_ROUTES: Routes = [
    // Authentication direct sibling routes
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    },

    // Main website shell
    {
        path: '',
        loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
        children: [
            {
                path: '',
                loadChildren: () => import('./features/catalog/catalog.routes').then(m => m.CATALOG_ROUTES)
            },
            {
                path: 'cart',
                canActivate: [authGuard],
                loadChildren: () => import('./features/cart/cart.routes').then(m => m.CART_ROUTES)
            },
            {
                path: 'checkout',
                canActivate: [authGuard],
                loadChildren: () => import('./features/checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES)
            },
            {
                path: 'account',
                canActivate: [authGuard],
                loadChildren: () => import('./features/account/account.routes').then(m => m.ACCOUNT_ROUTES)
            }
        ]
    },

    // Admin section shell
    {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () => import('./layout/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
        children: [
            {
                path: '',
                loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
            }
        ]
    },

    // Fallback redirect
    {
        path: '**',
        redirectTo: ''
    }
];
