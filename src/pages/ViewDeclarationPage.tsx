
import { useParams, useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Download, FileText, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import DeclarationForm from '@/components/DeclarationForm';
import DeclarationStatusBadge from '@/components/DeclarationStatusBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ViewDeclarationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getDeclarationById, deleteDeclaration } = useDeclarations();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const declaration = getDeclarationById(id || '');
  
  if (!declaration) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <FileText className="h-4 w-4" />
          <AlertTitle>Déclaration introuvable</AlertTitle>
          <AlertDescription>
            La déclaration que vous essayez de consulter n'existe pas ou vous n'avez pas les droits pour la consulter.
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

  const canDelete = user?.id === declaration.userId && declaration.status === 'draft';
  const canEdit = user?.id === declaration.userId && declaration.status === 'draft';
  
  const handleDelete = () => {
    deleteDeclaration(declaration.id);
    navigate('/declarations');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Déclaration
            <DeclarationStatusBadge status={declaration.status} />
          </h1>
          <p className="text-muted-foreground">
            Créée le {format(parseISO(declaration.createdAt), 'PPP', { locale: fr })}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {canEdit && (
            <Button variant="outline" onClick={() => navigate(`/declarations/${declaration.id}/edit`)}>
              Modifier
            </Button>
          )}
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
          
          {canDelete && (
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action ne peut pas être annulée. Cela supprimera définitivement cette déclaration et toutes ses données.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Statut de validation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${declaration.status === 'submitted' || declaration.status === 'verified' || declaration.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Soumission</p>
                  {declaration.status !== 'draft' && (
                    <p className="text-xs text-gray-500">
                      {format(parseISO(declaration.updatedAt), 'PPP', { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${declaration.status === 'verified' || declaration.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Vérification</p>
                  {declaration.verifiedBy && (
                    <p className="text-xs text-gray-500">
                      par {declaration.verifiedBy}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${declaration.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Approbation</p>
                  {declaration.approvedBy && (
                    <p className="text-xs text-gray-500">
                      par {declaration.approvedBy}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {declaration.rejectionReason && (
            <>
              <Separator className="my-6" />
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800">Motif de rejet</h3>
                <p className="mt-2 text-sm text-red-700">{declaration.rejectionReason}</p>
              </div>
            </>
          )}
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
    </div>
  );
};

export default ViewDeclarationPage;
