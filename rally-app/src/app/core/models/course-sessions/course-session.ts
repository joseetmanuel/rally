export interface CourseSession {
  id?: number;
  certification_id: number;
  instructor_consultant_id: number;
  session_date: string;
  title?: string;
  notes?: string;

  // related
  certification?: { id: number; vendor: string; name: string } | null;
  instructor?: { id: number; full_name: string } | null;
}
