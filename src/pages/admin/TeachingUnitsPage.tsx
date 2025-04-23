
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

const fetchUEs = async () => {
  const { data, error } = await supabase
    .from("teaching_units")
    .select("id,name,created_at,updated_at,semesters(name)");
  if (error) throw new Error(error.message);
  return data;
};

const TeachingUnitsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-teaching-units"],
    queryFn: fetchUEs,
  });

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Unités d’Enseignement (UE)</h2>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2" size={16}/>Nouvelle UE</Button>
      </div>
      {isLoading && <div>Chargement...</div>}
      {error && <div className="text-destructive">Erreur : {error.message}</div>}
      {data && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Semestre</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((ue: any) => (
              <TableRow key={ue.id}>
                <TableCell>{ue.name}</TableCell>
                <TableCell>{ue.semesters?.name || "-"}</TableCell>
                <TableCell>{new Date(ue.created_at).toLocaleDateString()}</TableCell>
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

export default TeachingUnitsPage;
