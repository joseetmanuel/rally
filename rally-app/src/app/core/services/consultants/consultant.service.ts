import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consultant } from '../../models/consultants/consultant';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/consultants`;

  getConsultants(): Observable<Consultant[]> {
    return this.http.get<Consultant[]>(this.apiUrl);
  }

  getConsultant(id: number): Observable<Consultant> {
    return this.http.get<Consultant>(`${this.apiUrl}/${id}`);
  }

  createConsultant(consultant: Consultant): Observable<Consultant> {
    return this.http.post<Consultant>(this.apiUrl, consultant);
  }

  updateConsultant(id: number, consultant: Consultant): Observable<Consultant> {
    return this.http.put<Consultant>(`${this.apiUrl}/${id}`, consultant);
  }

  deleteConsultant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
