import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { RankingService } from './ranking.service';

describe('RankingService', () => {
  let service: RankingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RankingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the ranking with GET', () => {
    service.getRanking().subscribe((r) => expect(r.length).toBe(1));
    const req = http.expectOne(`${environment.api_url}/ranking`);
    expect(req.request.method).toBe('GET');
    req.flush([{ position: 1 }]);
  });
});
