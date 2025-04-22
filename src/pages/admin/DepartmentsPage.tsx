
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Department } from '@/types';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du département doit contenir au moins 2 caractères",
  }),
});

const DepartmentsPage = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  
  useEffect(() => {
    if (dialogMode === 'edit' && currentDepartment) {
      form.reset({ name: currentDepartment.name });
    } else {
      form.reset({ name: "" });
    }
  }, [dialogMode, currentDepartment, form]);
  
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
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDepartments();
  }, []);
  
  const handleOpenDialog = (mode: 'add' | 'edit', department?: Department) => {
    setDialogMode(mode);
    setCurrentDepartment(department || null);
    setDialogOpen(true);
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (dialogMode === 'add') {
        const { error } = await supabase
          .from('departments')
          .insert({ name: values.name });
          
        if (error) throw error;
        toast.success("Département créé avec succès");
      } else if (dialogMode === 'edit' && currentDepartment) {
        const { error } = await supabase
          .from('departments')
          .update({ name: values.name })
          .eq('id', currentDepartment.id);
          
        if (error) throw error;
        toast.success("Département mis à jour avec succès");
      }
      
      setDialogOpen(false);
      fetchDepartments();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce département? Cette action est irréversible.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      toast.success("Département supprimé avec succès");
      fetchDepartments();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };
  
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
          <h1 className="text-2xl font-bold">Gestion des Départements</h1>
          <p className="text-muted-foreground">
            Créer, modifier ou supprimer des départements
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog('add')}>
              <Plus className="mr-2 h-4 w-4" /> Nouveau Département
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'add' ? 'Ajouter un département' : 'Modifier le département'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du département</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Informatique" {...field} />
                      </FormControl>
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
      
      {loading ? (
        <div className="flex justify-center py-10">
          <p>Chargement des départements...</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Aucun département trouvé
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>
                      {format(new Date(department.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenDialog('edit', department)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
