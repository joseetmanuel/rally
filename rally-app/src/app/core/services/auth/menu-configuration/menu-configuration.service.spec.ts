import { TestBed } from '@angular/core/testing';
import { MenuConfigurationService } from './menu-configuration.service';

describe('MenuConfigurationService', () => {
  let service: MenuConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('does not validate permissions (the MVP has no authentication)', () => {
    expect(service.validatePermissions).toBe(false);
  });

  it('keeps the top level short and groups the catalogs in a submenu', (done) => {
    service.getMenu().subscribe((menu: any[]) => {
      expect(menu.map((m) => m.name)).toEqual(['Inicio', 'Consultores', 'Cursos', 'Puntos Extra', 'Catálogos']);
      const catalogs = menu.find((m) => m.name === 'Catálogos');
      expect(catalogs.children.map((c: any) => c.route)).toEqual([
        'teams', 'consulting-firms', 'certification-types', 'certifications'
      ]);
      done();
    });
  });

  it('exposes a route for every MVP screen', (done) => {
    service.getMenu().subscribe((menu: any[]) => {
      const routes = menu.flatMap((m) => [m.route, ...m.children.map((c: any) => c.route)]).filter(Boolean);
      expect(routes.sort()).toEqual([
        'certification-types', 'certifications', 'consultants', 'consulting-firms', 'course-sessions',
        'extra-points', 'home', 'teams'
      ].sort());
      done();
    });
  });
});
