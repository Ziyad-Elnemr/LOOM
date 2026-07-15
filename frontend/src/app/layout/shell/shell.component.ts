import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
    template: `
    <div class="shell-wrapper">
      <app-header></app-header>
      
      <main class="main-viewport">
        <router-outlet></router-outlet>
      </main>
      
      <app-footer></app-footer>
      
      <!-- Core alert toast overlay -->
      <app-toast-container></app-toast-container>
    </div>
  `,
    styles: [`
    .shell-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .main-viewport {
      flex: 1;
      padding: 2rem 0;
    }
  `]
})
export class ShellComponent implements OnInit {
    authService = inject(AuthService);
    cartService = inject(CartService);

    ngOnInit(): void {
        // Silently restore session on startup, then load the cart
        this.authService.tryRestoreSession().subscribe({
            next: () => {
                if (this.authService.isLoggedIn()) {
                    this.cartService.loadCart();
                }
            }
        });
    }
}
