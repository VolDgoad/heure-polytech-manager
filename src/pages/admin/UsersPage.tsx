
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { User, UserRole, TeacherGrade, Department } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Pencil, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  email: z.string().email({ message: "L'adresse e-mail est invalide" }),
  first_name: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  last_name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  role: z.enum(['enseignant', 'chef_departement', 'directrice_etudes', 'scolarite', 'admin']),
  department_id: z.string().optional(),
  grade: z.enum([
    'Professeur Titulaire des Universités',
    'Maitre de Conférences Assimilé',
    'Maitre de Conférences Assimilé Stagiaire',
    'Maitre de Conférences Titulaire',
    'Maitre-assistant',
    'Assistant de Deuxième Classe',
    'Assistant dispensant des Cours Magistraux',
    'Assistant ne dispensant pas de Cours Magistraux'
  ]).optional(),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }).optional(),
});

const roleLabels: Record<UserRole, string> = {
  enseignant: 'Enseignant',
  chef_departement: 'Chef de département',
  directrice_etudes: 'Directrice des études',
  scolarite: 'Scolarité',
  admin: 'Administrateur'
};

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      role: "enseignant" as UserRole,
      department_id: undefined,
      grade: undefined,
      password: "",
    },
  });
  
  useEffect(() => {
    if (dialogMode === 'edit' && currentUser) {
      form.reset({
        email: currentUser.email,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        role: currentUser.role,
        department_id: currentUser.department_id || undefined,
        grade: currentUser.grade || undefined,
        password: undefined,
      });
    } else {
      form.reset({
        email: "",
        first_name: "",
        last_name: "",
        role: "enseignant",
        department_id: undefined,
        grade: undefined,
        password: "",
      });
    }
  }, [dialogMode, currentUser, form]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          departments(name)
        `)
        .order('last_name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
    }
  };
  
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);
  
  const handleOpenDialog = (mode: 'add' | 'edit', user?: User) => {
    setDialogMode(mode);
    setCurrentUser(user || null);
    setDialogOpen(true);
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (dialogMode === 'add') {
        // Create a new user through Supabase Auth
        if (!values.password) {
          toast.error("Le mot de passe est requis pour créer un nouvel utilisateur");
          return;
        }
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              first_name: values.first_name,
              last_name: values.last_name,
              role: values.role,
            }
          }
        });
        
        if (authError) throw authError;
        
        // Update additional fields in the profile
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              department_id: values.department_id,
              grade: values.grade,
            })
            .eq('id', authData.user.id);
            
          if (profileError) throw profileError;
        }
        
        toast.success("Utilisateur créé avec succès");
      } else if (dialogMode === 'edit' && currentUser) {
        // Update profile fields
        const updateData: any = {
          first_name: values.first_name,
          last_name: values.last_name,
          role: values.role,
          department_id: values.department_id,
          grade: values.grade,
        };
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', currentUser.id);
          
        if (profileError) throw profileError;
        
        // Update email if needed (admin only)
        if (values.email !== currentUser.email && user?.role === 'admin') {
          const { error: emailError } = await supabase.auth.admin.updateUserById(
            currentUser.id,
            { email: values.email }
          );
          
          if (emailError) throw emailError;
        }
        
        // Update password if provided
        if (values.password) {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            currentUser.id,
            { password: values.password }
          );
          
          if (passwordError) throw passwordError;
        }
        
        toast.success("Utilisateur mis à jour avec succès");
      }
      
      setDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action est irréversible.")) {
      return;
    }
    
    try {
      // Delete the user from Supabase Auth (this will cascade to profiles via trigger)
      const { error } = await supabase.auth.admin.deleteUser(id);
        
      if (error) throw error;
      toast.success("Utilisateur supprimé avec succès");
      fetchUsers();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };
  
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      roleLabels[user.role].toLowerCase().includes(searchLower)
    );
  });
  
  if (!user || !['admin', 'directrice_etudes'].includes(user.role)) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-lg text-gray-600">
          Vous n'avez pas les droits pour accéder à cette page.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Créer, modifier ou supprimer des utilisateurs
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog('add')}>
              <UserPlus className="mr-2 h-4 w-4" /> Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'add' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="exemple@polytech.edu" 
                          {...field} 
                          disabled={dialogMode === 'edit' && user?.role !== 'admin'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {(dialogMode === 'add' || (dialogMode === 'edit' && user?.role === 'admin')) && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mot de passe
                          {dialogMode === 'edit' && (
                            <span className="text-xs text-gray-500 ml-2">
                              (laisser vide pour ne pas modifier)
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="******" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rôle</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="enseignant">Enseignant</SelectItem>
                            <SelectItem value="chef_departement">Chef de département</SelectItem>
                            <SelectItem value="directrice_etudes">Directrice des études</SelectItem>
                            <SelectItem value="scolarite">Scolarité</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="department_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Département</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un département" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Non spécifié</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade (pour les enseignants)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Non spécifié</SelectItem>
                          <SelectItem value="Professeur Titulaire des Universités">
                            Professeur Titulaire des Universités
                          </SelectItem>
                          <SelectItem value="Maitre de Conférences Assimilé">
                            Maitre de Conférences Assimilé
                          </SelectItem>
                          <SelectItem value="Maitre de Conférences Assimilé Stagiaire">
                            Maitre de Conférences Assimilé Stagiaire
                          </SelectItem>
                          <SelectItem value="Maitre de Conférences Titulaire">
                            Maitre de Conférences Titulaire
                          </SelectItem>
                          <SelectItem value="Maitre-assistant">
                            Maitre-assistant
                          </SelectItem>
                          <SelectItem value="Assistant de Deuxième Classe">
                            Assistant de Deuxième Classe
                          </SelectItem>
                          <SelectItem value="Assistant dispensant des Cours Magistraux">
                            Assistant dispensant des Cours Magistraux
                          </SelectItem>
                          <SelectItem value="Assistant ne dispensant pas de Cours Magistraux">
                            Assistant ne dispensant pas de Cours Magistraux
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">Annuler</Button>
                  </DialogClose>
                  <Button type="submit">
                    {dialogMode === 'add' ? 'Ajouter' : 'Mettre à jour'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          icon={<Search className="h-4 w-4 opacity-50" />}
        />
        <Button variant="outline" onClick={() => setSearchTerm('')}>
          Réinitialiser
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <p>Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{roleLabels[user.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.departments?.name || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {user.grade || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenDialog('edit', user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
