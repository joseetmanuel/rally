import { Injectable, effect, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Section } from '@models/section/Section';
import { AdminSessionService } from '@services/admin-session/admin-session.service';

type MenuItem = { id: number; name: string; icon: string; route: string; inMenu: number; children: MenuItem[] };

const item = (id: number, name: string, icon: string, route: string, children: MenuItem[] = []): MenuItem =>
  ({ id, name, icon, route, inMenu: 1, children });

/**
 * Menú de la aplicación según el perfil.
 *  - Público: sólo lectura de los resultados (inicio, detalle, cursos y puntos extra).
 *  - Administrador: además Consultores y todos los catálogos.
 * El menú se recalcula solo cuando el perfil cambia (inicio o cierre de sesión).
 */
@Injectable({
  providedIn: 'root'
})
export class MenuConfigurationService {
  private admin = inject(AdminSessionService);
  private readonly menu$ = new BehaviorSubject<Section[]>(this.build(this.admin.isAdmin()));

  constructor() {
    effect(() => this.menu$.next(this.build(this.admin.isAdmin())));
  }

  startConfiguration(sections: Section[]) {
  }

  resetConfiguration() {
  }

  getMenu(): Observable<Section[]> {
    return this.menu$.asObservable();
  }

  get validatePermissions() {
    return false;
  }

  private build(isAdmin: boolean): Section[] {
    const inicio = item(1, 'Inicio', 'home', 'home');
    const detalle = item(11, 'Detalle', 'receipt_long', 'detail');
    const cursos = item(5, 'Cursos', 'school', 'course-sessions');
    const puntosExtra = item(6, 'Puntos Extra', 'stars', 'extra-points');

    const menu = isAdmin
      ? [
        inicio,
        detalle,
        item(2, 'Consultores', 'people', 'consultants'),
        cursos,
        puntosExtra,
        item(10, 'Catálogos', 'library_books', '', [
          item(8, 'Equipos', 'groups', 'teams'),
          item(9, 'Consultoras', 'business', 'consulting-firms'),
          item(3, 'Tipos de certificación', 'category', 'certification-types'),
          item(4, 'Certificaciones', 'workspace_premium', 'certifications')
        ])
      ]
      : [inicio, detalle, cursos, puntosExtra];
    return menu as unknown as Section[];
  }
}
