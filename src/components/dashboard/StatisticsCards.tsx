
import { useDeclarations } from "@/context/DeclarationContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Declaration, DeclarationStatus } from "@/types";
import { CircleCheck, FileCheck, FileText, FileClock } from "lucide-react";

export const StatisticsCards = () => {
  const { user } = useAuth();
  const { declarations, pendingDeclarations } = useDeclarations();

  if (!user) return null;

  const getCountsByStatus = (
    status: DeclarationStatus | DeclarationStatus[]
  ): number => {
    const statusArray = Array.isArray(status) ? status : [status];
    return declarations.filter((d) => statusArray.includes(d.status)).length;
  };

  const getFilteredDeclarations = (): { [key: string]: number } => {
    const stats: { [key: string]: number } = {};

    switch (user.role) {
      case "chef_departement":
        // Déclarations vérifiées en attente de validation pour le département du chef
        stats.pendingValidation = declarations.filter(
          (d) => 
            d.status === "verifiee" && 
            d.department_id === user.department_id
        ).length;
        
        // Déclarations validées par ce chef de département
        stats.validated = declarations.filter(
          (d) => 
            d.status === "validee" && 
            d.validated_by === user.id
        ).length;
        
        // Déclarations approuvées concernant son département
        stats.approved = declarations.filter(
          (d) => 
            d.status === "approuvee" && 
            d.department_id === user.department_id
        ).length;
        break;

      case "scolarite":
        // Déclarations en attente de vérification
        stats.pendingVerification = declarations.filter(
          (d) => d.status === "soumise"
        ).length;
        
        // Déclarations vérifiées par la scolarité
        stats.verified = declarations.filter(
          (d) => d.status === "verifiee" && d.verified_by === user.id
        ).length;
        
        // Déclarations rejetées par la scolarité
        stats.rejected = declarations.filter(
          (d) => 
            d.status === "rejetee" && 
            d.rejected_by === user.id
        ).length;
        break;

      case "directrice_etudes":
        // Déclarations validées en attente d'approbation finale
        stats.pendingApproval = declarations.filter(
          (d) => d.status === "validee"
        ).length;
        
        // Déclarations approuvées par la directrice
        stats.approved = declarations.filter(
          (d) => 
            d.status === "approuvee" && 
            d.approved_by === user.id
        ).length;
        
        // Toutes les déclarations approuvées
        stats.totalApproved = declarations.filter(
          (d) => d.status === "approuvee"
        ).length;
        break;
        
      default:
        // Statistiques pour les enseignants (brouillons, soumises, etc.)
        stats.drafts = getCountsByStatus("brouillon");
        stats.submitted = getCountsByStatus("soumise");
        stats.verified = getCountsByStatus("verifiee");
        stats.validated = getCountsByStatus("validee");
        stats.approved = getCountsByStatus("approuvee");
        stats.rejected = getCountsByStatus("rejetee");
    }

    return stats;
  };

  const stats = getFilteredDeclarations();

  const getCardsForRole = () => {
    switch (user.role) {
      case "chef_departement":
        return (
          <>
            <StatCard
              title="En attente de validation"
              value={stats.pendingValidation}
              description="Déclarations vérifiées à valider"
              icon={<FileClock className="h-5 w-5 text-yellow-500" />}
              color="bg-yellow-50"
            />
            <StatCard
              title="Validées"
              value={stats.validated}
              description="Déclarations que vous avez validées"
              icon={<FileCheck className="h-5 w-5 text-blue-500" />}
              color="bg-blue-50"
            />
            <StatCard
              title="Approuvées"
              value={stats.approved}
              description="Déclarations de votre département approuvées"
              icon={<CircleCheck className="h-5 w-5 text-green-500" />}
              color="bg-green-50"
            />
          </>
        );

      case "scolarite":
        return (
          <>
            <StatCard
              title="À vérifier"
              value={stats.pendingVerification}
              description="Déclarations en attente de vérification"
              icon={<FileClock className="h-5 w-5 text-yellow-500" />}
              color="bg-yellow-50"
            />
            <StatCard
              title="Vérifiées"
              value={stats.verified}
              description="Déclarations que vous avez vérifiées"
              icon={<FileCheck className="h-5 w-5 text-blue-500" />}
              color="bg-blue-50"
            />
            <StatCard
              title="Rejetées"
              value={stats.rejected}
              description="Déclarations que vous avez rejetées"
              icon={<FileText className="h-5 w-5 text-red-500" />}
              color="bg-red-50"
            />
          </>
        );

      case "directrice_etudes":
        return (
          <>
            <StatCard
              title="À approuver"
              value={stats.pendingApproval}
              description="Déclarations validées en attente d'approbation"
              icon={<FileClock className="h-5 w-5 text-yellow-500" />}
              color="bg-yellow-50"
            />
            <StatCard
              title="Approuvées par vous"
              value={stats.approved}
              description="Déclarations que vous avez approuvées"
              icon={<CircleCheck className="h-5 w-5 text-green-500" />}
              color="bg-green-50"
            />
            <StatCard
              title="Total approuvées"
              value={stats.totalApproved}
              description="Toutes les déclarations approuvées"
              icon={<FileCheck className="h-5 w-5 text-green-500" />}
              color="bg-green-50"
            />
          </>
        );

      default:
        return (
          <>
            <StatCard
              title="Brouillons"
              value={stats.drafts}
              description="Déclarations non soumises"
              icon={<FileText className="h-5 w-5 text-gray-500" />}
              color="bg-gray-50"
            />
            <StatCard
              title="Soumises"
              value={stats.submitted}
              description="En attente de vérification"
              icon={<FileText className="h-5 w-5 text-blue-500" />}
              color="bg-blue-50"
            />
            <StatCard
              title="Approuvées"
              value={stats.approved}
              description="Déclarations finalisées"
              icon={<CircleCheck className="h-5 w-5 text-green-500" />}
              color="bg-green-50"
            />
          </>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {getCardsForRole()}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, description, icon, color }: StatCardProps) => {
  return (
    <Card className={`${color} border-none shadow-sm hover:shadow-md transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};
