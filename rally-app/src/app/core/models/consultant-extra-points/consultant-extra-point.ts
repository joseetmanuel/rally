export interface ConsultantExtraPoint {
  id?: number;
  consultant_id: number;
  extra_point_reason_type_id: number;
  points: number;
  awarded_at: string;
  notes?: string | null;
  course_session_id?: number | null;
  consultant_certification_id?: number | null;
  consultant?: { id: number; full_name: string } | null;
  reason_type?: { id: number; code: string; name: string } | null;
}
