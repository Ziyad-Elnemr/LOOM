import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-box">
      <div class="status-code">Empty State</div>
      <p class="message">{{ message }}</p>
      @if (actionLabel) {
        <button class="btn-secondary" (click)="action.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-box {
      border: var(--border-dash);
      padding: 3rem 2rem;
      text-align: center;
      background: var(--ink-2);
      border-radius: var(--radius);
      margin: 1.5rem 0;
    }
    
    .status-code {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--chalk);
      margin-bottom: 0.5rem;
    }
    
    .message {
      font-family: var(--font-body);
      font-size: 1rem;
      color: var(--chalk);
      margin-bottom: 1.5rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() message: string = 'No entries found.';
  @Input() actionLabel: string = '';
  @Output() action = new EventEmitter<void>();
}
