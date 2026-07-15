import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';

@Component({
    selector: 'app-spec-panel',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="spec-shell">
      <div class="spec-header">// PART_TECHNICAL_SPECIFICATION</div>
      <div class="spec-body font-mono">
        <div class="spec-row">
          <span class="spec-lbl">IDENTIFIER:</span>
          <span class="spec-val">SKU-{{ skuCode() }}</span>
        </div>
        <div class="spec-row">
          <span class="spec-lbl">FABRIC:</span>
          <span class="spec-val">{{ fabricVal() }}</span>
        </div>
        <div class="spec-row">
          <span class="spec-lbl">FIT_SPEC:</span>
          <span class="spec-val">{{ fitVal() }}</span>
        </div>
        <div class="spec-row">
          <span class="spec-lbl">CATEGORY:</span>
          <span class="spec-val text-brass uppercase">{{ product?.category || 'ESSENTIALS' }}</span>
        </div>
        <div class="spec-row">
          <span class="spec-lbl">STATUS:</span>
          <span class="spec-val text-green" [class.text-rust]="product?.isActive === false">
            {{ product?.isActive !== false ? 'IN_STOCK [ACTIVE]' : 'OUT_OF_STOCK' }}
          </span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .spec-shell {
      border: 1px dashed var(--chalk);
      background: rgba(36, 54, 90, 0.45);
      border-radius: var(--radius);
      padding: 0.75rem 1rem;
      font-size: 0.75rem;
    }
    
    .spec-header {
      font-family: var(--font-mono);
      color: var(--chalk);
      font-weight: 500;
      margin-bottom: 0.5rem;
      opacity: 0.8;
      letter-spacing: 0.05em;
    }
    
    .spec-body {
      font-family: var(--font-mono);
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    
    .spec-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dotted rgba(199, 205, 214, 0.15);
      padding-bottom: 0.15rem;
    }
    
    .spec-lbl {
      color: var(--chalk);
      opacity: 0.75;
    }
    
    .spec-val {
      color: var(--bone);
      text-align: right;
    }
  `]
})
export class SpecPanelComponent {
    @Input() product: Product | null = null;

    skuCode(): string {
        if (!this.product?.id) return 'LOOM-0000';
        const idSec = this.product.id.slice(-4).toUpperCase();
        const catSec = (this.product.category || 'GEN').substring(0, 3).toUpperCase();
        return `${catSec}-${idSec}`;
    }

    fabricVal(): string {
        const title = (this.product?.title || '').toLowerCase();
        if (title.includes('jacket') || title.includes('coat')) return 'Nylon / Water Resistant Shell';
        if (title.includes('sweater') || title.includes('knit')) return '100% Merino Wool';
        if (title.includes('shirt') || title.includes('t-shirt') || title.includes('tee')) return '100% Organic Pima Cotton';
        return 'Premium Cotton / Lycra Blend';
    }

    fitVal(): string {
        const title = (this.product?.title || '').toLowerCase();
        if (title.includes('fit') || title.includes('slim')) return 'Slim Fit / Tailored';
        if (title.includes('oversized') || title.includes('hoodie')) return 'Relaxed Boxy Fit';
        return 'Standard Technical Fit';
    }
}
