import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id: string;
  name: string;
  barcode: string;
  quantity: number;
  minStockThreshold: number;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/low/lowstock';

  constructor(private http: HttpClient) {}

  getLowStockProducts(): Observable<{ lowStockProducts: Product[] }> {
    return this.http.get<{ lowStockProducts: Product[] }>(this.apiUrl);
  }
}
