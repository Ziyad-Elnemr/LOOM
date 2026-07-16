import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";
import { Order, ShippingAddress } from "../interface/api.models";

@Injectable({ providedIn: "root" })
export class OrderService {
  private readonly orderUrl = `${environment.apiUrl}/orders`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) { }

  createOrder(payload: {
    shippingAddress: ShippingAddress;
    paymentMethod: string;
  }) {
    return this.http.post<{ success: boolean; data: Order }>(
      this.orderUrl,
      payload,
      this.authService.getAuthOptions(),
    );
  }

  getMyOrders() {
    return this.http.get<{ success: boolean; data: Order[] }>(
      `${this.orderUrl}/my`,
      this.authService.getAuthOptions(),
    );
  }

  getAllOrders() {
    return this.http.get<{ success: boolean; data: Order[] }>(
      this.orderUrl,
      this.authService.getAuthOptions(),
    );
  }

  updateOrderStatus(orderId: string, orderStatus: string) {
    return this.http.patch<{ success: boolean; data: Order }>(
      `${this.orderUrl}/${orderId}/status`,
      { orderStatus },
      this.authService.getAuthOptions(),
    );
  }
}
