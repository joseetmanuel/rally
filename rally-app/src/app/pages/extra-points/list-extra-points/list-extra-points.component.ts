import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConsultantExtraPointService } from '../../../core/services/consultant-extra-points/consultant-extra-point.service';
import { ConsultantExtraPoint } from '../../../core/models/consultant-extra-points/consultant-extra-point';
import { CaptureExtraPointComponent } from '../capture-extra-point/capture-extra-point.component';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

@Component({
  selector: 'app-list-extra-points',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  templateUrl: './list-extra-points.component.html',
  styleUrls: ['./list-extra-points.component.scss']
})
export class ListExtraPointsComponent implements OnInit {
  extraPoints: ConsultantExtraPoint[] = [];
  filteredPoints: ConsultantExtraPoint[] = [];
  /**
   * Opciones del filtro: las personas que aparecen en los puntos cargados. Se obtienen de aquí y no del
   * catálogo de consultores porque ese catálogo es sólo para el administrador (esta pantalla es pública).
   */
  consultants: { id: number; full_name: string }[] = [];
  selectedConsultantId: number | null = null;
  get displayedColumns(): string[] {
    return this.admin.isAdmin()
      ? ['consultant', 'reason', 'points', 'date', 'notes', 'actions']
      : ['consultant', 'reason', 'points', 'date', 'notes'];
  }

  readonly admin = inject(AdminSessionService);
  private extraPointService = inject(ConsultantExtraPointService);
  private dialog = inject(MatDialog);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadExtraPoints();
  }

  loadExtraPoints(): void {
    this.extraPointService.getExtraPoints().subscribe({
      next: (data) => {
        this.extraPoints = data;
        this.consultants = this.buildConsultantOptions(data);
        this.applyFilter();
      },
      error: (err) => console.error('Error loading extra points', err)
    });
  }

  /** Se calcula una sola vez por carga: un getter crearía objetos nuevos en cada ciclo y el ngFor recrearía las opciones sin parar */
  private buildConsultantOptions(points: ConsultantExtraPoint[]): { id: number; full_name: string }[] {
    const people = new Map<number, string>();
    for (const point of points) {
      people.set(point.consultant_id, point.consultant?.full_name ?? `ID: ${point.consultant_id}`);
    }
    return [...people].map(([id, full_name]) => ({ id, full_name })).sort((a, b) => a.full_name.localeCompare(b.full_name, 'es'));
  }

  onFilterChange(consultantId: number | null): void {
    this.selectedConsultantId = consultantId;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredPoints = this.selectedConsultantId == null
      ? this.extraPoints
      : this.extraPoints.filter(p => p.consultant_id === this.selectedConsultantId);
  }

  formatDate(value: string | null | undefined): string {
    return value ? value.substring(0, 10) : '';
  }

  openCaptureDialog(): void {
    if (!this.admin.isAdmin()) return;
    const dialogRef = this.dialog.open(CaptureExtraPointComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadExtraPoints();
      }
    });
  }

  deleteExtraPoint(point: ConsultantExtraPoint): void {
    if (!this.admin.isAdmin()) return;
    if (!point.id) return;

    this.confirmationService.openDeleteConfirmation().subscribe(result => {
      if (result) {
        this.extraPointService.deleteExtraPoint(point.id!).subscribe({
          next: () => this.loadExtraPoints(),
          error: (err) => console.error('Error deleting extra point', err)
        });
      }
    });
  }
}
