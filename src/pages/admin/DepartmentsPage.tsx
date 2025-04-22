
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Department } from '@/types';
import { Edit, Trash2, Plus } from 'lucide-react';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [departmentName, setDepartmentName] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des départements: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditMode(false);
    setCurrentDepartment(null);
    setDepartmentName('');
    setDialogOpen(true);
  };

  const openEditDialog = (department: Department) => {
    setEditMode(true);
    setCurrentDepartment(department);
    setDepartmentName(department.name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!departmentName.trim()) {
      toast.error('Le nom du département est requis');
      return;
    }

    try {
      if (editMode && currentDepartment) {
        // Update existing department
        const { error } = await supabase
          .from('departments')
          .update({ name: departmentName })
          .eq('id', currentDepartment.id);
        
        if (error) throw error;
        toast.success('Département mis à jour avec succès');
      } else {
        // Create new department
        const { error } = await supabase
          .from('departments')
          .insert({ name: departmentName });
        
        if (error) throw error;
        toast.success('Département créé avec succès');
      }
      
      setDialogOpen(false);
      fetchDepartments();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleDelete = async (departmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce département?')) return;
    
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentId);
      
      if (error) throw error;
      toast.success('Département supprimé avec succès');
      fetchDepartments();
    } catch (error: any) {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Départements</h1>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un département
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Départements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Aucun département trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell>{department.name}</TableCell>
                      <TableCell>
                        {new Date(department.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(department)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(department.id)}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Modifier le département' : 'Ajouter un département'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              Nom du département
            </label>
            <Input
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="Nom du département"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editMode ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
