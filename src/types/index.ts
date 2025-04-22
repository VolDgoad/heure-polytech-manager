
export type UserRole = 'enseignant' | 'scolarite' | 'chef_departement' | 'directrice';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export type DeclarationStatus = 'draft' | 'submitted' | 'verified' | 'approved' | 'rejected';

export interface CourseSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  courseTitle: string;
  courseType: 'CM' | 'TD' | 'TP';
  hoursCount: number;
  department: string;
  comments?: string;
}

export interface Declaration {
  id: string;
  userId: string;
  userName: string;
  department: string;
  sessions: CourseSession[];
  status: DeclarationStatus;
  totalHours: number;
  createdAt: string;
  updatedAt: string;
  verifiedBy?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface Department {
  id: string;
  name: string;
  head?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
