import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CertificationService } from '../../../core/services/certifications/certification.service';
import { Certification } from '../../../core/models/certifications/certification';
import { CaptureCertificationComponent } from '../capture-certification/capture-certification.component';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';

@Component({
  selector: 'app-list-certifications',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './list-certifications.component.html',
  styleUrls: ['./list-certifications.component.scss']
})
export class ListCertificationsComponent implements OnInit {
  certifications: Certification[] = [];
  displayedColumns: string[] = ['vendor', 'name', 'type', 'actions'];
  
  private certificationService = inject(CertificationService);
  private dialog = inject(MatDialog);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadCertifications();
  }

  loadCertifications(): void {
    this.certificationService.getCertifications().subscribe({
      next: (data) => this.certifications = data,
      error: (err) => console.error('Error loading certifications', err)
    });
  }

  openCaptureDialog(certification?: Certification): void {
    const dialogRef = this.dialog.open(CaptureCertificationComponent, {
      width: '400px',
      data: certification || null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCertifications();
      }
    });
  }

  deleteCertification(certification: Certification): void {
    if(!certification.id) return;
    
    this.confirmationService.openDeleteConfirmation().subscribe(result => {
      if (result) {
        this.certificationService.deleteCertification(certification.id!).subscribe({
          next: () => this.loadCertifications(),
          error: (err) => console.error('Error deleting certification', err)
        });
      }
    });
  }
}
