
import { useDeclarations } from '@/context/DeclarationContext';
import DeclarationCard from '@/components/DeclarationCard';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VerificationPage = () => {
  const { declarations } = useDeclarations();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter declarations that are submitted and pending verification
  const pendingVerifications = declarations.filter(d => d.status === 'soumise');

  // Filter by search term
  const filteredDeclarations = pendingVerifications.filter(d => {
    if (!searchTerm) return true;
    return d.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           d.departmentName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vérification des Déclarations</h1>
        <p className="text-muted-foreground">
          Vérifiez les déclarations soumises par les enseignants
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
              actions="verify"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <FileText className="h-20 w-20 text-gray-300" />
          <h3 className="text-xl font-semibold">Aucune déclaration à vérifier</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {searchTerm 
              ? "Aucune déclaration ne correspond à votre recherche. Essayez d'autres termes."
              : "Toutes les déclarations ont été vérifiées. Revenez plus tard."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
