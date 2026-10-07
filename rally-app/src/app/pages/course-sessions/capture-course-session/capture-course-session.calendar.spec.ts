import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CaptureCourseSessionComponent } from './capture-course-session.component';
import { CourseSessionService } from '@services/course-sessions/course-session.service';
import { ConsultantService } from '@services/consultants/consultant.service';
import { CertificationService } from '@services/certifications/certification.service';

describe('CaptureCourseSessionComponent · calendario del Rally', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [CaptureCourseSessionComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: CourseSessionService, useValue: { createCourseSession: jest.fn().mockReturnValue(of({})) } },
        { provide: ConsultantService, useValue: { getConsultants: () => of([]) } },
        { provide: CertificationService, useValue: { getCertifications: () => of([]) } }
      ]
    });
    const fixture = TestBed.createComponent(CaptureCourseSessionComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('rejects a session outside the calendar', () => {
    const component = setup().componentInstance;
    component.form.patchValue({ certification_id: 1, instructor_consultant_id: 2, session_date: '2025-12-31' });
    expect(component.form.get('session_date')?.hasError('beforeStart')).toBe(true);
    component.form.patchValue({ session_date: '2026-12-16' });
    expect(component.form.get('session_date')?.hasError('afterCutoff')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('accepts the limits and any day in between, including a scheduled (future) course', () => {
    const component = setup().componentInstance;
    component.form.patchValue({ certification_id: 1, instructor_consultant_id: 2 });
    for (const day of ['2026-01-01', '2026-12-15', '2026-12-01']) {
      component.form.patchValue({ session_date: day });
      expect(component.form.valid).toBe(true);
    }
  });

  it('limits the date picker to the whole calendar', () => {
    const input = setup().nativeElement.querySelector('input[type=date]') as HTMLInputElement;
    expect([input.min, input.max]).toEqual(['2026-01-01', '2026-12-15']);
  });
});
