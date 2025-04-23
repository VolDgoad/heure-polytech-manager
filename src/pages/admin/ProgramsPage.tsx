
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/table";

const fetchPrograms = async () => {
  const { data, error } = await supabase
    .from("programs")
    .select("id,name,created_at,updated_at,departments(name)");
  if (error) throw new Error(error.message);
  return data;
};

const ProgramsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-programs"],
    queryFn: fetchPrograms,
  });

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Filières</h2>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2" size={16}/>Nouvelle filière</Button>
      </div>
      {isLoading && <div>Chargement...</div>}
      {error && <div className="text-destructive">Erreur : {error.message}</div>}
      {data && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((prog: any) => (
              <TableRow key={prog.id}>
                <TableCell>{prog.name}</TableCell>
                <TableCell>{prog.departments?.name || "-"}</TableCell>
                <TableCell>{new Date(prog.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {/* Actions à venir */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {/* Modal ou formulaire d’ajout à venir */}
    </div>
  );
};

export default ProgramsPage;
