
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, UserCog, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Department {
  id: string;
  name: string;
}

const USER_ROLES = [
  { value: 'enseignant', label: 'Enseignant' },
  { value: 'scolarite', label: 'Scolarité' },
  { value: 'chef_departement', label: 'Chef de département' },
  { value: 'directrice_etudes', label: 'Directrice des études' },
  { value: 'admin', label: 'Administrateur' }
];

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserRole, setNewUserRole] = useState("enseignant");
  const [newUserDepartment, setNewUserDepartment] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  
  // Edit user form state
  const [editUserRole, setEditUserRole] = useState("");
  const [editUserDepartment, setEditUserDepartment] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("last_name");

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
        .from("departments")
        .select("id, name")
        .order("name");

      if (error) throw error;
      
      setDepartments(data || []);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const resetNewUserForm = () => {
    setNewUserEmail("");
    setNewUserFirstName("");
    setNewUserLastName("");
    setNewUserRole("enseignant");
    setNewUserDepartment("");
    setNewUserPassword("");
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserFirstName || !newUserLastName || !newUserRole || !newUserPassword) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!newUserEmail.includes("@")) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            first_name: newUserFirstName,
            last_name: newUserLastName,
            role: newUserRole
          }
        }
      });

      if (authError) throw authError;

      // Update the profiles table if needed with department_id
      if (newUserDepartment) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ department_id: newUserDepartment })
          .eq("id", authData.user?.id);

        if (profileError) throw profileError;
      }

      toast.success("Utilisateur créé avec succès");
      resetNewUserForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const updates: any = {};
      
      if (editUserRole) {
        updates.role = editUserRole;
      }
      
      if (editUserDepartment) {
        updates.department_id = editUserDepartment;
      }
      
      if (Object.keys(updates).length === 0) {
        toast.error("Aucune modification n'a été faite");
        return;
      }
      
      updates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success("Utilisateur mis à jour avec succès");
      setSelectedUser(null);
      setEditUserRole("");
      setEditUserDepartment("");
      fetchUsers();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const getDepartmentName = (departmentId: string | null) => {
    if (!departmentId) return "Non assigné";
    const department = departments.find((d) => d.id === departmentId);
    return department ? department.name : "Inconnu";
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'enseignant':
        return <Badge variant="outline">Enseignant</Badge>;
      case 'scolarite':
        return <Badge variant="secondary">Scolarité</Badge>;
      case 'chef_departement':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Chef de département</Badge>;
      case 'directrice_etudes':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Directrice des études</Badge>;
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Administrateur</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des Utilisateurs</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-polytech-primary hover:bg-polytech-primary/90">
                <UserPlus className="mr-2 h-4 w-4" /> Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    value={newUserFirstName}
                    onChange={(e) => setNewUserFirstName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    value={newUserLastName}
                    onChange={(e) => setNewUserLastName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Rôle
                  </Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    Département
                  </Label>
                  <Select value={newUserDepartment} onValueChange={setNewUserDepartment}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non assigné</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button onClick={handleCreateUser} className="bg-polytech-primary hover:bg-polytech-primary/90">
                  Créer l'utilisateur
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement des utilisateurs...</p>
          ) : users.length === 0 ? (
            <p>Aucun utilisateur trouvé.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getDepartmentName(user.department_id)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              setSelectedUser(user);
                              setEditUserRole(user.role);
                              setEditUserDepartment(user.department_id || "");
                            }}
                          >
                            <UserCog className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Modifier l'utilisateur: {user.first_name} {user.last_name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-role" className="text-right">
                                Rôle
                              </Label>
                              <Select 
                                value={editUserRole} 
                                onValueChange={setEditUserRole}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                  {USER_ROLES.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-department" className="text-right">
                                Département
                              </Label>
                              <Select
                                value={editUserDepartment}
                                onValueChange={setEditUserDepartment}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Sélectionner un département" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Non assigné</SelectItem>
                                  {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                      {dept.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button 
                              onClick={handleUpdateUser}
                              className="bg-polytech-primary hover:bg-polytech-primary/90"
                            >
                              Mettre à jour
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
