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

interface Program {
  id: string;
  name: string;
  department_id: string;
  created_at: string;
  updated_at: string;
  departments?: {
    id: string;
    name: string;
  };
}

const fetchPrograms = async () => {
  const { data, error } = await supabase
    .from("programs")
    .select("id,name,created_at,updated_at,department_id,departments(id,name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const fetchDepartments = async () => {
  const { data, error } = await supabase
    .from("departments")
    .select("id,name")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
};

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  department_id: z.string().min(1, "Veuillez sélectionner un département"),
});

type FormValues = z.infer<typeof formSchema>;

const ProgramsPage = () => {
  const queryClient = useQueryClient();
  const { data: programs, isLoading, error } = useQuery({
    queryKey: ["admin-programs"],
    queryFn: fetchPrograms,
  });

  const { data: departments } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: fetchDepartments,
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      department_id: "",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      department_id: "",
    });
  };

  const createProgramMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session?.user.id)
        .maybeSingle();
      console.log("[DEBUG] Attempting create program as:", {
        user: sessionData.session?.user,
        profile: userProfile,
      });

      const { data, error } = await supabase
        .from("programs")
        .insert([{
          name: values.name,
          department_id: values.department_id
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      setShowAddDialog(false);
      resetForm();
      toast.success("Filière créée avec succès");
    },
    onError: (error: any) => {
      console.error("Error creating program:", error);
      if (error.code === "42501" || error.message?.includes("row violates row-level security")) {
        toast.error("Vous n'avez pas les permissions nécessaires pour créer une filière. Contactez un administrateur.");
      } else if (error.status === 403) {
        toast.error("Action interdite : vous n'avez pas les droits requis.");
      } else {
        toast.error("Erreur lors de la création de la filière");
      }
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: async (values: FormValues & { id: string }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session?.user.id)
        .maybeSingle();
      console.log("[DEBUG] Attempting update program as:", {
        user: sessionData.session?.user,
        profile: userProfile,
      });

      const { id, ...programData } = values;
      const { data, error } = await supabase
        .from("programs")
        .update({
          name: programData.name,
          department_id: programData.department_id
        })
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      setEditingProgram(null);
      resetForm();
      toast.success("Filière mise à jour avec succès");
    },
    onError: (error: any) => {
      console.error("Error updating program:", error);
      if (error.code === "42501" || error.message?.includes("row violates row-level security")) {
        toast.error("Vous n'avez pas les permissions nécessaires pour modifier cette filière.");
      } else if (error.status === 403) {
        toast.error("Action interdite : vous n'avez pas les droits requis.");
      } else {
        toast.error("Erreur lors de la mise à jour de la filière");
      }
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session?.user.id)
        .maybeSingle();
      console.log("[DEBUG] Attempting delete program as:", {
        user: sessionData.session?.user,
        profile: userProfile,
      });

      const { error } = await supabase.from("programs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      setDeletingProgram(null);
      toast.success("Filière supprimée avec succès");
    },
    onError: (error: any) => {
      console.error("Error deleting program:", error);
      if (error.code === "42501" || error.message?.includes("row violates row-level security")) {
        toast.error("Vous n'avez pas les permissions nécessaires pour supprimer cette filière.");
      } else if (error.status === 403) {
        toast.error("Action interdite : vous n'avez pas les droits requis.");
      } else {
        toast.error("Erreur lors de la suppression de la filière");
      }
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editingProgram) {
      updateProgramMutation.mutate({ ...values, id: editingProgram.id });
    } else {
      createProgramMutation.mutate(values);
    }
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    form.reset({
      name: program.name,
      department_id: program.department_id,
    });
  };

  const handleDelete = (program: Program) => {
    setDeletingProgram(program);
  };

  const confirmDelete = () => {
    if (deletingProgram) {
      deleteProgramMutation.mutate(deletingProgram.id);
    }
  };

  const closeEditDialog = () => {
    setEditingProgram(null);
    resetForm();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Filières</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2" size={16} />
          Nouvelle filière
        </Button>
      </div>

      {isLoading && <div className="text-center py-4">Chargement...</div>}
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error.message}
        </div>
      )}

      {programs && programs.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          Aucune filière trouvée. Cliquez sur "Nouvelle filière" pour en ajouter une.
        </div>
      )}

      {programs && programs.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program: Program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{program.departments?.name || "-"}</TableCell>
                  <TableCell>
                    {new Date(program.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(program)}
                    >
                      <Edit size={16} />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(program)}
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

      {/* Add Program Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle filière</DialogTitle>
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
                      <Input placeholder="Nom de la filière" {...field} />
                    </FormControl>
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
                        {departments?.map((department: any) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
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

      {/* Edit Program Dialog */}
      <Dialog open={!!editingProgram} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la filière</DialogTitle>
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
                      <Input placeholder="Nom de la filière" {...field} />
                    </FormControl>
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments?.map((department: any) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
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
        open={!!deletingProgram}
        onOpenChange={(open) => !open && setDeletingProgram(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la filière "{deletingProgram?.name}" ? Cette action ne peut pas être annulée.
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

export default ProgramsPage;
