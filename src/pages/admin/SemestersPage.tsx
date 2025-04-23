
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

const fetchSemesters = async () => {
  const { data, error } = await supabase
    .from("semesters")
    .select("id,name,created_at,updated_at,levels(name)");
  if (error) throw new Error(error.message);
  return data;
};

const SemestersPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-semesters"],
    queryFn: fetchSemesters,
  });

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Semestres</h2>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2" size={16}/>Nouveau semestre</Button>
      </div>
      {isLoading && <div>Chargement...</div>}
      {error && <div className="text-destructive">Erreur : {error.message}</div>}
      {data && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((sem: any) => (
              <TableRow key={sem.id}>
                <TableCell>{sem.name}</TableCell>
                <TableCell>{sem.levels?.name || "-"}</TableCell>
                <TableCell>{new Date(sem.created_at).toLocaleDateString()}</TableCell>
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

export default SemestersPage;
