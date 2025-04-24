
import { useAuth } from '@/context/AuthContext';
import { StatisticsCards } from '@/components/dashboard/StatisticsCards';
import { PendingDeclarationsTable } from '@/components/dashboard/PendingDeclarationsTable';
import { DeclarationChart } from '@/components/dashboard/DeclarationChart';
import { DeclarationProvider } from '@/context/DeclarationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, CalendarCheck, BadgeCheck, User } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;

  const welcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Bonjour";

    if (hour < 12) {
      greeting = "Bonjour";
    } else if (hour < 18) {
      greeting = "Bon après-midi";
    } else {
      greeting = "Bonsoir";
    }

    return `${greeting}, ${user.first_name} ${user.last_name}`;
  };

  const getRoleName = () => {
    switch (user.role) {
      case "enseignant":
        return "Enseignant";
      case "chef_departement":
        return "Chef de département";
      case "scolarite":
        return "Scolarité";
      case "directrice_etudes":
        return "Directrice des études";
      case "admin":
        return "Administrateur";
      default:
        return "";
    }
  };

  const getMainTitle = () => {
    switch (user.role) {
      case "enseignant":
        return "Suivi de vos déclarations";
      case "chef_departement":
        return "Validation des fiches de service";
      case "scolarite":
        return "Vérification des déclarations";
      case "directrice_etudes":
        return "Approbation des fiches de service";
      case "admin":
        return "Administration du système";
      default:
        return "Tableau de bord";
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm border-none">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{welcomeMessage()}</h1>
              <div className="flex items-center text-muted-foreground gap-1">
                <User className="h-4 w-4" />
                <span>{getRoleName()} {user.department_id ? "• Département" : "• Polytech Diamniadio"}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{getCurrentDate()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-blue-600" />
          {getMainTitle()}
        </h2>
      </div>

      <DeclarationProvider>
        <StatisticsCards />
        
        <Card className="shadow-sm border">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg flex items-center">
              <CalendarCheck className="h-5 w-5 mr-2 text-blue-600" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PendingDeclarationsTable />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Statistiques des déclarations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <DeclarationChart />
          </CardContent>
        </Card>
      </DeclarationProvider>
    </div>
  );
};

export default DashboardPage;
