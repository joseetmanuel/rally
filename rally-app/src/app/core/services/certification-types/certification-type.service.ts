import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertificationType } from '../../models/certification-types/certification-type';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class CertificationTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/certification-types`;

  getCertificationTypes(): Observable<CertificationType[]> {
    return this.http.get<CertificationType[]>(this.apiUrl);
  }

  getCertificationType(id: number): Observable<CertificationType> {
    return this.http.get<CertificationType>(`${this.apiUrl}/${id}`);
  }

  createCertificationType(data: CertificationType): Observable<CertificationType> {
    return this.http.post<CertificationType>(this.apiUrl, data);
  }

  updateCertificationType(id: number, data: CertificationType): Observable<CertificationType> {
    return this.http.put<CertificationType>(`${this.apiUrl}/${id}`, data);
  }

  deleteCertificationType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
