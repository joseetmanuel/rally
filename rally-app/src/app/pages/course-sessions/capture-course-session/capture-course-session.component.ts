import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CourseSessionService } from '../../../core/services/course-sessions/course-session.service';
import { ConsultantService } from '../../../core/services/consultants/consultant.service';
import { CertificationService } from '../../../core/services/certifications/certification.service';

import { CourseSession } from '../../../core/models/course-sessions/course-session';
import { Consultant } from '../../../core/models/consultants/consultant';
import { Certification } from '../../../core/models/certifications/certification';

@Component({
  selector: 'app-capture-course-session',
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
  templateUrl: './capture-course-session.component.html',
  styleUrls: ['./capture-course-session.component.scss']
})
export class CaptureCourseSessionComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  consultants: Consultant[] = [];
  certifications: Certification[] = [];
  
  private fb = inject(FormBuilder);
  private sessionService = inject(CourseSessionService);
  private consultantService = inject(ConsultantService);
  private certService = inject(CertificationService);
  
  constructor(
    public dialogRef: MatDialogRef<CaptureCourseSessionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CourseSession | null
  ) {
    this.form = this.fb.group({
      certification_id: [null, [Validators.required]],
      instructor_consultant_id: [null, [Validators.required]],
      session_date: ['', [Validators.required]],
      title: ['', [Validators.maxLength(255)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadSelectData();

    if (this.data) {
      this.isEditMode = true;
      this.form.patchValue({
        certification_id: this.data.certification_id,
        instructor_consultant_id: this.data.instructor_consultant_id,
        session_date: this.data.session_date,
        title: this.data.title,
        notes: this.data.notes
      });
    }
  }

  loadSelectData(): void {
    this.consultantService.getConsultants().subscribe({
      next: (data) => this.consultants = data,
      error: (err) => console.error('Error loading consultants', err)
    });
    this.certService.getCertifications().subscribe({
      next: (data) => this.certifications = data,
      error: (err) => console.error('Error loading certifications', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const sessionData: CourseSession = this.form.value;

    if (this.isEditMode && this.data?.id) {
      this.sessionService.updateCourseSession(this.data.id, sessionData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error updating course session', err)
      });
    } else {
      this.sessionService.createCourseSession(sessionData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error creating course session', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
