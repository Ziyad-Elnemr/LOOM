import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-size-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="size-picker-container">
      <div class="picker-label">
        <span class="label-heading">Size</span>
        @if (selectedSize) {
          <span class="selected-value">{{ selectedSize }}</span>
        } @else {
          <span class="selected-value required-text">Required</span>
        }
      </div>
      <div class="size-grid">
        @for (size of availableSizes; track size) {
          @let isOos = outOfStockSizes.includes(size);
          <button 
            type="button"
            class="size-chip"
            [class.selected]="selectedSize === size"
            [class.oos]="isOos"
            [disabled]="isOos"
            (click)="selectSize(size)"
          >
            {{ size }}
            @if (isOos) {
              <div class="strike-line"></div>
            }
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .size-picker-container {
      margin: 1.5rem 0;
    }
    
    .picker-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }
    
    .label-heading {
      font-weight: 500;
      color: var(--chalk);
    }
    
    .selected-value {
      font-weight: 600;
      color: var(--bone);
    }
    
    .selected-value.required-text {
      color: var(--rust);
      font-weight: 400;
    }
    
    .size-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }
    
    .size-chip {
      position: relative;
      background: var(--ink-2);
      border: 1px solid var(--border-color);
      color: var(--bone);
      font-size: 0.9rem;
      padding: 0.6rem 0;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .size-chip:hover:not(:disabled) {
      border-color: var(--brass);
      color: var(--brass);
    }
    
    .size-chip.selected {
      background: var(--brass);
      color: #FFFFFF;
      border-color: var(--brass);
    }
    
    .size-chip:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
    
    .size-chip.oos {
      text-decoration: line-through;
    }
    
    .strike-line {
      position: absolute;
      top: 50%;
      left: 10%;
      right: 10%;
      height: 1px;
      background: var(--rust);
      transform: rotate(-15deg);
    }
  `]
})
export class SizePickerComponent {
  availableSizes: string[] = ['S', 'M', 'L', 'XL'];

  @Input() selectedSize: string = '';
  @Input() outOfStockSizes: string[] = [];
  @Output() sizeChange = new EventEmitter<string>();

  selectSize(size: string) {
    if (!this.outOfStockSizes.includes(size)) {
      this.sizeChange.emit(size);
    }
  }
}
