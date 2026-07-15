import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="mgr-shell">
      <h2 class="main-title">Order Management</h2>

      <!-- Filters & controls -->
      <div class="controls-panel card-box">
        <span class="lbl font-bold-label">Filter Orders</span>
        <div class="filters">
          <button 
            class="filter-btn" 
            [class.active]="selectedStatus() === null" 
            (click)="selectedStatus.set(null)"
          >
            All Orders
          </button>
          <button 
            class="filter-btn" 
            [class.active]="selectedStatus() === 'processing'" 
            (click)="selectedStatus.set('processing')"
          >
            Processing
          </button>
          <button 
            class="filter-btn" 
            [class.active]="selectedStatus() === 'shipped'" 
            (click)="selectedStatus.set('shipped')"
          >
            Shipped
          </button>
          <button 
            class="filter-btn" 
            [class.active]="selectedStatus() === 'delivered'" 
            (click)="selectedStatus.set('delivered')"
          >
            Delivered
          </button>
        </div>
      </div>

      <!-- Main Ledger Table -->
      <div class="ledger-box card-box">
        @if (loading()) {
          <app-loading-spinner></app-loading-spinner>
        } @else {
          <table class="tech-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Items (Qty)</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              @for (o of filteredOrders(); track o._id) {
                <tr>
                  <td class="text-brass">{{ o._id.toUpperCase() }}</td>
                  <td>{{ o.shippingAddress.fullName }}</td>
                  <td>{{ o.shippingAddress.street }}, {{ o.shippingAddress.city }}</td>
                  <td>
                    <div class="manifest-cell font-body">
                      @for (item of o.items; track item.product) {
                        <div>- {{ item.title }} (x{{ item.quantity }})</div>
                      }
                    </div>
                  </td>
                  <td class="text-brass">\${{ o.totalAmount | number:'1.2-2' }}</td>
                  <td>
                    <span class="status-badge" [ngClass]="o.orderStatus">
                      {{ o.orderStatus | titlecase }}
                    </span>
                  </td>
                  <td>
                    <select 
                      [value]="o.orderStatus" 
                      (change)="updateStatus(o._id, $event)"
                      class="status-select"
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .mgr-shell {
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
    
    .card-box {
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .controls-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .lbl {
      font-size: 0.95rem;
      color: var(--chalk);
    }

    .font-bold-label {
      font-weight: 600;
      color: var(--bone);
    }
    
    .filters {
      display: flex;
      gap: 1rem;
    }
    
    .filter-btn {
      font-size: 0.9rem;
      color: var(--chalk);
      cursor: pointer;
      font-family: var(--font-body);
      text-transform: none;
    }
    
    .filter-btn:hover {
      color: #000000;
    }
    
    .filter-btn.active {
      color: #000000;
      font-weight: 600;
    }
    
    .tech-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    
    .tech-table th, .tech-table td {
      border: 1px solid var(--border-color);
      padding: 0.75rem 1rem;
      text-align: left;
    }
    
    .tech-table th {
      background: var(--ink-2);
      color: var(--chalk);
    }
    
    .manifest-cell {
      font-size: 0.8rem;
      color: var(--chalk);
      line-height: 1.4;
    }
    
    .status-badge {
      font-size: 0.8rem;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius);
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color);
    }
    
    .status-badge.processing, .status-badge.shipped {
      color: #000000;
      background: rgba(0, 0, 0, 0.03);
    }
    
    .status-badge.delivered {
      color: var(--thread-green);
      background: rgba(76, 122, 91, 0.05);
      border-color: rgba(76, 122, 91, 0.2);
    }
    
    .status-badge.cancelled {
      color: var(--rust);
      background: rgba(168, 71, 43, 0.05);
      border-color: rgba(168, 71, 43, 0.2);
    }
    
    .status-select {
      font-size: 0.85rem;
      padding: 0.2rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
    }
  `]
})
export class OrderManagerComponent implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  loading = signal(true);
  selectedStatus = signal<string | null>(null);

  constructor() {
    effect(() => {
      const all = this.orders();
      const status = this.selectedStatus();

      const filtered = status
        ? all.filter(o => o.orderStatus === status)
        : all;

      this.filteredOrders.set(filtered);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        this.orders.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  updateStatus(orderId: string, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;

    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.toastService.show(`Order status updated to ${newStatus}.`, 'success');
        this.loadOrders();
      }
    });
  }
}
