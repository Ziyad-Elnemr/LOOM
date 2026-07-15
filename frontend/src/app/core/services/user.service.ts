import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CustomerUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/users`;

    getAllUsers() {
        return this.http.get<{ success: boolean; data: CustomerUser[] }>(this.baseUrl);
    }

    deleteUser(id: string) {
        return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
    }

    updateUserStatus(id: string, payload: { isActive?: boolean; role?: string }) {
        return this.http.patch<{ success: boolean; data: CustomerUser }>(`${this.baseUrl}/${id}/status`, payload);
    }
}
