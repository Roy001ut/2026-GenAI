export interface Procedure {
  name: string;
  code: string | null;
  charge: number | null;
  quantity: number;
  category: string;
}

export interface MedicalData {
  patient_name: string | null;
  provider: string | null;
  date_of_service: string | null;
  total_amount: number | null;
  procedures: Procedure[];
  diagnoses: string[];
  medications: string[];
  insurance_adjustments: number | null;
  amount_due: number | null;
}

export interface Explanations {
  overall_summary: string;
  procedure_explanations: Record<string, string>;
  diagnosis_explanations: Record<string, string>;
  billing_tip: string;
}

export interface Flag {
  type: 'duplicate' | 'high_cost' | 'math_error';
  severity: 'warning' | 'info' | 'error';
  message: string;
  procedure: string | null;
}

export interface AnalysisResult {
  medical_data: MedicalData;
  explanations: Explanations;
  flags: Flag[];
  filename: string;
}
