import { Product } from './product.model';

export interface CartItem {
    _id: string;
    product: Product | string;
    quantity: number;
    size?: string;
    color?: string;
    priceAtAdd?: number;
}

export interface Cart {
    _id?: string;
    user: string;
    items: CartItem[];
}
