import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseSession } from '../../models/course-sessions/course-session';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseSessionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/course-sessions`;

  getCourseSessions(): Observable<CourseSession[]> {
    return this.http.get<CourseSession[]>(this.apiUrl);
  }

  getCourseSession(id: number): Observable<CourseSession> {
    return this.http.get<CourseSession>(`${this.apiUrl}/${id}`);
  }

  createCourseSession(data: CourseSession): Observable<CourseSession> {
    return this.http.post<CourseSession>(this.apiUrl, data);
  }

  updateCourseSession(id: number, data: CourseSession): Observable<CourseSession> {
    return this.http.put<CourseSession>(`${this.apiUrl}/${id}`, data);
  }

  deleteCourseSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
