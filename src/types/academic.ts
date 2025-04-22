
export interface Program {
  id: string;
  name: string;
  department_id: string;
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: string;
  name: string;
  program_id: string;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string;
  name: string;
  level_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeachingUnit {
  id: string;
  name: string;
  semester_id: string;
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
