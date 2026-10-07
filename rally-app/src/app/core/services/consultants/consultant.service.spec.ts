import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ConsultantService } from './consultant.service';

describe('ConsultantService', () => {
  let service: ConsultantService;
  let http: HttpTestingController;
  const url = `${environment.api_url}/consultants`;
  const sample: any = {"id": 1, "full_name": "Ana", "participant_type": "INTERNO", "team_id": 1};

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ConsultantService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lists records with GET', () => {
    service.getConsultants().subscribe((r) => expect(r).toEqual([sample]));
    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([sample]);
  });

  it('gets one record by id', () => {
    service.getConsultant(7).subscribe((r) => expect(r).toEqual(sample));
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('GET');
    req.flush(sample);
  });

  it('creates with POST and the body', () => {
    service.createConsultant(sample).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(sample);
    req.flush(sample);
  });

  it('updates with PUT on the id', () => {
    service.updateConsultant(7, sample).subscribe();
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(sample);
    req.flush(sample);
  });

  it('deletes with DELETE on the id', () => {
    service.deleteConsultant(7).subscribe();
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
