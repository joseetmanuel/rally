import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ConsultantCertificationService } from './consultant-certification.service';

describe('ConsultantCertificationService', () => {
  let service: ConsultantCertificationService;
  let http: HttpTestingController;
  const url = `${environment.api_url}/consultant-certifications`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ConsultantCertificationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('returns only the certifications of the requested consultant', () => {
    let result: any[] = [];
    service.getConsultantCertifications(5).subscribe((r) => (result = r));
    http.expectOne(url).flush([
      { id: 1, consultant_id: 5, certification_id: 1, obtained_at: '2026-01-01' },
      { id: 2, consultant_id: 6, certification_id: 1, obtained_at: '2026-01-02' }
    ]);
    expect(result.map((c) => c.id)).toEqual([1]);
  });

  it('creates with POST', () => {
    const body = { consultant_id: 5, certification_id: 1, obtained_at: '2026-01-01' };
    service.createConsultantCertification(body).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(body);
  });
});
