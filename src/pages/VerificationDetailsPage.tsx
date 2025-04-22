
import { useParams, useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, FileText, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import DeclarationForm from '@/components/DeclarationForm';
import DeclarationStatusBadge from '@/components/DeclarationStatusBadge';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const VerificationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getDeclarationById, verifyDeclaration } = useDeclarations();
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  
  const declaration = getDeclarationById(id || '');
  
  if (!declaration || declaration.status !== 'submitted') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <FileText className="h-4 w-4" />
          <AlertTitle>Déclaration introuvable</AlertTitle>
          <AlertDescription>
            La déclaration que vous essayez de vérifier n'existe pas, n'est pas en attente de vérification, ou vous n'avez pas les droits pour la vérifier.
            <div className="mt-4">
              <Button onClick={() => navigate('/verification')}>
                Retour aux vérifications
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleVerify = () => {
    verifyDeclaration(declaration.id, true);
    navigate('/verification');
  };
  
  const handleReject = () => {
    if (!rejectionReason) return;
    verifyDeclaration(declaration.id, false, rejectionReason);
    navigate('/verification');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Vérification
            <DeclarationStatusBadge status={declaration.status} />
          </h1>
          <p className="text-muted-foreground">
            Soumise le {format(parseISO(declaration.createdAt), 'PPP', { locale: fr })}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/verification')}>
            Retour
          </Button>
        </div>
      </div>
      
      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Enseignant</h3>
              <p className="mt-1">{declaration.userName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Département</h3>
              <p className="mt-1">{declaration.department}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Heures totales</h3>
              <p className="mt-1 font-bold">{declaration.totalHours} heures</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Détail des sessions</h2>
        </div>
        <div className="p-6">
          <DeclarationForm existingDeclaration={declaration} isReadOnly={true} />
        </div>
      </div>
      
      {showRejectForm ? (
        <Card className="border-gray-200">
          <CardHeader className="bg-red-50 border-b border-red-200">
            <CardTitle className="text-lg text-red-700">Motif de rejet</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Textarea
              placeholder="Veuillez préciser pourquoi cette déclaration est rejetée..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mb-4"
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectionReason}
              >
                Confirmer le rejet
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-end space-x-2">
          <Button 
            variant="destructive" 
            onClick={() => setShowRejectForm(true)}
          >
            <X className="mr-2 h-4 w-4" />
            Rejeter
          </Button>
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleVerify}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Vérifier
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerificationDetailsPage;
