export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

export interface ProductRating {
  rate: number;
  count: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number;
  rating: ProductRating;
  isActive?: boolean;
}

export interface CartItem {
  _id: string;
  product: Product | string;
  quantity: number;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

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

export interface Review {
  _id: string;
  product: string;
  user:
    | {
        _id?: string;
        name?: string;
      }
    | string;
  rating: number;
  comment?: string;
  createdAt?: string;
}
