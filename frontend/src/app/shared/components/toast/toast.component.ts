import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrapper">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="toast.type">
          <div class="toast-header">
            <span class="system-tag">Notification</span>
            <button class="dismiss-btn" (click)="toastService.dismiss(toast.id)">&times;</button>
          </div>
          <div class="toast-body">
            {{ toast.message }}
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-wrapper {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 320px;
      width: calc(100vw - 4rem);
    }
    
    .toast-item {
      background: #FFFFFF;
      border-left: 3px solid var(--chalk);
      border-top: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      animation: slideIn 0.2s cubic-bezier(0.1, 0.9, 0.2, 1);
    }
    
    .toast-item.success {
      border-left-color: var(--thread-green);
    }
    
    .toast-item.error {
      border-left-color: var(--rust);
    }
    
    .toast-item.info {
      border-left-color: var(--brass);
    }
    
    .toast-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }
    
    .system-tag {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--chalk);
      opacity: 0.9;
    }
    
    .dismiss-btn {
      color: var(--chalk);
      font-size: 1.1rem;
      line-height: 1;
      padding: 0;
      cursor: pointer;
    }
    
    .dismiss-btn:hover {
      color: var(--rust);
    }
    
    .toast-body {
      font-family: var(--font-body);
      font-size: 0.85rem;
      color: #000000;
    }
    
    @keyframes slideIn {
      from {
        transform: translateY(1rem) scale(0.98);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
