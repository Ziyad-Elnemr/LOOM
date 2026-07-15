export interface ShippingAddress {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    addresses?: ShippingAddress[];
    isActive?: boolean;
}
