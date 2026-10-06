import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsultantExtraPoint } from '../../models/consultant-extra-points/consultant-extra-point';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultantExtraPointService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/consultant-extra-points`;

  getExtraPoints(): Observable<ConsultantExtraPoint[]> {
    return this.http.get<ConsultantExtraPoint[]>(this.apiUrl);
  }

  createExtraPoint(data: ConsultantExtraPoint): Observable<ConsultantExtraPoint> {
    return this.http.post<ConsultantExtraPoint>(this.apiUrl, data);
  }

  deleteExtraPoint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
