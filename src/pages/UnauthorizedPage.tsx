
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <X className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-gray-900">Accès non autorisé</h1>
        <p className="mt-3 text-gray-600">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
        <div className="mt-8">
          <Button onClick={() => navigate('/dashboard')}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
