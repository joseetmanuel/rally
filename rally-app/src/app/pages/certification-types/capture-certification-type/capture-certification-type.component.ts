import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CertificationTypeService } from '../../../core/services/certification-types/certification-type.service';
import { CertificationType } from '../../../core/models/certification-types/certification-type';

@Component({
  selector: 'app-capture-certification-type',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './capture-certification-type.component.html',
  styleUrls: ['./capture-certification-type.component.scss']
})
export class CaptureCertificationTypeComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  
  private fb = inject(FormBuilder);
  private certificationTypeService = inject(CertificationTypeService);
  
  constructor(
    public dialogRef: MatDialogRef<CaptureCertificationTypeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CertificationType | null
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(30)]],
      points_base: [0, [Validators.required, Validators.min(0)]],
      points_for_course: [0, [Validators.required, Validators.min(0)]],
      points_for_instructor: [0, [Validators.required, Validators.min(0)]],
      points_for_student: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.form.patchValue({
        code: this.data.code,
        points_base: this.data.points_base,
        points_for_course: this.data.points_for_course,
        points_for_instructor: this.data.points_for_instructor,
        points_for_student: this.data.points_for_student
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const typeData: CertificationType = this.form.value;

    if (this.isEditMode && this.data?.id) {
      this.certificationTypeService.updateCertificationType(this.data.id, typeData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error updating certification type', err)
      });
    } else {
      this.certificationTypeService.createCertificationType(typeData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error creating certification type', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
