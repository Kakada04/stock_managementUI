// src/app/services/stock.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/Product';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:5000/api/stock';

  constructor(private http: HttpClient) {}

  getStockReport(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/report`);
  }

  restockProduct(productId: string, quantity: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/restock`, { productId, quantity, reason });
  }

  adjustStock(productId: string, quantity: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/adjust`, { productId, quantity, reason });
  }

  exportToExcel(): void {
    window.open(`${this.apiUrl}/export/excel`, '_blank');
  }

  exportToPdf(): void {
    window.open(`${this.apiUrl}/export/pdf`, '_blank');
  }
}