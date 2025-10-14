import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, NgClass],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  isCollapsed = false;

  // Route-based flags
  isDashboard = false;
  isInventory = false;
  isUserManagement = false;
  isOrderManagement = false;
  isCategoryManagement = false;

  // Optional: Combine into a single "isAdminPage" if needed
  isAdminPage = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Subscribe to router events to detect navigation
    this.router.events.subscribe(() => {
      this.checkCurrentRoute();
    });
    // Initial check on component load
    this.checkCurrentRoute();
  }

  private checkCurrentRoute() {
    const url = this.router.url;

    this.isDashboard = url === '/dashboard';
    this.isInventory = url === '/inventory';
    this.isUserManagement = url === '/usermanage';
    this.isOrderManagement = url === '/ordermanage';
    this.isCategoryManagement = url === '/category-management';

    // Admin-only pages (based on your route data)
    this.isAdminPage = [
      '/usermanage',
      '/category-management'
    ].some(adminPath => url.startsWith(adminPath));
  }
}