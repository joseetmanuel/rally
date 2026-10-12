import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RALLY_DISCLAIMER } from '../../core/constants/Disclaimer';
import { BASES_SECTIONS, BASES_TABLE, STUDY_RESOURCES } from '../../core/constants/RallyBases';
import { RallyRulesService } from '../../core/services/rally-rules/rally-rules.service';
import { mediumDate } from '../../core/utils/dates';

/** Página pública con las bases del Rally 2026 de certificaciones */
@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss'
})
export class RulesComponent {
  private rallyRules = inject(RallyRulesService);

  readonly disclaimer = RALLY_DISCLAIMER;
  readonly sections = BASES_SECTIONS;
  readonly table = BASES_TABLE;
  readonly resources = STUDY_RESOURCES;

  /** "1 ene 2026 – 15 dic 2026", tomado del calendario vigente del servidor */
  get calendar(): string {
    return this.rallyRules.rangeText();
  }

  get cutoffText(): string {
    return mediumDate(this.rallyRules.cutoff());
  }
}
