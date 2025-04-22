
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Department {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const DepartmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDepartment, setNewDepartment] = useState("");
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (error) throw error;
      
      setDepartments(data || []);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) {
      toast.error("Le nom du département ne peut pas être vide");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("departments")
        .insert([{ name: newDepartment.trim() }])
        .select();

      if (error) throw error;

      setDepartments([...(data || []), ...departments]);
      setNewDepartment("");
      toast.success("Département ajouté avec succès");
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editDepartment || !editName.trim()) {
      toast.error("Le nom du département ne peut pas être vide");
      return;
    }

    try {
      const { error } = await supabase
        .from("departments")
        .update({ name: editName.trim(), updated_at: new Date().toISOString() })
        .eq("id", editDepartment.id);

      if (error) throw error;

      setDepartments(
        departments.map((dept) =>
          dept.id === editDepartment.id
            ? { ...dept, name: editName.trim(), updated_at: new Date().toISOString() }
            : dept
        )
      );
      
      setEditDepartment(null);
      setEditName("");
      toast.success("Département mis à jour avec succès");
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("departments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setDepartments(departments.filter((dept) => dept.id !== id));
      toast.success("Département supprimé avec succès");
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des Départements</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-polytech-primary hover:bg-polytech-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un département</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Nom du département"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddDepartment}
                  className="bg-polytech-primary hover:bg-polytech-primary/90"
                >
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement des départements...</p>
          ) : departments.length === 0 ? (
            <p>Aucun département n'a été créé.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>
                      {new Date(department.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(department.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="mr-2"
                            onClick={() => {
                              setEditDepartment(department);
                              setEditName(department.name);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier le département</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <Input
                              placeholder="Nom du département"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button
                              onClick={handleUpdateDepartment}
                              className="bg-polytech-primary hover:bg-polytech-primary/90"
                            >
                              Mettre à jour
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteDepartment(department.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default DepartmentsPage;
