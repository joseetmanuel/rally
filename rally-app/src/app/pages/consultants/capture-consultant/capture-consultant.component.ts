import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConsultantService } from '../../../core/services/consultants/consultant.service';
import { Consultant } from '../../../core/models/consultants/consultant';

@Component({
  selector: 'app-capture-consultant',
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
  templateUrl: './capture-consultant.component.html',
  styleUrls: ['./capture-consultant.component.scss']
})
export class CaptureConsultantComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  readonly participantTypes = ['INTERNO', 'EXTERNO'];
  
  private fb = inject(FormBuilder);
  private consultantService = inject(ConsultantService);
  
  constructor(
    public dialogRef: MatDialogRef<CaptureConsultantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Consultant | null
  ) {
    this.form = this.fb.group({
      full_name: ['', [Validators.required, Validators.maxLength(200)]],
      participant_type: ['INTERNO', [Validators.required]],
      team_number: [1, [Validators.required, Validators.min(1)]],
      consulting_firm_name: ['', [Validators.maxLength(150)]],
      email: ['', [Validators.email, Validators.maxLength(150)]],
      teams_contact: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.form.patchValue({
        full_name: this.data.full_name,
        participant_type: this.data.participant_type,
        team_number: this.data.team_number,
        consulting_firm_name: this.data.consulting_firm_name,
        email: this.data.email,
        teams_contact: this.data.teams_contact
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    // El correo es único en BD: un texto vacío debe viajar como null
    const raw = this.form.value;
    const consultantData: Consultant = {
      ...raw,
      consulting_firm_name: raw.participant_type === 'EXTERNO' ? (raw.consulting_firm_name || null) : null,
      email: raw.email || null,
      teams_contact: raw.teams_contact || null
    };

    if (this.isEditMode && this.data?.id) {
      this.consultantService.updateConsultant(this.data.id, consultantData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error updating consultant', err)
      });
    } else {
      this.consultantService.createConsultant(consultantData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error creating consultant', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
