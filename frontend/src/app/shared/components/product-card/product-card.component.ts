import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-card-wrap" [routerLink]="['/product', product.id]">
      <div class="img-container">
        <img [src]="product.image || 'https://via.placeholder.com/300x400?text=LOOM+PIECE'" [alt]="product.title">
        
        <!-- Modern Hover CTA Bar -->
        <span class="hover-cta">View Details</span>
      </div>
      
      <div class="card-details">
        <div class="category uppercase">{{ product.category }}</div>
        <h3 class="title">{{ product.title }}</h3>
        
        <div class="footer-wrap">
          <span class="price">\${{ product.price | number:'1.2-2' }}</span>
          @if (product.rating) {
            <span class="rating-info">
              ★ {{ product.rating.rate }} ({{ product.rating.count }} reviews)
            </span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card-wrap {
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 0.75rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      transition: all 0.2s ease-in-out;
    }
    
    .product-card-wrap:hover {
      border-color: #000000;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
    }
    
    .img-container {
      position: relative;
      width: 100%;
      height: 280px;
      background: var(--ink-2);
      border-radius: var(--radius);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    
    .img-container img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.4s ease;
    }
    
    .product-card-wrap:hover .img-container img {
      transform: scale(1.03);
    }
    
    .hover-cta {
      position: absolute;
      bottom: 0px;
      left: 0;
      width: 100%;
      background: #000000;
      color: #FFFFFF;
      text-align: center;
      padding: 0.6rem 0;
      font-size: 0.85rem;
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0;
      transform: translateY(100%);
      transition: all 0.25s ease-in-out;
    }
    
    .product-card-wrap:hover .hover-cta {
      opacity: 1;
      transform: translateY(0);
    }
    
    .card-details {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      margin-top: 1rem;
    }
    
    .category {
      font-size: 0.72rem;
      color: var(--chalk);
      font-weight: 500;
      margin-bottom: 0.25rem;
      letter-spacing: 0.06em;
    }
    
    .title {
      font-size: 0.95rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      color: var(--bone);
    }
    
    .footer-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      border-top: 1px solid var(--border-color);
      padding-top: 0.5rem;
    }
    
    .price {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--bone);
    }
    
    .rating-info {
      font-size: 0.75rem;
      color: var(--chalk);
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
}
