import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CertificationService } from '../../../core/services/certifications/certification.service';
import { CertificationTypeService } from '../../../core/services/certification-types/certification-type.service';
import { Certification } from '../../../core/models/certifications/certification';
import { CertificationType } from '../../../core/models/certification-types/certification-type';

@Component({
  selector: 'app-capture-certification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './capture-certification.component.html',
  styleUrls: ['./capture-certification.component.scss']
})
export class CaptureCertificationComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  certificationTypes: CertificationType[] = [];
  
  private fb = inject(FormBuilder);
  private certificationService = inject(CertificationService);
  private certificationTypeService = inject(CertificationTypeService);
  
  constructor(
    public dialogRef: MatDialogRef<CaptureCertificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Certification | null
  ) {
    this.form = this.fb.group({
      vendor: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      certification_type_id: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadTypes();

    if (this.data) {
      this.isEditMode = true;
      this.form.patchValue({
        vendor: this.data.vendor,
        name: this.data.name,
        certification_type_id: this.data.certification_type_id
      });
    }
  }

  loadTypes(): void {
    this.certificationTypeService.getCertificationTypes().subscribe({
      next: (data) => this.certificationTypes = data,
      error: (err) => console.error('Error loading certification types', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const certData: Certification = this.form.value;

    if (this.isEditMode && this.data?.id) {
      this.certificationService.updateCertification(this.data.id, certData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error updating certification', err)
      });
    } else {
      this.certificationService.createCertification(certData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error creating certification', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
