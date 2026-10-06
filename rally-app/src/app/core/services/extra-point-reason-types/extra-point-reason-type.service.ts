import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExtraPointReasonType } from '../../models/extra-point-reasons/extra-point-reason';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ExtraPointReasonTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/extra-point-reason-types`;

  getReasonTypes(): Observable<ExtraPointReasonType[]> {
    return this.http.get<ExtraPointReasonType[]>(this.apiUrl);
  }
}
