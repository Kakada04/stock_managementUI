import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const guardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  const isLoggedIn = !!token && !!user;
  
  if (isLoggedIn) {
    // Optional: Check if user has admin role for admin routes
    if (route.data?.['role'] === 'admin') {
      const userData = JSON.parse(user!);
      if (userData.role !== 'admin') {
        router.navigate(['/inventory']);
        return false;
      }
    }
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};