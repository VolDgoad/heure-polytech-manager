
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import DeclarationCard from '@/components/DeclarationCard';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ValidationPage = () => {
  const { user } = useAuth();
  const { declarations } = useDeclarations();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter declarations based on user role
  const pendingValidations = user 
    ? (() => {
        switch(user.role) {
          case 'chef_departement':
            return declarations.filter(
              d => d.status === 'verifiee' && 
              d.department_id === user.department_id
            );
          case 'directrice_etudes':
            return declarations.filter(d => 
              d.status === 'validee'
            );
          default:
            return [];
        }
      })()
    : [];

  // Filter by search term
  const filteredDeclarations = pendingValidations.filter(d => {
    // Since teacherName is a client-side computed property, ensure it exists
    if (!searchTerm) return true;
    return d.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           d.departmentName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {user?.role === 'directrice_etudes' ? 'Approbation' : 'Validation'} des Déclarations
        </h1>
        <p className="text-muted-foreground">
          {user?.role === 'chef_departement' 
            ? `Validez les déclarations du département ${user.department_id}`
            : 'Approuvez les déclarations validées par les chefs de département'
          }
        </p>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" variant="secondary" onClick={() => setSearchTerm('')}>
          Réinitialiser
        </Button>
      </div>

      {filteredDeclarations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeclarations.map((declaration) => (
            <DeclarationCard 
              key={declaration.id} 
              declaration={declaration} 
              actions="approve"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <FileText className="h-20 w-20 text-gray-300" />
          <h3 className="text-xl font-semibold">
            Aucune déclaration à {user?.role === 'directrice_etudes' ? 'approuver' : 'valider'}
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            {searchTerm 
              ? "Aucune déclaration ne correspond à votre recherche. Essayez d'autres termes."
              : `Toutes les déclarations ont été ${user?.role === 'directrice_etudes' ? 'approuvées' : 'validées'}. Revenez plus tard.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ValidationPage;
