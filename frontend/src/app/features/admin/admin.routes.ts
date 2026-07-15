import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
    },
    {
        path: 'products',
        loadComponent: () => import('./product-manager/product-manager.component').then(m => m.ProductManagerComponent)
    },
    {
        path: 'orders',
        loadComponent: () => import('./order-manager/order-manager.component').then(m => m.OrderManagerComponent)
    },
    {
        path: 'customers',
        loadComponent: () => import('./customer-manager/customer-manager.component').then(m => m.CustomerManagerComponent)
    }
];
