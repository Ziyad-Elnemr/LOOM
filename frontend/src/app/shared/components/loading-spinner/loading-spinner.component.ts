import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-container">
      <div class="spinner"></div>
      <span class="loading-text">Loading...</span>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
    }
    
    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid var(--border-color);
      border-top-color: #000000;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    .loading-text {
      font-size: 0.9rem;
      color: var(--chalk);
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent { }
