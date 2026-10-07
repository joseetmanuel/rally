import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { AdminSessionService } from '@services/admin-session/admin-session.service';
import { adminAuthInterceptor } from './admin-auth-interceptor';

describe('adminAuthInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let admin: { token: string | null; expire: jest.Mock };
  const api = environment.api_url;

  beforeEach(() => {
    admin = { token: null, expire: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([adminAuthInterceptor])),
        provideHttpClientTesting(),
        { provide: AdminSessionService, useValue: admin }
      ]
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('sends no Authorization header in the public profile', () => {
    http.get(`${api}/teams`).subscribe();
    const req = controller.expectOne(`${api}/teams`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('adds the Bearer token to API calls when there is an admin session', () => {
    admin.token = 'abc';
    http.post(`${api}/teams`, { name: 'X' }).subscribe();
    const req = controller.expectOne(`${api}/teams`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush({});
  });

  it('never sends the token to other hosts', () => {
    admin.token = 'abc';
    http.get('https://otro-sitio.example.com/datos').subscribe();
    const req = controller.expectOne('https://otro-sitio.example.com/datos');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('expires the session when the server answers 401 during a session', () => {
    admin.token = 'abc';
    http.delete(`${api}/teams/1`).subscribe({ error: () => undefined });
    controller.expectOne(`${api}/teams/1`).flush({ error: 'session expired' }, { status: 401, statusText: 'Unauthorized' });
    expect(admin.expire).toHaveBeenCalledTimes(1);
  });

  it('does not expire anything for a 401 in the public profile', () => {
    http.post(`${api}/teams`, {}).subscribe({ error: () => undefined });
    controller.expectOne(`${api}/teams`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(admin.expire).not.toHaveBeenCalled();
  });

  it('a wrong password (401 on login) is not an expired session', () => {
    admin.token = 'abc';
    http.post(`${api}/auth/login`, {}).subscribe({ error: () => undefined });
    controller.expectOne(`${api}/auth/login`).flush({ error: 'invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    expect(admin.expire).not.toHaveBeenCalled();
  });

  it('other errors do not close the session and still reach the caller', () => {
    admin.token = 'abc';
    let status = 0;
    http.get(`${api}/teams`).subscribe({ error: (e) => (status = e.status) });
    controller.expectOne(`${api}/teams`).flush({}, { status: 500, statusText: 'Server Error' });
    expect(status).toBe(500);
    expect(admin.expire).not.toHaveBeenCalled();
  });
});
