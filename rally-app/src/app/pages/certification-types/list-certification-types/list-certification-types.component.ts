import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CertificationTypeService } from '../../../core/services/certification-types/certification-type.service';
import { CertificationType } from '../../../core/models/certification-types/certification-type';
import { CaptureCertificationTypeComponent } from '../capture-certification-type/capture-certification-type.component';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

@Component({
  selector: 'app-list-certification-types',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './list-certification-types.component.html',
  styleUrls: ['./list-certification-types.component.scss']
})
export class ListCertificationTypesComponent implements OnInit {
  certificationTypes: CertificationType[] = [];
  get displayedColumns(): string[] {
    return this.admin.isAdmin()
      ? ['code', 'points_base', 'points_for_course', 'points_for_instructor', 'points_for_student', 'actions']
      : ['code', 'points_base', 'points_for_course', 'points_for_instructor', 'points_for_student'];
  }
  
  readonly admin = inject(AdminSessionService);
  private certificationTypeService = inject(CertificationTypeService);
  private dialog = inject(MatDialog);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadCertificationTypes();
  }

  loadCertificationTypes(): void {
    this.certificationTypeService.getCertificationTypes().subscribe({
      next: (data) => this.certificationTypes = data,
      error: (err) => console.error('Error loading certification types', err)
    });
  }

  openCaptureDialog(certificationType?: CertificationType): void {
    if (!this.admin.isAdmin()) return;
    const dialogRef = this.dialog.open(CaptureCertificationTypeComponent, {
      width: '400px',
      data: certificationType || null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCertificationTypes();
      }
    });
  }

  deleteCertificationType(certificationType: CertificationType): void {
    if (!this.admin.isAdmin()) return;
    if(!certificationType.id) return;
    
    this.confirmationService.openDeleteConfirmation().subscribe(result => {
      if (result) {
        this.certificationTypeService.deleteCertificationType(certificationType.id!).subscribe({
          next: () => this.loadCertificationTypes(),
          error: (err) => console.error('Error deleting certification type', err)
        });
      }
    });
  }
}
