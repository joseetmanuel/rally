import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Statement } from '../../models/statement/statement';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class StatementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/consultants`;

  getStatement(consultantId: number): Observable<Statement> {
    return this.http.get<Statement>(`${this.apiUrl}/${consultantId}/statement`);
  }
}
