import type { StatementEntry } from '../statement/statement';

export interface RankingBreakdown {
  certifications: number;
  courses_given: number;
  student_bonus: number;
  instructor_bonus: number;
  extra: number;
}

export interface RankingEntry {
  position: number;
  consultant_id: number;
  full_name: string;
  team: string | null;
  certifications: number;
  courses_given: number;
  courses_taken: number;
  total_points: number;
  last_certification_date: string | null;
  breakdown: RankingBreakdown;
  /** Movimientos de puntos; sólo viene con getRanking(true) */
  entries?: StatementEntry[];
}
