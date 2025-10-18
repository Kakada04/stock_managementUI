import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: []
})
export class Dashboard implements OnInit {
  totalProducts = 0;
  totalSales = 0;
  lowStockCount = 0;
  newUsers = 0;

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {  
    this.loadOverview();
  }

  loadOverview() {
    this.analyticsService.getOverview().subscribe({
      next: (data) => {
        console.log('✅ API data:', data);
        this.totalProducts = data.totalProduct || 0;
        this.totalSales = data.totalSales;
        this.lowStockCount = data.lowStockCount;
        this.newUsers = data.newUsers; // ✅ changed
        this.cdr.detectChanges(); // 👈 force UI update
      },
      error: (err) => console.error('❌ Error loading data:', err)
    });
  }
}
