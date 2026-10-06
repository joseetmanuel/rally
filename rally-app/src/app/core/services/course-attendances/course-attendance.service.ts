import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CourseAttendance } from '../../models/course-attendances/course-attendance';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseAttendanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/course-attendances`;

  getCourseAttendances(sessionId: number): Observable<CourseAttendance[]> {
    return this.http.get<CourseAttendance[]>(this.apiUrl).pipe(
      map(attendances => attendances.filter(a => a.course_session_id === sessionId))
    );
  }

  createCourseAttendance(data: CourseAttendance): Observable<CourseAttendance> {
    return this.http.post<CourseAttendance>(this.apiUrl, data);
  }

  deleteCourseAttendance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
