import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="dash-shell">
      <h2 class="main-title">Dashboard Overview</h2>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <!-- Metric Grid -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="label">Total Revenue</div>
            <div class="val">\${{ totalRevenue() | number:'1.2-2' }}</div>
            <span class="sub">Based on paid orders</span>
          </div>

          <div class="metric-card">
            <div class="label">Total Products</div>
            <div class="val">{{ productCount() }}</div>
            <span class="sub">Items in catalog</span>
          </div>

          <div class="metric-card">
            <div class="label">Total Orders</div>
            <div class="val">{{ orderCount() }}</div>
            <span class="sub">From all customers</span>
          </div>
        </div>

        <!-- Alert Log -->
        <div class="report-box margin-top">
          <h4>System Status</h4>
          <div class="logs-stream">
            <div>System health status: Stable</div>
            <div>Database connection: Operational</div>
            <div>Payment gateway simulation: Active</div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dash-shell {
      padding: 0.5rem 0;
    }
    
    .main-title {
      font-size: 1.6rem;
      color: var(--bone);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
      margin-bottom: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }
    
    .metric-card {
      background: var(--ink-2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem 2rem;
    }
    
    .metric-card .label {
      font-size: 0.85rem;
      color: var(--chalk);
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .metric-card .val {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      letter-spacing: -0.02em;
    }
    
    .metric-card .sub {
      font-size: 0.8rem;
      color: var(--chalk);
    }
    
    .report-box {
      background: var(--ink-2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
    }
    
    .report-box h4 {
      font-size: 1rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    
    .logs-stream {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--chalk);
    }
    
    .margin-top {
      margin-top: 3rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);

  loading = signal(true);
  productCount = signal(0);
  orderCount = signal(0);
  totalRevenue = signal(0);

  ngOnInit() {
    forkJoin({
      products: this.productService.getProducts(),
      orders: this.orderService.getAllOrders()
    }).subscribe({
      next: (res) => {
        this.productCount.set(res.products.data ? res.products.data.length : 0);
        this.orderCount.set(res.orders.data ? res.orders.data.length : 0);

        const rev = (res.orders.data || []).reduce((sum, o) => {
          return sum + (o.payment.status === 'paid' ? o.totalAmount : 0);
        }, 0);
        this.totalRevenue.set(rev);

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
