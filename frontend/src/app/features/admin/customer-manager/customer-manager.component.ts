import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, CustomerUser } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-customer-manager',
    standalone: true,
    imports: [CommonModule, LoadingSpinnerComponent],
    template: `
    <div class="mgr-shell">
      <h2 class="main-title">Customer Management</h2>

      <div class="ledger-box card-box">
        <div class="panel-header">
          <span class="lbl font-bold-label">Registered Customers</span>
        </div>

        @if (loading()) {
          <app-loading-spinner></app-loading-spinner>
        } @else {
          <table class="tech-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (u of users(); track u._id) {
                <tr>
                  <td>{{ u.name }}</td>
                  <td>{{ u.email }}</td>
                  <td>
                    <span class="role-badge" [class.admin]="u.role === 'admin'">
                      {{ u.role | uppercase }}
                    </span>
                  </td>
                  <td>
                    <span class="status-tag" [class.active]="u.isActive">
                      {{ u.isActive ? 'Active' : 'Deactivated' }}
                    </span>
                  </td>
                  <td>{{ u.createdAt | date:'shortDate' }}</td>
                  <td>
                    <button class="action-btn text-rust" (click)="deleteUser(u)">Remove</button>
                    @if (u.isActive) {
                      <button class="action-btn text-brass" (click)="toggleStatus(u, false)">Deactivate</button>
                    } @else {
                      <button class="action-btn text-brass" (click)="toggleStatus(u, true)">Activate</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
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
    
    .card-box {
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-bottom: 2rem;
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
    
    .tech-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    
    .tech-table th, .tech-table td {
      border: 1px solid var(--border-color);
      padding: 0.75rem 1rem;
      text-align: left;
    }
    
    .tech-table th {
      background: var(--ink-2);
      color: var(--chalk);
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

    .role-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--chalk);
    }

    .role-badge.admin {
      color: var(--brass);
    }
    
    .action-btn {
      font-size: 0.85rem;
      cursor: pointer;
      margin-right: 0.75rem;
      text-transform: none;
      background: none;
      border: none;
    }
    
    .action-btn:hover {
      text-decoration: underline;
    }
  `]
})
export class CustomerManagerComponent implements OnInit {
    private userService = inject(UserService);
    private toastService = inject(ToastService);

    users = signal<CustomerUser[]>([]);
    loading = signal(true);

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading.set(true);
        this.userService.getAllUsers().subscribe({
            next: (res) => {
                this.users.set(res.data || []);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    deleteUser(user: CustomerUser) {
        if (confirm(`Are you sure you want to delete customer ${user.name}? This action cannot be undone.`)) {
            this.userService.deleteUser(user._id).subscribe({
                next: (res) => {
                    this.toastService.show(res.message || 'Customer removed successfully.', 'success');
                    this.loadUsers();
                },
                error: (err) => {
                    const msg = err?.error?.message || 'Failed to delete customer.';
                    this.toastService.show(msg, 'error');
                }
            });
        }
    }

    toggleStatus(user: CustomerUser, isActive: boolean) {
        this.userService.updateUserStatus(user._id, { isActive }).subscribe({
            next: () => {
                this.toastService.show(`User status updated.`, 'success');
                this.loadUsers();
            },
            error: (err) => {
                const msg = err?.error?.message || 'Failed to update status.';
                this.toastService.show(msg, 'error');
            }
        });
    }
}
