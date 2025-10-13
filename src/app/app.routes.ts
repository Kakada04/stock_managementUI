import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { guardGuard } from './CORE/Guard/guard-guard';

export const routes: Routes = [
    {
        path: '', 
        redirectTo: 'inventory', 
        pathMatch: 'full'
    },
    {
        path: '',
        component: Layout,
        canActivate: [guardGuard],
        children: [
            {
                path: 'inventory', 
                loadComponent: () => import('./components/inventory-page/inventory-page').then(c => c.InventoryPage)
            // },
            // {
            //     path: 'dashboard', 
            //     loadComponent: () => import('./components/dashboard/dashboard').then(c => c.Dashboard),
            //     data: { role: 'admin' } // Only admin can access
            // },
            // {
            //     path: 'user-management', 
            //     loadComponent: () => import('./components/user-management/user-management').then(c => c.UserManagement),
            //     data: { role: 'admin' } // Only admin can access
            // },
            // {
            //     path: 'order-management', 
            //     loadComponent: () => import('./components/order-management/order-management').then(c => c.OrderManagement)
            // 
            },{
  path: 'category-management',
  loadComponent: () => import('./components/category-management/category-management').then(c => c.CategoryManagement),
  data: { role: 'admin' }
}
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login-page/login-page').then(c => c.LoginPage)
    },
    {
        path: '**',
        redirectTo: 'inventory'
    }
];