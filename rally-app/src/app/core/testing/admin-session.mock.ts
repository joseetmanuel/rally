import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AdminSessionService } from '@services/admin-session/admin-session.service';

/**
 * Doble de AdminSessionService para los specs de componentes.
 *
 *   providers: [provideAdminSession(true)]   // administrador
 *   providers: [provideAdminSession(false)]  // perfil público
 *
 * `mock.setAdmin(true|false)` cambia de perfil durante el test (las signals avisan a la vista).
 */
export function createAdminSessionMock(isAdmin = false, user = 'Etmanuel') {
  const admin = signal(isAdmin);
  const notice = signal<string | null>(null);
  const epoch = signal(0);
  return {
    isAdmin: admin.asReadonly(),
    user: signal<string | null>(isAdmin ? user : null).asReadonly(),
    session: signal(null).asReadonly(),
    notice: notice.asReadonly(),
    epoch: epoch.asReadonly(),
    token: isAdmin ? 'token-de-prueba' : null,
    login: jest.fn().mockReturnValue(of({ token: 't', user, expires_at: '2099-01-01T00:00:00+00:00' })),
    logout: jest.fn(),
    expire: jest.fn(),
    clearNotice: jest.fn(),
    notify: jest.fn(),
    restore: jest.fn(),
    setAdmin: (value: boolean) => {
      admin.set(value);
      epoch.update((n) => n + 1);
    },
    setNotice: (value: string | null) => notice.set(value)
  };
}

export function provideAdminSession(isAdmin = false) {
  return { provide: AdminSessionService, useValue: createAdminSessionMock(isAdmin) };
}
