// src/app/services/sales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TopSellingProduct {
  productId: string;
  productName: string;
  productCategory: string;
  totalSold: number;
  totalRevenue: number;
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private apiUrl = 'http://localhost:5000/api/orders/analytics/top-selling';

  constructor(private http: HttpClient) {}

  getTopSellingProducts(): Observable<TopSellingProduct[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      // Adjust to handle API format: { success, data }
      (source) => new Observable(observer => {
        source.subscribe({
          next: (response) => observer.next(response.data || []),
          error: (err) => observer.error(err),
          complete: () => observer.complete()
        });
      })
    );
  }
}
