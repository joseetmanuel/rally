import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CourseSessionService } from '../../../core/services/course-sessions/course-session.service';
import { CourseSession } from '../../../core/models/course-sessions/course-session';
import { CaptureCourseSessionComponent } from '../capture-course-session/capture-course-session.component';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';
import { ListCourseAttendancesComponent } from '../dialogs/list-course-attendances/list-course-attendances.component';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

@Component({
  selector: 'app-list-course-sessions',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './list-course-sessions.component.html',
  styleUrls: ['./list-course-sessions.component.scss']
})
export class ListCourseSessionsComponent implements OnInit {
  sessions: CourseSession[] = [];
  get displayedColumns(): string[] {
    return ['title', 'certification', 'instructor', 'date', 'actions'];
  }
  
  readonly admin = inject(AdminSessionService);
  private sessionService = inject(CourseSessionService);
  private dialog = inject(MatDialog);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionService.getCourseSessions().subscribe({
      next: (data) => this.sessions = data,
      error: (err) => console.error('Error loading course sessions', err)
    });
  }

  openCaptureDialog(session?: CourseSession): void {
    if (!this.admin.isAdmin()) return;
    const dialogRef = this.dialog.open(CaptureCourseSessionComponent, {
      width: '500px',
      data: session || null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSessions();
      }
    });
  }
  
  openAttendancesDialog(session: CourseSession): void {
    this.dialog.open(ListCourseAttendancesComponent, {
      width: '700px',
      data: session
    });
  }

  deleteSession(session: CourseSession): void {
    if (!this.admin.isAdmin()) return;
    if(!session.id) return;
    
    this.confirmationService.openDeleteConfirmation().subscribe(result => {
      if (result) {
        this.sessionService.deleteCourseSession(session.id!).subscribe({
          next: () => this.loadSessions(),
          error: (err) => console.error('Error deleting session', err)
        });
      }
    });
  }
}
