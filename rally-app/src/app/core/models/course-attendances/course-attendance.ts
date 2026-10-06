export interface CourseAttendance {
  id?: number;
  course_session_id: number;
  consultant_id: number;
  points_obtained?: number;
  notes?: string;

  // related
  consultant?: { id: number; full_name: string } | null;
}
