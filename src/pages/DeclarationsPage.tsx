
import { useDeclarations } from '@/context/DeclarationContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import DeclarationCard from '@/components/DeclarationCard';
import { FileText, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const DeclarationsPage = () => {
  const { userDeclarations } = useDeclarations();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeclarations = userDeclarations.filter(declaration => 
    declaration.sessions.some(session => 
      session.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mes Déclarations</h1>
          <p className="text-muted-foreground">
            Gérez vos déclarations d'heures d'enseignement
          </p>
        </div>
        <Button onClick={() => navigate('/declarations/new')}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Déclaration
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Rechercher par titre de cours..."
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
            <DeclarationCard key={declaration.id} declaration={declaration} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <FileText className="h-20 w-20 text-gray-300" />
          <h3 className="text-xl font-semibold">Aucune déclaration trouvée</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {searchTerm 
              ? "Aucune déclaration ne correspond à votre recherche. Essayez d'autres termes."
              : "Vous n'avez pas encore de déclarations. Créez votre première déclaration d'heures."
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => navigate('/declarations/new')}>
              Créer une déclaration
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DeclarationsPage;
