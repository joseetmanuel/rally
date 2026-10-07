import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { RallyRulesService } from '../../../core/services/rally-rules/rally-rules.service';
import { ConsultantExtraPointService } from '../../../core/services/consultant-extra-points/consultant-extra-point.service';
import { ConsultantService } from '../../../core/services/consultants/consultant.service';
import { ExtraPointReasonTypeService } from '../../../core/services/extra-point-reason-types/extra-point-reason-type.service';

import { ConsultantExtraPoint } from '../../../core/models/consultant-extra-points/consultant-extra-point';
import { Consultant } from '../../../core/models/consultants/consultant';
import { ExtraPointReasonType } from '../../../core/models/extra-point-reasons/extra-point-reason';

@Component({
  selector: 'app-capture-extra-point',
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
  templateUrl: './capture-extra-point.component.html',
  styleUrls: ['./capture-extra-point.component.scss']
})
export class CaptureExtraPointComponent implements OnInit {
  form: FormGroup;
  consultants: Consultant[] = [];
  reasonTypes: ExtraPointReasonType[] = [];
  errorMessage = '';

  private rules = inject(RallyRulesService);
  readonly minDate = this.rules.start();
  readonly maxDate = this.rules.cutoff();
  readonly rangeText = this.rules.rangeText();
  private fb = inject(FormBuilder);
  private extraPointService = inject(ConsultantExtraPointService);
  private consultantService = inject(ConsultantService);
  private reasonTypeService = inject(ExtraPointReasonTypeService);
  public dialogRef = inject(MatDialogRef<CaptureExtraPointComponent>);

  constructor() {
    this.form = this.fb.group({
      consultant_id: [null, [Validators.required]],
      extra_point_reason_type_id: [null, [Validators.required]],
      points: [null, [Validators.required, Validators.min(0)]],
      awarded_at: [this.today(), [Validators.required, this.rules.dateValidator()]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.consultantService.getConsultants().subscribe({
      next: (data) => this.consultants = data,
      error: (err) => console.error('Error loading consultants', err)
    });
    this.reasonTypeService.getReasonTypes().subscribe({
      next: (data) => this.reasonTypes = data,
      error: (err) => console.error('Error loading reason types', err)
    });
  }

  private today(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.errorMessage = '';
    const value = this.form.value;
    const payload: ConsultantExtraPoint = {
      consultant_id: value.consultant_id,
      extra_point_reason_type_id: value.extra_point_reason_type_id,
      points: Number(value.points),
      awarded_at: String(value.awarded_at).substring(0, 10)
    };
    if (value.notes) {
      payload.notes = value.notes;
    }

    this.extraPointService.createExtraPoint(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.errorMessage = err?.error?.error || 'Error al registrar el punto extra';
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
