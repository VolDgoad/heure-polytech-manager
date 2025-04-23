
export type DeclarationStatus = 'brouillon' | 'soumise' | 'verifiee' | 'validee' | 'rejetee' | 'approuvee';

export type PaymentStatus = 'non_paye' | 'en_cours' | 'paye';

export type UserRole = 'enseignant' | 'chef_departement' | 'directrice_etudes' | 'scolarite' | 'admin';

export type TeacherGrade = 
  | 'Professeur Titulaire des Universités'
  | 'Maitre de Conférences Assimilé'
  | 'Maitre de Conférences Assimilé Stagiaire'
  | 'Maitre de Conférences Titulaire'
  | 'Maitre-assistant'
  | 'Assistant de Deuxième Classe'
  | 'Assistant dispensant des Cours Magistraux'
  | 'Assistant ne dispensant pas de Cours Magistraux';

export interface Declaration {
  id: string;
  teacher_id: string;
  course_element_id: string;
  department_id: string;
  program_id?: string;
  level_id?: string;
  semester_id?: string;
  teaching_unit_id?: string;
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
  course_element_name?: string;
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

export interface Department {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CourseElement {
  id: string;
  name: string;
  teaching_unit_id: string;
  created_at: string;
  updated_at: string;
}

export interface CourseSession {
  id: string;
  date: string;
  duration: number;
  type: 'cm' | 'td' | 'tp';
  location: string;
  description?: string;
  
  // Additional fields from DeclarationForm
  startTime?: string;
  endTime?: string;
  courseTitle?: string;
  courseType?: 'CM' | 'TD' | 'TP';
  hoursCount?: number;
  department?: string;
  comments?: string;
}

// Re-export academic types for backward compatibility
export * from './academic';
