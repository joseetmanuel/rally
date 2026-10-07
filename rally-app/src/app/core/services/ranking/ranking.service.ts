import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RankingEntry } from '../../models/ranking/ranking-entry';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/ranking`;

  /** Con `withDetail` cada participante trae además sus movimientos de puntos (para el PDF) */
  getRanking(withDetail = false): Observable<RankingEntry[]> {
    return this.http.get<RankingEntry[]>(this.apiUrl, withDetail ? { params: { detail: '1' } } : {});
  }
}
