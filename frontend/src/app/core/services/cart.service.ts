import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { CartItem, Cart } from '../models/cart.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
    private readonly cartUrl = `${environment.apiUrl}/cart`;
    private itemsSignal = signal<CartItem[]>([]);

    items = this.itemsSignal.asReadonly();
    itemCount = computed(() =>
        this.itemsSignal().reduce((sum, i) => sum + i.quantity, 0)
    );
    subtotal = computed(() =>
        this.itemsSignal().reduce((sum, i) => {
            const product = typeof i.product === 'string' ? null : i.product;
            const price = product?.price || i.priceAtAdd || 0;
            return sum + price * i.quantity;
        }, 0)
    );

    constructor(private http: HttpClient) { }

    loadCart() {
        this.http.get<{ success: boolean; data: Cart }>(this.cartUrl)
            .subscribe({
                next: (res) => {
                    this.itemsSignal.set(res.data?.items || []);
                },
                error: () => {
                    this.itemsSignal.set([]);
                }
            });
    }

    addItem(productId: string, quantity: number = 1, variantId?: string, size?: string, color?: string) {
        return this.http.post<{ success: boolean; data: Cart }>(`${this.cartUrl}/items`, {
            productId,
            quantity,
        }).pipe(
            tap((res) => {
                if (res.success && res.data) {
                    this.itemsSignal.set(res.data.items || []);
                }
            })
        );
    }

    updateItem(itemId: string, quantity: number) {
        return this.http.patch<{ success: boolean; data: Cart }>(`${this.cartUrl}/items/${itemId}`, {
            quantity,
        }).pipe(
            tap((res) => {
                if (res.success && res.data) {
                    this.itemsSignal.set(res.data.items || []);
                }
            })
        );
    }

    removeItem(itemId: string) {
        return this.http.delete<{ success: boolean; data: Cart }>(`${this.cartUrl}/items/${itemId}`).pipe(
            tap((res) => {
                if (res.success && res.data) {
                    this.itemsSignal.set(res.data.items || []);
                }
            })
        );
    }

    clearCart() {
        return this.http.delete<{ success: boolean }>(this.cartUrl).pipe(
            tap((res) => {
                if (res.success) {
                    this.itemsSignal.set([]);
                }
            })
        );
    }
}
