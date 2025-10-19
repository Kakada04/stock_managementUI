import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../services/sale.service';

declare const Chart: any;

@Component({
  selector: 'app-top-selling',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-selling.html',
  styleUrls: ['./top-selling.css'],
})
export class TopSellingComponent implements OnInit {
  chart: any;

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.salesService.getTopSellingProducts().subscribe((products) => {
      
      const data = products.map((p) => p.totalSold);
      const labels = products.map((p) => p.productName);
      
      const ctx = document.getElementById('topSellingChart') as HTMLCanvasElement;

      this.chart = new Chart(ctx, {
        type: 'doughnut', // <-- changed from 'bar' to 'doughnut'
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Units Sold',
              data: data,
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)', // Red
                'rgba(54, 162, 235, 0.7)', // Blue
                'rgba(255, 206, 86, 0.7)', // Yellow
                'rgba(75, 192, 192, 0.7)', // Green
                'rgba(153, 102, 255, 0.7)', // Purple
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'rectRounded', // square with rounded corners
              boxWidth: 1110,
              padding: 12,
            },
          },
        },
      },
      });
    });
  }
}
