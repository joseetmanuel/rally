import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConsultantExtraPointService } from './consultant-extra-point.service';
import { environment } from '@env/environment';

describe('ConsultantExtraPointService', () => {
  let service: ConsultantExtraPointService;
  let httpMock: HttpTestingController;
  const url = `${environment.api_url}/consultant-extra-points`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ConsultantExtraPointService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET extra points', () => {
    service.getExtraPoints().subscribe(d => expect(d.length).toBe(1));
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, consultant_id: 1, extra_point_reason_type_id: 1, points: 2, awarded_at: '2026-01-01' }]);
  });

  it('should POST an extra point', () => {
    const body = { consultant_id: 1, extra_point_reason_type_id: 2, points: 3, awarded_at: '2026-01-01' };
    service.createExtraPoint(body).subscribe();
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 5, ...body });
  });

  it('should DELETE an extra point', () => {
    service.deleteExtraPoint(7).subscribe();
    const req = httpMock.expectOne(`${url}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
