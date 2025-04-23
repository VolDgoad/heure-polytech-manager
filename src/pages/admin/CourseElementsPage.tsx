
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

const fetchCourseElements = async () => {
  const { data, error } = await supabase
    .from("course_elements")
    .select("id,name,created_at,updated_at,teaching_units(name)");
  if (error) throw new Error(error.message);
  return data;
};

const CourseElementsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-course-elements"],
    queryFn: fetchCourseElements,
  });

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Éléments Constitutifs (EC)</h2>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2" size={16}/>Nouvel EC</Button>
      </div>
      {isLoading && <div>Chargement...</div>}
      {error && <div className="text-destructive">Erreur : {error.message}</div>}
      {data && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Unité d'Enseignement</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((ec: any) => (
              <TableRow key={ec.id}>
                <TableCell>{ec.name}</TableCell>
                <TableCell>{ec.teaching_units?.name || "-"}</TableCell>
                <TableCell>{new Date(ec.created_at).toLocaleDateString()}</TableCell>
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

export default CourseElementsPage;
