import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RALLY_DISCLAIMER } from '../../core/constants/Disclaimer';
import {
  BASES_SECTIONS, BASES_TABLE, CERTIFICATION_TYPES, ROUTE_BY_VENDOR, ROUTE_ORDER, STUDY_RESOURCES
} from '../../core/constants/RallyBases';
import { RallyCertification, RallyRulesService } from '../../core/services/rally-rules/rally-rules.service';
import { mediumDate } from '../../core/utils/dates';

/** Certificaciones de un tipo, agrupadas por ruta (Python, AWS, Azure, GCP) */
export interface TypeGroup {
  code: string;
  label: string;
  points: number;
  routes: { route: string; names: string[] }[];
}

/** Página pública con las bases del Rally 2026 de certificaciones */
@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss'
})
export class RulesComponent implements OnInit {
  private rallyRules = inject(RallyRulesService);

  readonly disclaimer = RALLY_DISCLAIMER;
  readonly sections = BASES_SECTIONS;
  readonly table = BASES_TABLE;
  readonly resources = STUDY_RESOURCES;

  /** Certificaciones por tipo; vacío mientras carga o si el servidor no responde (la sección se oculta) */
  groups: TypeGroup[] = [];

  ngOnInit(): void {
    this.rallyRules.certifications().subscribe({
      next: (certs) => (this.groups = this.group(certs)),
      error: () => (this.groups = [])
    });
  }

  private group(certs: RallyCertification[]): TypeGroup[] {
    return CERTIFICATION_TYPES.map(({ code, label }) => {
      const ofType = certs.filter((c) => c.type === code);
      const routes = ROUTE_ORDER
        .map((route) => ({
          route,
          names: ofType.filter((c) => (ROUTE_BY_VENDOR[c.vendor] ?? c.vendor) === route).map((c) => c.name)
        }))
        .filter((r) => r.names.length > 0);
      return { code, label, points: ofType[0]?.points ?? 0, routes };
    }).filter((g) => g.routes.length > 0);
  }

  /** "1 ene 2026 – 15 dic 2026", tomado del calendario vigente del servidor */
  get calendar(): string {
    return this.rallyRules.rangeText();
  }

  get cutoffText(): string {
    return mediumDate(this.rallyRules.cutoff());
  }
}
