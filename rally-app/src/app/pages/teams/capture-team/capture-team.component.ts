import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TeamService } from '../../../core/services/teams/team.service';
import { Team } from '../../../core/models/teams/team';

function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.length > 0 && value.trim().length === 0
    ? { required: true }
    : null;
}

@Component({
  selector: 'app-capture-team',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './capture-team.component.html',
  styleUrls: ['./capture-team.component.scss']
})
export class CaptureTeamComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);

  constructor(
    public dialogRef: MatDialogRef<CaptureTeamComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Team | null
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

    const teamData: Team = { name: String(this.form.value.name).trim() };

    if (this.isEditMode && this.data?.id) {
      this.teamService.updateTeam(this.data.id, teamData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => this.handleError(err, 'No se pudo actualizar el equipo.')
      });
    } else {
      this.teamService.createTeam(teamData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => this.handleError(err, 'No se pudo crear el equipo.')
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private handleError(err: any, fallback: string): void {
    console.error('Error saving team', err);
    this.errorMessage = err?.error?.error || fallback;
  }
}
