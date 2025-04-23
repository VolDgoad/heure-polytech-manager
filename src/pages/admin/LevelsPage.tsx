
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

const fetchLevels = async () => {
  const { data, error } = await supabase
    .from("levels")
    .select("id,name,created_at,updated_at,programs(name)");
  if (error) throw new Error(error.message);
  return data;
};

const LevelsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-levels"],
    queryFn: fetchLevels,
  });

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Niveaux</h2>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2" size={16}/>Nouveau niveau</Button>
      </div>
      {isLoading && <div>Chargement...</div>}
      {error && <div className="text-destructive">Erreur : {error.message}</div>}
      {data && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Filière</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((level: any) => (
              <TableRow key={level.id}>
                <TableCell>{level.name}</TableCell>
                <TableCell>{level.programs?.name || "-"}</TableCell>
                <TableCell>{new Date(level.created_at).toLocaleDateString()}</TableCell>
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

export default LevelsPage;
