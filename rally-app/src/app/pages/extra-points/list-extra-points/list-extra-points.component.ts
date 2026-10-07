import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConsultantExtraPointService } from '../../../core/services/consultant-extra-points/consultant-extra-point.service';
import { ConsultantService } from '../../../core/services/consultants/consultant.service';
import { ConsultantExtraPoint } from '../../../core/models/consultant-extra-points/consultant-extra-point';
import { Consultant } from '../../../core/models/consultants/consultant';
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
  consultants: Consultant[] = [];
  selectedConsultantId: number | null = null;
  get displayedColumns(): string[] {
    return this.admin.isAdmin()
      ? ['consultant', 'reason', 'points', 'date', 'notes', 'actions']
      : ['consultant', 'reason', 'points', 'date', 'notes'];
  }

  readonly admin = inject(AdminSessionService);
  private extraPointService = inject(ConsultantExtraPointService);
  private consultantService = inject(ConsultantService);
  private dialog = inject(MatDialog);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadConsultants();
    this.loadExtraPoints();
  }

  loadConsultants(): void {
    this.consultantService.getConsultants().subscribe({
      next: (data) => this.consultants = data,
      error: (err) => console.error('Error loading consultants', err)
    });
  }

  loadExtraPoints(): void {
    this.extraPointService.getExtraPoints().subscribe({
      next: (data) => {
        this.extraPoints = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error loading extra points', err)
    });
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
