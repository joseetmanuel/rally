export interface ConsultantCertification {
  id?: number;
  consultant_id: number;
  certification_id: number;
  obtained_at: string;
  reimbursement_amount?: number;
  paid_with_own_resources?: boolean;
  reimbursement_registered?: boolean;
  reimbursement_registered_at?: string;
  notes?: string;
  
  // related
  certification?: any;
}
