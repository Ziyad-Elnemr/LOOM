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

export interface Review {
    _id: string;
    product: string;
    user: {
        _id?: string;
        name?: string;
    } | string;
    rating: number;
    comment?: string;
    createdAt?: string;
}
