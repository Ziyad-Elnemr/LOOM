import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart.model';
import { Product } from '../../../core/models/product.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container cart-container">
      <h1 class="cart-title">Shopping Cart</h1>
      
      @if (cartService.items().length === 0) {
        <div class="empty-cart">
          <div class="warning-tag">Your cart is empty</div>
          <p class="empty-desc">You have no items in your shopping cart.</p>
          <a routerLink="/" class="btn-primary start-btn">Go Shopping</a>
        </div>
      } @else {
        <div class="cart-grid">
          <!-- Item list -->
          <div class="item-list">
            @for (item of cartService.items(); track item._id) {
              @let prod = getProduct(item);
              <div class="item-row" [class.archived]="!prod || prod.isActive === false">
                <!-- Image -->
                <div class="item-img">
                  <img [src]="prod?.image || 'https://via.placeholder.com/150'" [alt]="prod?.title || 'Garment'">
                </div>
                
                <!-- Details -->
                <div class="item-details">
                  <div class="item-cat uppercase">{{ prod?.category || 'General' }}</div>
                  <h3 class="item-name">{{ prod?.title || 'Inactive Item: ' + item.product }}</h3>
                  
                  @if (!prod || prod.isActive === false) {
                    <div class="warning-alert text-rust">Warning: Product out of stock</div>
                  } @else {
                    <div class="item-sub-meta">
                      Size: {{ item.size || 'M' }} | Color: {{ item.color || 'Default' }}
                    </div>
                  }
                </div>
                
                <!-- Quantity stepper -->
                <div class="qty-stepper">
                  <button 
                    class="step-btn" 
                    [disabled]="item.quantity <= 1 || (!prod || prod.isActive === false)" 
                    (click)="updateQty(item, -1)"
                  >
                    &minus;
                  </button>
                  <span class="qty-val">{{ item.quantity }}</span>
                  <button 
                    class="step-btn" 
                    [disabled]="!prod || prod.isActive === false" 
                    (click)="updateQty(item, 1)"
                  >
                    &plus;
                  </button>
                </div>
                
                <!-- Price / Remove -->
                <div class="price-action">
                  <span class="item-price">\${{ (prod ? prod.price * item.quantity : 0) | number:'1.2-2' }}</span>
                  <button class="remove-btn text-rust" (click)="removeItem(item._id)">Remove</button>
                </div>
              </div>
            }
          </div>

          <!-- Checkout summary sidebar -->
          <div class="summary-sidebar">
            <h3 class="summary-title">Order Summary</h3>
            
            <div class="summary-table">
              <div class="row">
                <span>Total Items:</span>
                <span>{{ cartService.itemCount() }}</span>
              </div>
              <div class="row">
                <span>Shipping Cost:</span>
                <span>{{ currentShippingCost() }}</span>
              </div>
              <div class="divider"></div>
              <div class="row grand-total">
                <span>Total Amount:</span>
                <span class="text-brass">\${{ grandTotal() | number:'1.2-2' }}</span>
              </div>
            </div>
            
            @if (hasArchivedItems()) {
              <div class="oos-warning text-rust text-center">
                * Please remove out of stock items to proceed.
              </div>
            }
            
            <button 
              class="btn-primary btn-checkout" 
              [disabled]="hasArchivedItems()"
              routerLink="/checkout"
            >
              Proceed to Checkout
            </button>
            <button class="btn-clear text-rust text-center" (click)="clearCart()">
              Clear Cart
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-container {
      margin-top: 2rem;
      margin-bottom: 4rem;
    }
    
    .cart-title {
      font-size: 2.2rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
      margin-bottom: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    
    .empty-cart {
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 4rem 2rem;
      text-align: center;
      background: var(--ink-2);
    }
    
    .warning-tag {
      color: #000000;
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .empty-desc {
      color: var(--chalk);
      font-size: 0.95rem;
    }
    
    .start-btn {
      margin-top: 1.5rem;
    }
    
    .cart-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 3rem;
    }
    
    .item-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .item-row {
      display: grid;
      grid-template-columns: 80px 1fr 120px 140px;
      gap: 1.5rem;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1rem;
      background: #FFFFFF;
      transition: all 0.2s ease;
    }
    
    .item-row.archived {
      border-color: var(--rust);
      background: rgba(220, 38, 38, 0.02);
    }
    
    .item-img {
      width: 80px;
      height: 80px;
      background: var(--ink-2);
      border-radius: var(--radius);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
    }
    
    .item-img img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .item-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .item-cat {
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--chalk);
    }
    
    .item-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--bone);
    }
    
    .item-sub-meta {
      font-size: 0.85rem;
      color: var(--chalk);
    }
    
    .warning-alert {
      font-size: 0.8rem;
    }
    
    .qty-stepper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .step-btn {
      color: #000000;
      font-size: 1.2rem;
      cursor: pointer;
      font-weight: 600;
    }
    
    .step-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    .qty-val {
      background: var(--ink-2);
      border: 1px solid var(--border-color);
      min-width: 40px;
      text-align: center;
      padding: 0.2rem 0;
      border-radius: var(--radius);
      font-size: 0.9rem;
    }
    
    .price-action {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }
    
    .item-price {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--bone);
    }
    
    .remove-btn {
      font-size: 0.85rem;
      cursor: pointer;
      text-transform: none;
    }
    
    .remove-btn:hover {
      text-decoration: underline;
    }
    
    /* Summary sidebar */
    .summary-sidebar {
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
      color: #000000;
    }
    
    .oos-warning {
      font-size: 0.8rem;
      line-height: 1.4;
    }
    
    .btn-checkout {
      width: 100%;
      padding: 0.9rem;
    }
    
    .btn-clear {
      font-size: 0.85rem;
      cursor: pointer;
      text-transform: none;
    }
    
    .btn-clear:hover {
      text-decoration: underline;
    }
 
    @media (max-width: 992px) {
      .cart-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  `]
})
export class CartPageComponent implements OnInit {
  cartService = inject(CartService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.cartService.loadCart();
  }

  getProduct(item: CartItem): Product | null {
    if (typeof item.product === 'string') return null;
    return item.product;
  }

  hasArchivedItems(): boolean {
    return this.cartService.items().some(item => {
      const prod = this.getProduct(item);
      return !prod || prod.isActive === false;
    });
  }

  currentShippingCost(): string {
    const sub = this.cartService.subtotal();
    if (sub === 0) return '$0.00';
    return sub > 100 ? 'FREE' : '$9.99';
  }

  grandTotal(): number {
    const sub = this.cartService.subtotal();
    if (sub === 0) return 0;
    const shipping = sub > 100 ? 0 : 9.99;
    return sub + shipping;
  }

  updateQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    this.cartService.updateItem(item._id, newQty).subscribe({
      next: () => {
        this.toastService.show('Quantity updated.', 'info');
      }
    });
  }

  removeItem(itemId: string) {
    this.cartService.removeItem(itemId).subscribe({
      next: () => {
        this.toastService.show('Item removed from cart.', 'info');
      }
    });
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.toastService.show('Cart cleared.', 'info');
        }
      });
    }
  }
}
