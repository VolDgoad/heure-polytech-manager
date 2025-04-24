
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeacherGrade, UserRole } from '@/types';

interface DepartmentOption {
  id: string;
  name: string;
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  departments: DepartmentOption[];
  isSubmitting: boolean;
}

export interface UserFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department_id?: string;
  grade?: TeacherGrade;
}

const UserForm = ({ onSubmit, departments, isSubmitting }: UserFormProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'enseignant',
    department_id: undefined,
    grade: undefined,
  });

  const roles: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'directrice_etudes', label: 'Directrice des Études' },
    { value: 'chef_departement', label: 'Chef de Département' },
    { value: 'enseignant', label: 'Enseignant' },
    { value: 'scolarite', label: 'Service Scolarité' }
  ];

  const grades = [
    'Professeur Titulaire des Universités',
    'Maitre de Conférences Assimilé',
    'Maitre de Conférences Assimilé Stagiaire',
    'Maitre de Conférences Titulaire',
    'Maitre-assistant',
    'Assistant de Deuxième Classe',
    'Assistant dispensant des Cours Magistraux',
    'Assistant ne dispensant pas de Cours Magistraux'
  ] as TeacherGrade[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="password">Mot de Passe</Label>
        <Input
          id="password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="first_name">Prénom</Label>
        <Input
          id="first_name"
          required
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="last_name">Nom</Label>
        <Input
          id="last_name"
          required
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="role">Rôle</Label>
        <Select
          value={formData.role}
          onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="department">Département</Label>
        <Select
          value={formData.department_id || "none"}
          onValueChange={(value) => setFormData({ ...formData, department_id: value === "none" ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un département" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun département</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.role === 'enseignant' && (
        <div>
          <Label htmlFor="grade">Grade</Label>
          <Select
            value={formData.grade || "none"}
            onValueChange={(value) => setFormData({ ...formData, grade: value === "none" ? undefined : value as TeacherGrade })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun grade</SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Création en cours..." : "Créer l'utilisateur"}
      </Button>
    </form>
  );
};

export default UserForm;
