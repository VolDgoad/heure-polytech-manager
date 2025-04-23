
import { useParams, useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
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

const ValidationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getDeclarationById, approveDeclaration } = useDeclarations();
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  
  const declaration = getDeclarationById(id || '');
  
  // For chef_departement, they should see declarations with status 'verifiee'
  // For directrice_etudes, they should see declarations with status 'validee'
  const isValidStatus = user?.role === 'chef_departement' 
    ? declaration?.status === 'verifiee'
    : declaration?.status === 'validee';
  
  if (!declaration || !isValidStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <FileText className="h-4 w-4" />
          <AlertTitle>Déclaration introuvable</AlertTitle>
          <AlertDescription>
            La déclaration que vous essayez de {user?.role === 'directrice_etudes' ? 'approuver' : 'valider'} n'existe pas, 
            n'est pas en attente de {user?.role === 'directrice_etudes' ? 'approbation' : 'validation'}, 
            ou vous n'avez pas les droits pour la {user?.role === 'directrice_etudes' ? 'approuver' : 'valider'}.
            <div className="mt-4">
              <Button onClick={() => navigate('/validation')}>
                Retour aux {user?.role === 'directrice_etudes' ? 'approbations' : 'validations'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user has permission to validate this declaration
  if (user?.role === 'chef_departement' && declaration.department_id !== user.department_id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <FileText className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous n'avez pas les droits pour valider cette déclaration car elle n'appartient pas à votre département.
            <div className="mt-4">
              <Button onClick={() => navigate('/validation')}>
                Retour aux validations
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleApprove = () => {
    approveDeclaration(declaration.id, true);
    navigate('/validation');
  };
  
  const handleReject = () => {
    if (!rejectionReason) return;
    approveDeclaration(declaration.id, false, rejectionReason);
    navigate('/validation');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {user?.role === 'directrice_etudes' ? 'Approbation' : 'Validation'}
            <DeclarationStatusBadge status={declaration.status} />
          </h1>
          <p className="text-muted-foreground">
            {declaration.status === 'verifiee' && 
              `Vérifiée le ${format(parseISO(declaration.verified_at || declaration.updated_at), 'PPP', { locale: fr })}`}
            {declaration.status === 'validee' && 
              `Validée le ${format(parseISO(declaration.validated_at || declaration.updated_at), 'PPP', { locale: fr })}`}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/validation')}>
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
              <p className="mt-1">{declaration.teacher_id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Département</h3>
              <p className="mt-1">{declaration.department_id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Heures totales</h3>
              <p className="mt-1 font-bold">{declaration.totalHours} heures</p>
            </div>
            {declaration.verified_by && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vérifiée par</h3>
                <p className="mt-1">{declaration.verified_by}</p>
              </div>
            )}
            {declaration.validated_by && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Validée par</h3>
                <p className="mt-1">{declaration.validated_by}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* This component might need to be updated to handle the proper declaration structure */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Détail des sessions</h2>
        </div>
        <div className="p-6">
          {/* We need to update this form to handle our declaration structure */}
          {/* <DeclarationForm existingDeclaration={declaration} isReadOnly={true} /> */}
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
            onClick={handleApprove}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {user?.role === 'chef_departement' ? 'Valider' : 'Approuver'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ValidationDetailsPage;
