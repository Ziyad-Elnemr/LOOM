import { Injectable } from "@angular/core";
import { AuthService } from "../service/auth.service";
import { CartService } from "../service/cart.service";
import { OrderService } from "../service/order.service";
import { ProductService } from "../service/product.service";
import { ReviewService } from "../service/review.service";
import {
  AuthUser,
  Cart,
  CartItem,
  Order,
  Product,
  Review,
} from "../interface/api.models";

interface CollectionCard {
  title: string;
  description: string;
  tone: string;
}

interface ProductFormModel {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number;
  ratingRate: number;
  ratingCount: number;
}

@Injectable()
export class AppController {
  featuredCollections: CollectionCard[] = [
    {
      title: "Tailored Essentials",
      description:
        "Sharp silhouettes and breathable fabrics for everyday wear.",
      tone: "Warm neutral",
    },
    {
      title: "Weekend Layers",
      description: "Relaxed hoodies, overshirts, and denim built for movement.",
      tone: "Soft denim",
    },
    {
      title: "Seasonal Statement",
      description:
        "Limited drops with bold textures and elevated color stories.",
      tone: "Sunset red",
    },
  ];

  currentUser: AuthUser | null = null;

  registerForm = {
    name: "",
    email: "",
    password: "",
  };

  loginForm = {
    email: "",
    password: "",
  };

  productForm: ProductFormModel = this.createEmptyProductForm();
  addToCartForm = {
    productId: "",
    quantity: 1,
  };
  orderForm = {
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    paymentMethod: "fake_card",
  };
  reviewForm = {
    productId: "",
    rating: 5,
    comment: "",
  };
  orderStatusById: Record<string, string> = {};

  featuredProducts: Product[] = [];
  cart: Cart | null = null;
  myOrders: Order[] = [];
  allOrders: Order[] = [];
  reviews: Review[] = [];

  loadingProducts = true;
  loadingCart = false;
  loadingOrders = false;
  loadingReviews = false;

  authMessage = "";
  authError = "";
  productMessage = "";
  productError = "";
  cartMessage = "";
  cartError = "";
  orderMessage = "";
  orderError = "";
  reviewMessage = "";
  reviewError = "";

  constructor(
    private readonly authService: AuthService,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly reviewService: ReviewService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.restoreSession();
  }

  private createEmptyProductForm(): ProductFormModel {
    return {
      id: "",
      title: "",
      description: "",
      category: "men's clothing",
      image: "",
      price: 0,
      ratingRate: 0,
      ratingCount: 0,
    };
  }

  private restoreSession(): void {
    this.authService.refresh().subscribe({
      next: (response) => {
        this.authService.setAccessToken(response.data.accessToken);
        this.authService.getMe().subscribe({
          next: (meResponse) => {
            this.currentUser = meResponse.data;
            this.authService.setSession(
              meResponse.data,
              response.data.accessToken,
            );
            this.loadCart();
            this.loadMyOrders();
            if (meResponse.data.role === "admin") {
              this.loadAllOrders();
            }
          },
          error: () => {
            this.authService.clearSession();
          },
        });
      },
      error: () => {
        this.authService.clearSession();
      },
    });
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.productMessage = "";
    this.productError = "";

    this.productService.getProducts().subscribe({
      next: (response) => {
        this.featuredProducts = response.data;
        this.loadingProducts = false;
      },
      error: () => {
        this.productError = "Unable to load products from the backend.";
        this.loadingProducts = false;
      },
    });
  }

  register(): void {
    this.authError = "";
    this.authMessage = "";

    this.authService.register(this.registerForm).subscribe({
      next: (response) => {
        this.authService.setSession(
          response.data.user,
          response.data.accessToken,
        );
        this.currentUser = response.data.user;
        this.authMessage = "Registered successfully.";
        this.registerForm = { name: "", email: "", password: "" };
        this.loadCart();
        this.loadMyOrders();
      },
      error: () => {
        this.authError = "Register failed. Check the fields and try again.";
      },
    });
  }

