import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConsultantService } from '../../../core/services/consultants/consultant.service';
import { TeamService } from '../../../core/services/teams/team.service';
import { ConsultingFirmService } from '../../../core/services/consulting-firms/consulting-firm.service';
import { Consultant } from '../../../core/models/consultants/consultant';
import { Team } from '../../../core/models/teams/team';
import { ConsultingFirm } from '../../../core/models/consulting-firms/consulting-firm';

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
  teams: Team[] = [];
  consultingFirms: ConsultingFirm[] = [];
  errorMessage = '';
  
  private fb = inject(FormBuilder);
  private consultantService = inject(ConsultantService);
  private teamService = inject(TeamService);
  private consultingFirmService = inject(ConsultingFirmService);
  
  constructor(
    public dialogRef: MatDialogRef<CaptureConsultantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Consultant | null
  ) {
    this.form = this.fb.group({
      full_name: ['', [Validators.required, Validators.maxLength(200)]],
      participant_type: ['INTERNO', [Validators.required]],
      team_id: [null, [Validators.required]],
      consulting_firm_id: [null],
      email: ['', [Validators.email, Validators.maxLength(150)]],
      teams_contact: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.teamService.getTeams().subscribe({
      next: (data) => this.teams = data,
      error: (err) => console.error('Error loading teams', err)
    });
    this.consultingFirmService.getConsultingFirms().subscribe({
      next: (data) => this.consultingFirms = data,
      error: (err) => console.error('Error loading consulting firms', err)
    });

    if (this.data) {
      this.isEditMode = true;
      this.form.patchValue({
        full_name: this.data.full_name,
        participant_type: this.data.participant_type,
        team_id: this.data.team_id,
        consulting_firm_id: this.data.consulting_firm_id ?? null,
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
      // La consultora sólo aplica a participantes externos
      consulting_firm_id: raw.participant_type === 'EXTERNO' ? (raw.consulting_firm_id ?? null) : null,
      email: raw.email || null,
      teams_contact: raw.teams_contact || null
    };

    if (this.isEditMode && this.data?.id) {
      this.consultantService.updateConsultant(this.data.id, consultantData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => this.showError(err, 'No se pudo actualizar el consultor')
      });
    } else {
      this.consultantService.createConsultant(consultantData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => this.showError(err, 'No se pudo crear el consultor')
      });
    }
  }

  private showError(err: any, fallback: string): void {
    this.errorMessage = err?.error?.error || fallback;
    console.error(fallback, err);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
