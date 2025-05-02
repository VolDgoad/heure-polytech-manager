
import { useDeclarations } from "@/context/DeclarationContext";
import { useAuth } from "@/context/AuthContext";
import { Declaration } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import DeclarationStatusBadge from "@/components/DeclarationStatusBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export const PendingDeclarationsTable = () => {
  const { user } = useAuth();
  const { pendingDeclarations } = useDeclarations();
  const navigate = useNavigate();
  const [displayDeclarations, setDisplayDeclarations] = useState<Declaration[]>([]);

  useEffect(() => {
    console.log("PendingDeclarationsTable - User:", user?.role);
    console.log("PendingDeclarationsTable - pendingDeclarations:", pendingDeclarations);
    
    // Use the pendingDeclarations from context
    if (pendingDeclarations && pendingDeclarations.length > 0) {
      console.log("Setting display declarations from pendingDeclarations:", pendingDeclarations);
      setDisplayDeclarations(pendingDeclarations);
    } else {
      console.log("No pending declarations found in context");
      setDisplayDeclarations([]);
    }
  }, [user, pendingDeclarations]);

  if (!user) return null;

  const getPageTitle = () => {
    switch (user.role) {
      case "chef_departement":
        return "Déclarations en attente de validation";
      case "scolarite":
        return "Déclarations en attente de vérification";
      case "directrice_etudes":
        return "Déclarations en attente d'approbation";
      default:
        return "Vos déclarations récentes";
    }
  };

  const getActionRoute = (declaration: Declaration) => {
    switch (user.role) {
      case "chef_departement":
        return `/validation/${declaration.id}`;
      case "scolarite":
        return `/verification/${declaration.id}`;
      case "directrice_etudes":
        return `/approbation/${declaration.id}`;
      default:
        return `/declarations/${declaration.id}`;
    }
  };

  if (displayDeclarations.length === 0) {
    return (
      <div className="p-6">
        <Alert variant="default" className="bg-blue-50 border-blue-100 text-blue-800">
          <AlertDescription>
            Aucune déclaration en attente pour le moment.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-0">
      {displayDeclarations.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Enseignant</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Département</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">EC</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Heures</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayDeclarations.slice(0, 5).map((declaration) => (
                <TableRow key={declaration.id} className="hover:bg-gray-50 border-b">
                  <TableCell className="font-medium text-sm">
                    {declaration.declaration_date ? 
                      format(new Date(declaration.declaration_date), 'dd/MM/yyyy', { locale: fr }) : 
                      'N/A'}
                  </TableCell>
                  <TableCell className="text-sm">{declaration.teacherName || declaration.teacher_id}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{declaration.departmentName || declaration.department_id}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{declaration.course_element_id}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{declaration.totalHours}h</TableCell>
                  <TableCell>
                    <DeclarationStatusBadge status={declaration.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(getActionRoute(declaration))}
                      className="hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">Aucune déclaration en attente pour le moment.</p>
        </div>
      )}
    </div>
  );
};
