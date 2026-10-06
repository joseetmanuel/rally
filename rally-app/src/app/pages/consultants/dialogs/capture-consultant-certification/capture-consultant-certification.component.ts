import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConsultantCertificationService } from '../../../../core/services/consultant-certifications/consultant-certification.service';
import { CertificationService } from '../../../../core/services/certifications/certification.service';
import { ConsultantCertification } from '../../../../core/models/consultant-certifications/consultant-certification';
import { Consultant } from '../../../../core/models/consultants/consultant';
import { Certification } from '../../../../core/models/certifications/certification';

@Component({
  selector: 'app-capture-consultant-certification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatFormFieldModule
  ],
  templateUrl: './capture-consultant-certification.component.html',
  styleUrls: ['./capture-consultant-certification.component.scss']
})
export class CaptureConsultantCertificationComponent implements OnInit {
  form: FormGroup;
  certifications: Certification[] = [];
  
  private fb = inject(FormBuilder);
  private consultantCertService = inject(ConsultantCertificationService);
  private certService = inject(CertificationService);
  
  constructor(
    public dialogRef: MatDialogRef<CaptureConsultantCertificationComponent>,
    @Inject(MAT_DIALOG_DATA) public consultant: Consultant
  ) {
    this.form = this.fb.group({
      certification_id: [null, Validators.required],
      obtained_at: ['', Validators.required],
      reimbursement_amount: [0, Validators.min(0)],
      paid_with_own_resources: [false],
      reimbursement_registered: [false],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCertifications();
  }

  loadCertifications(): void {
    this.certService.getCertifications().subscribe({
      next: (data) => this.certifications = data,
      error: (err) => console.error('Error loading certifications', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const certData: ConsultantCertification = {
      ...this.form.value,
      consultant_id: this.consultant.id
    };

    this.consultantCertService.createConsultantCertification(certData).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Error assigning certification', err)
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