  login(): void {
    this.authError = "";
    this.authMessage = "";

    this.authService.login(this.loginForm).subscribe({
      next: (response) => {
        this.authService.setSession(
          response.data.user,
          response.data.accessToken,
        );
        this.currentUser = response.data.user;
        this.authMessage = "Logged in successfully.";
        this.loginForm = { email: "", password: "" };
        this.loadCart();
        this.loadMyOrders();
        if (this.currentUser?.role === "admin") {
          this.loadAllOrders();
        }
      },
      error: () => {
        this.authError = "Login failed. Check your email and password.";
      },
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearSession();
        this.currentUser = null;
        this.cart = null;
        this.myOrders = [];
        this.allOrders = [];
        this.reviews = [];
        this.authMessage = "Logged out successfully.";
      },
      error: () => {
        this.authError = "Logout failed.";
      },
    });
  }

  saveProduct(): void {
    this.productError = "";
    this.productMessage = "";

    const payload = {
      title: this.productForm.title,
      description: this.productForm.description,
      category: this.productForm.category,
      image: this.productForm.image,
      price: Number(this.productForm.price),
      rating: {
        rate: Number(this.productForm.ratingRate),
        count: Number(this.productForm.ratingCount),
      },
    };

    const request$ = this.productForm.id
      ? this.productService.updateProduct(this.productForm.id, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.productMessage = this.productForm.id
          ? "Product updated."
          : "Product created.";
        this.productForm = this.createEmptyProductForm();
        this.loadProducts();
      },
      error: () => {
        this.productError =
          "Unable to save product. Admin access may be required.";
      },
    });
  }

  editProduct(product: Product): void {
    this.productForm = {
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      image: product.image,
      price: product.price,
      ratingRate: product.rating?.rate || 0,
      ratingCount: product.rating?.count || 0,
    };
    this.scrollTo("product-form");
  }

  deleteProduct(productId: string): void {
    this.productError = "";
    this.productMessage = "";

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.productMessage = "Product deleted.";
        this.loadProducts();
      },
      error: () => {
        this.productError =
          "Unable to delete product. Admin access may be required.";
      },
    });
  }

  resetProductForm(): void {
    this.productForm = this.createEmptyProductForm();
  }

  addCurrentProductToCart(product: Product): void {
    this.addToCartForm.productId = product.id;
    this.addToCart();
  }

  addToCart(): void {
    this.cartError = "";
    this.cartMessage = "";

    this.cartService
      .addToCart({
        productId: this.addToCartForm.productId,
        quantity: Number(this.addToCartForm.quantity),
      })
      .subscribe({
        next: () => {
          this.cartMessage = "Product added to cart.";
          this.loadCart();
        },
        error: () => {
          this.cartError = "Unable to add item to cart. Login first.";
        },
      });
  }

  loadCart(): void {
    this.loadingCart = true;
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cart = response.data;
        this.loadingCart = false;
      },
      error: () => {
        this.cart = null;
        this.loadingCart = false;
      },
    });
  }

  updateCartItem(item: CartItem): void {
    this.cartService.updateCartItem(item._id, item.quantity).subscribe({
      next: () => this.loadCart(),
      error: () => {
        this.cartError = "Unable to update cart item.";
      },
    });
  }

  removeCartItem(itemId: string): void {
    this.cartService.removeCartItem(itemId).subscribe({
      next: () => this.loadCart(),
      error: () => {
        this.cartError = "Unable to remove cart item.";
      },
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart = { user: this.currentUser?.id || "", items: [] };
        this.cartMessage = "Cart cleared.";
      },
      error: () => {
        this.cartError = "Unable to clear cart.";
      },
    });
  }

  placeOrder(): void {
    this.orderError = "";
    this.orderMessage = "";

    this.orderService
      .createOrder({
        shippingAddress: {
          fullName: this.orderForm.fullName,
          phone: this.orderForm.phone,
          street: this.orderForm.street,
          city: this.orderForm.city,
          state: this.orderForm.state,
          postalCode: this.orderForm.postalCode,
          country: this.orderForm.country,
        },
        paymentMethod: this.orderForm.paymentMethod,
      })
      .subscribe({
        next: () => {
          this.orderMessage = "Order placed successfully.";
          this.loadCart();
          this.loadMyOrders();
        },
        error: () => {
          this.orderError =
            "Unable to place order. Make sure your cart is not empty.";
        },
      });
  }

  loadMyOrders(): void {
    this.loadingOrders = true;
    this.orderService.getMyOrders().subscribe({
      next: (response) => {
        this.myOrders = response.data;
        this.loadingOrders = false;
      },
      error: () => {
        this.myOrders = [];
        this.loadingOrders = false;
      },
    });
  }

  loadAllOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (response) => {
        this.allOrders = response.data;
        this.orderStatusById = response.data.reduce(
          (statusMap, order) => {
            statusMap[order._id] = order.orderStatus;
            return statusMap;
          },
          {} as Record<string, string>,
        );
      },
      error: () => {
        this.orderError = "Unable to load all orders.";
      },
    });
  }

  updateOrderStatus(orderId: string): void {
    const orderStatus = this.orderStatusById[orderId];
    if (!orderStatus) {
      return;
    }

    this.orderService.updateOrderStatus(orderId, orderStatus).subscribe({
      next: () => this.loadAllOrders(),
      error: () => {
        this.orderError = "Unable to update order status.";
      },
    });
  }

  loadReviews(productId?: string): void {
    const targetProductId = productId || this.reviewForm.productId;
    if (!targetProductId) {
      return;
    }

    this.loadingReviews = true;
    this.reviewError = "";

    this.reviewService.getProductReviews(targetProductId).subscribe({
      next: (response) => {
        this.reviews = response.data;
        this.reviewForm.productId = targetProductId;
        this.loadingReviews = false;
      },
      error: () => {
        this.reviews = [];
        this.loadingReviews = false;
        this.reviewError = "Unable to load reviews.";
      },
    });
  }

  saveReview(): void {
    this.reviewError = "";
    this.reviewMessage = "";

    this.reviewService
      .saveReview({
        productId: this.reviewForm.productId,
        rating: Number(this.reviewForm.rating),
        comment: this.reviewForm.comment,
      })
      .subscribe({
        next: () => {
          this.reviewMessage = "Review saved.";
          this.loadReviews();
        },
        error: () => {
          this.reviewError = "Unable to save review. Login first.";
        },
      });
  }

  deleteReview(reviewId: string): void {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviewMessage = "Review deleted.";
        this.loadReviews();
      },
      error: () => {
        this.reviewError = "Unable to delete review.";
      },
    });
  }

  getProductImage(product: Product): string {
    return product.image || "https://via.placeholder.com/600x600?text=No+Image";
  }

  getProductPrice(product: Product): string {
    return `$${product.price.toFixed(2)}`;
  }

  getCartProduct(item: CartItem): Product | null {
    return typeof item.product === "string" ? null : item.product;
  }

  getOrderItemsSummary(order: Order): string {
    return `${order.items.length} item(s)`;
  }

  getOrderStatusColor(status: string): string {
    if (status === "delivered") return "success";
    if (status === "cancelled") return "danger";
    if (status === "shipped") return "info";
    return "muted";
  }

  getReviewAuthor(review: Review): string {
    return typeof review.user === "string"
      ? review.user
      : review.user.name || "Anonymous";
  }

  resetAllMessages(): void {
    this.authMessage = "";
    this.authError = "";
    this.productMessage = "";
    this.productError = "";
    this.cartMessage = "";
    this.cartError = "";
    this.orderMessage = "";
    this.orderError = "";
    this.reviewMessage = "";
    this.reviewError = "";
  }

  private scrollTo(elementId: string): void {
    setTimeout(() => {
      document
        .getElementById(elementId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }
}
