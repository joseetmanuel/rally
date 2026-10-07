/* eslint-disable  */

import { NavegationGuard } from './naavigation.guard';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuConfigurationService } from '@services/auth/menu-configuration/menu-configuration.service';
import { Router } from '@angular/router';
import { AuthenticationConfigurationService } from '@services/auth/authentication-configuration/authentication-configuration-service.service';
import { of } from 'rxjs';
import { provideAdminSession } from '../../testing/admin-session.mock';
import { Section } from '@models/section/Section';
import { Menu } from '@models/menu/Menu';
import { LoginItem } from '@models/authentication/LoginComparrnet';
import { Response } from '@models/response-api/ResponseApi';

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
  let guard: NavegationGuard;
  let menu: MenuConfigurationService;
  let router: Router;
  let auth: AuthenticationConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [NavegationGuard, provideAdminSession(false)],
    });
    guard = TestBed.inject(NavegationGuard);
    router = TestBed.inject(Router);
    menu = TestBed.inject(MenuConfigurationService);
    auth = TestBed.inject(AuthenticationConfigurationService);
  });

  it('should be create', () => {
    expect(guard).toBeTruthy();
  });

  it('shoud canLoad()', () => {
    const data = guard.canLoad();
    expect(data).toBe(false);
  });

  // it('sholud validateAuthentication() return false', fakeAsync(() => {
  // 	const data = guard.validateAuthentication();
  // 	expect(data).toBe(false);
  // }));

  it('sholud validateAuthentication() return true', fakeAsync(() => {
    auth.startConfiguration(datas);
    tick(2000);
    const data = guard.validateAuthentication();
    expect(data).toBe(true);
  }));

  it('sholud validateAccesToMenu() return false', async () => {
    jest.spyOn(menu, 'getMenu').mockReturnValue(of(sections));
    const data = await guard.validateAccesToMenu('/test/test/test');
    expect(data.length).toBe(1);
  });

  it('sholud validateAccesToMenu() return true', async () => {
    jest.spyOn(menu, 'getMenu').mockReturnValue(of(sections));
    const data = await guard.validateAccesToMenu('/test');
    expect(data).toEqual(sections);
  });

  describe('canActivate', () => {
    it('should return true if user have route', async () => {
      jest.spyOn(guard, 'validateAccesToMenu').mockReturnValue(sections);
      const test: any = { url: 'test/test/test' };
      const result = await guard.canActivate(test, test);
      expect(result).toBe(true);
    });

    it('should return false if user dont have route', async () => {
      jest.spyOn(guard, 'validateAccesToMenu').mockReturnValue(sections);
      const test: any = { url: '' };
      const result = await guard.canActivate(test, test);
      expect(result).toBe(true);
    });
  });
});
