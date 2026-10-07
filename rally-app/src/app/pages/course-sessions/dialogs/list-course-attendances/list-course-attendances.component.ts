import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CourseAttendanceService } from '../../../../core/services/course-attendances/course-attendance.service';
import { CourseAttendance } from '../../../../core/models/course-attendances/course-attendance';
import { CourseSession } from '../../../../core/models/course-sessions/course-session';
import { CaptureCourseAttendanceComponent } from '../capture-course-attendance/capture-course-attendance.component';
import { ConfirmationService } from '../../../../core/services/confirmation/confirmation.service';
import { AdminSessionService } from '../../../../core/services/admin-session/admin-session.service';

@Component({
  selector: 'app-list-course-attendances',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './list-course-attendances.component.html',
  styleUrls: ['./list-course-attendances.component.scss']
})
export class ListCourseAttendancesComponent implements OnInit {
  attendances: CourseAttendance[] = [];
  get displayedColumns(): string[] {
    return this.admin.isAdmin()
      ? ['consultant', 'points', 'actions']
      : ['consultant', 'points'];
  }
  
  readonly admin = inject(AdminSessionService);
  private attendanceService = inject(CourseAttendanceService);
  private dialog = inject(MatDialog);
  private confirmationService = inject(ConfirmationService);

  constructor(
    public dialogRef: MatDialogRef<ListCourseAttendancesComponent>,
    @Inject(MAT_DIALOG_DATA) public session: CourseSession
  ) {}

  ngOnInit(): void {
    this.loadAttendances();
  }

  loadAttendances(): void {
    this.attendanceService.getCourseAttendances(this.session.id!).subscribe({
      next: (data) => this.attendances = data,
      error: (err) => console.error('Error loading attendances', err)
    });
  }

  openCaptureDialog(): void {
    if (!this.admin.isAdmin()) return;
    const dialogRef = this.dialog.open(CaptureCourseAttendanceComponent, {
      width: '500px',
      data: this.session,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAttendances();
      }
    });
  }

  deleteAttendance(attendance: CourseAttendance): void {
    if (!this.admin.isAdmin()) return;
    if(!attendance.id) return;

    this.confirmationService.openDeleteConfirmation().subscribe(result => {
      if (result) {
        this.attendanceService.deleteCourseAttendance(attendance.id!).subscribe({
          next: () => this.loadAttendances(),
          error: (err) => console.error('Error deleting attendance', err)
        });
      }
    });
  }
}
