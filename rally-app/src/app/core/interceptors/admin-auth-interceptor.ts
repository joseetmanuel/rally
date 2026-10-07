import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { AdminSessionService } from '@services/admin-session/admin-session.service';

/**
 * Perfil administrador:
 *  - agrega `Authorization: Bearer <token>` a las llamadas a la API cuando hay sesión de administrador;
 *  - si el servidor responde 401 estando en sesión (venció o ya no es válida), vuelve al perfil público.
 * El 401 de un login fallido NO cierra nada: es una contraseña incorrecta.
 */
export const adminAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const admin = inject(AdminSessionService);
  const isApi = request.url.startsWith(environment.api_url);
  const token = admin.token;

  const authorized = isApi && token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

  return next(authorized).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLogin = request.url.endsWith('/auth/login');
      if (isApi && token && error.status === 401 && !isLogin) {
        admin.expire();
      }
      return throwError(() => error);
    })
  );
};
