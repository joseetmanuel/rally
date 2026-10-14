import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RankingService } from '../../core/services/ranking/ranking.service';
import { StatementService } from '../../core/services/statement/statement.service';
import { RankingEntry } from '../../core/models/ranking/ranking-entry';
import { KIND_LABELS, Statement, StatementEntry, StatementKind } from '../../core/models/statement/statement';
import { initials } from '../../core/utils/initials';
import { facePhoto } from '../../core/utils/face-photo';
import { MONTH_NAMES, shortDate } from '../../core/utils/dates';
import { BREAKDOWN_SEGMENTS } from '../ranking/ranking.component';

export interface KindMeta {
  label: string;
  icon: string;
  color: string;
}

/** Etiqueta, icono y color de cada tipo de movimiento. Los colores son versiones más oscuras de la paleta
 *  del ranking para que el icono blanco tenga contraste suficiente. */
export const KIND_META: Record<StatementKind, KindMeta> = {
  certification: { label: KIND_LABELS.certification, icon: 'workspace_premium', color: 'var(--dt-cert)' },
  course_given: { label: KIND_LABELS.course_given, icon: 'school', color: 'var(--dt-given)' },
  student_bonus: { label: KIND_LABELS.student_bonus, icon: 'redeem', color: 'var(--dt-student)' },
  instructor_bonus: { label: KIND_LABELS.instructor_bonus, icon: 'record_voice_over', color: 'var(--dt-instructor)' },
  extra: { label: KIND_LABELS.extra, icon: 'stars', color: 'var(--dt-extra)' }
};

export interface MonthGroup {
  key: string;
  label: string;
  points: number;
  entries: StatementEntry[];
}

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule, MatButtonModule, MatSelectModule, MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  participants: RankingEntry[] = [];
  statement: Statement | null = null;
  groups: MonthGroup[] = [];
  selectedId: number | null = null;
  loading = true;
  error = false;
  notFound = false;

  readonly segments = BREAKDOWN_SEGMENTS;
  readonly segmentColor: Record<keyof Statement['breakdown'], string> = {
    certifications: 'var(--dt-cert)',
    courses_given: 'var(--dt-given)',
    student_bonus: 'var(--dt-student)',
    instructor_bonus: 'var(--dt-instructor)',
    extra: 'var(--dt-extra)'
  };
  readonly kinds = KIND_META;
  readonly initials = initials;
  readonly facePhoto = facePhoto;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rankingService = inject(RankingService);
  private statementService = inject(StatementService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.rankingService.getRanking().subscribe({
      next: (data) => {
        this.participants = data;
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => this.onParams(params.get('id')));
      },
      error: (err) => this.fail(err)
    });
  }

  private onParams(id: string | null): void {
    if (id === null) {
      // Sin participante elegido: abrir al líder del ranking
      if (this.participants.length === 0) {
        this.loading = false;
        return;
      }
      this.router.navigate(['/app/detail', this.participants[0].consultant_id], { replaceUrl: true });
      return;
    }
    const consultantId = Number(id);
    if (!Number.isInteger(consultantId)) {
      this.notFound = true;
      this.loading = false;
      return;
    }
    this.load(consultantId);
  }

  load(consultantId: number): void {
    this.selectedId = consultantId;
    this.loading = true;
    this.error = false;
    this.notFound = false;
    this.statementService.getStatement(consultantId).subscribe({
      next: (statement) => {
        this.statement = statement;
        this.groups = this.groupByMonth(statement.entries);
        this.loading = false;
      },
      error: (err) => {
        this.statement = null;
        this.groups = [];
        if (err?.status === 404) {
          this.notFound = true;
          this.loading = false;
        } else {
          this.fail(err);
        }
      }
    });
  }

  private fail(err: unknown): void {
    console.error('Error loading the statement', err);
    this.error = true;
    this.loading = false;
  }

  /** Cambia de participante desde el selector */
  select(consultantId: number): void {
    this.router.navigate(['/app/detail', consultantId]);
  }

  retry(): void {
    if (this.selectedId !== null) {
      this.load(this.selectedId);
    } else {
      this.ngOnInit();
    }
  }

  /** Agrupa los movimientos por mes conservando el orden cronológico */
  groupByMonth(entries: StatementEntry[]): MonthGroup[] {
    const groups: MonthGroup[] = [];
    for (const entry of entries) {
      const key = entry.date.substring(0, 7);
      let group = groups[groups.length - 1];
      if (!group || group.key !== key) {
        group = { key, label: this.monthLabel(key), points: 0, entries: [] };
        groups.push(group);
      }
      group.points += entry.points;
      group.entries.push(entry);
    }
    return groups;
  }

  monthLabel(key: string): string {
    const [year, month] = key.split('-').map(Number);
    return `${MONTH_NAMES[month - 1]} ${year}`;
  }

  shortDate(iso: string): string {
    return shortDate(iso);
  }

  /** Ancho (%) de un componente dentro de la barra de desglose */
  segmentWidth(key: keyof Statement['breakdown']): number {
    const total = this.statement?.total_points ?? 0;
    return total > 0 && this.statement ? (this.statement.breakdown[key] / total) * 100 : 0;
  }

  get hasPoints(): boolean {
    return (this.statement?.total_points ?? 0) > 0;
  }

  trackEntry(index: number, entry: StatementEntry): string {
    return `${entry.date}-${entry.kind}-${index}`;
  }
}
