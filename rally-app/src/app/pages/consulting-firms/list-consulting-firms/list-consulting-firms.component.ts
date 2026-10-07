import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConsultingFirmService } from '../../../core/services/consulting-firms/consulting-firm.service';
import { ConsultingFirm } from '../../../core/models/consulting-firms/consulting-firm';
import { CaptureConsultingFirmComponent } from '../capture-consulting-firm/capture-consulting-firm.component';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

@Component({
  selector: 'app-list-consulting-firms',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './list-consulting-firms.component.html',
  styleUrls: ['./list-consulting-firms.component.scss']
})
export class ListConsultingFirmsComponent implements OnInit {
  consultingFirms: ConsultingFirm[] = [];
  get displayedColumns(): string[] {
    return this.admin.isAdmin()
      ? ['name', 'actions']
      : ['name'];
  }
  errorMessage = '';

  readonly admin = inject(AdminSessionService);
  private consultingFirmService = inject(ConsultingFirmService);
  private dialog = inject(MatDialog);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadConsultingFirms();
  }

  loadConsultingFirms(): void {
    this.errorMessage = '';
    this.consultingFirmService.getConsultingFirms().subscribe({
      next: (data) => this.consultingFirms = data,
      error: (err) => {
        console.error('Error loading consulting firms', err);
        this.errorMessage = err?.error?.error || 'No se pudieron cargar las consultoras.';
      }
    });
  }

  openCaptureDialog(consultingFirm?: ConsultingFirm): void {
    if (!this.admin.isAdmin()) return;
    const dialogRef = this.dialog.open(CaptureConsultingFirmComponent, {
      width: '400px',
      data: consultingFirm || null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadConsultingFirms();
      }
    });
  }

  deleteConsultingFirm(consultingFirm: ConsultingFirm): void {
    if (!this.admin.isAdmin()) return;
    if (!consultingFirm.id) return;

    this.confirmationService.openDeleteConfirmation().subscribe(result => {
      if (result) {
        this.errorMessage = '';
        this.consultingFirmService.deleteConsultingFirm(consultingFirm.id!).subscribe({
          next: () => this.loadConsultingFirms(),
          error: (err) => {
            console.error('Error deleting consulting firm', err);
            this.errorMessage = err?.error?.error || 'No se pudo eliminar la consultora.';
          }
        });
      }
    });
  }
}
