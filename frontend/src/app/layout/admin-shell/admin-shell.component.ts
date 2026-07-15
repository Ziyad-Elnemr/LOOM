import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="admin-grid">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <div class="logo">Admin Panel</div>
          <span class="version-tag">Loom Store</span>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="active">
            Manage Products
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active">
            Manage Orders
          </a>
          <a routerLink="/admin/customers" routerLinkActive="active">
            Manage Customers
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <div class="operator-meta">Admin: {{ adminEmail() }}</div>
          <a routerLink="/" class="back-link">&larr; Exit Admin</a>
        </div>
      </aside>
      
      <!-- Main Content Viewport -->
      <main class="admin-main">
        <div class="container admin-container">
          <router-outlet></router-outlet>
        </div>
      </main>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .admin-grid {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 100vh;
      background: #FFFFFF;
    }
    
    .admin-sidebar {
      background: var(--ink-2);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      padding: 2rem 1.5rem;
    }
    
    .sidebar-header {
      margin-bottom: 2.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
    }
    
    .logo {
      font-size: 1.4rem;
      font-weight: 700;
      color: #000000;
      letter-spacing: -0.02em;
    }
    
    .version-tag {
      font-size: 0.8rem;
      color: var(--chalk);
    }
    
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .sidebar-nav a {
      display: block;
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      border: 1px solid transparent;
      color: var(--chalk);
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }
    
    .sidebar-nav a:hover {
      color: #000000;
      background: rgba(0, 0, 0, 0.02);
    }
    
    .sidebar-nav a.active {
      color: #000000;
      font-weight: 600;
      border-color: var(--border-color);
      background: #FFFFFF;
    }
    
    .sidebar-footer {
      margin-top: auto;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .operator-meta {
      font-size: 0.8rem;
      color: var(--chalk);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    
    .back-link {
      font-size: 0.9rem;
      font-weight: 500;
      color: #000000;
    }
    
    .back-link:hover {
      color: var(--chalk);
    }
    
    .admin-main {
      padding: 2.5rem 0;
      overflow-y: auto;
    }
    
    .admin-container {
      max-width: 1100px;
    }

    @media (max-width: 768px) {
      .admin-grid {
        grid-template-columns: 1fr;
      }
      .admin-sidebar {
        height: auto;
        position: relative;
      }
    }
  `]
})
export class AdminShellComponent {
  authService = inject(AuthService);

  adminEmail(): string {
    return this.authService.user()?.email || 'Admin';
  }
}
