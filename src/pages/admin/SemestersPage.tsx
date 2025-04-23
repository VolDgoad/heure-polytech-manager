
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

interface Semester {
  id: string;
  name: string;
  level_id: string;
  created_at: string;
  updated_at: string;
  levels?: {
    id: string;
    name: string;
  };
}

const fetchSemesters = async () => {
  const { data, error } = await supabase
    .from("semesters")
    .select("id,name,created_at,updated_at,level_id,levels(id,name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const fetchLevels = async () => {
  const { data, error } = await supabase
    .from("levels")
    .select("id,name")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
};

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  level_id: z.string().min(1, "Veuillez sélectionner un niveau"),
});

type FormValues = z.infer<typeof formSchema>;

const SemestersPage = () => {
  const queryClient = useQueryClient();
  const { data: semesters, isLoading, error } = useQuery({
    queryKey: ["admin-semesters"],
    queryFn: fetchSemesters,
  });

  const { data: levels } = useQuery({
    queryKey: ["admin-levels"],
    queryFn: fetchLevels,
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [deletingSemester, setDeletingSemester] = useState<Semester | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      level_id: "",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      level_id: "",
    });
  };

  const createSemesterMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("semesters")
        .insert([{
          name: values.name,
          level_id: values.level_id
        }])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-semesters"] });
      setShowAddDialog(false);
      resetForm();
      toast.success("Semestre créé avec succès");
    },
    onError: (error) => {
      console.error("Error creating semester:", error);
      toast.error("Erreur lors de la création du semestre");
    },
  });

  const updateSemesterMutation = useMutation({
    mutationFn: async (values: FormValues & { id: string }) => {
      const { id, ...semesterData } = values;
      const { data, error } = await supabase
        .from("semesters")
        .update({
          name: semesterData.name,
          level_id: semesterData.level_id
        })
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-semesters"] });
      setEditingSemester(null);
      resetForm();
      toast.success("Semestre mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Error updating semester:", error);
      toast.error("Erreur lors de la mise à jour du semestre");
    },
  });

  const deleteSemesterMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("semesters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-semesters"] });
      setDeletingSemester(null);
      toast.success("Semestre supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting semester:", error);
      toast.error("Erreur lors de la suppression du semestre");
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editingSemester) {
      updateSemesterMutation.mutate({ ...values, id: editingSemester.id });
    } else {
      createSemesterMutation.mutate(values);
    }
  };

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester);
    form.reset({
      name: semester.name,
      level_id: semester.level_id,
    });
  };

  const handleDelete = (semester: Semester) => {
    setDeletingSemester(semester);
  };

  const confirmDelete = () => {
    if (deletingSemester) {
      deleteSemesterMutation.mutate(deletingSemester.id);
    }
  };

  const closeEditDialog = () => {
    setEditingSemester(null);
    resetForm();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Semestres</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2" size={16} />
          Nouveau semestre
        </Button>
      </div>

      {isLoading && <div className="text-center py-4">Chargement...</div>}
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error.message}
        </div>
      )}

      {semesters && semesters.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          Aucun semestre trouvé. Cliquez sur "Nouveau semestre" pour en ajouter un.
        </div>
      )}

      {semesters && semesters.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesters.map((semester: Semester) => (
                <TableRow key={semester.id}>
                  <TableCell className="font-medium">{semester.name}</TableCell>
                  <TableCell>{semester.levels?.name || "-"}</TableCell>
                  <TableCell>
                    {new Date(semester.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(semester)}
                    >
                      <Edit size={16} />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(semester)}
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

      {/* Add Semester Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau semestre</DialogTitle>
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
                      <Input placeholder="Nom du semestre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levels?.map((level: any) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
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

      {/* Edit Semester Dialog */}
      <Dialog open={!!editingSemester} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le semestre</DialogTitle>
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
                      <Input placeholder="Nom du semestre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levels?.map((level: any) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
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
        open={!!deletingSemester}
        onOpenChange={(open) => !open && setDeletingSemester(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le semestre "{deletingSemester?.name}" ? Cette action ne peut pas être annulée.
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

export default SemestersPage;
