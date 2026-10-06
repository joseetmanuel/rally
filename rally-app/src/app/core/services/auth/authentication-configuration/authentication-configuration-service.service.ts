/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
// RXJS
import { BehaviorSubject, Observable } from 'rxjs';
// SERVICES
// MODELS / MAPPERS / CONSTANTS
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';
import { KEYS_STORAGE } from '@constants/KeysStorage';
import { LoginComparnet } from '@models/authentication/LoginComparrnet';
import { SessionStorageService } from '@services/storage/sessionstorage/sessionstorage.service';
import { Response } from '@models/response-api/ResponseApi';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationConfigurationService {
  private userCurrentSubject!: BehaviorSubject<any>;
  public userCurrent: Observable<LoginComparnet>;

  constructor(
    private localStorageService: LocalStorageService,
    private sesionStorageService: SessionStorageService,
  ) {
    const user = this.localStorageService.getObject(KEYS_STORAGE.auth);
    this.userCurrentSubject = new BehaviorSubject<any>(user);
    this.userCurrent = this.userCurrentSubject.asObservable();
  }

  startConfiguration(data: Response) {
    this.userCurrentSubject.next(data.data.user);
    this.localStorageService.setObject(KEYS_STORAGE.auth, data.data.user);
    this.sesionStorageService.setObject(KEYS_STORAGE.auth, data.data.token);
  }
  startConfigurationStatic(data: Response) {
    console.log(data.data[0].element);
    console.log({
      token: data.data[0].element.token,
      refreshToken: data.data[0].element.refreshToken,
    });
    this.userCurrentSubject.next(data.data[0].element);
    this.localStorageService.setObject(KEYS_STORAGE.auth, data.data[0].element);
    this.sesionStorageService.setObject(KEYS_STORAGE.auth, {
      token: data.data[0].element.token,
      refreshToken: data.data[0].element.TokenRefresh,
    });
  }

  resetConfiguration() {
    this.userCurrentSubject.next(null);
    this.localStorageService.removeByKey(KEYS_STORAGE.auth);
  }

  get isUserAuthenticated(): boolean {
    return !!this.userCurrentSubject.value;
  }
}
