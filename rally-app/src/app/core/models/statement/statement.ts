import { RankingBreakdown } from '../ranking/ranking-entry';

export type StatementKind = 'certification' | 'course_given' | 'student_bonus' | 'instructor_bonus' | 'extra';

/** Nombre legible de cada tipo de movimiento */
export const KIND_LABELS: Record<StatementKind, string> = {
  certification: 'Certificación',
  course_given: 'Curso impartido',
  student_bonus: 'Bono de alumno',
  instructor_bonus: 'Bono de expositor',
  extra: 'Punto extra'
};

/** Un movimiento del estado de cuenta: de dónde salieron unos puntos */
export interface StatementEntry {
  date: string;
  kind: StatementKind;
  points: number;
  /** Asunto: nombre de la certificación, del curso o motivo del punto extra */
  title: string;
  detail: string;
  /** Saldo acumulado después de este movimiento */
  balance: number;
}

export interface Statement {
  consultant: {
    id: number;
    full_name: string;
    participant_type: 'INTERNO' | 'EXTERNO';
    team: string | null;
    consulting_firm: string | null;
  };
  position: number;
  participants: number;
  total_points: number;
  certifications: number;
  courses_given: number;
  courses_taken: number;
  last_certification_date: string | null;
  breakdown: RankingBreakdown;
  entries: StatementEntry[];
}
