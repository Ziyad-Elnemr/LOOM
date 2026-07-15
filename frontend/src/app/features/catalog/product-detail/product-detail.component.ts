import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewService } from '../../../core/services/review.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, Review } from '../../../core/models/product.model';
import { SizePickerComponent } from '../../../shared/components/size-picker/size-picker.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SizePickerComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="container detail-container">
      <div class="back-nav">
        <a routerLink="/">&larr; Back to catalog</a>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <app-empty-state [message]="error()!" actionLabel="Return Home" (action)="goHome()"></app-empty-state>
      } @else if (product()) {
        @let p = product()!;
        <div class="product-grid">
          <!-- Image Section -->
          <div class="gallery-wrapper">
            <div class="main-image-box">
              <img [src]="selectedImage || p.image" [alt]="p.title" />
            </div>
            <div class="thumbnails">
              <button 
                class="thumb-btn" 
                [class.active]="selectedImage === p.image" 
                (click)="selectedImage = p.image"
              >
                <img [src]="p.image" alt="Primary thumb" />
              </button>
              <button 
                class="thumb-btn" 
                [class.active]="selectedImage === mockAltImage" 
                (click)="selectedImage = mockAltImage"
              >
                <div class="thumb-alt-label">Alternate View</div>
              </button>
            </div>
          </div>

          <!-- Specs & Purchase controls -->
          <div class="detail-control">
            <div class="meta-sku">SKU: LOOM-{{ p.id.slice(-4).toUpperCase() }}</div>
            <h1 class="title">{{ p.title }}</h1>
            
            <div class="price-rating">
              <span class="price">\${{ p.price | number:'1.2-2' }}</span>
              <span class="rating-badge">★ {{ p.rating.rate }} ({{ p.rating.count }} reviews)</span>
            </div>

            <div class="description-box">
              <h4 class="section-title">Description</h4>
              <p>{{ p.description }}</p>
            </div>

            <!-- Size Picker -->
            <app-size-picker 
              [selectedSize]="selectedSize()" 
              [outOfStockSizes]="oosSizes"
              (sizeChange)="selectedSize.set($event)"
            ></app-size-picker>

            <!-- Color Picker -->
            <div class="color-picker-section">
              <div class="picker-label">Color</div>
              <div class="color-chips">
                @for (c of availableColors; track c) {
                  <button 
                    type="button"
                    class="color-chip" 
                    [class.selected]="selectedColor() === c"
                    (click)="selectedColor.set(c)"
                  >
                    {{ c }}
                  </button>
                }
              </div>
            </div>

            <!-- Inline validation messages -->
            <div class="validation-messages text-rust">
              @if (!selectedSize()) {
                <div>* Size selection is required.</div>
              }
              @if (!selectedColor()) {
                <div>* Color selection is required.</div>
              }
            </div>

            <!-- CTA Actions -->
            <div class="action-panel">
              <button 
                class="btn-primary btn-cta" 
                [disabled]="!selectedSize() || !selectedColor() || adding()"
                (click)="addToCart()"
              >
                {{ adding() ? 'Adding...' : 'Add to Cart' }}
              </button>
              
              @if (!authService.isLoggedIn()) {
                <div class="auth-hint">
                  * Note: Please <a routerLink="/login" class="text-brass">login</a> to add items to your cart.
                </div>
              }
            </div>

            <!-- Technical Spec Details -->
            <div class="spec-fold">
              <div class="spec-fold-header">Material details</div>
              <div class="spec-fold-table">
                <div class="row">
                  <span>Composition</span>
                  <span>100% combed cotton (250 GSM)</span>
                </div>
                <div class="row">
                  <span>Dye Method</span>
                  <span>Low-impact certified</span>
                </div>
                <div class="row">
                  <span>Finish</span>
                  <span>Pre-shrunk, enzyme washed soft finish</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews block -->
        <section class="reviews-section">
          <h2 class="section-heading">Customer Reviews</h2>
          
          <!-- Review Form (Only logged in) -->
          @if (authService.isLoggedIn()) {
            <form (submit)="submitReview($event)" class="review-form font-body">
              <h4 class="form-title">Write a review</h4>
              <div class="form-grid">
                <div>
                  <label>Rating:</label>
                  <select name="rating" [(ngModel)]="newReviewRating">
                    <option [value]="5">5 - Excellent</option>
                    <option [value]="4">4 - Good</option>
                    <option [value]="3">3 - Average</option>
                    <option [value]="2">2 - Poor</option>
                    <option [value]="1">1 - Terrible</option>
                  </select>
                </div>
                <div>
                  <label>Comment:</label>
                  <textarea name="comment" [(ngModel)]="newReviewComment" rows="3" placeholder="Write your review here..."></textarea>
                </div>
              </div>
              <button type="submit" class="btn-secondary" [disabled]="submittingReview()">
                Submit Review
              </button>
            </form>
          } @else {
            <div class="login-prompt">
              Please <a routerLink="/login" class="text-brass">login</a> to write a review.
            </div>
          }

          <!-- Reviews List -->
          <div class="reviews-list">
            @if (loadingReviews()) {
              <div>Loading reviews...</div>
            } @else if (reviews().length === 0) {
              <div class="empty-reviews">No reviews yet. Be the first to review this product!</div>
            } @else {
              @for (rev of reviews(); track rev._id) {
                <div class="review-card">
                  <div class="review-header">
                    <span class="user-handle">{{ getAuthorName(rev) }}</span>
                    <span class="rating text-brass">★ {{ rev.rating }}</span>
                    <span class="date">{{ rev.createdAt | date:'shortDate' }}</span>
                  </div>
                  <p class="review-comment">{{ rev.comment || '[No comment]' }}</p>
                  @if (canDeleteReview(rev)) {
                    <button class="delete-rev-btn text-rust" (click)="deleteReview(rev._id)">Delete</button>
                  }
                </div>
              }
            }
          </div>
        </section>
      )}
    </div>
  `,
  styles: [`
    .detail-container {
      margin-top: 2rem;
      margin-bottom: 4rem;
    }
    
    .back-nav {
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 3.5rem;
    }
    
    .gallery-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .main-image-box {
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      background: var(--ink-2);
      height: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .main-image-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .thumbnails {
      display: flex;
      gap: 1rem;
    }
    
    .thumb-btn {
      width: 80px;
      height: 80px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 0.25rem;
      cursor: pointer;
      background: var(--ink-2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .thumb-btn.active {
      border-color: #000000;
    }
    
    .thumb-btn img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .thumb-alt-label {
      font-size: 0.70rem;
      color: var(--chalk);
    }
    
    .detail-control {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .meta-sku {
      color: var(--chalk);
      font-size: 0.85rem;
    }
    
    .title {
      font-size: 2.2rem;
      color: var(--bone);
      line-height: 1.15;
      font-weight: 750;
      letter-spacing: -0.03em;
    }
    
    .price-rating {
      display: flex;
      gap: 2rem;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
    }
    
    .price {
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .rating-badge {
      font-size: 0.9rem;
      color: var(--chalk);
    }
    
    .description-box {
      font-size: 0.95rem;
      color: var(--chalk);
      line-height: 1.6;
    }
    
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--bone);
      margin-bottom: 0.4rem;
    }
    
    .color-picker-section {
      margin-bottom: 0.5rem;
    }
    
    .picker-label {
      font-size: 0.85rem;
      color: var(--chalk);
      margin-bottom: 0.5rem;
    }
    
    .color-chips {
      display: flex;
      gap: 0.5rem;
    }
    
    .color-chip {
      background: var(--ink-2);
      border: 1px solid var(--border-color);
      color: var(--bone);
      font-size: 0.85rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius);
      cursor: pointer;
    }
    
    .color-chip.selected {
      background: #000000;
      color: #FFFFFF;
      border-color: #000000;
    }
    
    .validation-messages {
      font-size: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .action-panel {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 1rem 0;
    }
    
    .btn-cta {
      width: 100%;
      padding: 1rem;
      font-size: 1.05rem;
    }
    
    .auth-hint {
      font-size: 0.85rem;
      text-align: center;
      color: var(--chalk);
    }
    
    .spec-fold {
      background: var(--ink-2);
      border-radius: var(--radius);
      border: 1px solid var(--border-color);
      padding: 1.25rem;
    }
    
    .spec-fold-header {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--bone);
      margin-bottom: 0.75rem;
    }
    
    .spec-fold-table {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    
    .spec-fold-table .row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.25rem;
    }
    
    .spec-fold-table span:first-child {
      color: var(--chalk);
      width: 30%;
    }
    
    .spec-fold-table span:last-child {
      color: var(--bone);
      text-align: right;
    }
 
    .reviews-section {
      margin-top: 4rem;
      border-top: 1px solid var(--border-color);
      padding-top: 3rem;
    }
    
    .section-heading {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: var(--bone);
    }
    
    .review-form {
      background: var(--ink-2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .form-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 1.5rem;
      margin: 1rem 0;
    }
    
    .form-grid label {
      display: block;
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
      color: var(--chalk);
    }
    
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .review-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.25rem;
      position: relative;
    }
    
    .review-header {
      display: flex;
      gap: 1.5rem;
      font-size: 0.85rem;
      color: var(--chalk);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
      margin-bottom: 0.75rem;
    }
    
    .user-handle {
      color: var(--bone);
      font-weight: 600;
    }
    
    .review-comment {
      font-size: 0.95rem;
      color: var(--bone);
      line-height: 1.5;
    }
    
    .delete-rev-btn {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      font-size: 0.8rem;
    }
    
    .login-prompt {
      font-size: 0.9rem;
      color: var(--chalk);
      margin-bottom: 2rem;
    }

    .empty-reviews {
      color: var(--chalk);
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .product-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private toastService = inject(ToastService);

  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  adding = signal(false);

  selectedImage = '';
  mockAltImage = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400&auto=format&fit=crop';

  selectedSize = signal<string>('');
  selectedColor = signal<string>('');

  availableColors = ['Ink Blue', 'Ash Grey', 'Bone White'];
  oosSizes = ['XL'];

  reviews = signal<Review[]>([]);
  loadingReviews = signal(false);
  submittingReview = signal(false);
  newReviewRating = 5;
  newReviewComment = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      } else {
        this.error.set('No product ID defined');
        this.loading.set(false);
      }
    });
  }

  loadProduct(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product.set(res.data);
        this.selectedImage = res.data.image;
        this.loading.set(false);
        this.loadReviews(id);
      },
      error: () => {
        this.error.set('This product does not exist in our catalog.');
        this.loading.set(false);
      }
    });
  }

  loadReviews(productId: string) {
    this.loadingReviews.set(true);
    this.reviewService.getProductReviews(productId).subscribe({
      next: (res) => {
        this.reviews.set(res.data || []);
        this.loadingReviews.set(false);
      },
      error: () => {
        this.reviews.set([]);
        this.loadingReviews.set(false);
      }
    });
  }

  addToCart() {
    if (!this.selectedSize() || !this.selectedColor() || !this.product()) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.toastService.show('Please login to add items to your cart.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    this.adding.set(true);
    this.cartService.addItem(this.product()!.id, 1, undefined, this.selectedSize(), this.selectedColor()).subscribe({
      next: () => {
        this.toastService.show('Item added to cart.', 'success');
        this.adding.set(false);
      },
      error: (err) => {
        this.adding.set(false);
      }
    });
  }

  submitReview(event: Event) {
    event.preventDefault();
    if (!this.product() || !this.newReviewComment.trim()) return;

    this.submittingReview.set(true);
    this.reviewService.saveReview(this.product()!.id, this.newReviewRating, this.newReviewComment).subscribe({
      next: () => {
        this.toastService.show('Review submitted successfully.', 'success');
        this.newReviewComment = '';
        this.newReviewRating = 5;
        this.submittingReview.set(false);
        this.loadReviews(this.product()!.id);
      },
      error: () => {
        this.submittingReview.set(false);
      }
    });
  }

  deleteReview(reviewId: string) {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.toastService.show('Review deleted.', 'info');
        if (this.product()) {
          this.loadReviews(this.product()!.id);
        }
      }
    });
  }

  getAuthorName(rev: Review): string {
    if (typeof rev.user === 'string') return 'User: ' + rev.user.slice(-4).toUpperCase();
    return rev.user?.name || 'Anonymous';
  }

  canDeleteReview(rev: Review): boolean {
    const user = this.authService.user();
    if (!user) return false;
    if (typeof rev.user === 'string') return rev.user === user.id || user.role === 'admin';
    return rev.user?._id === user.id || user.role === 'admin';
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
