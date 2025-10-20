import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-alert-lowstock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-lowstock.html',
  styleUrls: ['./alert-lowstock.css'],
})
export class AlertLowstock implements OnInit {
  lowStockProducts: Product[] = [];
  loading = true;
  error = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getLowStockProducts().subscribe({
      next: (data) => {
        this.lowStockProducts = data.lowStockProducts;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching low stock:', err);
        this.error = 'Failed to load low stock products';
        this.loading = false;
      }
    });
  }
}
