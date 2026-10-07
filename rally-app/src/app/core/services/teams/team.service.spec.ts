import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TeamService } from './team.service';
import { environment } from '@env/environment';

describe('TeamService', () => {
  let service: TeamService;
  let httpMock: HttpTestingController;
  const url = `${environment.api_url}/teams`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TeamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTeams does GET /teams', () => {
    const data = [{ id: 1, name: 'A' }];
    service.getTeams().subscribe(r => expect(r).toEqual(data));
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush(data);
  });

  it('getTeam does GET /teams/:id', () => {
    service.getTeam(3).subscribe(r => expect(r).toEqual({ id: 3, name: 'C' }));
    const req = httpMock.expectOne(`${url}/3`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 3, name: 'C' });
  });

  it('createTeam does POST /teams with the body', () => {
    service.createTeam({ name: 'Nuevo' }).subscribe();
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Nuevo' });
    req.flush({ id: 9, name: 'Nuevo' });
  });

  it('updateTeam does PUT /teams/:id with the body', () => {
    service.updateTeam(4, { name: 'Edit' }).subscribe();
    const req = httpMock.expectOne(`${url}/4`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Edit' });
    req.flush({ id: 4, name: 'Edit' });
  });

  it('deleteTeam does DELETE /teams/:id', () => {
    service.deleteTeam(5).subscribe();
    const req = httpMock.expectOne(`${url}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
