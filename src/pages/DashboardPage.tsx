
import React from 'react';
import { useAuth } from '@/context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Bienvenue, {user?.first_name} {user?.last_name}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-lg font-semibold mb-3">Déclarations en attente</h2>
          <p className="text-muted-foreground">Vous n'avez aucune déclaration en attente.</p>
        </div>
        
        <div className="p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-lg font-semibold mb-3">Déclarations approuvées</h2>
          <p className="text-muted-foreground">Vous n'avez aucune déclaration approuvée.</p>
        </div>
        
        <div className="p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-lg font-semibold mb-3">Notifications</h2>
          <p className="text-muted-foreground">Vous n'avez aucune notification.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
