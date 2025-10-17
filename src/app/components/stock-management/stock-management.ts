import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../models/Product';
import { StockService } from '../../services/stock.service';
import { FormsModule } from '@angular/forms';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-stock-management',
  imports: [FormsModule,CommonModule],
  templateUrl: './stock-management.html',
  styleUrls: ['./stock-management.css']
})
export class StockManagement implements OnInit {
  products: Product[] = [];
  loading = false;
  
  // Modal states
  showRestockModal = false;
  showAdjustModal = false;
  selectedProduct: Product | null = null;
  
  // Form data
  restockForm = { quantity: 0, reason: '' };
  adjustForm = { quantity: 0, reason: '' };

  constructor(
    private stockService: StockService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStockReport();
  }

  loadStockReport(): void {
    this.loading = true;
    this.stockService.getStockReport().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastr.error('Failed to load stock report');
        this.loading = false;
      }
    });
  }

  // Restock Modal
  openRestockModal(product: Product): void {
    this.selectedProduct = product;
    this.restockForm = { quantity: 0, reason: '' };
    this.showRestockModal = true;
  }

  closeRestockModal(): void {
    this.showRestockModal = false;
    this.selectedProduct = null;
  }

  submitRestock(): void {
    if (!this.selectedProduct || !this.restockForm.quantity || !this.restockForm.reason) return;
    
    this.loading = true;
    this.stockService.restockProduct(
      this.selectedProduct._id,
      this.restockForm.quantity,
      this.restockForm.reason
    ).subscribe({
      next: (response) => {
        this.toastr.success('Product restocked successfully!');
        this.loadStockReport(); // Refresh data
        this.closeRestockModal();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Restock failed');
        this.loading = false;
      }
    });
  }

  // Adjust Stock Modal
  openAdjustModal(product: Product): void {
    this.selectedProduct = product;
    this.adjustForm = { quantity: 0, reason: '' };
    this.showAdjustModal = true;
  }

  closeAdjustModal(): void {
    this.showAdjustModal = false;
    this.selectedProduct = null;
  }

  submitAdjust(): void {
    if (!this.selectedProduct || !this.adjustForm.quantity || !this.adjustForm.reason) return;
    
    this.loading = true;
    this.stockService.adjustStock(
      this.selectedProduct._id,
      this.adjustForm.quantity,
      this.adjustForm.reason
    ).subscribe({
      next: (response) => {
        this.toastr.success('Stock adjusted successfully!');
        this.loadStockReport(); // Refresh data
        this.closeAdjustModal();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Adjustment failed');
        this.loading = false;
      }
    });
  }

  // View History
  viewHistory(productId: string): void {
    this.router.navigate(['/stock/history', productId]);
  }

  // Export Functions
  exportToExcel(): void {
    this.stockService.exportToExcel();
  }

  exportToPdf(): void {
    this.stockService.exportToPdf();
  }
}