import { TestBed } from '@angular/core/testing';
import { MenuConfigurationService } from './menu-configuration.service';
import { AdminSessionService } from '@services/admin-session/admin-session.service';
import { ADMIN_ONLY_SECTIONS } from '@constants/AdminOnlyPaths';
import { createAdminSessionMock } from '../../../testing/admin-session.mock';

describe('MenuConfigurationService', () => {
  const setup = (isAdmin: boolean) => {
    const mock = createAdminSessionMock(isAdmin);
    TestBed.configureTestingModule({ providers: [{ provide: AdminSessionService, useValue: mock }] });
    return { service: TestBed.inject(MenuConfigurationService), mock };
  };
  const routesOf = (menu: any[]) =>
    menu.flatMap((m) => [m.route, ...m.children.map((c: any) => c.route)]).filter(Boolean);
  const current = (service: MenuConfigurationService) => {
    let menu: any[] = [];
    service.getMenu().subscribe((m: any) => (menu = m)).unsubscribe();
    return menu;
  };

  it('should be created', () => {
    expect(setup(false).service).toBeTruthy();
  });

  it('does not validate permissions (the real access control lives in the backend)', () => {
    expect(setup(false).service.validatePermissions).toBe(false);
  });

  it('public profile only sees results: no Consultores and no catalogs', () => {
    const { service } = setup(false);
    const menu = current(service);
    expect(menu.map((m) => m.name)).toEqual(['Inicio', 'Detalle', 'Cursos', 'Puntos Extra']);
    for (const section of ADMIN_ONLY_SECTIONS) expect(routesOf(menu)).not.toContain(section);
  });

  it('admin profile adds Consultores and groups the catalogs in a submenu', () => {
    const { service } = setup(true);
    const menu = current(service);
    expect(menu.map((m) => m.name)).toEqual(['Inicio', 'Detalle', 'Consultores', 'Cursos', 'Puntos Extra', 'Catálogos']);
    const catalogs = menu.find((m) => m.name === 'Catálogos');
    expect(catalogs.children.map((c: any) => c.route)).toEqual([
      'teams', 'consulting-firms', 'certification-types', 'certifications'
    ]);
  });

  it('admin menu exposes a route for every screen, and the admin-only ones are exactly the protected ones', () => {
    const routes = routesOf(current(setup(true).service));
    expect([...routes].sort()).toEqual([
      'certification-types', 'certifications', 'consultants', 'consulting-firms', 'course-sessions',
      'detail', 'extra-points', 'home', 'teams'
    ]);
    expect(routes.filter((r) => ADMIN_ONLY_SECTIONS.includes(r)).sort()).toEqual([...ADMIN_ONLY_SECTIONS].sort());
  });

  it('rebuilds itself when the profile changes (login / logout)', () => {
    const { service, mock } = setup(false);
    expect(current(service)).toHaveLength(4);
    mock.setAdmin(true);
    TestBed.tick();
    expect(current(service)).toHaveLength(6);
    mock.setAdmin(false);
    TestBed.tick();
    expect(current(service)).toHaveLength(4);
  });
});
