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

  getRanking(): Observable<RankingEntry[]> {
    return this.http.get<RankingEntry[]>(this.apiUrl);
  }
}
