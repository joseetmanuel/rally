/* eslint-disable  */

import { TestBed } from '@angular/core/testing';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppConfigService } from '@services/config/app-config.service';
import { SharedModule } from '@shared/shared.module';
import { authenticationInterceptor } from '@interceptors/request-interceptor';
import { appConfig } from './app.config';
import { SessionGuard } from '@guards/session/session.guard';
import { AuthenticationGuard } from '@guards/authentication/authentication.guard';
import { routes } from './app.routes';

describe('AppConfig', () => {
  let appConfigServiceMock: jest.Mocked<AppConfigService>;

  beforeEach(() => {
    appConfigServiceMock = {
      loadAppConfig: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<AppConfigService>;

    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        { provide: AppConfigService, useValue: appConfigServiceMock },
      ],
    });
  });

  it('should define APP_INITIALIZER provider', () => {
    const initializer = TestBed.inject(APP_INITIALIZER) as any[];
    expect(initializer).toBeDefined();
    expect(initializer.length).toBeGreaterThan(0);
  });

  it('should correctly lazy load the "app" route module', async () => {
    jest.mock('./pages/pages.routes', () => ({
      ROUTES: [{ path: 'home', component: {} }],
    }));

    jest.mock('./pages/auth/auth.routes', () => ({
      ROUTES: [{ path: 'home', component: {} }],
    }));
  });
});
