
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

interface CourseElement {
  id: string;
  name: string;
  teaching_unit_id: string;
  created_at: string;
  updated_at: string;
  teaching_units?: {
    id: string;
    name: string;
  };
}

const fetchCourseElements = async () => {
  const { data, error } = await supabase
    .from("course_elements")
    .select("id,name,created_at,updated_at,teaching_unit_id,teaching_units(id,name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const fetchTeachingUnits = async () => {
  const { data, error } = await supabase
    .from("teaching_units")
    .select("id,name")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
};

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  teaching_unit_id: z.string().min(1, "Veuillez sélectionner une UE"),
});

type FormValues = z.infer<typeof formSchema>;

const CourseElementsPage = () => {
  const queryClient = useQueryClient();
  const { data: courseElements, isLoading, error } = useQuery({
    queryKey: ["admin-course-elements"],
    queryFn: fetchCourseElements,
  });

  const { data: teachingUnits } = useQuery({
    queryKey: ["admin-teaching-units-select"],
    queryFn: fetchTeachingUnits,
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingElement, setEditingElement] = useState<CourseElement | null>(null);
  const [deletingElement, setDeletingElement] = useState<CourseElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      teaching_unit_id: "",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      teaching_unit_id: "",
    });
  };

  const createElementMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("course_elements")
        .insert([{
          name: values.name,
          teaching_unit_id: values.teaching_unit_id
        }])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-elements"] });
      setShowAddDialog(false);
      resetForm();
      toast.success("EC créé avec succès");
    },
    onError: (error) => {
      console.error("Error creating course element:", error);
      toast.error("Erreur lors de la création de l'EC");
    },
  });

  const updateElementMutation = useMutation({
    mutationFn: async (values: FormValues & { id: string }) => {
      const { id, ...elementData } = values;
      const { data, error } = await supabase
        .from("course_elements")
        .update({
          name: elementData.name,
          teaching_unit_id: elementData.teaching_unit_id
        })
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-elements"] });
      setEditingElement(null);
      resetForm();
      toast.success("EC mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Error updating course element:", error);
      toast.error("Erreur lors de la mise à jour de l'EC");
    },
  });

  const deleteElementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("course_elements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-elements"] });
      setDeletingElement(null);
      toast.success("EC supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting course element:", error);
      toast.error("Erreur lors de la suppression de l'EC");
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editingElement) {
      updateElementMutation.mutate({ ...values, id: editingElement.id });
    } else {
      createElementMutation.mutate(values);
    }
  };

  const handleEdit = (element: CourseElement) => {
    setEditingElement(element);
    form.reset({
      name: element.name,
      teaching_unit_id: element.teaching_unit_id,
    });
  };

  const handleDelete = (element: CourseElement) => {
    setDeletingElement(element);
  };

  const confirmDelete = () => {
    if (deletingElement) {
      deleteElementMutation.mutate(deletingElement.id);
    }
  };

  const closeEditDialog = () => {
    setEditingElement(null);
    resetForm();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Éléments Constitutifs (EC)</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2" size={16} />
          Nouvel EC
        </Button>
      </div>

      {isLoading && <div className="text-center py-4">Chargement...</div>}
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error.message}
        </div>
      )}

      {courseElements && courseElements.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          Aucun EC trouvé. Cliquez sur "Nouvel EC" pour en ajouter un.
        </div>
      )}

      {courseElements && courseElements.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Unité d'Enseignement</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseElements.map((element: CourseElement) => (
                <TableRow key={element.id}>
                  <TableCell className="font-medium">{element.name}</TableCell>
                  <TableCell>{element.teaching_units?.name || "-"}</TableCell>
                  <TableCell>
                    {new Date(element.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(element)}
                    >
                      <Edit size={16} />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(element)}
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

      {/* Add Course Element Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel EC</DialogTitle>
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
                      <Input placeholder="Nom de l'EC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teaching_unit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité d'Enseignement</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une UE" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachingUnits?.map((unit: any) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
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

      {/* Edit Course Element Dialog */}
      <Dialog open={!!editingElement} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'EC</DialogTitle>
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
                      <Input placeholder="Nom de l'EC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teaching_unit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité d'Enseignement</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une UE" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachingUnits?.map((unit: any) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
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
        open={!!deletingElement}
        onOpenChange={(open) => !open && setDeletingElement(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'EC "{deletingElement?.name}" ? Cette action ne peut pas être annulée.
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

export default CourseElementsPage;
