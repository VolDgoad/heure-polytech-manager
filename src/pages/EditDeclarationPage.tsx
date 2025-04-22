
import { useParams, useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import DeclarationForm from '@/components/DeclarationForm';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditDeclarationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getDeclarationById } = useDeclarations();
  const navigate = useNavigate();
  
  const declaration = getDeclarationById(id || '');
  
  useEffect(() => {
    if (declaration && declaration.status !== 'draft') {
      navigate(`/declarations/${id}`);
    }
  }, [declaration, id, navigate]);
  
  if (!declaration) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <FileX className="h-4 w-4" />
          <AlertTitle>Déclaration introuvable</AlertTitle>
          <AlertDescription>
            La déclaration que vous essayez de modifier n'existe pas ou vous n'avez pas les droits pour la modifier.
            <div className="mt-4">
              <Button onClick={() => navigate('/declarations')}>
                Retour aux déclarations
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return <DeclarationForm existingDeclaration={declaration} />;
};

export default EditDeclarationPage;
