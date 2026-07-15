import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent)
    },
    {
        path: 'product/:id',
        loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent)
    }
];
