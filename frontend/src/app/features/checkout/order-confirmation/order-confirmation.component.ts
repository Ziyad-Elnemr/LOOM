import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Order } from '../../../core/models/order.model';
import { environment } from '../../../../environments/environment';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="container confirmation-shell">
      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (order()) {
        @let o = order()!;
        <div class="success-banner border-box">
          <div class="status-indicator text-green">Order Successful</div>
          <h1 class="confirm-title">Thank you for your order!</h1>
          <p class="order-id">Order ID: {{ o._id }}</p>
        </div>

        <div class="confirm-grid">
          <!-- Left Specs Column -->
          <div class="manifest-card">
            <h3 class="card-title">Order Manifest</h3>
            <div class="manifest-list">
              @for (item of o.items; track item.product) {
                <div class="manifest-item">
                  <div class="meta">
                    <strong>{{ item.title }}</strong>
                    <div class="price-spec text-chalk">\${{ item.price | number:'1.2-2' }} x {{ item.quantity }}</div>
                  </div>
                  <div class="aligned-right">
                    \${{ (item.price * item.quantity) | number:'1.2-2' }}
                  </div>
                </div>
              }
            </div>

            <div class="summary-table">
              <div class="row">
                <span>Items Total:</span>
                <span>\${{ o.itemsTotal | number:'1.2-2' }}</span>
              </div>
              <div class="row">
                <span>Shipping Cost:</span>
                <span>\${{ o.shippingFee | number:'1.2-2' }}</span>
              </div>
              <div class="divider"></div>
              <div class="row grand-total">
                <span>Total Amount:</span>
                <span class="text-brass">\${{ o.totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Right Port Column -->
          <div class="destination-card">
            <h3 class="card-title">Delivery Details</h3>
            <div class="review-section">
              <div class="section-label">Shipping Address:</div>
              <p>{{ o.shippingAddress.fullName }}</p>
              <p>{{ o.shippingAddress.street }}</p>
              <p>{{ o.shippingAddress.city }}, {{ o.shippingAddress.state }} {{ o.shippingAddress.postalCode }}</p>
              <p>{{ o.shippingAddress.country }}</p>
              <p>Tel: {{ o.shippingAddress.phone }}</p>
            </div>

            <div class="review-section margin-top">
              <div class="section-label">Payment Details:</div>
              <p>Method: {{ o.payment.method | uppercase }}</p>
              <p>Status: {{ o.payment.status | uppercase }}</p>
              <p>Paid At: {{ o.payment.paidAt | date:'medium' }}</p>
            </div>

            <div class="actions">
              <a routerLink="/" class="btn-primary">Return to Shop</a>
              <a routerLink="/account" class="btn-secondary">View Order History</a>
            </div>
          </div>
        </div>
      } @else {
        <div class="error-box">
          <div class="text-rust">Order not found</div>
          <p>We could not find the details for this order.</p>
          <a routerLink="/" class="btn-primary">Go Back Home</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .confirmation-shell {
      margin-top: 2rem;
      margin-bottom: 4rem;
      max-width: 1000px;
    }
    
    .border-box {
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 2.5rem;
      background: var(--ink-2);
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .success-banner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .status-indicator {
      font-size: 0.95rem;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    
    .confirm-title {
      font-size: 2rem;
      color: var(--bone);
      margin: 0.5rem 0;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    
    .order-id {
      color: var(--chalk);
      font-size: 0.9rem;
    }
    
    .confirm-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 3rem;
    }
    
    .manifest-card, .destination-card {
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 2rem;
    }
    
    .card-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--bone);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.75rem;
      margin-bottom: 1.5rem;
    }
    
    .manifest-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .manifest-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }
    
    .price-spec {
      font-size: 0.8rem;
    }
    
    .summary-table {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      font-size: 0.9rem;
    }
    
    .summary-table .row {
      display: flex;
      justify-content: space-between;
    }
    
    .summary-table .divider {
      height: 1px;
      background: var(--border-color);
      margin: 0.5rem 0;
    }
    
    .grand-total {
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .review-section {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.9rem;
      color: var(--chalk);
    }
    
    .review-section.margin-top {
      margin-top: 1.5rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
    }
    
    .section-label {
      font-weight: 600;
      color: var(--bone);
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 2.5rem;
    }
    
    .actions a {
      width: 100%;
      text-align: center;
    }
    
    .error-box {
      border: 1px solid var(--rust);
      padding: 3rem;
      text-align: center;
      background: var(--ink-2);
      border-radius: var(--radius);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      align-items: center;
    }
 
    @media (max-width: 768px) {
      .confirm-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  order = signal<Order | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<{ success: boolean; data: Order[] }>(`${environment.apiUrl}/orders/my`).subscribe({
        next: (res) => {
          const match = res.data.find((o: Order) => o._id === id);
          if (match) {
            this.order.set(match);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }
}
