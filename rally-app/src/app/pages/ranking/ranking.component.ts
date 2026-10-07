import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RankingService } from '../../core/services/ranking/ranking.service';
import { RankingPdfService } from '../../core/services/ranking/ranking-pdf.service';
import { RankingEntry } from '../../core/models/ranking/ranking-entry';
import { initials as toInitials } from '../../core/utils/initials';

export interface BreakdownSegment {
  key: keyof RankingEntry['breakdown'];
  label: string;
  color: string;
}

/** Orden y color de cada componente del puntaje (paleta de marca) */
export const BREAKDOWN_SEGMENTS: BreakdownSegment[] = [
  { key: 'certifications', label: 'Certificaciones', color: 'var(--rk-seg-cert)' },
  { key: 'courses_given', label: 'Cursos impartidos', color: 'var(--rk-seg-given)' },
  { key: 'student_bonus', label: 'Bono alumno', color: 'var(--rk-seg-student)' },
  { key: 'instructor_bonus', label: 'Bono expositor', color: 'var(--rk-seg-instructor)' },
  { key: 'extra', label: 'Puntos extra', color: 'var(--rk-seg-extra)' }
];

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit {
  ranking: RankingEntry[] = [];
  loading = true;
  error = false;
  exporting = false;
  exportError = false;
  search = '';
  readonly segments = BREAKDOWN_SEGMENTS;

  private rankingService = inject(RankingService);
  private pdfService = inject(RankingPdfService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.rankingService.getRanking().subscribe({
      next: (data) => {
        this.ranking = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading ranking', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  /** Descarga todo el ranking (sin aplicar el filtro de búsqueda) como PDF, con el detalle de cada participante */
  async exportPdf(): Promise<void> {
    if (this.exporting || this.ranking.length === 0) return;
    this.exporting = true;
    this.exportError = false;
    try {
      // Se piden los movimientos de todos y de paso se exportan datos frescos, no los de la pantalla
      const detailed = await firstValueFrom(this.rankingService.getRanking(true));
      await this.pdfService.export(detailed);
    } catch (err) {
      console.error('Error exporting ranking to PDF', err);
      this.exportError = true;
    } finally {
      this.exporting = false;
    }
  }

  /** Mientras nadie tenga puntos no hay podio que premiar */
  get hasPoints(): boolean {
    return this.ranking.some((e) => e.total_points > 0);
  }

  /** Podio en orden visual: 2º, 1º, 3º (el primero al centro y más alto) */
  get podium(): RankingEntry[] {
    if (!this.hasPoints) return [];
    const [first, second, third] = this.ranking;
    return [second, first, third].filter((e): e is RankingEntry => !!e);
  }

  /** Filas del listado: todos a partir del 4º; todos si se busca o si aún no hay podio */
  get rows(): RankingEntry[] {
    const term = this.search.trim().toLowerCase();
    if (term) {
      return this.ranking.filter((e) => e.full_name.toLowerCase().includes(term));
    }
    return this.hasPoints ? this.ranking.slice(3) : this.ranking;
  }

  get maxPoints(): number {
    return Math.max(1, ...this.ranking.map((e) => e.total_points));
  }

  get totalCertifications(): number {
    return this.ranking.reduce((sum, e) => sum + e.certifications, 0);
  }

  get totalPoints(): number {
    return this.ranking.reduce((sum, e) => sum + e.total_points, 0);
  }

  onSearch(event: Event): void {
    this.search = (event.target as HTMLInputElement).value;
  }

  initials(name: string): string {
    return toInitials(name);
  }

  /** Ancho de la barra de una fila respecto al líder (mínimo visible si tiene puntos) */
  barWidth(entry: RankingEntry): number {
    if (entry.total_points <= 0) return 0;
    return Math.max(4, Math.round((entry.total_points / this.maxPoints) * 100));
  }

  /** Ancho de un segmento dentro de la barra de la fila (% del total de la fila) */
  segmentWidth(entry: RankingEntry, key: BreakdownSegment['key']): number {
    return entry.total_points > 0 ? (entry.breakdown[key] / entry.total_points) * 100 : 0;
  }

  breakdownSummary(entry: RankingEntry): string {
    return this.segments
      .filter((s) => entry.breakdown[s.key] > 0)
      .map((s) => `${s.label}: ${entry.breakdown[s.key]}`)
      .join(' · ') || 'Sin puntos todavía';
  }

  trackById(_: number, entry: RankingEntry): number {
    return entry.consultant_id;
  }
}
