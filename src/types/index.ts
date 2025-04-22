
export type DeclarationStatus = 'brouillon' | 'soumise' | 'verifiee' | 'validee' | 'rejetee' | 'approuvee';

export interface Declaration {
  id: string;
  teacher_id: string;
  course_element_id: string;
  department_id: string;
  cm_hours: number;
  td_hours: number;
  tp_hours: number;
  declaration_date: string;
  status: DeclarationStatus;
  payment_status: PaymentStatus;
  verified_by?: string;
  verified_at?: string;
  validated_by?: string;
  validated_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  
  // Client-side computed properties
  departmentName?: string;
  teacherName?: string;
  totalHours?: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department_id?: string;
  grade?: TeacherGrade;
  photo_url?: string;
  signature_url?: string;
  created_at: string;
  updated_at: string;
}
