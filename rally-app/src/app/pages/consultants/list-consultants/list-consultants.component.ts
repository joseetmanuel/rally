import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConsultantService } from '../../../core/services/consultants/consultant.service';
import { Consultant } from '../../../core/models/consultants/consultant';
import { CaptureConsultantComponent } from '../capture-consultant/capture-consultant.component';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';
import { ListConsultantCertificationsComponent } from '../dialogs/list-consultant-certifications/list-consultant-certifications.component';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

@Component({
  selector: 'app-list-consultants',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './list-consultants.component.html',
  styleUrls: ['./list-consultants.component.scss']
})
export class ListConsultantsComponent implements OnInit {
  consultants: Consultant[] = [];
  get displayedColumns(): string[] {
    return this.admin.isAdmin()
      ? ['full_name', 'participant_type', 'team', 'email', 'actions']
      : ['full_name', 'participant_type', 'team', 'actions'];
  }
  
  readonly admin = inject(AdminSessionService);
  private consultantService = inject(ConsultantService);
  private dialog = inject(MatDialog);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadConsultants();
  }

  loadConsultants(): void {
    this.consultantService.getConsultants().subscribe({
      next: (data) => this.consultants = data,
      error: (err) => console.error('Error loading consultants', err)
    });
  }

  openCaptureDialog(consultant?: Consultant): void {
    if (!this.admin.isAdmin()) return;
    const dialogRef = this.dialog.open(CaptureConsultantComponent, {
      width: '400px',
      data: consultant || null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadConsultants();
      }
    });
  }
  
  openCertificationsDialog(consultant: Consultant): void {
    this.dialog.open(ListConsultantCertificationsComponent, {
      width: '700px',
      data: consultant
    });
  }

  deleteConsultant(consultant: Consultant): void {
    if (!this.admin.isAdmin()) return;
    if(!consultant.id) return;
    
    this.confirmationService.openDeleteConfirmation().subscribe(result => {
      if (result) {
        this.consultantService.deleteConsultant(consultant.id!).subscribe({
          next: () => this.loadConsultants(),
          error: (err) => console.error('Error deleting consultant', err)
        });
      }
    });
  }
}
