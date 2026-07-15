import { ShippingAddress } from './user.model';

export interface OrderItem {
    product: string;
    title: string;
    image: string;
    quantity: number;
    price: number;
}

export interface Order {
    _id: string;
    user: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    itemsTotal: number;
    shippingFee: number;
    totalAmount: number;
    payment: {
        method: string;
        status: string;
        transactionId?: string;
        paidAt?: string;
    };
    orderStatus: string;
    createdAt?: string;
}
