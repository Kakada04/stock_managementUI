import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { TopSellingComponent } from '../top-selling/top-selling';
import { AlertLowstock } from "../alert-lowstock/alert-lowstock";
import { RecentOrders } from "../recent-orders/recent-orders";

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [TopSellingComponent, AlertLowstock, RecentOrders]
})
export class Dashboard implements OnInit, AfterViewInit {
  totalProducts = 0;
  totalSales = 0;
  lowStockCount = 0;
  newUsers = 0;
  
  @ViewChild('salesCanvas', { static: false }) salesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('comparisonCanvas', { static: false }) comparisonCanvas!: ElementRef<HTMLCanvasElement>;
  
  private salesChart: any;
  private comparisonChart: any;
  
  salesData = {
    day: { labels: [] as string[], data: [] as number[] },
    week: { labels: [] as string[], data: [] as number[] },
    month: { labels: [] as string[], data: [] as number[] }
  };
  
  currentPeriod: 'day' | 'week' | 'month' = 'day';

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {  
    this.loadOverview();
  }

  ngAfterViewInit(): void {
    console.log('🔍 AfterViewInit - Canvas available?', !!this.salesCanvas);
    
    setTimeout(() => {
      this.loadChartData();
      this.initComparisonChart();
    }, 100);
  }

  loadOverview() {
    this.analyticsService.getOverview().subscribe({
      next: (data) => {
        console.log('✅ Overview:', data);
        this.totalProducts = data.totalProduct || 0;
        this.totalSales = data.totalSales || 0;
        this.lowStockCount = data.lowStockCount || 0;
        this.newUsers = data.newUsers || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error loading overview:', err)
    });
  }

  loadChartData() {
    // API returns all periods at once: { day: {...}, week: {...}, month: {...} }
    this.analyticsService.getSalesByPeriod(this.currentPeriod).subscribe({
      next: (res) => {
        console.log('✅ Sales data received:', res);
        
        // Store all periods
        if (res.day) {
          this.salesData.day = {
            labels: res.day.labels || [],
            data: res.day.data || []
          };
        }
        
        if (res.week) {
          this.salesData.week = {
            labels: res.week.labels || [],
            data: res.week.data || []
          };
        }
        
        if (res.month) {
          this.salesData.month = {
            labels: res.month.labels || [],
            data: res.month.data || []
          };
        }
        
        console.log('📊 All periods stored:', this.salesData);
        this.updateSalesChart();
      },
      error: (err) => console.error('❌ Error loading sales data:', err)
    });
  }

  updateSalesChart() {
    console.log('🎨 Updating chart for period:', this.currentPeriod);
    
    if (!this.salesCanvas || !this.salesCanvas.nativeElement) {
      console.error('❌ Canvas element not available');
      return;
    }

    const periodData = this.salesData[this.currentPeriod];
    console.log('📈 Chart data to render:', periodData);
    
    if (!periodData.labels.length || !periodData.data.length) {
      console.warn('⚠️ No data available for period:', this.currentPeriod);
      return;
    }

    const ctx = this.salesCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('❌ Could not get 2d context from canvas');
      return;
    }

    if (this.salesChart) {
      // Update existing chart
      console.log('🔄 Updating existing chart');
      this.salesChart.data.labels = periodData.labels;
      this.salesChart.data.datasets[0].data = periodData.data;
      this.salesChart.update();
    } else {
      // Create new chart
      console.log('🆕 Creating new chart');
      
      try {
        this.salesChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: periodData.labels,
            datasets: [{
              label: 'Sales Amount ($)',
              data: periodData.data,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                display: true, 
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 15
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: (context: any) => {
                    return 'Sales: $' + context.parsed.y.toFixed(2);
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value: any) => '$' + value
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
        
        console.log('✅ Chart created successfully');
      } catch (error) {
        console.error('❌ Error creating chart:', error);
      }
    }
    
    this.cdr.detectChanges();
  }

  initComparisonChart() {
    if (!this.comparisonCanvas || !this.comparisonCanvas.nativeElement) {
      console.log('⚠️ Comparison canvas not available');
      return;
    }

    const ctx = this.comparisonCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Sample data for comparison chart
    this.comparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sales',
            data: [450, 520, 480, 600, 550, 620],
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
          },
          {
            label: 'Restock',
            data: [300, 400, 350, 450, 400, 500],
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: true, 
            position: 'top' 
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  changePeriod(period: 'day' | 'week' | 'month') {
    console.log('🔄 Changing period to:', period);
    this.currentPeriod = period;
    
    // Check if data exists for this period
    if (this.salesData[period].labels.length > 0) {
      console.log('📦 Using cached data');
      this.updateSalesChart();
    } else {
      console.log('🌐 Data not available, fetching...');
      this.loadChartData();
    }
  }
}