import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { guardGuard } from './CORE/Guard/guard-guard';
import { Dashboard } from './components/dashboard/dashboard';
import { Usermanage } from './components/usermanage/usermanage';
import { Ordermanage } from './components/orderManage/ordermanage';

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
            },
            {
                path: 'dashboard', 
                loadComponent: () => import('./components/dashboard/dashboard').then(c => c.Dashboard),
                // data: { role: 'admin' } // Only admin can access
            },
            {
                path: 'usermanage', 
                loadComponent: () => import('./components/usermanage/usermanage').then(c => c.Usermanage),
                // data: { role: 'admin' } // Only admin can access
            },
            {
                path: 'ordermanage', 
                loadComponent: () => import('./components/orderManage/ordermanage').then(c => c.Ordermanage)
            
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