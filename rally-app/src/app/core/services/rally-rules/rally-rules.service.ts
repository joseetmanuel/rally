import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { environment } from '@env/environment';
import { mediumDate, todayIso } from '../../utils/dates';

/** Calendario del Rally (bases): sólo cuentan los hechos entre el inicio y el corte de puntos */
export interface RallyRules {
  start: string;
  cutoff: string;
  closed: boolean;
}

/** Una certificación del catálogo del Rally (vista pública de las bases) */
export interface RallyCertification {
  id: number;
  vendor: string;
  name: string;
  type: 'FUNDACIONAL' | 'PROFESIONAL' | 'EXPERTO' | 'OPCIONAL';
  points: number;
}

/** Valores de las bases del Rally 2026; se usan mientras el servidor no responde (o si falla) */
export const DEFAULT_RALLY_RULES: RallyRules = { start: '2026-01-01', cutoff: '2026-12-15', closed: false };

@Injectable({
  providedIn: 'root'
})
export class RallyRulesService {
  // HttpClient se pide hasta que se carga: así el servicio se puede usar (con los valores por defecto) sin red
  private injector = inject(Injector);

  private readonly _rules = signal<RallyRules>(DEFAULT_RALLY_RULES);
  readonly rules = this._rules.asReadonly();
  readonly start = computed(() => this._rules().start);
  readonly cutoff = computed(() => this._rules().cutoff);
  readonly closed = computed(() => this._rules().closed);

  /** Pide el calendario al servidor. Si falla se conservan los valores de las bases. */
  load(): void {
    this.injector.get(HttpClient).get<RallyRules>(`${environment.api_url}/rules`).subscribe({
      next: (rules) => this._rules.set({ start: rules.start, cutoff: rules.cutoff, closed: !!rules.closed }),
      error: () => undefined
    });
  }

  /** Certificaciones que cuentan en el Rally, con su tipo (público; el catálogo de administración no lo es) */
  certifications(): Observable<RallyCertification[]> {
    return this.injector.get(HttpClient).get<RallyCertification[]>(`${environment.api_url}/rules/certifications`);
  }

  /** Última fecha que se puede registrar para algo que ya ocurrió: hoy, o el corte si ya pasó */
  latestForPastEvents(): string {
    const today = todayIso();
    return today < this.cutoff() ? today : this.cutoff();
  }

  /** Texto de ayuda: "1 ene 2026 – 15 dic 2026" */
  rangeText(): string {
    return `${mediumDate(this.start())} – ${mediumDate(this.cutoff())}`;
  }

  /**
   * Validador para un campo de fecha (AAAA-MM-DD).
   * @param forPastEvents true para hechos que ya ocurrieron (una certificación): además no admite el futuro.
   */
  dateValidator(forPastEvents = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '').substring(0, 10);
      if (!value) return null;
      if (value < this.start()) return { beforeStart: { start: this.start() } };
      if (value > this.cutoff()) return { afterCutoff: { cutoff: this.cutoff() } };
      if (forPastEvents && value > todayIso()) return { future: true };
      return null;
    };
  }
}
