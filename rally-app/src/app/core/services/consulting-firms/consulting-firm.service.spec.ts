import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConsultingFirmService } from './consulting-firm.service';
import { environment } from '@env/environment';

describe('ConsultingFirmService', () => {
  let service: ConsultingFirmService;
  let httpMock: HttpTestingController;
  const url = `${environment.api_url}/consulting-firms`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ConsultingFirmService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getConsultingFirms does GET /consulting-firms', () => {
    const data = [{ id: 1, name: 'A' }];
    service.getConsultingFirms().subscribe(r => expect(r).toEqual(data));
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush(data);
  });

  it('getConsultingFirm does GET /consulting-firms/:id', () => {
    service.getConsultingFirm(3).subscribe(r => expect(r).toEqual({ id: 3, name: 'C' }));
    const req = httpMock.expectOne(`${url}/3`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 3, name: 'C' });
  });

  it('createConsultingFirm does POST /consulting-firms with the body', () => {
    service.createConsultingFirm({ name: 'Nueva' }).subscribe();
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Nueva' });
    req.flush({ id: 9, name: 'Nueva' });
  });

  it('updateConsultingFirm does PUT /consulting-firms/:id with the body', () => {
    service.updateConsultingFirm(4, { name: 'Edit' }).subscribe();
    const req = httpMock.expectOne(`${url}/4`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Edit' });
    req.flush({ id: 4, name: 'Edit' });
  });

  it('deleteConsultingFirm does DELETE /consulting-firms/:id', () => {
    service.deleteConsultingFirm(5).subscribe();
    const req = httpMock.expectOne(`${url}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
