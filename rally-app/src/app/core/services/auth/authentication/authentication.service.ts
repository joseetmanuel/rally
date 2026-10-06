/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// ANGULAR
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// LIBS
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
// MODELS / MAPPERS
import { Credential } from '@models/authentication/Credential';
import { AuthenticationMapper } from '@mappers/authentication/authentication';
import { ResponseApi, Response } from '@models/response-api/ResponseApi';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';
import { KEYS_STORAGE } from '@constants/KeysStorage';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private url = this.localStorage.getObject(KEYS_STORAGE.config)
    ? this.localStorage.getObject(KEYS_STORAGE.config).apiUrl
    : '';

  constructor(
    private http: HttpClient,
    private mapper: AuthenticationMapper,
    private localStorage: LocalStorageService,
  ) {}

  login(credential: Credential) {
    const url = `${this.getUrl()}login/login_ad`;
    const data = { ...credential };
    return this.http
      .post<Response>(url, data)
      .pipe(map((x: any) => this.mapper.toAutenticacion(x)));
  }
  loginStatic(credential: Credential) {
    if (credential.user == 'admin' && credential.password == 'admin') {
      return of({
        data: [
          {
            element: {
              user: 'admin',
              systemId: '0',
              name: 'Admin Static',
              accountNumber: '000000',
              positionId: 12345,
              positionDescription: 'Admin artefacto',
              functionId: 311,
              functionDescription: 'Admin artefacto',
              profile: 'CONFIGURADOR',
              profileId: 14,
              token: 'aGduD5=',
              refreshToken: 'p5Uz6/A=',
            },
            message: 'Datos del usuario',
          },
        ],
        message: '',
        success: true,
      });
    } else {
      return of({ data: [], message: 'no se pudo logear', success: false });
    }
  }

  refreshToken(value: string) {
    const url = `${this.getUrl()}TokenRefresh`;
    return this.http
      .post<ResponseApi>(url, { data: { element: { refreshToken: value } } })
      .pipe(map((x) => x));
  }

  validSesion() {
    const url = `${this.getUrl()}Token`;
    return this.http.get<ResponseApi>(url).pipe(map((x) => x));
  }
  encrypt(value: string) {
    const url = `${this.getUrl()}User/Encrypt`;
    return this.http
      .post<ResponseApi>(url, { data: { element: { word: value } } })
      .pipe(map((x) => x));
  }

  verifyUserInDirectory(usuario: string) {
    return of({ data: [], message: '', success: true });
  }

  getUrl() {
    return this.localStorage.getObject(KEYS_STORAGE.config).apiUrl;
  }
}
