import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExtraPointReasonTypeService } from './extra-point-reason-type.service';
import { environment } from '@env/environment';

describe('ExtraPointReasonTypeService', () => {
  let service: ExtraPointReasonTypeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ExtraPointReasonTypeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET reason types', () => {
    service.getReasonTypes().subscribe(d => expect(d[0].name).toBe('Mentoría'));
    const req = httpMock.expectOne(`${environment.api_url}/extra-point-reason-types`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, code: 'MENTOR', name: 'Mentoría', description: null }]);
  });
});
