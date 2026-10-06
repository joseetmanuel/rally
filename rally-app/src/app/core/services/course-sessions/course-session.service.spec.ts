import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { CourseSessionService } from './course-session.service';

describe('CourseSessionService', () => {
  let service: CourseSessionService;
  let http: HttpTestingController;
  const url = `${environment.api_url}/course-sessions`;
  const sample: any = {"id": 1, "certification_id": 1, "instructor_consultant_id": 2, "session_date": "2026-10-01"};

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CourseSessionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lists records with GET', () => {
    service.getCourseSessions().subscribe((r) => expect(r).toEqual([sample]));
    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([sample]);
  });

  it('gets one record by id', () => {
    service.getCourseSession(7).subscribe((r) => expect(r).toEqual(sample));
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('GET');
    req.flush(sample);
  });

  it('creates with POST and the body', () => {
    service.createCourseSession(sample).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(sample);
    req.flush(sample);
  });

  it('updates with PUT on the id', () => {
    service.updateCourseSession(7, sample).subscribe();
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(sample);
    req.flush(sample);
  });

  it('deletes with DELETE on the id', () => {
    service.deleteCourseSession(7).subscribe();
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
