import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container container-margin">
      <div class="auth-box">
        <!-- Exit link back to shop -->
        <div class="exit-link-wrap">
          <a routerLink="/" class="exit-link">&larr; Back to shop</a>
        </div>

        <div class="auth-header">
          <h2>Login</h2>
          <p class="subtitle">Login to access your account</p>
        </div>

        @if (errorMessage()) {
          <div class="error-banner">
            {{ errorMessage() }}
          </div>
        }

        <form (submit)="onLogin($event)" class="auth-form">
          <div class="form-control">
            <label>Email Address:</label>
            <input 
              type="email" 
              name="email" 
              [(ngModel)]="email" 
              required 
              placeholder="email@example.com" 
            />
          </div>

          <div class="form-control">
            <label>Password:</label>
            <input 
              type="password" 
              name="password" 
              [(ngModel)]="password" 
              required 
              placeholder="••••••••" 
            />
          </div>

          <button type="submit" class="btn-primary auth-submit" [disabled]="submitting()">
            {{ submitting() ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="auth-footer text-center">
          <span>No account?</span>
          <a routerLink="/register" class="text-brass">Create an account &rarr;</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-margin {
      margin-top: 4rem;
      margin-bottom: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .auth-box {
      width: 100%;
      max-width: 400px;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 2.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      position: relative;
    }

    .exit-link-wrap {
      margin-bottom: 1.5rem;
    }

    .exit-link {
      font-size: 0.85rem;
      color: var(--chalk);
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .exit-link:hover {
      color: #000000;
    }
    
    .auth-header {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
    }
    
    .auth-header h2 {
      font-size: 1.6rem;
      color: var(--bone);
      font-weight: 700;
    }
    
    .subtitle {
      font-size: 0.85rem;
      color: var(--chalk);
      margin-top: 0.25rem;
    }

    .error-banner {
      background-color: rgba(220, 53, 69, 0.05);
      color: var(--rust);
      border: 1px solid rgba(220, 53, 69, 0.2);
      border-radius: var(--radius);
      font-size: 0.85rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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
    
    .auth-submit {
      width: 100%;
      padding: 0.85rem;
      margin-top: 0.5rem;
    }
    
    .auth-footer {
      margin-top: 2rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
      font-size: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  email = '';
  password = '';
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  onLogin(event: Event) {
    event.preventDefault();
    this.errorMessage.set(null);

    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill out all fields.');
      return;
    }

    this.submitting.set(true);
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toastService.show('Logged in successfully.', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || 'Invalid email or password.';
        this.errorMessage.set(msg);
      }
    });
  }
}
