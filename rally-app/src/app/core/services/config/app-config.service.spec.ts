/* eslint-disable  */

import { TestBed } from '@angular/core/testing';
import { AppConfigService } from './app-config.service';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs';

describe('AppConfigService', () => {
  let appConfigService: AppConfigService;
  let http: HttpClient;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        AppConfigService,
        LocalStorageService,
        HttpClient,
        HttpHandler,
      ],
    });
    appConfigService = TestBed.inject(AppConfigService);
    http = TestBed.inject(HttpClient);
  });

  it('should call loadAppConfig()', () => {
    appConfigService.loadAppConfig();
  });
  // Tests that app config is successfully loaded from config.json
  it('test_loads_app_config', async () => {
    const spy = jest.spyOn(http, 'get').mockReturnValue(of({}));
    await appConfigService.loadAppConfig();
  });
});
