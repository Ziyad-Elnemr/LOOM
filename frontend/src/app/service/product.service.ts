import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";
import { Product } from "../interface/api.models";

@Injectable({ providedIn: "root" })
export class ProductService {
  private readonly productsUrl = `${environment.apiBaseUrl}/products`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getProducts() {
    return this.http.get<{ success: boolean; data: Product[] }>(
      this.productsUrl,
    );
  }

  createProduct(payload: Partial<Product>) {
    return this.http.post<{ success: boolean; data: Product }>(
      this.productsUrl,
      payload,
      this.authService.getAuthOptions(),
    );
  }

  updateProduct(id: string, payload: Partial<Product>) {
    return this.http.put<{ success: boolean; data: Product }>(
      `${this.productsUrl}/${id}`,
      payload,
      this.authService.getAuthOptions(),
    );
  }

  deleteProduct(id: string) {
    return this.http.delete<{ success: boolean }>(
      `${this.productsUrl}/${id}`,
      this.authService.getAuthOptions(),
    );
  }
}
