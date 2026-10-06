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

  it('exposes one menu entry per MVP screen', (done) => {
    service.getMenu().subscribe((menu) => {
      expect(menu.map((m: any) => m.route)).toEqual([
        'home', 'ranking', 'consultants', 'certification-types', 'certifications', 'course-sessions', 'extra-points'
      ]);
      done();
    });
  });
});
