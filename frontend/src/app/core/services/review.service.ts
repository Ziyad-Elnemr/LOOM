import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
    private readonly reviewUrl = `${environment.apiUrl}/reviews`;

    constructor(private http: HttpClient) { }

    getProductReviews(productId: string) {
        return this.http.get<{ success: boolean; data: Review[] }>(`${this.reviewUrl}/product/${productId}`);
    }

    saveReview(productId: string, rating: number, comment: string) {
        return this.http.post<{ success: boolean; data: Review }>(`${this.reviewUrl}/product/${productId}`, {
            rating,
            comment,
        });
    }

    deleteReview(reviewId: string) {
        return this.http.delete<{ success: boolean }>(`${this.reviewUrl}/${reviewId}`);
    }
}
