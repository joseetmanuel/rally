import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RankingEntry } from '../../models/ranking/ranking-entry';
import { environment } from '@env/environment';
import { OrgFilter } from '../../models/org-structure/org-structure';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/ranking`;

  /** Con `withDetail` cada participante trae además sus movimientos de puntos (para el PDF) */
  getRanking(withDetail = false, filter: OrgFilter = {}): Observable<RankingEntry[]> {
    const params: Record<string, string> = withDetail ? { detail: '1' } : {};
    // Filtros por dirección / subdirección / gerencia: sólo los respeta el servidor si la sesión es de administrador
    for (const [key, value] of Object.entries(filter)) {
      if (value !== null && value !== undefined) params[key] = String(value);
    }
    return this.http.get<RankingEntry[]>(this.apiUrl, Object.keys(params).length ? { params } : {});
  }
}
