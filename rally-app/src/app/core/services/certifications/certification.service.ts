import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certification } from '../../models/certifications/certification';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class CertificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/certifications`;

  getCertifications(): Observable<Certification[]> {
    return this.http.get<Certification[]>(this.apiUrl);
  }

  getCertification(id: number): Observable<Certification> {
    return this.http.get<Certification>(`${this.apiUrl}/${id}`);
  }

  createCertification(data: Certification): Observable<Certification> {
    return this.http.post<Certification>(this.apiUrl, data);
  }

  updateCertification(id: number, data: Certification): Observable<Certification> {
    return this.http.put<Certification>(`${this.apiUrl}/${id}`, data);
  }

  deleteCertification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
