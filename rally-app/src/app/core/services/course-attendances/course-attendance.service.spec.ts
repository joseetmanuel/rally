import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { CourseAttendanceService } from './course-attendance.service';

describe('CourseAttendanceService', () => {
  let service: CourseAttendanceService;
  let http: HttpTestingController;
  const url = `${environment.api_url}/course-attendances`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CourseAttendanceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns only the attendances of the requested session', () => {
    let result: any[] = [];
    service.getCourseAttendances(1).subscribe((r) => (result = r));
    http.expectOne(url).flush([
      { id: 1, course_session_id: 1, consultant_id: 10 },
      { id: 2, course_session_id: 2, consultant_id: 11 },
      { id: 3, course_session_id: 1, consultant_id: 12 }
    ]);
    expect(result.map((a) => a.id)).toEqual([1, 3]);
  });

  it('creates with POST', () => {
    const body = { course_session_id: 1, consultant_id: 10, points_obtained: 8 };
    service.createCourseAttendance(body).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(body);
  });

  it('deletes with DELETE on the id', () => {
    service.deleteCourseAttendance(4).subscribe();
    const req = http.expectOne(`${url}/4`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
