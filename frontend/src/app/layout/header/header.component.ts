import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header-shell">
      <div class="container nav-container">
        <!-- Logo -->
        <a routerLink="/" class="logo-link">
          <span class="logo">LOOM</span>
        </a>
        
        <!-- Navigation Linkage -->
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Catalog</a>
          <a routerLink="/cart" routerLinkActive="active" class="cart-nav-link">
            Cart 
            <span class="cart-badge" [class.primary]="cartService.itemCount() > 0">
              {{ cartService.itemCount() }}
            </span>
          </a>
          @if (authService.isLoggedIn()) {
            <a routerLink="/account" routerLinkActive="active">Account</a>
            @if (authService.isAdmin()) {
              <a routerLink="/admin/dashboard" routerLinkActive="active" class="admin-link">Admin</a>
            }
          }
        </nav>
        
        <!-- User Status / Auth CTA -->
        <div class="auth-group">
          @if (authService.isLoggedIn()) {
            <div class="user-meta">
              <span class="username">{{ authService.user()?.name }}</span>
              <button class="logout-btn" (click)="onLogout()">Logout</button>
            </div>
          } @else {
            <a routerLink="/login" class="login-cta-btn">Login</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header-shell {
      background: #FFFFFF;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .nav-container {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .logo-link {
      display: flex;
      align-items: center;
    }
    
    .logo {
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #000000;
    }
    
    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
      font-size: 0.95rem;
    }
    
    .nav-links a {
      position: relative;
      padding: 0.5rem 0;
      color: var(--chalk);
      font-weight: 500;
    }
    
    .nav-links a:hover {
      color: #000000;
    }
    
    .nav-links a.active {
      color: #000000;
      font-weight: 600;
    }
    
    .nav-links a.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: #000000;
    }
    
    .cart-nav-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    
    .cart-badge {
      font-size: 0.75rem;
      background: var(--ink-2);
      border: 1px solid var(--border-color);
      color: var(--chalk);
      padding: 0.1rem 0.4rem;
      border-radius: 99px;
    }
    
    .cart-badge.primary {
      border-color: #000000;
      color: #FFFFFF;
      background: #000000;
    }
    
    .admin-link {
      color: var(--rust) !important;
    }
    
    .admin-link.active::after {
      background: var(--rust) !important;
    }
    
    .auth-group {
      font-size: 0.9rem;
    }
    
    .user-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .username {
      color: var(--bone);
      font-weight: 500;
    }
    
    .logout-btn {
      color: var(--chalk);
      font-size: 0.9rem;
      font-family: var(--font-body);
      cursor: pointer;
      text-transform: none;
    }
    
    .logout-btn:hover {
      color: #000000;
    }
    
    .login-cta-btn {
      color: #FFFFFF;
      background: #000000;
      padding: 0.4rem 1rem;
      font-weight: 500;
      border-radius: var(--radius);
      transition: all 0.2s ease;
    }
    
    .login-cta-btn:hover {
      background: #333333;
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);

  onLogout() {
    this.authService.logout().subscribe();
  }
}
