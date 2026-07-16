import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly productsUrl = `${environment.apiUrl}/products`;

    constructor(private http: HttpClient) { }

    getProducts(filters?: { category?: string; search?: string }) {
        let params = new HttpParams();
        if (filters?.category) {
            params = params.set('category', filters.category);
        }
        if (filters?.search) {
            params = params.set('search', filters.search);
        }
        return this.http.get<{ success: boolean; data: Product[] }>(this.productsUrl, { params });
    }

    getProductById(id: string) {
        return this.http.get<{ success: boolean; data: Product }>(`${this.productsUrl}/${id}`);
    }

    createProduct(payload: Partial<Product>) {
        return this.http.post<{ success: boolean; data: Product }>(this.productsUrl, payload);
    }

    updateProduct(id: string, payload: Partial<Product>) {
        return this.http.put<{ success: boolean; data: Product }>(`${this.productsUrl}/${id}`, payload);
    }

    deleteProduct(id: string) {
        return this.http.delete<{ success: boolean }>(`${this.productsUrl}/${id}`);
    }
}
