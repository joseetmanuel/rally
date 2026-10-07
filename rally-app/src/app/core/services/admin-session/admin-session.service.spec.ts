import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ADMIN_SESSION_KEY, AdminSessionService } from './admin-session.service';

const FUTURE = '2099-01-01T00:00:00+00:00';
const PAST = '2000-01-01T00:00:00+00:00';
const SAVED = { token: 'abc', user: 'Etmanuel', expires_at: FUTURE };

describe('AdminSessionService', () => {
  let service: AdminSessionService;
  let http: HttpTestingController;
  const api = `${environment.api_url}/auth`;

  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AdminSessionService);
    http = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => sessionStorage.clear());
  afterEach(() => http.verify());

  it('starts as the public profile', () => {
    setup();
    expect(service.isAdmin()).toBe(false);
    expect(service.token).toBeNull();
    expect(service.user()).toBeNull();
  });

  it('logs in against the API and becomes admin', () => {
    setup();
    service.login('Etmanuel', 'secreta').subscribe();
    const req = http.expectOne(`${api}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'Etmanuel', password: 'secreta' });
    req.flush({ token: 'abc', user: 'Etmanuel', role: 'admin', expires_at: FUTURE });

    expect(service.isAdmin()).toBe(true);
    expect(service.user()).toBe('Etmanuel');
    expect(service.token).toBe('abc');
  });

  it('keeps the session in this tab only (sessionStorage) and never stores the password', () => {
    setup();
    service.login('Etmanuel', 'secreta').subscribe();
    http.expectOne(`${api}/login`).flush({ token: 'abc', user: 'Etmanuel', role: 'admin', expires_at: FUTURE });
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY)!;
    expect(JSON.parse(raw)).toEqual(SAVED);
    expect(raw).not.toContain('secreta');
    expect(localStorage.getItem(ADMIN_SESSION_KEY)).toBeNull();
  });

  it('changes the epoch on login, logout and expiry so screens reload their data', () => {
    setup();
    const start = service.epoch();
    service.login('Etmanuel', 'secreta').subscribe();
    http.expectOne(`${api}/login`).flush({ token: 'abc', user: 'Etmanuel', role: 'admin', expires_at: FUTURE });
    const afterLogin = service.epoch();
    expect(afterLogin).toBeGreaterThan(start);
    service.logout();
    const afterLogout = service.epoch();
    expect(afterLogout).toBeGreaterThan(afterLogin);
    service.login('Etmanuel', 'secreta').subscribe();
    http.expectOne(`${api}/login`).flush({ token: 'abc', user: 'Etmanuel', role: 'admin', expires_at: FUTURE });
    const beforeExpiry = service.epoch();
    service.expire();
    expect(service.epoch()).toBeGreaterThan(beforeExpiry);
  });

  it('does not change the epoch when nothing changed (failed login, public expiry)', () => {
    setup();
    const start = service.epoch();
    service.login('Etmanuel', 'mal').subscribe({ error: () => undefined });
    http.expectOne(`${api}/login`).flush({}, { status: 401, statusText: 'Unauthorized' });
    service.expire();
    expect(service.epoch()).toBe(start);
  });

  it('stays public when the login fails', () => {
    setup();
    let status = 0;
    service.login('Etmanuel', 'mal').subscribe({ error: (e) => (status = e.status) });
    http.expectOne(`${api}/login`).flush({ error: 'invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    expect(status).toBe(401);
    expect(service.isAdmin()).toBe(false);
    expect(sessionStorage.getItem(ADMIN_SESSION_KEY)).toBeNull();
  });

  it('logs out and forgets the session', () => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(SAVED));
    setup();
    service.restore();
    http.expectOne(`${api}/session`).flush({ authenticated: true });
    service.logout();
    expect(service.isAdmin()).toBe(false);
    expect(sessionStorage.getItem(ADMIN_SESSION_KEY)).toBeNull();
  });

  it('restores a saved session and checks it with the server', () => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(SAVED));
    setup();
    service.restore();
    expect(service.isAdmin()).toBe(true);
    expect(service.token).toBe('abc');
    http.expectOne(`${api}/session`).flush({ authenticated: true });
  });

  it('ignores a saved session that already expired', () => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ ...SAVED, expires_at: PAST }));
    setup();
    service.restore();
    expect(service.isAdmin()).toBe(false);
    expect(sessionStorage.getItem(ADMIN_SESSION_KEY)).toBeNull();
    http.expectNone(`${api}/session`);
  });

  it('ignores corrupted storage', () => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '{no es json');
    setup();
    expect(() => service.restore()).not.toThrow();
    expect(service.isAdmin()).toBe(false);
  });

  it('does nothing on restore when there is no saved session', () => {
    setup();
    service.restore();
    http.expectNone(`${api}/session`);
    expect(service.isAdmin()).toBe(false);
  });

  it('expires: back to public with a notice, and the notice can be dismissed', () => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(SAVED));
    setup();
    service.restore();
    http.expectOne(`${api}/session`).flush({});
    service.expire();
    expect(service.isAdmin()).toBe(false);
    expect(service.notice()).toContain('sesión expiró');
    expect(sessionStorage.getItem(ADMIN_SESSION_KEY)).toBeNull();
    service.clearNotice();
    expect(service.notice()).toBeNull();
  });

  it('does not leave a notice when the public profile "expires"', () => {
    setup();
    service.expire();
    expect(service.notice()).toBeNull();
  });

  it('a new login clears the previous notice', () => {
    setup();
    service['_notice'].set('Tu sesión expiró');
    service.login('Etmanuel', 'secreta').subscribe();
    http.expectOne(`${api}/login`).flush({ token: 'abc', user: 'Etmanuel', role: 'admin', expires_at: FUTURE });
    expect(service.notice()).toBeNull();
  });

  it('still works when sessionStorage is unavailable', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado'); });
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('bloqueado'); });
    setup();
    expect(() => service.restore()).not.toThrow();
    service.login('Etmanuel', 'secreta').subscribe();
    http.expectOne(`${api}/login`).flush({ token: 'abc', user: 'Etmanuel', role: 'admin', expires_at: FUTURE });
    expect(service.isAdmin()).toBe(true); // vive en memoria
    getItem.mockRestore();
    setItem.mockRestore();
  });
});
