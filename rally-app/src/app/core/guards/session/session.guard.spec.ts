/* eslint-disable  */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuConfigurationService } from '@services/auth/menu-configuration/menu-configuration.service';
import { Router } from '@angular/router';
import { AuthenticationConfigurationService } from '@services/auth/authentication-configuration/authentication-configuration-service.service';
import { of } from 'rxjs';
import { Section } from '@models/section/Section';
import { Menu } from '@models/menu/Menu';
import { LoginItem } from '@models/authentication/LoginComparrnet';
import { Response } from '@models/response-api/ResponseApi';
import { SessionGuard } from './session.guard';

const sections: any = [
  {
    id: 1,
    systemId: 1,
    name: 'test',
    route: '/test',
    order: 1,
    inMenu: 1,
    typeSectionId: 2,
    status: false,
  },
];

const menuMock: Menu = {
  items: sections,
};
const login: LoginItem = {
  name: 'dhmorales',
  positionDescription: '',
  user: 'dhmorales',
};
const datas: Response = {
  data: login,
  message: '',
  success: true,
};

describe('NavigationGuard', () => {
  let guard: SessionGuard;
  let menu: MenuConfigurationService;
  let router: Router;
  let auth: AuthenticationConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [SessionGuard],
    });
    guard = TestBed.inject(SessionGuard);
    router = TestBed.inject(Router);
    menu = TestBed.inject(MenuConfigurationService);
    auth = TestBed.inject(AuthenticationConfigurationService);
  });

  it('should be create', () => {
    expect(guard).toBeTruthy();
  });

  it('shoud canLoad()', () => {
    const data = guard.canLoad();
    expect(data).toBe(true);
  });

  it('sholud validateAuthentication() return true', fakeAsync(() => {
    const data = guard.validateAuthentication();
    expect(data).toBe(true);
  }));

  it('sholud validateAuthentication() return true', fakeAsync(() => {
    const data = guard.canActivate();
    expect(data).toBe(true);
  }));
});
