import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConsultantCertificationService } from '../../../../core/services/consultant-certifications/consultant-certification.service';
import { ConsultantCertification } from '../../../../core/models/consultant-certifications/consultant-certification';
import { Consultant } from '../../../../core/models/consultants/consultant';
import { CaptureConsultantCertificationComponent } from '../capture-consultant-certification/capture-consultant-certification.component';

@Component({
  selector: 'app-list-consultant-certifications',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './list-consultant-certifications.component.html',
  styleUrls: ['./list-consultant-certifications.component.scss']
})
export class ListConsultantCertificationsComponent implements OnInit {
  certifications: ConsultantCertification[] = [];
  displayedColumns: string[] = ['certification', 'obtained_at', 'paid_with_own_resources'];
  
  private service = inject(ConsultantCertificationService);
  private dialog = inject(MatDialog);

  constructor(
    public dialogRef: MatDialogRef<ListConsultantCertificationsComponent>,
    @Inject(MAT_DIALOG_DATA) public consultant: Consultant
  ) {}

  ngOnInit(): void {
    this.loadCertifications();
  }

  loadCertifications(): void {
    this.service.getConsultantCertifications(this.consultant.id!).subscribe({
      next: (data) => this.certifications = data,
      error: (err) => console.error('Error', err)
    });
  }

  openCaptureDialog(): void {
    const dialogRef = this.dialog.open(CaptureConsultantCertificationComponent, {
      width: '500px',
      data: this.consultant,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCertifications();
      }
    });
  }
}
