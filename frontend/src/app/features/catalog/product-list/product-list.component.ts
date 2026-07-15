import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="container container-margin">
      <!-- Section Header -->
      <div class="catalog-header">
        <h1 class="catalog-title">Catalog</h1>
        <p class="system-indicator">Showing {{ filteredProducts().length }} of {{ products().length }} items</p>
      </div>

      <!-- Filter Controls & Dashboard -->
      <div class="catalog-layout">
        <!-- Sidebar filters -->
        <aside class="filter-sidebar">
          <div class="filter-group">
            <h4 class="filter-title">Search</h4>
            <input 
              type="text" 
              placeholder="Search catalog..." 
              [ngModel]="searchQuery()" 
              (ngModelChange)="onSearchChange($event)"
              class="search-input"
            />
          </div>

          <div class="filter-group">
            <h4 class="filter-title">Categories</h4>
            <div class="category-list">
              <button 
                class="category-btn" 
                [class.active]="!selectedCategory()" 
                (click)="setCategory(null)"
              >
                All Items
              </button>
              @for (cat of categories; track cat) {
                <button 
                  class="category-btn" 
                  [class.active]="selectedCategory() === cat" 
                  (click)="setCategory(cat)"
                >
                  {{ cat | titlecase }}
                </button>
              }
            </div>
          </div>

          <div class="filter-group">
            <h4 class="filter-title">Max Price</h4>
            <div class="range-inputs">
              <label>Up to \${{ maxPrice() }}</label>
              <input 
                type="range" 
                min="0" 
                max="500" 
                step="10" 
                [value]="maxPrice()" 
                (input)="onPriceChange($event)"
                class="price-range"
              />
            </div>
          </div>

          <button class="btn-secondary btn-full" (click)="clearFilters()">
            Clear Filters
          </button>
        </aside>

        <!-- Product Grid View -->
        <section class="grid-section">
          @if (loading()) {
            <app-loading-spinner></app-loading-spinner>
          } @else if (error()) {
            <app-empty-state [message]="error()!" actionLabel="Retry" (action)="loadProducts()"></app-empty-state>
          } @else if (filteredProducts().length === 0) {
            <app-empty-state message="No products match your filters." actionLabel="Clear Filters" (action)="clearFilters()"></app-empty-state>
          } @else {
            <div class="products-grid">
              @for (p of filteredProducts(); track p.id) {
                <app-product-card [product]="p"></app-product-card>
              }
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: [`
    .container-margin {
      margin-top: 2rem;
      margin-bottom: 5rem;
    }
    
    .catalog-header {
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .catalog-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--bone);
      letter-spacing: -0.02em;
    }
    
    .system-indicator {
      font-size: 0.85rem;
      color: var(--chalk);
    }
    
    .catalog-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 3rem;
    }
    
    .filter-sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .filter-title {
      font-size: 0.85rem;
      color: var(--chalk);
      font-weight: 600;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.25rem;
    }
    
    .search-input {
      width: 100%;
      padding: 0.6rem 0.8rem;
      font-size: 0.85rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      background: #FFFFFF;
      color: #000000;
      outline: none;
      transition: border-color 0.2s ease;
    }
    
    .search-input:focus {
      border-color: #000000;
    }
    
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    
    .category-btn {
      text-align: left;
      font-size: 0.85rem;
      padding: 0.4rem 0.6rem;
      border-radius: var(--radius);
      color: var(--chalk);
      transition: all 0.2s ease;
      background: none;
      border: none;
      cursor: pointer;
    }
    
    .category-btn:hover {
      color: #000000;
      background: rgba(0, 0, 0, 0.02);
    }
    
    .category-btn.active {
      color: #000000;
      font-weight: 600;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
    }
    
    .range-inputs {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--chalk);
    }
    
    .price-range {
      width: 100%;
      accent-color: #000000;
      cursor: pointer;
    }
    
    .btn-full {
      width: 100%;
      padding: 0.6rem;
      font-size: 0.85rem;
    }
    
    .grid-section {
      min-height: 400px;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 2rem;
    }
 
    @media (max-width: 768px) {
      .catalog-layout {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedCategory = signal<string | null>(null);
  maxPrice = signal<number>(500);
  searchQuery = signal<string>('');

  categories = ["men's clothing", "women's clothing", "jewelery", "electronics"];

  constructor() {
    effect(() => {
      const all = this.products();
      const cat = this.selectedCategory();
      const max = this.maxPrice();
      const q = this.searchQuery().toLowerCase().trim();

      const filtered = all.filter(p => {
        const matchesCategory = !cat || p.category === cat;
        const matchesPrice = p.price <= max;
        const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        return matchesCategory && matchesPrice && matchesSearch;
      });

      this.filteredProducts.set(filtered);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      if (params['search']) {
        this.searchQuery.set(params['search']);
      }
      if (params['maxPrice']) {
        this.maxPrice.set(Number(params['maxPrice']));
      }
    });

    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Could not fetch products from LOOM backend core.');
        this.loading.set(false);
      }
    });
  }

  setCategory(category: string | null) {
    this.selectedCategory.set(category);
    this.updateQueryParams();
  }

  onSearchChange(val: string) {
    this.searchQuery.set(val);
    this.updateQueryParams();
  }

  onPriceChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.maxPrice.set(Number(target.value));
    this.updateQueryParams();
  }

  clearFilters() {
    this.selectedCategory.set(null);
    this.maxPrice.set(500);
    this.searchQuery.set('');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: ''
    });
  }

  private updateQueryParams() {
    const queryParams: any = {};
    if (this.selectedCategory()) {
      queryParams.category = this.selectedCategory();
    }
    if (this.searchQuery()) {
      queryParams.search = this.searchQuery();
    }
    if (this.maxPrice() !== 500) {
      queryParams.maxPrice = this.maxPrice();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
