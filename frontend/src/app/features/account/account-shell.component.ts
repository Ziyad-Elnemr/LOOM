import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-account-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="container container-margin">
      <div class="accounts-grid">
        <!-- Vertical Tab List -->
        <nav class="account-tabs">
          <a routerLink="/account" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            Profile
          </a>
          <a routerLink="/account/orders" routerLinkActive="active">
            Order Review
          </a>
        </nav>

        <!-- Dynamic Area -->
        <section class="account-body">
          <router-outlet></router-outlet>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .container-margin {
      margin-top: 2rem;
      margin-bottom: 4rem;
    }
    
    .accounts-grid {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 3rem;
    }
    
    .account-tabs {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      height: fit-content;
      position: sticky;
      top: 100px;
    }
    
    .account-tabs a {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--chalk);
      border: 1px solid transparent;
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      transition: all 0.2s ease;
      text-transform: none;
    }
    
    .account-tabs a:hover {
      color: #000000;
      background: rgba(0, 0, 0, 0.02);
    }
    
    .account-tabs a.active {
      color: #000000;
      font-weight: 600;
      border-color: var(--border-color);
      background: var(--ink-2);
    }
    
    .account-body {
      min-height: 400px;
    }

    @media (max-width: 768px) {
      .accounts-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .account-tabs {
        position: relative;
        top: 0;
        flex-direction: row;
        overflow-x: auto;
      }
      .account-tabs a {
        white-space: nowrap;
      }
    }
  `]
})
export class AccountShellComponent { }
