
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

export const PendingDeclarationsTable = () => {
  const { user } = useAuth();
  const { pendingDeclarations } = useDeclarations();
  const navigate = useNavigate();

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
        return `/validation/${declaration.id}`;
      default:
        return `/declarations/${declaration.id}`;
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
      {pendingDeclarations.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Enseignant</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Élément Constitutif</TableHead>
                <TableHead>Heures</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingDeclarations.slice(0, 5).map((declaration) => (
                <TableRow key={declaration.id}>
                  <TableCell className="font-medium">
                    {format(new Date(declaration.declaration_date), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>{declaration.teacherName}</TableCell>
                  <TableCell>{declaration.departmentName}</TableCell>
                  <TableCell>{declaration.course_element_id}</TableCell>
                  <TableCell>{declaration.totalHours}h</TableCell>
                  <TableCell>
                    <DeclarationStatusBadge status={declaration.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(getActionRoute(declaration))}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-6 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">Aucune déclaration en attente pour le moment.</p>
        </div>
      )}
      {pendingDeclarations.length > 5 && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              switch (user.role) {
                case "chef_departement":
                case "directrice_etudes":
                  navigate("/validation");
                  break;
                case "scolarite":
                  navigate("/verification");
                  break;
                default:
                  navigate("/declarations");
                  break;
              }
            }}
          >
            Voir toutes les déclarations
          </Button>
        </div>
      )}
    </div>
  );
};
