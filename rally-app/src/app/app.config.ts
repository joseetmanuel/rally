import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '@shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { AppConfigService } from '@services/config/app-config.service';
import { APP_INITIALIZER, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { spinnerInterceptor } from '@interceptors/spinner-interceptor';
import { adminAuthInterceptor } from '@interceptors/admin-auth-interceptor';
import { AdminSessionService } from '@services/admin-session/admin-session.service';

const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    return appConfig.loadAppConfig();
  };
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserModule, SharedModule, ToastrModule.forRoot()),
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigService],
    },
    provideHttpClient(withInterceptors([adminAuthInterceptor, spinnerInterceptor])),
    // Recupera la sesión de administrador de esta pestaña (si la hay) al arrancar
    provideAppInitializer(() => inject(AdminSessionService).restore()),
    provideAnimationsAsync(),
  ],
};
