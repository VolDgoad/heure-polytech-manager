
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
import { Level } from "@/types";
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

const fetchLevels = async () => {
  const { data, error } = await supabase
    .from("levels")
    .select("id,name,created_at,updated_at,program_id,programs(id,name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const fetchPrograms = async () => {
  const { data, error } = await supabase
    .from("programs")
    .select("id,name")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
};

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  program_id: z.string().min(1, "Veuillez sélectionner une filière"),
});

type FormValues = z.infer<typeof formSchema>;

const LevelsPage = () => {
  const queryClient = useQueryClient();
  const { data: levels, isLoading, error } = useQuery({
    queryKey: ["admin-levels"],
    queryFn: fetchLevels,
  });

  const { data: programs } = useQuery({
    queryKey: ["admin-programs"],
    queryFn: fetchPrograms,
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [deletingLevel, setDeletingLevel] = useState<Level | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      program_id: "",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      program_id: "",
    });
  };

  const createLevelMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("levels")
        .insert([{
          name: values.name,
          program_id: values.program_id
        }])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
      setShowAddDialog(false);
      resetForm();
      toast.success("Niveau créé avec succès");
    },
    onError: (error) => {
      console.error("Error creating level:", error);
      toast.error("Erreur lors de la création du niveau");
    },
  });

  const updateLevelMutation = useMutation({
    mutationFn: async (values: FormValues & { id: string }) => {
      const { id, ...levelData } = values;
      const { data, error } = await supabase
        .from("levels")
        .update({
          name: levelData.name,
          program_id: levelData.program_id
        })
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
      setEditingLevel(null);
      resetForm();
      toast.success("Niveau mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Error updating level:", error);
      toast.error("Erreur lors de la mise à jour du niveau");
    },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("levels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
      setDeletingLevel(null);
      toast.success("Niveau supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting level:", error);
      toast.error("Erreur lors de la suppression du niveau");
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editingLevel) {
      updateLevelMutation.mutate({ ...values, id: editingLevel.id });
    } else {
      createLevelMutation.mutate(values);
    }
  };

  const handleEdit = (level: Level) => {
    setEditingLevel(level);
    form.reset({
      name: level.name,
      program_id: level.program_id,
    });
  };

  const handleDelete = (level: Level) => {
    setDeletingLevel(level);
  };

  const confirmDelete = () => {
    if (deletingLevel) {
      deleteLevelMutation.mutate(deletingLevel.id);
    }
  };

  const closeEditDialog = () => {
    setEditingLevel(null);
    resetForm();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Niveaux</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2" size={16} />
          Nouveau niveau
        </Button>
      </div>

      {isLoading && <div className="text-center py-4">Chargement...</div>}
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error.message}
        </div>
      )}

      {levels && levels.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          Aucun niveau trouvé. Cliquez sur "Nouveau niveau" pour en ajouter un.
        </div>
      )}

      {levels && levels.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Filière</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levels.map((level: any) => (
                <TableRow key={level.id}>
                  <TableCell className="font-medium">{level.name}</TableCell>
                  <TableCell>{level.programs?.name || "-"}</TableCell>
                  <TableCell>
                    {new Date(level.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(level)}
                    >
                      <Edit size={16} />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(level)}
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

      {/* Add Level Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau niveau</DialogTitle>
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
                      <Input placeholder="Nom du niveau" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="program_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filière</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une filière" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs?.map((program: any) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
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

      {/* Edit Level Dialog */}
      <Dialog open={!!editingLevel} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le niveau</DialogTitle>
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
                      <Input placeholder="Nom du niveau" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="program_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filière</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une filière" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs?.map((program: any) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
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
        open={!!deletingLevel}
        onOpenChange={(open) => !open && setDeletingLevel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le niveau "{deletingLevel?.name}" ? Cette action ne peut pas être annulée.
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

export default LevelsPage;
