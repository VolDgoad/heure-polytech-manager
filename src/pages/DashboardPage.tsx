
import { useAuth } from '@/context/AuthContext';
import { StatisticsCards } from '@/components/dashboard/StatisticsCards';
import { PendingDeclarationsTable } from '@/components/dashboard/PendingDeclarationsTable';
import { DeclarationChart } from '@/components/dashboard/DeclarationChart';
import { DeclarationProvider } from '@/context/DeclarationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, CalendarCheck, BadgeCheck, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const getMainRoute = () => {
    switch (user.role) {
      case "enseignant":
        return "/declarations";
      case "chef_departement":
        return "/validation";
      case "scolarite":
        return "/verification";
      case "directrice_etudes":
        return "/approbation";
      case "admin":
        return "/admin/users";
      default:
        return "/";
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
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 shadow-sm border-none overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1">{welcomeMessage()}</h1>
              <div className="flex items-center text-muted-foreground gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{getRoleName()} {user.department_id ? "• Département" : "• Polytech Diamniadio"}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-blue-500" />
              <span className="text-sm font-medium">{getCurrentDate()}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-100">
            <Button 
              variant="default" 
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
              onClick={() => navigate(getMainRoute())}
            >
              {getMainTitle()}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeclarationProvider>
        <StatisticsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border overflow-hidden">
            <CardHeader className="bg-gray-50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <CalendarCheck className="h-5 w-5 mr-2 text-blue-600" />
                Activité récente
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(getMainRoute())}
                className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                Tout voir
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <PendingDeclarationsTable />
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border overflow-hidden">
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
        </div>
      </DeclarationProvider>
    </div>
  );
};

export default DashboardPage;
