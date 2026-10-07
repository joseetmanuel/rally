import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsultingFirm } from '../../models/consulting-firms/consulting-firm';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultingFirmService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/consulting-firms`;

  getConsultingFirms(): Observable<ConsultingFirm[]> {
    return this.http.get<ConsultingFirm[]>(this.apiUrl);
  }

  getConsultingFirm(id: number): Observable<ConsultingFirm> {
    return this.http.get<ConsultingFirm>(`${this.apiUrl}/${id}`);
  }

  createConsultingFirm(data: ConsultingFirm): Observable<ConsultingFirm> {
    return this.http.post<ConsultingFirm>(this.apiUrl, data);
  }

  updateConsultingFirm(id: number, data: ConsultingFirm): Observable<ConsultingFirm> {
    return this.http.put<ConsultingFirm>(`${this.apiUrl}/${id}`, data);
  }

  deleteConsultingFirm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
