import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  CtoNode, Direction, Management, OrgFilter, OrgLevel, OrgUnit, ORG_LEVELS, Subdirection
} from '../../models/org-structure/org-structure';

/** Estructura CTO > Dirección > Subdirección > Gerencia (sólo administrador). */
@Injectable({
  providedIn: 'root'
})
export class OrgStructureService {
  private http = inject(HttpClient);
  private base = environment.api_url;

  /** Árbol completo anidado, con el número de participantes de cada gerencia */
  getTree(): Observable<CtoNode[]> {
    return this.http.get<CtoNode[]>(`${this.base}/org-structure`);
  }

  getDirections(): Observable<Direction[]> {
    return this.http.get<Direction[]>(`${this.base}/directions`);
  }

  getSubdirections(): Observable<Subdirection[]> {
    return this.http.get<Subdirection[]>(`${this.base}/subdirections`);
  }

  getManagements(): Observable<Management[]> {
    return this.http.get<Management[]>(`${this.base}/managements`);
  }

  /** Edita nombre, encabezado o enlace a participante de un nivel (por ID). */
  update(level: OrgLevel, id: number, changes: Partial<OrgUnit>): Observable<OrgUnit> {
    return this.http.put<OrgUnit>(`${this.base}/${this.url(level)}/${id}`, changes);
  }

  /** Alta de una unidad (el padre va en `data`: cto_id, direction_id o subdirection_id según el nivel). */
  create(level: OrgLevel, data: Partial<OrgUnit> & Record<string, unknown>): Observable<OrgUnit> {
    return this.http.post<OrgUnit>(`${this.base}/${this.url(level)}`, data);
  }

  /** Parámetros de consulta del ranking para un filtro por nivel (sólo los que traen valor). */
  filterParams(filter: OrgFilter): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value !== null && value !== undefined) params[key] = String(value);
    }
    return params;
  }

  private url(level: OrgLevel): string {
    return ORG_LEVELS.find((l) => l.level === level)!.url;
  }
}
