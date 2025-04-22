
import { useAuth } from '@/context/AuthContext';
import { useDeclarations } from '@/context/DeclarationContext';
import DeclarationCard from '@/components/DeclarationCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, FileCheck, FileText } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { userDeclarations, pendingDeclarations, declarations } = useDeclarations();

  if (!user) return null;

  // Role-specific stats
  const getStats = () => {
    switch (user.role) {
      case 'enseignant':
        const draft = userDeclarations.filter(d => d.status === 'draft').length;
        const submitted = userDeclarations.filter(d => d.status === 'submitted').length;
        const verified = userDeclarations.filter(d => d.status === 'verified').length;
        const approved = userDeclarations.filter(d => d.status === 'approved').length;
        
        const totalHours = userDeclarations
          .filter(d => d.status === 'approved')
          .reduce((sum, d) => sum + d.totalHours, 0);
        
        return [
          { title: 'Brouillons', value: draft, icon: FileText, color: 'text-gray-500' },
          { title: 'En attente', value: submitted + verified, icon: Clock, color: 'text-blue-500' },
          { title: 'Approuvées', value: approved, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Heures validées', value: `${totalHours}h`, icon: FileCheck, color: 'text-purple-500' },
        ];
      case 'scolarite':
        const pendingVerification = declarations.filter(d => d.status === 'submitted').length;
        const totalVerified = declarations.filter(d => d.status === 'verified' || d.status === 'approved').length;
        
        return [
          { title: 'À vérifier', value: pendingVerification, icon: Clock, color: 'text-blue-500' },
          { title: 'Vérifiées', value: totalVerified, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Total déclarations', value: declarations.length, icon: FileText, color: 'text-gray-500' },
        ];
      case 'chef_departement':
        const pendingApproval = declarations.filter(
          d => d.status === 'verified' && d.department === user.department
        ).length;
        
        const totalApproved = declarations.filter(
          d => d.status === 'approved' && d.department === user.department
        ).length;
        
        const departmentHours = declarations
          .filter(d => d.status === 'approved' && d.department === user.department)
          .reduce((sum, d) => sum + d.totalHours, 0);
          
        return [
          { title: 'À valider', value: pendingApproval, icon: Clock, color: 'text-blue-500' },
          { title: 'Validées', value: totalApproved, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Heures département', value: `${departmentHours}h`, icon: FileCheck, color: 'text-purple-500' },
        ];
      case 'directrice':
        const waitingDirector = declarations.filter(d => d.status === 'verified').length;
        const finalApproved = declarations.filter(d => d.status === 'approved').length;
        
        const allHours = declarations
          .filter(d => d.status === 'approved')
          .reduce((sum, d) => sum + d.totalHours, 0);
          
        return [
          { title: 'À approuver', value: waitingDirector, icon: Clock, color: 'text-blue-500' },
          { title: 'Approuvées', value: finalApproved, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Total heures', value: `${allHours}h`, icon: FileCheck, color: 'text-purple-500' },
          { title: 'Enseignants', value: new Set(declarations.map(d => d.userId)).size, icon: FileText, color: 'text-gray-500' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue, <span className="font-medium">{user.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getStats().map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:max-w-[400px]">
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="recent">Récentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          {user.role === 'enseignant' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userDeclarations.filter(d => d.status === 'draft' || d.status === 'submitted' || d.status === 'verified').length > 0 ? (
                userDeclarations
                  .filter(d => d.status === 'draft' || d.status === 'submitted' || d.status === 'verified')
                  .slice(0, 6)
                  .map((declaration) => (
                    <DeclarationCard key={declaration.id} declaration={declaration} />
                  ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-muted-foreground">Aucune déclaration en attente.</p>
                </div>
              )}
            </div>
          )}
          
          {(user.role === 'scolarite' || user.role === 'chef_departement' || user.role === 'directrice') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingDeclarations.length > 0 ? (
                pendingDeclarations.slice(0, 6).map((declaration) => (
                  <DeclarationCard 
                    key={declaration.id} 
                    declaration={declaration} 
                    actions={user.role === 'scolarite' ? 'verify' : 'approve'}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-muted-foreground">Aucune déclaration en attente de traitement.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.role === 'enseignant' ? (
              userDeclarations.length > 0 ? (
                userDeclarations
                  .slice(0, 6)
                  .map((declaration) => (
                    <DeclarationCard key={declaration.id} declaration={declaration} />
                  ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-muted-foreground">Aucune déclaration récente.</p>
                </div>
              )
            ) : (
              declarations.length > 0 ? (
                declarations
                  .slice(0, 6)
                  .map((declaration) => (
                    <DeclarationCard 
                      key={declaration.id} 
                      declaration={declaration} 
                      actions="view"
                    />
                  ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-muted-foreground">Aucune déclaration récente.</p>
                </div>
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
