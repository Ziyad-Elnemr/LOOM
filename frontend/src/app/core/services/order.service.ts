import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/order.model';
import { ShippingAddress } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private readonly orderUrl = `${environment.apiBaseUrl}/orders`;

    constructor(private http: HttpClient) { }

    createOrder(shippingAddress: ShippingAddress, paymentMethod: string = 'fake_card') {
        return this.http.post<{ success: boolean; data: Order }>(this.orderUrl, {
            shippingAddress,
            paymentMethod,
        });
    }

    getMyOrders() {
        return this.http.get<{ success: boolean; data: Order[] }>(`${this.orderUrl}/my`);
    }

    getAllOrders() {
        return this.http.get<{ success: boolean; data: Order[] }>(this.orderUrl);
    }

    updateOrderStatus(orderId: string, orderStatus: string) {
        return this.http.patch<{ success: boolean; data: Order }>(`${this.orderUrl}/${orderId}/status`, {
            orderStatus,
        });
    }
}
