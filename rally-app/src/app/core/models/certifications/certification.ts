export interface Certification {
  id?: number;
  vendor: string;
  name: string;
  certification_type_id: number;
  type?: { id: number; code: string; points_base: number } | null;
}
