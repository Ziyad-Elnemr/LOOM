import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toast = inject(ToastService);

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            // 401 on a non-auth route: try one silent refresh, then retry original request
            if (err.status === 401 && !req.url.includes('/auth/')) {
                const auth = inject(AuthService);
                return auth.tryRestoreSession().pipe(
                    switchMap(() => next(req)) // retry with new token attached by authInterceptor
                );
            }

            // Do not show toast notifications for auth endpoints (handles login/register/refresh silently or in-form)
            if (!req.url.includes('/auth/')) {
                const errMsg = err.error?.message || 'Something went wrong';
                toast.show(errMsg, 'error');
            }

            return throwError(() => err);
        })
    );
};
