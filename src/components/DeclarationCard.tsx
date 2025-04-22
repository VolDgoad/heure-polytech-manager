
import { Declaration } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import DeclarationStatusBadge from './DeclarationStatusBadge';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckSquare, X } from 'lucide-react';

interface DeclarationCardProps {
  declaration: Declaration;
  actions?: 'view' | 'verify' | 'approve';
}

const DeclarationCard = ({ declaration, actions = 'view' }: DeclarationCardProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/declarations/${declaration.id}`);
  };

  const handleEdit = () => {
    navigate(`/declarations/${declaration.id}/edit`);
  };

  const handleVerify = () => {
    navigate(`/verification/${declaration.id}`);
  };

  const handleApprove = () => {
    navigate(`/validation/${declaration.id}`);
  };

  return (
    <Card className="border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between py-4 bg-gray-50">
        <CardTitle className="text-md font-medium">
          {declaration.department}
        </CardTitle>
        <DeclarationStatusBadge status={declaration.status} />
      </CardHeader>
      <CardContent className="pt-4 pb-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Enseignant</p>
            <p className="font-medium">{declaration.userName}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Heures</p>
            <p className="font-medium">{declaration.totalHours} heures</p>
          </div>
          <div>
            <p className="text-gray-500">Date de création</p>
            <p className="font-medium">{format(parseISO(declaration.createdAt), 'dd/MM/yyyy')}</p>
          </div>
          <div>
            <p className="text-gray-500">Mise à jour</p>
            <p className="font-medium">{format(parseISO(declaration.updatedAt), 'dd/MM/yyyy')}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Sessions</p>
            <p className="font-medium">{declaration.sessions.length} cours</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-4 pb-4">
        {actions === 'view' && (
          <>
            <Button variant="outline" size="sm" onClick={handleView}>
              <FileText className="mr-1 h-4 w-4" />
              Voir
            </Button>
            {declaration.status === 'draft' && (
              <Button variant="default" size="sm" onClick={handleEdit}>
                Modifier
              </Button>
            )}
          </>
        )}
        
        {actions === 'verify' && (
          <>
            <Button variant="outline" size="sm" onClick={handleView}>
              <FileText className="mr-1 h-4 w-4" />
              Voir
            </Button>
            <Button variant="default" size="sm" onClick={handleVerify}>
              <CheckSquare className="mr-1 h-4 w-4" />
              Vérifier
            </Button>
          </>
        )}
        
        {actions === 'approve' && (
          <>
            <Button variant="outline" size="sm" onClick={handleView}>
              <FileText className="mr-1 h-4 w-4" />
              Voir
            </Button>
            <Button variant="default" size="sm" onClick={handleApprove}>
              <CheckSquare className="mr-1 h-4 w-4" />
              Valider
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default DeclarationCard;
