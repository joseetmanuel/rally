/* eslint-disable  */

import { TestBed } from '@angular/core/testing';
import { LoginApi, sesionTokens } from '@models/authentication/LoginComparrnet';
import { AuthenticationMapper } from './authentication';
import {
  UserPermission,
  UserPermissionApi,
} from '@models/authentication/UserPermissions';

const objectFrom: LoginApi = {
  name: 'test',
  positionDescription: '',
  user: 'test',
};
const sesionToken: sesionTokens = {
  token: '',
  refreshToken: '',
};
const allData: any = {
  objectFrom,
  sesionToken,
};

const objectPermissionApi: UserPermissionApi = {
  nombrePerfil: 'test',
  nombreSistema: 'test',
  nombreUsuario: 'test',
  perfilId: 1,
  sistemaId: 1,
  usuarioId: 1,
};

const userPermission: UserPermission = {
  profile: 'test',
  profileId: 1,
  system: 'test',
  systemId: 1,
  user: 'test',
  userId: 1,
};

describe('UserPermissionMapper', () => {
  let mapper: AuthenticationMapper;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthenticationMapper],
    });
  });

  beforeEach(() => {
    mapper = TestBed.inject(AuthenticationMapper);
  });
  it('should toAutenticacion() transform a LoginApi into a Response', () => {
    const objectFrom = {
      name: 'test',
      positionDescription: '',
      user: 'test',
    };

    const data = {
      data: {
        element: objectFrom,
        message: '',
        token: { refreshToken: '', token: '' },
      },
    };

    const dataMap = mapper.toAutenticacion(data);

    expect(dataMap).toEqual({
      data: {
        user: objectFrom,
        token: { refreshToken: '', token: '' },
      },
      message: '',
      success: true,
    });
  });

  it('should toVerifyUserInDirectory() transform a LoginApi into a Response', () => {
    const data = [{ perfil: objectPermissionApi, message: '' }];
    const dataMap = mapper.toVerifyUserInDirectory(data);
    expect(dataMap).toEqual({
      data: userPermission,
      success: true,
      message: '',
    });
  });
});
