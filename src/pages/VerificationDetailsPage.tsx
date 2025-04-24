
import { useParams, useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, FileText, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import DeclarationStatusBadge from '@/components/DeclarationStatusBadge';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const VerificationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getDeclarationById, verifyDeclaration } = useDeclarations();
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  
  const declaration = getDeclarationById(id || '');
  
  if (!declaration || declaration.status !== 'soumise') {
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
            Soumise le {format(parseISO(declaration.created_at), 'PPP', { locale: fr })}
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
              <p className="mt-1">{declaration.teacherName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Département</h3>
              <p className="mt-1">{declaration.departmentName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Heures totales</h3>
              <p className="mt-1 font-bold">{declaration.totalHours} heures</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg">Détail des heures</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cours Magistraux (CM)</h3>
              <p className="mt-1">{declaration.cm_hours} heures</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Travaux Dirigés (TD)</h3>
              <p className="mt-1">{declaration.td_hours} heures</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Travaux Pratiques (TP)</h3>
              <p className="mt-1">{declaration.tp_hours} heures</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Suivi du processus de validation</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex flex-col items-center">
              <Badge className="bg-blue-500 mb-2">Étape 1</Badge>
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-2 font-medium text-center">Soumission</h3>
              <p className="text-green-600 font-medium text-sm mt-1">Complété</p>
              <p className="text-xs text-gray-500 mt-1">{format(parseISO(declaration.created_at), 'dd/MM/yyyy', { locale: fr })}</p>
            </div>
            <div className="hidden md:block mt-10 flex-grow h-0.5 bg-gray-300"></div>
            
            <div className="flex flex-col items-center">
              <Badge className="bg-yellow-500 mb-2">Étape 2</Badge>
              <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="mt-2 font-medium text-center">Vérification</h3>
              <p className="text-yellow-600 font-medium text-sm mt-1">En cours</p>
              <p className="text-xs text-gray-500 mt-1">Scolarité</p>
            </div>
            <div className="hidden md:block mt-10 flex-grow h-0.5 bg-gray-300"></div>
            
            <div className="flex flex-col items-center">
              <Badge className="bg-gray-500 mb-2">Étape 3</Badge>
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center opacity-60">
                <CheckCircle className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mt-2 font-medium text-center">Validation</h3>
              <p className="text-gray-500 font-medium text-sm mt-1">En attente</p>
              <p className="text-xs text-gray-500 mt-1">Chef de Département</p>
            </div>
            <div className="hidden md:block mt-10 flex-grow h-0.5 bg-gray-300"></div>
            
            <div className="flex flex-col items-center">
              <Badge className="bg-gray-500 mb-2">Étape 4</Badge>
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center opacity-60">
                <CheckCircle className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mt-2 font-medium text-center">Approbation</h3>
              <p className="text-gray-500 font-medium text-sm mt-1">En attente</p>
              <p className="text-xs text-gray-500 mt-1">Directrice</p>
            </div>
          </div>
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
