/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpHeaders,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { KEYS_STORAGE } from '@constants/KeysStorage';
import { AlertService } from '@services/alert/alert.service';
import { AuthenticationConfigurationService } from '@services/auth/authentication-configuration/authentication-configuration-service.service';
import { AuthenticationService } from '@services/auth/authentication/authentication.service';
import { ConfigurationCenterService } from '@services/auth/configuration-center.service/configuration-center.service';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';
import { SessionStorageService } from '@services/storage/sessionstorage/sessionstorage.service';
import { Observable, Subscription, catchError, map, throwError } from 'rxjs';

export const validatedToken = (
  sesion: SessionStorageService,
  alert: AlertService,
  authService: AuthenticationService,
  confCenter: ConfigurationCenterService,
  router: Router,
) => {
  const subscription = new Subscription();
  const auth = sesion.getObject(KEYS_STORAGE.auth);
  subscription.add(
    authService.refreshToken(auth ? auth.refreshToken : '').subscribe({
      next: (value: any) => {
        if (value.data) {
          auth.token = JSON.stringify(value.data.element.token);
          auth.refreshToken = JSON.stringify(value.data.element.refreshToken);

          sesion.setObject(KEYS_STORAGE.auth, auth);
          alert.showSuccesAlert('Se actualizo la sesión correctamente');
          if (router.url != 'app/home') {
            router.navigate([router.url]);
          }
        } else {
          confCenter.closeSesion();
        }
      },
      error: () => {
        confCenter.closeSesion();
      },
    }),
  );
};

export const authenticationInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const local = inject(LocalStorageService);
  const sesion = inject(SessionStorageService);
  const alert = inject(AlertService);
  const configCenter = inject(ConfigurationCenterService);
  const authConfig = inject(AuthenticationConfigurationService);
  const router = inject(Router);
  const authServ = inject(AuthenticationService);

  const token = sesion.getObject(KEYS_STORAGE.auth)
    ? sesion.getObject(KEYS_STORAGE.auth).token
    : '';
  const systemId = local.getObject(KEYS_STORAGE.config)
    ? local.getObject(KEYS_STORAGE.config).systemId
    : '0';
  const account = local.getObject(KEYS_STORAGE.auth)
    ? local.getObject(KEYS_STORAGE.auth).accountNumber
    : '';

  const authReq = request.clone({
    headers: new HttpHeaders({
      Authorization: 'Bearer ' + token,
      systemId: systemId,
      accountNumber: account,
    }),
  });

  return next(authReq)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = { message: '' };
        if (error.status === 401 && !error.url?.includes('TokenRefresh')) {
          if (authConfig.isUserAuthenticated) {
            validatedToken(sesion, alert, authServ, configCenter, router);
            errorMessage.message = 'Se termino el tiempo de sesión';
          } else {
            errorMessage.message = error.error.message;
          }
        }
        if (error.status === 502)
          errorMessage.message = 'Se produjo un error al mandar la peticion';
        if (error.status === 400) errorMessage.message = error.error.message;
        if (error.error instanceof ErrorEvent)
          errorMessage.message = `Error: ${error.message}`;
        // if (error.error.error) errorMessage.message = error.error;
        if (errorMessage.message != '')
          alert.showErrorAlert(errorMessage.message);

        return throwError(() => errorMessage);
      }),
    )
    .pipe(
      map<HttpEvent<any>, any>((evt: HttpEvent<any>) => {
        if (evt instanceof HttpResponse) {
          if (evt.body.data) {
            if (
              evt.body.data.element == undefined &&
              evt.body.data.elements == undefined &&
              evt.body.data.validationCode == undefined
            ) {
              alert.showSuccesAlert(evt.body.data.message);
            }
          } else if (evt.status != 200 && evt.status != 201) {
            alert.showSuccesAlert(evt.body.data.message);
          }
        }
        return evt;
      }),
    );
};
