import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ShippingAddress } from '../../../core/models/user.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container checkout-container">
      <h1 class="checkout-title">Checkout</h1>

      <div class="checkout-grid">
        <div class="steps-column">
          <!-- Step Indicators -->
          <div class="step-indicators">
            <div class="indicator" [class.active]="step() >= 1" [class.current]="step() === 1">1. Shipping</div>
            <div class="indicator" [class.active]="step() >= 2" [class.current]="step() === 2">2. Payment</div>
            <div class="indicator" [class.active]="step() >= 3" [class.current]="step() === 3">3. Review</div>
          </div>

          <!-- Step 1: Shipping Address -->
          @if (step() === 1) {
            <div class="step-card">
              <h3 class="step-title">Shipping Address</h3>
              
              @if (savedAddresses().length > 0) {
                <div class="saved-addresses-list">
                  <p class="section-label">Select a saved address:</p>
                  @for (addr of savedAddresses(); track addr.fullName) {
                    <div 
                      class="address-option" 
                      [class.selected]="selectedSavedAddressIndex === $index"
                      (click)="selectSavedAddress($index)"
                    >
                      <div class="addr-header">
                        <strong>{{ addr.fullName }}</strong>
                        @if (addr.isDefault) { <span class="tag-default">[Default]</span> }
                      </div>
                      <div>{{ addr.street }}, {{ addr.city }}, {{ addr.state }} {{ addr.postalCode }}</div>
                      <div>{{ addr.country }} | Tel: {{ addr.phone }}</div>
                    </div>
                  }
                  <button type="button" class="btn-secondary" (click)="toggleNewAddressForm()">
                    {{ showNewAddressForm ? 'Choose Saved Address' : 'Add New Address' }}
                  </button>
                </div>
              }

              @if (showNewAddressForm || savedAddresses().length === 0) {
                <form (submit)="submitShipping($event)" class="address-form font-body">
                  <div class="form-row">
                    <div class="form-control">
                      <label>Full Name:</label>
                      <input type="text" name="fullName" [(ngModel)]="address.fullName" required placeholder="John Doe" />
                    </div>
                    <div class="form-control">
                      <label>Phone Number:</label>
                      <input type="text" name="phone" [(ngModel)]="address.phone" required placeholder="555-0199" />
                    </div>
                  </div>
                  
                  <div class="form-control">
                    <label>Street Address:</label>
                    <input type="text" name="street" [(ngModel)]="address.street" required placeholder="123 Main St" />
                  </div>
                  
                  <div class="form-row triplet">
                    <div class="form-control">
                      <label>City:</label>
                      <input type="text" name="city" [(ngModel)]="address.city" required placeholder="New York" />
                    </div>
                    <div class="form-control">
                      <label>State:</label>
                      <input type="text" name="state" [(ngModel)]="address.state" placeholder="NY" />
                    </div>
                    <div class="form-control">
                      <label>Postal Code:</label>
                      <input type="text" name="postalCode" [(ngModel)]="address.postalCode" required placeholder="10001" />
                    </div>
                  </div>

                  <div class="form-control">
                    <label>Country:</label>
                    <input type="text" name="country" [(ngModel)]="address.country" required placeholder="United States" />
                  </div>

                  <button type="submit" class="btn-primary form-submit">Continue to Payment</button>
                </form>
              } @else {
                <button type="button" class="btn-primary form-submit" (click)="confirmSavedAddress()">
                  Use Selected Address
                </button>
              }
            </div>
          }

          <!-- Step 2: Payment Details -->
          @if (step() === 2) {
            <div class="step-card">
              <h3 class="step-title">Payment Details</h3>
              
              <!-- Dummy credit card -->
              <div class="fake-card-graphic">
                <div class="card-chip"></div>
                <div class="card-number-lbl">
                  {{ cardNum ? formatCardNum(cardNum) : '•••• •••• •••• ••••' }}
                </div>
                <div class="card-footer">
                  <div class="card-name-lbl">{{ cardHolder ? (cardHolder | uppercase) : 'Cardholder Name' }}</div>
                  <div class="card-expiry-lbl">{{ cardExpiry ? cardExpiry : 'MM/YY' }}</div>
                </div>
              </div>

              <form (submit)="submitPayment($event)" class="payment-form">
                <div class="warning-alert text-brass text-center">
                  * Test Environment: No real charges will be processed
                </div>

                <div class="form-control">
                  <label>Cardholder Name:</label>
                  <input type="text" name="holder" [(ngModel)]="cardHolder" required placeholder="John Doe" />
                </div>

                <div class="form-control">
                  <label>Credit Card Number:</label>
                  <input type="text" name="num" [(ngModel)]="cardNum" required maxlength="16" placeholder="4111222233334444" />
                </div>

                <div class="form-row">
                  <div class="form-control">
                    <label>Expiration Date:</label>
                    <input type="text" name="exp" [(ngModel)]="cardExpiry" required placeholder="12/28" maxlength="5" />
                  </div>
                  <div class="form-control">
                    <label>CVC:</label>
                    <input type="password" name="cvc" [(ngModel)]="cardCvc" required placeholder="123" maxlength="3" />
                  </div>
                </div>

                <div class="control-actions">
                  <button type="button" class="btn-secondary" (click)="step.set(1)">Back</button>
                  <button type="submit" class="btn-primary">Continue to Review</button>
                </div>
              </form>
            </div>
          }

          <!-- Step 3: Order Review -->
          @if (step() === 3) {
            <div class="step-card">
              <h3 class="step-title">Review Order</h3>

              @if (simulatedError()) {
                <div class="payment-error-box">
                  <div class="err-title">Payment Failed</div>
                  <p class="err-desc">{{ simulatedError() }}</p>
                  <button type="button" class="btn-secondary text-brass" (click)="retryOrderPlacement()">
                    Retry Order
                  </button>
                </div>
              }

              <div class="review-details">
                <div class="review-section">
                  <div class="section-label">Shipping Destination:</div>
                  <p>{{ address.fullName }} - Tel: {{ address.phone }}</p>
                  <p>{{ address.street }}</p>
                  <p>{{ address.city }}, {{ address.state }} {{ address.postalCode }}, {{ address.country }}</p>
                </div>

                <div class="review-section">
                  <div class="section-label">Payment Method:</div>
                  <p>Card ending in {{ cardNum.slice(-4) }} (Test Payment)</p>
                </div>
              </div>

              <div class="control-actions">
                <button type="button" class="btn-secondary" [disabled]="submitting()" (click)="step.set(2)">
                  Back to Payment
                </button>
                <button type="button" class="btn-primary" [disabled]="submitting()" (click)="placeOrder()">
                  {{ submitting() ? 'Processing...' : 'Place Order' }}
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Summary column -->
        <div class="summary-column">
          <h3 class="summary-title">Items Summary</h3>
          
          <div class="order-manifest-list">
            @for (item of cartService.items(); track item._id) {
              @let prod = getProduct(item);
              <div class="manifest-item">
                <span class="manifest-title">{{ prod?.title || 'Garment Item' }} (x{{ item.quantity }})</span>
                <span class="manifest-price">\${{ (prod ? prod.price * item.quantity : 0) | number:'1.2-2' }}</span>
              </div>
            }
          </div>

          <div class="summary-table">
            <div class="row">
              <span>Subtotal:</span>
              <span>\${{ cartService.subtotal() | number:'1.2-2' }}</span>
            </div>
            <div class="row">
              <span>Shipping:</span>
              <span>{{ currentShippingCost() }}</span>
            </div>
            <div class="divider"></div>
            <div class="row grand-total">
              <span>Total Amount:</span>
              <span class="text-brass">\${{ grandTotal() | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      margin-top: 2rem;
      margin-bottom: 4rem;
    }
    
    .checkout-title {
      font-size: 2.2rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
      margin-bottom: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 3rem;
    }
    
    .step-indicators {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
    }
    
    .indicator {
      font-size: 0.95rem;
      color: var(--chalk);
      font-weight: 500;
    }
    
    .indicator.active {
      color: var(--bone);
    }
    
    .indicator.current {
      color: #000000;
      font-weight: 600;
    }
    
    .step-card {
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 2rem;
    }
    
    .step-title {
      font-size: 1.3rem;
      color: var(--bone);
      margin-bottom: 1.5rem;
      font-weight: 600;
    }
    
    .saved-addresses-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    
    .section-label {
      color: var(--bone);
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    .address-option {
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1rem;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }
    
    .address-option:hover {
      border-color: #000000;
    }
    
    .address-option.selected {
      border-color: #000000;
      background: var(--ink-2);
    }
    
    .addr-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }
    
    .tag-default {
      color: var(--chalk);
    }
    
    .address-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-row.triplet {
      grid-template-columns: 1fr 100px 120px;
    }
    
    .form-control {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    
    .form-control label {
      font-size: 0.85rem;
      color: var(--chalk);
    }
    
    .form-submit {
      width: 100%;
      margin-top: 1.5rem;
    }
    
    /* Payment graphics */
    .fake-card-graphic {
      width: 100%;
      max-width: 360px;
      height: 200px;
      padding: 1.5rem;
      background: linear-gradient(135deg, #222222 0%, #000000 100%);
      border: 1px solid var(--border-color);
      border-radius: 8px; 
      margin: 0 auto 2rem auto;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      color: #FFFFFF;
    }
    
    .card-chip {
      width: 45px;
      height: 35px;
      background: #D4AF37;
      border-radius: 4px;
      opacity: 0.8;
    }
    
    .card-number-lbl {
      font-family: var(--font-mono);
      font-size: 1.35rem;
      letter-spacing: 0.1em;
      color: #FFFFFF;
      margin: 1.5rem 0;
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #CCCCCC;
    }
    
    .payment-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .control-actions {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    
    .control-actions button {
      flex: 1;
    }
    
    /* Review */
    .review-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1.5rem;
    }
    
    .review-section {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.9rem;
    }
    
    .payment-error-box {
      background: rgba(220, 38, 38, 0.02);
      border: 1px solid var(--rust);
      border-radius: var(--radius);
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .err-title {
      color: var(--rust);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .err-desc {
      font-size: 0.85rem;
      color: var(--chalk);
      margin-bottom: 1rem;
    }
    
    /* Summary column */
    .summary-column {
      background: var(--ink-2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
      height: fit-content;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .summary-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--bone);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.75rem;
    }
    
    .order-manifest-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .manifest-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.25rem;
    }
    
    .manifest-title {
      color: var(--bone);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 75%;
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
      font-size: 1.15rem;
      font-weight: 600;
    }
  `]
})
export class CheckoutPageComponent implements OnInit {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  step = signal<number>(1);
  submitting = signal(false);
  simulatedError = signal<string | null>(null);

  address: ShippingAddress = {
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  };

  savedAddresses = signal<ShippingAddress[]>([]);
  selectedSavedAddressIndex = 0;
  showNewAddressForm = false;

  cardHolder = '';
  cardNum = '';
  cardExpiry = '';
  cardCvc = '';

  ngOnInit() {
    this.cartService.loadCart();

    const user = this.authService.user();
    if (user && user.addresses) {
      this.savedAddresses.set(user.addresses);
      if (user.addresses.length > 0) {
        this.selectSavedAddress(0);
      }
    }
  }

  selectSavedAddress(idx: number) {
    this.selectedSavedAddressIndex = idx;
    const selected = this.savedAddresses()[idx];
    if (selected) {
      this.address = { ...selected };
    }
  }

  toggleNewAddressForm() {
    this.showNewAddressForm = !this.showNewAddressForm;
    if (!this.showNewAddressForm && this.savedAddresses().length > 0) {
      this.selectSavedAddress(this.selectedSavedAddressIndex);
    } else {
      this.address = { fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: '' };
    }
  }

  confirmSavedAddress() {
    this.step.set(2);
  }

  submitShipping(event: Event) {
    event.preventDefault();
    if (!this.address.fullName || !this.address.street || !this.address.city || !this.address.postalCode) {
      return;
    }
    this.step.set(2);
  }

  submitPayment(event: Event) {
    event.preventDefault();
    if (!this.cardHolder || !this.cardNum || !this.cardExpiry || !this.cardCvc) return;
    this.step.set(3);
  }

  retryOrderPlacement() {
    this.simulatedError.set(null);
    this.placeOrder();
  }

  placeOrder() {
    this.submitting.set(true);
    this.simulatedError.set(null);

    this.orderService.createOrder(this.address, 'fake_card').subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.toastService.show('Order placed successfully.', 'success');
        this.cartService.clearCart().subscribe();
        this.router.navigate(['/checkout/order-confirmation', res.data._id]);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 402) {
          this.simulatedError.set('Simulated payment rejection. Please check card inputs.');
        } else {
          this.simulatedError.set(err.error?.message || 'Order placement failed. Please try again.');
        }
      }
    });
  }

  getProduct(item: any): Product | null {
    if (typeof item.product === 'string') return null;
    return item.product;
  }

  currentShippingCost(): string {
    const sub = this.cartService.subtotal();
    return sub > 100 ? 'FREE' : '$9.99';
  }

  grandTotal(): number {
    const sub = this.cartService.subtotal();
    const shipping = sub > 100 ? 0 : 9.99;
    return sub + shipping;
  }

  formatCardNum(num: string): string {
    return num.replace(/(\d{4})/g, '$1 ').trim();
  }
}
