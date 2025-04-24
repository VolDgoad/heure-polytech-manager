import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { UserCog, Lock, UserPlus } from 'lucide-react';
import UserForm, { UserFormData } from '@/components/admin/UserForm';

interface DepartmentOption {
  id: string;
  name: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('enseignant');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('none');
  const [passwordResetDialog, setPasswordResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles: {value: UserRole, label: string}[] = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'directrice_etudes', label: 'Directrice des Études' },
    { value: 'chef_departement', label: 'Chef de Département' },
    { value: 'enseignant', label: 'Enseignant' },
    { value: 'scolarite', label: 'Service Scolarité' }
  ];

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`*, departments(name)`)
        .order('last_name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des utilisateurs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des départements: ${error.message}`);
    }
  };

  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    setSelectedRole(user.role);
    setSelectedDepartment(user.department_id || 'none');
    setDialogOpen(true);
  };

  const openPasswordReset = (user: User) => {
    setCurrentUser(user);
    setResetEmail(user.email);
    setPasswordResetDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: selectedRole,
          department_id: selectedDepartment === 'none' ? null : selectedDepartment,
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      toast.success('Utilisateur mis à jour avec succès');
      setDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  };

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      toast.success('Email de réinitialisation envoyé avec succès');
      setPasswordResetDialog(false);
    } catch (error: any) {
      toast.error(`Erreur lors de l'envoi de l'email: ${error.message}`);
    }
  };

  const handleCreateUser = async (userData: UserFormData) => {
    try {
      setIsSubmitting(true);
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        }
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: userData.role,
          department_id: userData.department_id || null,
          grade: userData.grade,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast.success('Utilisateur créé avec succès');
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(`Erreur lors de la création: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleName = (role: UserRole) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <UserForm 
              onSubmit={handleCreateUser}
              departments={departments}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleName(user.role)}</TableCell>
                      <TableCell>
                        {user.department_id 
                          ? departments.find(d => d.id === user.department_id)?.name || '—'
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openPasswordReset(user)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          {currentUser && (
            <div className="py-4 space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium">Utilisateur</div>
                <div className="p-2 bg-gray-100 rounded">
                  {currentUser.first_name} {currentUser.last_name} ({currentUser.email})
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rôle
                </label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as UserRole)}
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
                <label className="block text-sm font-medium mb-2">
                  Département
                </label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateUser}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordResetDialog} onOpenChange={setPasswordResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Un email de réinitialisation de mot de passe sera envoyé à :
            </p>
            <div className="p-2 bg-gray-100 rounded font-medium">
              {resetEmail}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordResetDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleResetPassword}>
              Envoyer l'email de réinitialisation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
