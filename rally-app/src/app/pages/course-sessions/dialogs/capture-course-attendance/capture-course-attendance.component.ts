import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { forkJoin } from 'rxjs';

import { CourseAttendanceService } from '../../../../core/services/course-attendances/course-attendance.service';
import { ConsultantService } from '../../../../core/services/consultants/consultant.service';
import { CourseSession } from '../../../../core/models/course-sessions/course-session';
import { Consultant } from '../../../../core/models/consultants/consultant';
import { CourseAttendance } from '../../../../core/models/course-attendances/course-attendance';

@Component({
  selector: 'app-capture-course-attendance',
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
  templateUrl: './capture-course-attendance.component.html',
  styleUrls: ['./capture-course-attendance.component.scss']
})
export class CaptureCourseAttendanceComponent implements OnInit {
  form: FormGroup;
  availableConsultants: Consultant[] = [];
  errorMessage = '';

  private fb = inject(FormBuilder);
  private attendanceService = inject(CourseAttendanceService);
  private consultantService = inject(ConsultantService);

  constructor(
    public dialogRef: MatDialogRef<CaptureCourseAttendanceComponent>,
    @Inject(MAT_DIALOG_DATA) public session: CourseSession
  ) {
    this.form = this.fb.group({
      consultant_id: [null, [Validators.required]],
      points_obtained: [null, [Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Regla de negocio: el instructor no asiste a su propio curso y nadie se registra dos veces
    forkJoin({
      consultants: this.consultantService.getConsultants(),
      attendances: this.attendanceService.getCourseAttendances(this.session.id!)
    }).subscribe({
      next: ({ consultants, attendances }) => {
        const registered = new Set(attendances.map(a => a.consultant_id));
        this.availableConsultants = consultants.filter(
          c => c.id !== this.session.instructor_consultant_id && !registered.has(c.id!)
        );
      },
      error: (err) => console.error('Error loading consultants', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const value = this.form.value;
    const attendance: CourseAttendance = {
      course_session_id: this.session.id!,
      consultant_id: value.consultant_id,
      points_obtained: value.points_obtained ?? 0,
      notes: value.notes || undefined
    };

    this.attendanceService.createCourseAttendance(attendance).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.errorMessage = err?.error?.error || 'No se pudo registrar la asistencia';
        console.error('Error creating attendance', err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
