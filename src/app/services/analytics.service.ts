import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = 'http://localhost:5000/api/analytic'; // ✅ match backend

  constructor(private http: HttpClient) {}

  getOverview(): Observable<any> {
    return this.http.get(`${this.apiUrl}/overview`); // ✅ endpoint
  }
}
