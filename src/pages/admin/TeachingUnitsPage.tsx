
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeachingUnit {
  id: string;
  name: string;
  semester_id: string;
  created_at: string;
  updated_at: string;
  semesters?: {
    id: string;
    name: string;
  };
}

const fetchTeachingUnits = async () => {
  const { data, error } = await supabase
    .from("teaching_units")
    .select("id,name,created_at,updated_at,semester_id,semesters(id,name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const fetchSemesters = async () => {
  const { data, error } = await supabase
    .from("semesters")
    .select("id,name")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
};

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  semester_id: z.string().min(1, "Veuillez sélectionner un semestre"),
});

type FormValues = z.infer<typeof formSchema>;

const TeachingUnitsPage = () => {
  const queryClient = useQueryClient();
  const { data: teachingUnits, isLoading, error } = useQuery({
    queryKey: ["admin-teaching-units"],
    queryFn: fetchTeachingUnits,
  });

  const { data: semesters } = useQuery({
    queryKey: ["admin-semesters"],
    queryFn: fetchSemesters,
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState<TeachingUnit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<TeachingUnit | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      semester_id: "",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      semester_id: "",
    });
  };

  const createUnitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("teaching_units")
        .insert([{
          name: values.name,
          semester_id: values.semester_id
        }])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teaching-units"] });
      setShowAddDialog(false);
      resetForm();
      toast.success("UE créée avec succès");
    },
    onError: (error) => {
      console.error("Error creating teaching unit:", error);
      toast.error("Erreur lors de la création de l'UE");
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: async (values: FormValues & { id: string }) => {
      const { id, ...unitData } = values;
      const { data, error } = await supabase
        .from("teaching_units")
        .update({
          name: unitData.name,
          semester_id: unitData.semester_id
        })
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teaching-units"] });
      setEditingUnit(null);
      resetForm();
      toast.success("UE mise à jour avec succès");
    },
    onError: (error) => {
      console.error("Error updating teaching unit:", error);
      toast.error("Erreur lors de la mise à jour de l'UE");
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teaching_units").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teaching-units"] });
      setDeletingUnit(null);
      toast.success("UE supprimée avec succès");
    },
    onError: (error) => {
      console.error("Error deleting teaching unit:", error);
      toast.error("Erreur lors de la suppression de l'UE");
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editingUnit) {
      updateUnitMutation.mutate({ ...values, id: editingUnit.id });
    } else {
      createUnitMutation.mutate(values);
    }
  };

  const handleEdit = (unit: TeachingUnit) => {
    setEditingUnit(unit);
    form.reset({
      name: unit.name,
      semester_id: unit.semester_id,
    });
  };

  const handleDelete = (unit: TeachingUnit) => {
    setDeletingUnit(unit);
  };

  const confirmDelete = () => {
    if (deletingUnit) {
      deleteUnitMutation.mutate(deletingUnit.id);
    }
  };

  const closeEditDialog = () => {
    setEditingUnit(null);
    resetForm();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Unités d'Enseignement (UE)</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2" size={16} />
          Nouvelle UE
        </Button>
      </div>

      {isLoading && <div className="text-center py-4">Chargement...</div>}
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error.message}
        </div>
      )}

      {teachingUnits && teachingUnits.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          Aucune UE trouvée. Cliquez sur "Nouvelle UE" pour en ajouter une.
        </div>
      )}

      {teachingUnits && teachingUnits.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachingUnits.map((unit: TeachingUnit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.semesters?.name || "-"}</TableCell>
                  <TableCell>
                    {new Date(unit.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(unit)}
                    >
                      <Edit size={16} />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(unit)}
                    >
                      <Trash2 size={16} />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Teaching Unit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle UE</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'UE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semestre</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un semestre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {semesters?.map((semester: any) => (
                          <SelectItem key={semester.id} value={semester.id}>
                            {semester.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button" onClick={resetForm}>
                    Annuler
                  </Button>
                </DialogClose>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Teaching Unit Dialog */}
      <Dialog open={!!editingUnit} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'UE</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'UE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semestre</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un semestre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {semesters?.map((semester: any) => (
                          <SelectItem key={semester.id} value={semester.id}>
                            {semester.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button" onClick={closeEditDialog}>
                    Annuler
                  </Button>
                </DialogClose>
                <Button type="submit">Mettre à jour</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingUnit}
        onOpenChange={(open) => !open && setDeletingUnit(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'UE "{deletingUnit?.name}" ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeachingUnitsPage;
