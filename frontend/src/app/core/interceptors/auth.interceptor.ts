import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = inject(TokenService).getToken();
    let cloneParams: any = {};

    if (req.url.includes('/api')) {
        cloneParams.withCredentials = true;
        if (token) {
            cloneParams.setHeaders = { Authorization: `Bearer ${token}` };
        }
    }

    if (Object.keys(cloneParams).length > 0) {
        req = req.clone(cloneParams);
    }
    return next(req);
};
