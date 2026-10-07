import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { StatementService } from './statement.service';

describe('StatementService', () => {
  let service: StatementService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(StatementService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the statement of one participant', () => {
    service.getStatement(7).subscribe((s) => expect(s.total_points).toBe(110));
    const req = http.expectOne(`${environment.api_url}/consultants/7/statement`);
    expect(req.request.method).toBe('GET');
    req.flush({ total_points: 110 });
  });
});
