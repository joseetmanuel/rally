import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConsultantCertification } from '../../models/consultant-certifications/consultant-certification';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultantCertificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/consultant-certifications`;

  getConsultantCertifications(consultantId: number): Observable<ConsultantCertification[]> {
    return this.http.get<ConsultantCertification[]>(this.apiUrl).pipe(
      map(certs => certs.filter(c => c.consultant_id === consultantId))
    );
  }

  createConsultantCertification(certification: ConsultantCertification): Observable<ConsultantCertification> {
    return this.http.post<ConsultantCertification>(this.apiUrl, certification);
  }
}
