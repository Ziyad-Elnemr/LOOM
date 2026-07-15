import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="history-shell">
      <h2 class="section-title">Order History</h2>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <app-empty-state [message]="error()!" actionLabel="Reload" (action)="loadOrders()"></app-empty-state>
      } @else if (orders().length === 0) {
        <app-empty-state message="You have not placed any orders yet." actionLabel="Shop Now" (action)="goCatalog()"></app-empty-state>
      } @else {
        <div class="orders-list">
          @for (o of orders(); track o._id) {
            <div class="order-block">
              <!-- Header key info -->
              <div class="order-header">
                <div>
                  <span class="lbl">Order ID:</span>
                  <span class="val">{{ o._id }}</span>
                </div>
                <div>
                  <span class="lbl">Date:</span>
                  <span class="val">{{ o.createdAt | date:'shortDate' }}</span>
                </div>
                <div>
                  <span class="lbl">Status:</span>
                  <span class="val badge" [ngClass]="o.orderStatus">{{ o.orderStatus | titlecase }}</span>
                </div>
              </div>

              <!-- Item rows -->
              <div class="order-items">
                @for (item of o.items; track item.product) {
                  <div class="item-row">
                    <img [src]="item.image || 'https://via.placeholder.com/60'" [alt]="item.title" class="item-thumb" />
                    <div class="item-info">
                      <div class="item-name">{{ item.title }}</div>
                      <div class="item-meta">Quantity: {{ item.quantity }} | \${{ item.price | number:'1.2-2' }}</div>
                    </div>
                    <div class="item-total">
                      \${{ (item.price * item.quantity) | number:'1.2-2' }}
                    </div>
                  </div>
                }
              </div>

              <!-- Footer totals -->
              <div class="order-footer">
                <div>
                  <span class="lbl">Payment:</span>
                  <span class="val uppercase text-green">{{ o.payment.status }} via {{ o.payment.method }}</span>
                </div>
                <div>
                  <span class="lbl">Total Amount:</span>
                  <span class="val price text-brass">\${{ o.totalAmount | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .history-shell {
      padding: 1rem 0;
    }
    
    .section-title {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      color: var(--bone);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .order-block {
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      background: var(--ink-2);
      padding: 1.5rem;
    }
    
    .order-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    
    .lbl {
      color: var(--chalk);
      margin-right: 0.35rem;
    }
    
    .val {
      color: var(--bone);
      font-weight: 500;
    }
    
    .badge {
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius);
      font-size: 0.8rem;
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color);
    }
    
    .badge.processing, .badge.shipped {
      color: #000000;
      background: rgba(0, 0, 0, 0.03);
    }
    
    .badge.delivered {
      color: var(--thread-green);
      background: rgba(76, 122, 91, 0.05);
      border-color: rgba(76, 122, 91, 0.2);
    }
    
    .badge.cancelled {
      color: var(--rust);
      background: rgba(168, 71, 43, 0.05);
      border-color: rgba(168, 71, 43, 0.2);
    }
    
    .order-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .item-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .item-thumb {
      width: 50px;
      height: 50px;
      object-fit: contain;
      border-radius: var(--radius);
      background: #FFFFFF;
      padding: 0.15rem;
      border: 1px solid var(--border-color);
    }
    
    .item-info {
      flex: 1;
    }
    
    .item-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--bone);
    }
    
    .item-meta {
      font-size: 0.85rem;
      color: var(--chalk);
      margin-top: 0.15rem;
    }
    
    .item-total {
      font-size: 0.95rem;
      color: var(--bone);
      font-weight: 600;
    }
    
    .order-footer {
      border-top: 1px solid var(--border-color);
      padding-top: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }
    
    .order-footer .price {
      font-size: 1.1rem;
      font-weight: 600;
    }

    @media (max-width: 576px) {
      .order-header {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
    }
  `]
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.error.set(null);
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to retrieve order history.');
        this.loading.set(false);
      }
    });
  }

  goCatalog() {
    window.location.href = '/';
  }
}
