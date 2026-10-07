import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConsultingFirmService } from '../../../core/services/consulting-firms/consulting-firm.service';
import { ConsultingFirm } from '../../../core/models/consulting-firms/consulting-firm';

function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.length > 0 && value.trim().length === 0
    ? { required: true }
    : null;
}

@Component({
  selector: 'app-capture-consulting-firm',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './capture-consulting-firm.component.html',
  styleUrls: ['./capture-consulting-firm.component.scss']
})
export class CaptureConsultingFirmComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private consultingFirmService = inject(ConsultingFirmService);

  constructor(
    public dialogRef: MatDialogRef<CaptureConsultingFirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConsultingFirm | null
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, notBlank]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.form.patchValue({ name: this.data.name });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.errorMessage = '';

    const firmData: ConsultingFirm = { name: String(this.form.value.name).trim() };

    if (this.isEditMode && this.data?.id) {
      this.consultingFirmService.updateConsultingFirm(this.data.id, firmData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => this.handleError(err, 'No se pudo actualizar la consultora.')
      });
    } else {
      this.consultingFirmService.createConsultingFirm(firmData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => this.handleError(err, 'No se pudo crear la consultora.')
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private handleError(err: any, fallback: string): void {
    console.error('Error saving consulting firm', err);
    this.errorMessage = err?.error?.error || fallback;
  }
}
