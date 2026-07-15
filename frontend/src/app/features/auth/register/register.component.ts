import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
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
          <h2>Register</h2>
          <p class="subtitle">Create your account to get started</p>
        </div>

        @if (errorMessage()) {
          <div class="error-banner">
            {{ errorMessage() }}
          </div>
        }

        <form (submit)="onRegister($event)" class="auth-form">
          <div class="form-control">
            <label>Full Name:</label>
            <input 
              type="text" 
              name="name" 
              [(ngModel)]="name" 
              required 
              placeholder="John Doe" 
            />
          </div>

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

          <div class="form-control">
            <label>Account Role:</label>
            <select name="role" [(ngModel)]="role" class="role-select" required>
              <option value="user">User / Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" class="btn-primary auth-submit" [disabled]="submitting()">
            {{ submitting() ? 'Registering...' : 'Register' }}
          </button>
        </form>

        <div class="auth-footer text-center">
          <span>Already registered?</span>
          <a routerLink="/login" class="text-brass">Login &rarr;</a>
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

    .role-select {
      width: 100%;
      padding: 0.65rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      background-color: #FFFFFF;
      font-size: 0.9rem;
      color: #000000;
      outline: none;
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
export class RegisterComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  role = 'user';
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  onRegister(event: Event) {
    event.preventDefault();
    this.errorMessage.set(null);

    // Validation checks
    if (!this.name || !this.email || !this.password) {
      this.errorMessage.set('All fields are required.');
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage.set('Password must be at least 8 characters long.');
      return;
    }

    if (!/\d/.test(this.password)) {
      this.errorMessage.set('Password must contain at least one number.');
      return;
    }

    this.submitting.set(true);
    this.authService.register(this.name, this.email, this.password, this.role).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toastService.show('Account created successfully.', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || 'Failed to create account. Please check your credentials.';
        this.errorMessage.set(msg);
      }
    });
  }
}
