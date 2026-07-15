import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";
import { Cart } from "../interface/api.models";

@Injectable({ providedIn: "root" })
export class CartService {
  private readonly cartUrl = `${environment.apiBaseUrl}/cart`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getCart() {
    return this.http.get<{ success: boolean; data: Cart }>(
      this.cartUrl,
      this.authService.getAuthOptions(),
    );
  }

  addToCart(payload: { productId: string; quantity: number }) {
    return this.http.post<{ success: boolean; data: Cart }>(
      `${this.cartUrl}/items`,
      payload,
      this.authService.getAuthOptions(),
    );
  }

  updateCartItem(itemId: string, quantity: number) {
    return this.http.patch<{ success: boolean; data: Cart }>(
      `${this.cartUrl}/items/${itemId}`,
      { quantity },
      this.authService.getAuthOptions(),
    );
  }

  removeCartItem(itemId: string) {
    return this.http.delete<{ success: boolean; data: Cart }>(
      `${this.cartUrl}/items/${itemId}`,
      this.authService.getAuthOptions(),
    );
  }

  clearCart() {
    return this.http.delete<{ success: boolean }>(
      this.cartUrl,
      this.authService.getAuthOptions(),
    );
  }
}
