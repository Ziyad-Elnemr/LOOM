import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ShippingAddress } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-shell">
      <h2 class="section-title">User Profile</h2>

      <!-- General Info -->
      <div class="profile-card">
        <h4 class="card-subtitle">Personal Details</h4>
        <div class="info-rows">
          <div class="row">
            <span>Name:</span>
            <span>{{ authService.user()?.name }}</span>
          </div>
          <div class="row">
            <span>Email:</span>
            <span>{{ authService.user()?.email }}</span>
          </div>
          <div class="row">
            <span>Account Role:</span>
            <span class="role-badge">{{ authService.user()?.role }}</span>
          </div>
        </div>
      </div>

      <!-- Address registry -->
      <div class="profile-card margin-top">
        <h4 class="card-subtitle">Saved Addresses</h4>
        
        @if (addresses().length === 0) {
          <p class="empty-msg">No addresses saved yet.</p>
        } @else {
          <div class="address-grid">
            @for (addr of addresses(); track addr.street) {
              <div class="address-block">
                <div class="addr-head">
                  <strong>{{ addr.fullName }}</strong>
                  <span class="actions">
                    @if (addr.isDefault) { <span class="tag-default">[Default]</span> }
                    <button class="text-rust delete-btn" (click)="deleteAddress($index)">Delete</button>
                  </span>
                </div>
                <div>{{ addr.street }}</div>
                <div>{{ addr.city }}, {{ addr.state }} {{ addr.postalCode }}</div>
                <div>{{ addr.country }}</div>
                <div>Tel: {{ addr.phone }}</div>
              </div>
            }
          </div>
        }

        <!-- Add Address form toggle -->
        <div class="form-toggle-wrap">
          <button class="btn-secondary" (click)="showForm.set(!showForm())">
            {{ showForm() ? 'Cancel' : 'Add New Address' }}
          </button>
        </div>

        <!-- Add Address form -->
        @if (showForm()) {
          <form (submit)="saveAddress($event)" class="address-form animate-fade-in">
            <h4 class="form-title">New Address Details</h4>
            <div class="form-row">
              <div class="form-control">
                <label>Full Name:</label>
                <input type="text" name="fullName" [(ngModel)]="newAddress.fullName" required placeholder="John Doe" />
              </div>
              <div class="form-control">
                <label>Phone Number:</label>
                <input type="text" name="phone" [(ngModel)]="newAddress.phone" required placeholder="555-5555" />
              </div>
            </div>
            
            <div class="form-control">
              <label>Street Address:</label>
              <input type="text" name="street" [(ngModel)]="newAddress.street" required placeholder="123 Main St" />
            </div>
            
            <div class="form-row triplet">
              <div class="form-control">
                <label>City:</label>
                <input type="text" name="city" [(ngModel)]="newAddress.city" required placeholder="New York" />
              </div>
              <div class="form-control">
                <label>State:</label>
                <input type="text" name="state" [(ngModel)]="newAddress.state" placeholder="NY" />
              </div>
              <div class="form-control">
                <label>Postal Code:</label>
                <input type="text" name="postalCode" [(ngModel)]="newAddress.postalCode" required placeholder="10001" />
              </div>
            </div>

            <div class="form-control">
              <label>Country:</label>
              <input type="text" name="country" [(ngModel)]="newAddress.country" required placeholder="United States" />
            </div>

            <div class="form-control checkbox-control">
              <input type="checkbox" name="isDefault" [(ngModel)]="newAddress.isDefault" id="isDefaultCheck" />
              <label for="isDefaultCheck">Set as default shipping address</label>
            </div>

            <button type="submit" class="btn-primary" [disabled]="saving()">
              {{ saving() ? 'Saving...' : 'Add Address' }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-shell {
      padding: 1rem 0;
    }
    
    .section-title {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      color: var(--bone);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    
    .profile-card {
      background: var(--ink-2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
    }
    
    .profile-card.margin-top {
      margin-top: 2rem;
    }
    
    .card-subtitle {
      font-size: 1.1rem;
      color: var(--bone);
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
      font-weight: 600;
    }
    
    .info-rows {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      font-size: 0.9rem;
    }
    
    .info-rows .row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.35rem;
    }
    
    .info-rows span:first-child {
      color: var(--chalk);
    }

    .role-badge {
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .empty-msg {
      font-size: 0.9rem;
      color: var(--chalk);
    }
    
    .address-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    
    .address-block {
      border: 1px solid var(--border-color);
      padding: 1rem;
      border-radius: var(--radius);
      font-size: 0.85rem;
      color: var(--bone);
      background: #FFFFFF;
    }
    
    .addr-head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.25rem;
    }
    
    .tag-default {
      color: var(--chalk);
      font-weight: 600;
      margin-right: 0.5rem;
    }

    .delete-btn {
      font-size: 0.85rem;
      cursor: pointer;
      text-transform: none;
    }
    
    .form-toggle-wrap {
      margin-top: 1.5rem;
    }
    
    .address-form {
      border-top: 1px solid var(--border-color);
      margin-top: 2rem;
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-title {
      font-size: 1rem;
      font-weight: 600;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-row.triplet {
      grid-template-columns: 1fr 100px 120px;
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
    
    .checkbox-control {
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
    
    .checkbox-control input {
      width: auto;
      cursor: pointer;
    }
    
    .checkbox-control label {
      margin-bottom: 0;
      cursor: pointer;
    }
  `]
})
export class ProfileComponent {
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  showForm = signal(false);
  saving = signal(false);

  newAddress: ShippingAddress = {
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  };

  addresses() {
    return this.authService.user()?.addresses || [];
  }

  saveAddress(event: Event) {
    event.preventDefault();
    if (!this.newAddress.fullName || !this.newAddress.phone || !this.newAddress.street || !this.newAddress.city || !this.newAddress.postalCode) {
      return;
    }

    this.saving.set(true);
    const user = this.authService.user();
    if (!user) return;

    const list = [...(user.addresses || [])];

    if (this.newAddress.isDefault) {
      list.forEach(a => a.isDefault = false);
    }

    list.push({ ...this.newAddress });

    this.authService.updateProfile(user.name, user.phone, list).subscribe({
      next: () => {
        this.toastService.show('Address added successfully.', 'success');
        this.newAddress = { fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: '', isDefault: false };
        this.showForm.set(false);
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  deleteAddress(index: number) {
    if (confirm('Are you sure you want to delete this address?')) {
      const user = this.authService.user();
      if (!user) return;

      const list = [...(user.addresses || [])];
      list.splice(index, 1);

      this.authService.updateProfile(user.name, user.phone, list).subscribe({
        next: () => {
          this.toastService.show('Address deleted.', 'info');
        }
      });
    }
  }
}
