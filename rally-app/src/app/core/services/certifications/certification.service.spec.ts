import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { CertificationService } from './certification.service';

describe('CertificationService', () => {
  let service: CertificationService;
  let http: HttpTestingController;
  const url = `${environment.api_url}/certifications`;
  const sample: any = {"id": 1, "vendor": "AWS", "name": "SAA", "certification_type_id": 1};

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CertificationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lists records with GET', () => {
    service.getCertifications().subscribe((r) => expect(r).toEqual([sample]));
    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([sample]);
  });

  it('gets one record by id', () => {
    service.getCertification(7).subscribe((r) => expect(r).toEqual(sample));
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('GET');
    req.flush(sample);
  });

  it('creates with POST and the body', () => {
    service.createCertification(sample).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(sample);
    req.flush(sample);
  });

  it('updates with PUT on the id', () => {
    service.updateCertification(7, sample).subscribe();
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(sample);
    req.flush(sample);
  });

  it('deletes with DELETE on the id', () => {
    service.deleteCertification(7).subscribe();
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
