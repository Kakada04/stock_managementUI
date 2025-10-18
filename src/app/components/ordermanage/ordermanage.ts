import { Component, OnInit ,ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-ordermanage',
  imports: [CommonModule],
  templateUrl: './ordermanage.html',
  styleUrl: './ordermanage.css'
})
export class Ordermanage implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  loading = false;
  
  // Pagination
  currentPage = 1;
  limit = 20;
  totalOrders = 0;
  
  // Search
  searchTerm = '';

  constructor(
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.listOrders(this.currentPage, this.limit).subscribe({
      next: (response) => {
        this.orders = response.orders || [];
        this.totalOrders = response.total || this.orders.length;
        this.applySearchFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  applySearchFilter(): void {
    if (!this.searchTerm) {
      this.filteredOrders = this.orders;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredOrders = this.orders.filter(order => 
      order._id.toLowerCase().includes(term) ||
      (order.userId?.name && order.userId.name.toLowerCase().includes(term)) ||
      (order.userId?.email && order.userId.email.toLowerCase().includes(term)) ||
      order.items.some((item: any) => 
        item.productId?.name && item.productId.name.toLowerCase().includes(term)
      )
    );
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.applySearchFilter();
  }

  changePage(page: number): void {
    if (page < 1 || (page - 1) * this.limit >= this.totalOrders) return;
    
    this.currentPage = page;
    this.loadOrders();
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  // Helper for template
  Math = Math;
}