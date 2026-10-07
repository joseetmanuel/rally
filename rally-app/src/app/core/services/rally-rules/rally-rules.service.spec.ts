import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { todayIso } from '../../utils/dates';
import { DEFAULT_RALLY_RULES, RallyRulesService } from './rally-rules.service';

function dayFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

describe('RallyRulesService', () => {
  let service: RallyRulesService;

  describe('without network (the service works with the dates of the rally rules)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(RallyRulesService);
    });

    it('starts with the dates of the rally rules', () => {
      expect(service.start()).toBe('2026-01-01');
      expect(service.cutoff()).toBe('2026-12-15');
      expect(service.closed()).toBe(false);
      expect(service.rules()).toEqual(DEFAULT_RALLY_RULES);
    });

    it('describes the calendar in readable form', () => {
      expect(service.rangeText()).toBe('1 ene 2026 – 15 dic 2026');
    });

    it('rejects dates before the start of the rally', () => {
      const validate = service.dateValidator();
      expect(validate(new FormControl('2025-12-31'))).toEqual({ beforeStart: { start: '2026-01-01' } });
      expect(validate(new FormControl('2026-01-01'))).toBeNull();
    });

    it('rejects dates after the points cutoff', () => {
      const validate = service.dateValidator();
      expect(validate(new FormControl('2026-12-16'))).toEqual({ afterCutoff: { cutoff: '2026-12-15' } });
      expect(validate(new FormControl('2026-12-15'))).toBeNull();
    });

    it('does not complain about an empty field (required is another validator)', () => {
      expect(service.dateValidator()(new FormControl(''))).toBeNull();
      expect(service.dateValidator()(new FormControl(null))).toBeNull();
    });

    it('accepts an ISO date time by looking only at the day', () => {
      expect(service.dateValidator()(new FormControl('2026-12-15T23:59:00'))).toBeNull();
      expect(service.dateValidator()(new FormControl('2026-12-16T00:00:00'))).not.toBeNull();
    });

    it('for events that already happened it also rejects the future', () => {
      const today = todayIso();
      const tomorrow = dayFromToday(1);
      const inWindow = today >= '2026-01-01' && tomorrow <= '2026-12-15';
      if (inWindow) {
        expect(service.dateValidator(true)(new FormControl(tomorrow))).toEqual({ future: true });
        expect(service.dateValidator(false)(new FormControl(tomorrow))).toBeNull(); // un curso sí puede estar agendado
      }
      expect(service.dateValidator(true)(new FormControl(today)) === null || today > '2026-12-15' || today < '2026-01-01').toBe(true);
    });

    it('the latest date for past events is today, or the cutoff once it has passed', () => {
      const today = todayIso();
      expect(service.latestForPastEvents()).toBe(today < '2026-12-15' ? today : '2026-12-15');
    });
  });

  describe('with the server', () => {
    let http: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
      service = TestBed.inject(RallyRulesService);
      http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('takes the calendar from the API', () => {
      service.load();
      const req = http.expectOne(`${environment.api_url}/rules`);
      expect(req.request.method).toBe('GET');
      req.flush({ start: '2027-01-01', cutoff: '2027-12-15', closed: true, started: true, max_registrable: '2027-12-15' });
      expect(service.start()).toBe('2027-01-01');
      expect(service.cutoff()).toBe('2027-12-15');
      expect(service.closed()).toBe(true);
      expect(service.dateValidator()(new FormControl('2026-06-01'))).toEqual({ beforeStart: { start: '2027-01-01' } });
    });

    it('keeps the dates of the rally rules when the server fails', () => {
      service.load();
      http.expectOne(`${environment.api_url}/rules`).flush({}, { status: 500, statusText: 'Server Error' });
      expect(service.rules()).toEqual(DEFAULT_RALLY_RULES);
    });
  });
});
