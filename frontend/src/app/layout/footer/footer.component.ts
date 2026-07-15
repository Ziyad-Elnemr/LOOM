import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer-shell">
      <div class="container footer-content">
        <div class="footer-col">
          <div class="col-title">About</div>
          <p class="about-text">LOOM is a modern clothing platform built with a clean aesthetic and high-quality materials.</p>
        </div>
        
        <div class="footer-col">
          <div class="col-title">Contact</div>
          <div>Email: hello&#64;loom.systems</div>
          <div>Tel: +1 (800) 555-LOOM</div>
        </div>
        
        <div class="footer-col">
          <div class="col-title">Copyright</div>
          <div>&copy; {{ currentYear }} LOOM Corp. All rights reserved.</div>
          <div>Quality garments made for everyday wear.</div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-shell {
      background: var(--ink-2);
      border-top: 1px solid var(--border-color);
      color: var(--chalk);
      font-size: 0.85rem;
      padding: 3rem 0;
      margin-top: 4rem;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2.5rem;
    }
    
    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .col-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--bone);
      margin-bottom: 0.5rem;
    }

    .about-text {
      line-height: 1.5;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
