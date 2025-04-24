
import { useParams, useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, FileText, X, User, Calendar, BookOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import DeclarationStatusBadge from '@/components/DeclarationStatusBadge';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";
import { toast } from '@/components/ui/sonner';

const ValidationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getDeclarationById, approveDeclaration, declarations } = useDeclarations();
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [declaration, setDeclaration] = useState(getDeclarationById(id || ''));
  
  useEffect(() => {
    const foundDeclaration = getDeclarationById(id || '');
    if (foundDeclaration) {
      console.log("Declaration found:", foundDeclaration);
      setDeclaration(foundDeclaration);
    } else {
      console.log("Declaration not found for ID:", id);
    }
  }, [id, declarations, getDeclarationById]);
  
  // Determine if the status is valid for the current user role
  const determineValidStatus = () => {
    if (!user || !declaration) return false;
    
    if (user.role === 'chef_departement') {
      return declaration.status === 'verifiee';
    } else if (user.role === 'directrice_etudes') {
      return declaration.status === 'validee';
    }
    return false;
  };
  
  const isValidStatus = determineValidStatus();
  
  // Check department permissions for chef_departement
  const hasPermission = () => {
    if (!user || !declaration) return false;
    
    if (user.role === 'chef_departement') {
      return declaration.department_id === user.department_id;
    }
    
    return true; // directrice_etudes has permission for all departments
  };

  if (!declaration) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <FileText className="h-4 w-4" />
          <AlertTitle>Déclaration introuvable</AlertTitle>
          <AlertDescription>
            La déclaration que vous essayez de {user?.role === 'directrice_etudes' ? 'approuver' : 'valider'} n'existe pas 
            ou a été supprimée.
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

  if (!isValidStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <FileText className="h-4 w-4" />
          <AlertTitle>Statut non valide</AlertTitle>
          <AlertDescription>
            Cette déclaration n'est pas en attente de {user?.role === 'directrice_etudes' ? 'approbation' : 'validation'}.
            Son statut actuel est: <span className="font-semibold">{declaration.status}</span>.
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

  if (!hasPermission()) {
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
    if (!declaration || !user) return;
    
    try {
      approveDeclaration(declaration.id, true);
      toast.success('Déclaration ' + (user.role === 'directrice_etudes' ? 'approuvée' : 'validée') + ' avec succès');
      navigate('/validation');
    } catch (error) {
      console.error('Error approving declaration:', error);
      toast.error('Une erreur est survenue lors de la validation');
    }
  };
  
  const handleReject = () => {
    if (!rejectionReason || !declaration) return;
    
    try {
      approveDeclaration(declaration.id, false, rejectionReason);
      toast.success('Déclaration rejetée avec succès');
      navigate('/validation');
    } catch (error) {
      console.error('Error rejecting declaration:', error);
      toast.error('Une erreur est survenue lors du rejet');
    }
  };

  // Calculate progress of the declaration workflow
  const getProgressValue = () => {
    const statusMap: Record<string, number> = {
      'brouillon': 0,
      'soumise': 25,
      'verifiee': 50,
      'validee': 75,
      'approuvee': 100,
      'rejetee': 0
    };
    return statusMap[declaration.status] || 0;
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
      
      <Card className="border shadow-sm">
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Progression</CardTitle>
            <DeclarationStatusBadge status={declaration.status} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Progress value={getProgressValue()} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Soumise</span>
              <span>Vérifiée</span>
              <span>Validée</span>
              <span>Approuvée</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Enseignant
              </h3>
              <p className="mt-1 font-semibold">{declaration.teacherName || declaration.teacher_id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                Département
              </h3>
              <p className="mt-1 font-semibold">{declaration.departmentName || declaration.department_id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Date de déclaration
              </h3>
              <p className="mt-1 font-semibold">{format(new Date(declaration.declaration_date), 'PPP', { locale: fr })}</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">CM</h3>
              <p className="mt-1 font-semibold">{declaration.cm_hours} heures</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">TD</h3>
              <p className="mt-1 font-semibold">{declaration.td_hours} heures</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">TP</h3>
              <p className="mt-1 font-semibold">{declaration.tp_hours} heures</p>
            </div>
            <div className="col-span-full">
              <h3 className="text-sm font-medium text-gray-500">Total</h3>
              <p className="mt-1 font-bold text-lg">{declaration.totalHours} heures</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-500">Élément Constitutif</h3>
            <p className="mt-1">{declaration.course_element_id}</p>
          </div>
          
          {declaration.verified_by && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-500">Vérifiée par</h3>
              <p className="mt-1">{declaration.verified_by}</p>
            </div>
          )}
          
          {declaration.validated_by && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-500">Validée par</h3>
              <p className="mt-1">{declaration.validated_by}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {showRejectForm ? (
        <Card className="border-gray-200 border shadow-sm">
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
