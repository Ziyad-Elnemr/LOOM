import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";
import { Review } from "../interface/api.models";

@Injectable({ providedIn: "root" })
export class ReviewService {
  private readonly reviewUrl = `${environment.apiBaseUrl}/reviews`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getProductReviews(productId: string) {
    return this.http.get<{ success: boolean; data: Review[] }>(
      `${this.reviewUrl}/product/${productId}`,
    );
  }

  saveReview(payload: { productId: string; rating: number; comment: string }) {
    return this.http.post<{ success: boolean; data: Review }>(
      `${this.reviewUrl}/product/${payload.productId}`,
      { rating: payload.rating, comment: payload.comment },
      this.authService.getAuthOptions(),
    );
  }

  deleteReview(reviewId: string) {
    return this.http.delete<{ success: boolean }>(
      `${this.reviewUrl}/${reviewId}`,
      this.authService.getAuthOptions(),
    );
  }
}
