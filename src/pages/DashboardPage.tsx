
import { useAuth } from '@/context/AuthContext';
import { StatisticsCards } from '@/components/dashboard/StatisticsCards';
import { PendingDeclarationsTable } from '@/components/dashboard/PendingDeclarationsTable';
import { DeclarationChart } from '@/components/dashboard/DeclarationChart';
import { DeclarationProvider } from '@/context/DeclarationContext';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{welcomeMessage()}</h1>
        <p className="text-muted-foreground">
          {getRoleName()} | {user.department_id ? "Département" : "Polytech Diamniadio"}
        </p>
      </div>

      <DeclarationProvider>
        <StatisticsCards />
        <PendingDeclarationsTable />
        <DeclarationChart />
      </DeclarationProvider>
    </div>
  );
};

export default DashboardPage;
