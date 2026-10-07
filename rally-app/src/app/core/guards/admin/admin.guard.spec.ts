import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AdminSessionService } from '@services/admin-session/admin-session.service';
import { ADMIN_ONLY_NOTICE, isAdminOnlyUrl } from '@constants/AdminOnlyPaths';
import { createAdminSessionMock } from '../../testing/admin-session.mock';

describe('adminGuard', () => {
  const run = (isAdmin: boolean) => {
    const mock = createAdminSessionMock(isAdmin);
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AdminSessionService, useValue: mock }] });
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    return { result, mock };
  };

  it('lets the administrator in', () => {
    const { result, mock } = run(true);
    expect(result).toBe(true);
    expect(mock.notify).not.toHaveBeenCalled();
  });

  it('sends the public profile home and tells them why', () => {
    const { result, mock } = run(false);
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/app/home');
    expect(mock.notify).toHaveBeenCalledWith(ADMIN_ONLY_NOTICE);
  });
});

describe('isAdminOnlyUrl', () => {
  it.each(['/app/consultants', '/app/teams', '/app/consulting-firms', '/app/certification-types',
    '/app/certifications', '/app/teams?x=1', '/app/consultants#top'])('%s is admin only', (url) => {
    expect(isAdminOnlyUrl(url)).toBe(true);
  });

  it.each(['/app/home', '/app/detail', '/app/course-sessions', '/app/extra-points', '/', '/consultants'])(
    '%s is public', (url) => {
      expect(isAdminOnlyUrl(url)).toBe(false);
    });
});
