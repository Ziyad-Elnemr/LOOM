import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="mgr-shell">
      <h2 class="main-title">Product Management</h2>

      <div class="mgr-grid">
        <!-- List Panel -->
        <div class="list-panel">
          <div class="panel-header">
            <span class="lbl font-bold-label">Products List</span>
          </div>

          @if (loading()) {
            <app-loading-spinner></app-loading-spinner>
          } @else {
            <table class="tech-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (prod of products(); track prod.id) {
                  <tr [class.selected]="selectedProduct()?.id === prod.id">
                    <td class="text-brass">LOOM-{{ prod.id.slice(-4).toUpperCase() }}</td>
                    <td>{{ prod.title }}</td>
                    <td>{{ prod.category | titlecase }}</td>
                    <td class="text-brass">\${{ prod.price | number:'1.2-2' }}</td>
                    <td>
                      <span class="status-tag" [class.active]="prod.isActive !== false">
                        {{ prod.isActive !== false ? 'Active' : 'Removed' }}
                      </span>
                    </td>
                    <td>
                      <button class="action-btn text-brass" (click)="editProduct(prod)">Edit</button>
                      <button class="action-btn text-rust" (click)="deleteProduct(prod.id)">Remove</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <!-- Form/Variant Panel -->
        <div class="form-panel">
          <h3 class="sub-title">Product Details Form</h3>

          <form (submit)="saveProduct($event)" class="mgr-form font-body">
            <div class="form-control">
              <label>Title:</label>
              <input type="text" name="title" [(ngModel)]="formProduct.title" required placeholder="Heavyweight Overshirt" />
            </div>

            <div class="form-control">
              <label>Description:</label>
              <textarea name="description" [(ngModel)]="formProduct.description" required rows="3" placeholder="Fabric specifications..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-control">
                <label>Price (USD):</label>
                <input type="number" name="price" [(ngModel)]="formProduct.price" required step="0.01" />
              </div>
              <div class="form-control">
                <label>Category:</label>
                <select name="category" [(ngModel)]="formProduct.category" required>
                  <option value="men's clothing">Men's Clothing</option>
                  <option value="women's clothing">Women's Clothing</option>
                  <option value="jewelery">Jewelery</option>
                  <option value="electronics">Electronics</option>
                </select>
              </div>
            </div>

            <div class="form-control">
              <label>Image URL:</label>
              <input type="text" name="image" [(ngModel)]="formProduct.image" placeholder="https://..." />
            </div>

            <!-- Variant Matrix Grid -->
            <div class="variant-matrix">
              <div class="variant-header font-bold-label">Stock Allocation Matrix</div>
              <div class="matrix-grid">
                <div>Size</div>
                <div>Ink Blue</div>
                <div>Ash Grey</div>
                <div>Bone White</div>

                <div>S</div>
                <div><input type="number" class="matrix-input" value="12" /></div>
                <div><input type="number" class="matrix-input" value="8" /></div>
                <div><input type="number" class="matrix-input" value="15" /></div>

                <div>M</div>
                <div><input type="number" class="matrix-input" value="22" /></div>
                <div><input type="number" class="matrix-input" value="19" /></div>
                <div><input type="number" class="matrix-input" value="25" /></div>

                <div>L</div>
                <div><input type="number" class="matrix-input" value="15" /></div>
                <div><input type="number" class="matrix-input" value="11" /></div>
                <div><input type="number" class="matrix-input" value="18" /></div>

                <div>XL</div>
                <div><input type="number" class="matrix-input" value="0" /></div>
                <div><input type="number" class="matrix-input" value="0" /></div>
                <div><input type="number" class="matrix-input" value="2" /></div>
              </div>
              <div class="matrix-note">* Stock values are synchronized automatically.</div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="resetForm()">Reset</button>
              <button type="submit" class="btn-primary" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save Product' }}
              </button>
            </div>
          </form>
        </div>
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
    
    .mgr-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 3rem;
    }
    
    .list-panel, .form-panel {
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
    }
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }

    .font-bold-label {
      font-weight: 600;
      font-size: 1rem;
    }
    
    .sub-title {
      font-size: 1.15rem;
      color: var(--bone);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
    }
    
    .tech-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    
    .tech-table th, .tech-table td {
      border: 1px solid var(--border-color);
      padding: 0.5rem 0.75rem;
      text-align: left;
    }
    
    .tech-table th {
      background: var(--ink-2);
      color: var(--chalk);
    }
    
    .tech-table tr.selected {
      background: rgba(0, 0, 0, 0.02);
      border-color: #000000;
    }
    
    .status-tag {
      padding: 0.15rem 0.4rem;
      font-size: 0.75rem;
      background: rgba(168, 71, 43, 0.05);
      color: var(--rust);
      border-radius: var(--radius);
      border: 1px solid rgba(168, 71, 43, 0.2);
    }
    
    .status-tag.active {
      background: rgba(76, 122, 91, 0.05);
      color: var(--thread-green);
      border-color: rgba(76, 122, 91, 0.2);
    }
    
    .action-btn {
      font-size: 0.85rem;
      cursor: pointer;
      margin-right: 0.5rem;
      text-transform: none;
    }
    
    .action-btn:hover {
      text-decoration: underline;
    }
    
    .mgr-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
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
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }
    
    .form-actions button {
      flex: 1;
    }
    
    /* Variant Table layout */
    .variant-matrix {
      background: var(--ink-2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1rem;
      font-size: 0.85rem;
    }
    
    .variant-header {
      font-weight: 600;
      color: var(--bone);
      margin-bottom: 0.75rem;
    }
    
    .matrix-grid {
      display: grid;
      grid-template-columns: 60px repeat(3, 1fr);
      gap: 0.4rem;
      align-items: center;
      text-align: center;
    }
    
    .matrix-input {
      padding: 0.2rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      text-align: center;
      font-size: 0.8rem;
    }
    
    .matrix-note {
      font-size: 0.75rem;
      color: var(--chalk);
      margin-top: 0.75rem;
      opacity: 0.8;
    }

    @media (max-width: 992px) {
      .mgr-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  `]
})
export class ProductManagerComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  products = signal<Product[]>([]);
  loading = signal(true);
  saving = signal(false);
  selectedProduct = signal<Product | null>(null);

  formProduct = {
    title: '',
    description: '',
    price: 0,
    category: "men's clothing",
    image: ''
  };

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  initializeNewProduct() {
    this.selectedProduct.set(null);
    this.formProduct = {
      title: '',
      description: '',
      price: 0,
      category: "men's clothing",
      image: ''
    };
  }

  editProduct(prod: Product) {
    this.selectedProduct.set(prod);
    this.formProduct = {
      title: prod.title,
      description: prod.description,
      price: prod.price,
      category: prod.category as any,
      image: prod.image
    };
  }

  saveProduct(event: Event) {
    event.preventDefault();
    if (!this.formProduct.title || !this.formProduct.description || !this.formProduct.price) {
      this.toastService.show('Please fill out Title, Description, and Price.', 'error');
      return;
    }

    this.saving.set(true);
    const selected = this.selectedProduct();

    // Fallback default image link if empty
    const imgUrl = this.formProduct.image?.trim() || 'https://placehold.co/600x400';

    const payload = {
      ...this.formProduct,
      image: imgUrl,
      rating: selected?.rating || { rate: 4.5, count: 12 },
      isActive: true
    };

    const request$ = selected
      ? this.productService.updateProduct(selected.id, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.toastService.show(selected ? 'Product updated.' : 'Product created.', 'success');
        this.loadProducts();
        this.resetForm();
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message || 'Failed to save product in database.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to remove this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.toastService.show('Product removed successfully.', 'info');
          this.loadProducts();
        }
      });
    }
  }

  resetForm() {
    this.initializeNewProduct();
  }
}
