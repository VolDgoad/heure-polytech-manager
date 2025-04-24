
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
  const { declarations, pendingDeclarations } = useDeclarations();
  const navigate = useNavigate();
  const [displayDeclarations, setDisplayDeclarations] = useState<Declaration[]>([]);

  useEffect(() => {
    console.log("PendingDeclarationsTable - User:", user?.role);
    console.log("PendingDeclarationsTable - pendingDeclarations:", pendingDeclarations);
    
    // Make sure we're actually getting the proper pending declarations
    if (pendingDeclarations && pendingDeclarations.length > 0) {
      setDisplayDeclarations(pendingDeclarations);
    } else {
      // Fallback to filtering declarations based on user role directly
      if (user) {
        let filtered: Declaration[] = [];
        
        switch(user.role) {
          case 'scolarite':
            filtered = declarations.filter(d => d.status === 'soumise');
            console.log("Filtering scolarite declarations:", filtered);
            break;
          case 'chef_departement':
            filtered = declarations.filter(
              d => d.status === 'verifiee' && 
              d.department_id === user.department_id
            );
            console.log("Filtering chef departement declarations:", filtered);
            break;
          case 'directrice_etudes':
            filtered = declarations.filter(d => d.status === 'validee');
            console.log("Filtering directrice declarations:", filtered);
            break;
          default:
            filtered = [];
        }
        
        setDisplayDeclarations(filtered);
      }
    }
  }, [user, pendingDeclarations, declarations]);

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

  if (displayDeclarations.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <Alert variant="default" className="bg-blue-50 border-blue-100 text-blue-800">
            <AlertDescription>
              Aucune déclaration en attente pour le moment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4">
      {displayDeclarations.length > 0 ? (
        <div className="rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
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
              {displayDeclarations.slice(0, 5).map((declaration) => (
                <TableRow key={declaration.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {declaration.declaration_date ? 
                      format(new Date(declaration.declaration_date), 'dd/MM/yyyy', { locale: fr }) : 
                      'N/A'}
                  </TableCell>
                  <TableCell>{declaration.teacherName || declaration.teacher_id}</TableCell>
                  <TableCell>{declaration.departmentName || declaration.department_id}</TableCell>
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
                      className="hover:bg-blue-50"
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
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">Aucune déclaration en attente pour le moment.</p>
        </div>
      )}
      {displayDeclarations.length > 5 && (
        <div className="flex justify-end mt-4">
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
            className="hover:bg-blue-50"
          >
            Voir toutes les déclarations
          </Button>
        </div>
      )}
    </div>
  );
};
