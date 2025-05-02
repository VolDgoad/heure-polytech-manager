import { useDeclarations } from "@/context/DeclarationContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Declaration, DeclarationStatus } from "@/types";
import { CircleCheck, FileCheck, FileText, FileClock, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
        
        // Déclarations rejetées pour ce département
        stats.rejected = declarations.filter(
          (d) => 
            d.status === "rejetee" && 
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
        
        // Toutes les déclarations
        stats.total = declarations.length;
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
        
        // Déclarations rejetées par la directrice
        stats.rejected = declarations.filter(
          (d) => 
            d.status === "rejetee" && 
            d.rejected_by === user.id
        ).length;
        break;
        
      default:
        // Statistiques pour les enseignants (soumises, vérifiées, etc.)
        stats.submitted = getCountsByStatus("soumise");
        stats.verified = getCountsByStatus("verifiee");
        stats.validated = getCountsByStatus("validee");
        stats.approved = getCountsByStatus("approuvee");
        stats.rejected = getCountsByStatus("rejetee");
        stats.total = declarations.filter(d => d.teacher_id === user.id).length;
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
              title="À valider"
              value={stats.pendingValidation}
              description="Déclarations vérifiées à valider"
              icon={<FileClock className="h-5 w-5" />}
              className="from-amber-50 to-amber-100 border-l-amber-500"
              iconColor="text-amber-500"
            />
            <StatCard
              title="Validées"
              value={stats.validated}
              description="Déclarations que vous avez validées"
              icon={<FileCheck className="h-5 w-5" />}
              className="from-blue-50 to-blue-100 border-l-blue-500"
              iconColor="text-blue-500"
            />
            <StatCard
              title="Approuvées"
              value={stats.approved}
              description="Déclarations de votre département approuvées"
              icon={<CircleCheck className="h-5 w-5" />}
              className="from-green-50 to-green-100 border-l-green-500"
              iconColor="text-green-500"
            />
            <StatCard
              title="Rejetées"
              value={stats.rejected}
              description="Déclarations rejetées dans votre département"
              icon={<AlertTriangle className="h-5 w-5" />}
              className="from-red-50 to-red-100 border-l-red-500"
              iconColor="text-red-500"
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
              icon={<FileClock className="h-5 w-5" />}
              className="from-amber-50 to-amber-100 border-l-amber-500"
              iconColor="text-amber-500"
            />
            <StatCard
              title="Vérifiées"
              value={stats.verified}
              description="Déclarations que vous avez vérifiées"
              icon={<FileCheck className="h-5 w-5" />}
              className="from-blue-50 to-blue-100 border-l-blue-500"
              iconColor="text-blue-500"
            />
            <StatCard
              title="Rejetées"
              value={stats.rejected}
              description="Déclarations que vous avez rejetées"
              icon={<AlertTriangle className="h-5 w-5" />}
              className="from-red-50 to-red-100 border-l-red-500"
              iconColor="text-red-500"
            />
            <StatCard
              title="Total"
              value={stats.total}
              description="Toutes les déclarations"
              icon={<FileText className="h-5 w-5" />}
              className="from-purple-50 to-purple-100 border-l-purple-500"
              iconColor="text-purple-500"
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
              icon={<FileClock className="h-5 w-5" />}
              className="from-amber-50 to-amber-100 border-l-amber-500"
              iconColor="text-amber-500"
            />
            <StatCard
              title="Approuvées par vous"
              value={stats.approved}
              description="Déclarations que vous avez approuvées"
              icon={<CircleCheck className="h-5 w-5" />}
              className="from-green-50 to-green-100 border-l-green-500"
              iconColor="text-green-500"
            />
            <StatCard
              title="Total approuvées"
              value={stats.totalApproved}
              description="Toutes les déclarations approuvées"
              icon={<CheckCircle className="h-5 w-5" />}
              className="from-emerald-50 to-emerald-100 border-l-emerald-500"
              iconColor="text-emerald-500"
            />
            <StatCard
              title="Rejetées"
              value={stats.rejected}
              description="Déclarations que vous avez rejetées"
              icon={<AlertTriangle className="h-5 w-5" />}
              className="from-red-50 to-red-100 border-l-red-500"
              iconColor="text-red-500"
            />
          </>
        );

      default:
        return (
          <>
            <StatCard
              title="Soumises"
              value={stats.submitted}
              description="En attente de vérification"
              icon={<FileText className="h-5 w-5" />}
              className="from-blue-50 to-blue-100 border-l-blue-500"
              iconColor="text-blue-500"
            />
            <StatCard
              title="Vérifiées"
              value={stats.verified}
              description="En attente de validation"
              icon={<FileCheck className="h-5 w-5" />}
              className="from-purple-50 to-purple-100 border-l-purple-500"
              iconColor="text-purple-500"
            />
            <StatCard
              title="Approuvées"
              value={stats.approved}
              description="Déclarations finalisées"
              icon={<CircleCheck className="h-5 w-5" />}
              className="from-green-50 to-green-100 border-l-green-500"
              iconColor="text-green-500"
            />
            <StatCard
              title="Rejetées"
              value={stats.rejected}
              description="Déclarations rejetées"
              icon={<AlertTriangle className="h-5 w-5" />}
              className="from-red-50 to-red-100 border-l-red-500"
              iconColor="text-red-500"
            />
          </>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {getCardsForRole()}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  className?: string;
  iconColor?: string;
}

const StatCard = ({ title, value, description, icon, className, iconColor }: StatCardProps) => {
  return (
    <Card className={cn(
      "overflow-hidden border-l-4 hover:shadow-md transition-shadow bg-gradient-to-br", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className={cn("p-2 rounded-full bg-white/80 shadow-sm", iconColor)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <CardDescription className="text-gray-700 mt-1">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};
