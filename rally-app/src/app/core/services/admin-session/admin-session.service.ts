import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';

/** Sesión del perfil administrador. Sin sesión, la app funciona como perfil público (sólo lectura). */
export interface AdminSession {
  token: string;
  user: string;
  /** Vencimiento (ISO, UTC) */
  expires_at: string;
}

export const ADMIN_SESSION_KEY = 'rally.admin-session';

@Injectable({
  providedIn: 'root'
})
export class AdminSessionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/auth`;

  private readonly _session = signal<AdminSession | null>(null);
  private readonly _notice = signal<string | null>(null);
  private readonly _epoch = signal(0);

  /** Sesión actual, o null en el perfil público */
  readonly session = this._session.asReadonly();
  /** true sólo con sesión de administrador vigente: es lo que habilita crear, editar y eliminar */
  readonly isAdmin = computed(() => this._session() !== null);
  readonly user = computed(() => this._session()?.user ?? null);
  /** Aviso para mostrar al usuario cuando la sesión terminó sola (p. ej. venció). Quien lo muestra llama a clearNotice(). */
  readonly notice = this._notice.asReadonly();

  /**
   * Cambia cada vez que el perfil cambia (inicio de sesión, cierre o vencimiento). La aplicación recrea la
   * pantalla actual cuando cambia, para que vuelva a pedir sus datos: el público y el administrador reciben
   * respuestas distintas (correos, reembolsos) y no deben verse los datos del otro perfil.
   */
  readonly epoch = this._epoch.asReadonly();

  get token(): string | null {
    return this._session()?.token ?? null;
  }

  /** Recupera la sesión guardada en esta pestaña y la valida con el servidor sin bloquear el arranque. */
  restore(): void {
    const saved = this.readStorage();
    if (!saved) return;
    if (new Date(saved.expires_at).getTime() <= Date.now()) {
      this.removeStorage();
      return;
    }
    this._session.set(saved);
    // Si el servidor ya no la reconoce (reinició con otra clave, venció...), el interceptor la expira con el 401.
    this.http.get(`${this.apiUrl}/session`).subscribe({ error: () => undefined });
  }

  login(username: string, password: string): Observable<AdminSession> {
    return this.http.post<AdminSession>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((session) => {
        const { token, user, expires_at } = session;
        this.setSession({ token, user, expires_at });
        this._notice.set(null);
      })
    );
  }

  /** Cierra la sesión por decisión del usuario */
  logout(): void {
    this.setSession(null);
  }

  /** La sesión terminó sola (el servidor respondió 401): vuelve al perfil público y deja un aviso */
  expire(message = 'Tu sesión expiró. Inicia sesión de nuevo para modificar datos.'): void {
    if (this._session() === null) return;
    this.setSession(null);
    this._notice.set(message);
  }

  /** Deja un aviso para el usuario sin cambiar de perfil (p. ej. al negarle una pantalla de administrador) */
  notify(message: string): void {
    this._notice.set(message);
  }

  clearNotice(): void {
    this._notice.set(null);
  }

  private setSession(session: AdminSession | null): void {
    this._session.set(session);
    this._epoch.update((n) => n + 1);
    if (session) {
      this.writeStorage(session);
    } else {
      this.removeStorage();
    }
  }

  // sessionStorage puede no estar disponible (modo privado, políticas del navegador): nunca debe romper la app
  private readStorage(): AdminSession | null {
    try {
      const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.token && parsed.user && parsed.expires_at ? parsed : null;
    } catch {
      return null;
    }
  }

  private writeStorage(session: AdminSession): void {
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    } catch {
      /* sin almacenamiento: la sesión vive sólo en memoria */
    }
  }

  private removeStorage(): void {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      /* nada que limpiar */
    }
  }
}
