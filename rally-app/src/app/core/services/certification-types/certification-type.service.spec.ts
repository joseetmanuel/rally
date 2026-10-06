import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { CertificationTypeService } from './certification-type.service';

describe('CertificationTypeService', () => {
  let service: CertificationTypeService;
  let http: HttpTestingController;
  const url = `${environment.api_url}/certification-types`;
  const sample: any = {"id": 1, "code": "FUNDACIONAL", "points_base": 10, "points_for_course": 5, "points_for_instructor": 1, "points_for_student": 2};

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CertificationTypeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lists records with GET', () => {
    service.getCertificationTypes().subscribe((r) => expect(r).toEqual([sample]));
    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([sample]);
  });

  it('gets one record by id', () => {
    service.getCertificationType(7).subscribe((r) => expect(r).toEqual(sample));
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('GET');
    req.flush(sample);
  });

  it('creates with POST and the body', () => {
    service.createCertificationType(sample).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(sample);
    req.flush(sample);
  });

  it('updates with PUT on the id', () => {
    service.updateCertificationType(7, sample).subscribe();
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(sample);
    req.flush(sample);
  });

  it('deletes with DELETE on the id', () => {
    service.deleteCertificationType(7).subscribe();
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
