
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Declaration } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Download, 
  FileText, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { useDeclarations } from '@/context/DeclarationContext';

const ViewDeclarationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { deleteDeclaration } = useDeclarations();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDeclaration = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('declarations')
          .select(`
            *,
            teacher:teacher_id(first_name, last_name),
            department:department_id(name),
            course_element:course_element_id(name)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Process declaration data
        const processedDeclaration: Declaration = {
          ...data,
          teacherName: `${data.teacher.first_name} ${data.teacher.last_name}`,
          departmentName: data.department.name,
          course_element_name: data.course_element.name,
          totalHours: (data.cm_hours || 0) + (data.td_hours || 0) + (data.tp_hours || 0)
        };
        
        setDeclaration(processedDeclaration);
      } catch (err: any) {
        console.error('Error fetching declaration:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement de la déclaration');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeclaration();
  }, [id, user]);
  
  const handleDelete = async () => {
    if (!declaration || !user) return;
    
    try {
      const { error } = await supabase
        .from('declarations')
        .delete()
        .eq('id', declaration.id);
        
      if (error) throw error;
      
      // Update local state through context
      deleteDeclaration(declaration.id);
      
      toast.success('Déclaration supprimée avec succès');
      navigate('/declarations');
    } catch (err: any) {
      console.error('Error deleting declaration:', err);
      toast.error('Erreur lors de la suppression de la déclaration');
    }
  };
  
  const canDelete = declaration && user?.id === declaration.teacher_id && declaration.status === 'brouillon';
  const canEdit = declaration && user?.id === declaration.teacher_id && declaration.status === 'brouillon';
  
  if (loading) {
    return <div className="flex justify-center p-8">Chargement de la déclaration...</div>;
  }
  
  if (error || !declaration) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <FileText className="h-4 w-4" />
          <AlertTitle>Déclaration introuvable</AlertTitle>
          <AlertDescription>
            {error || "La déclaration que vous essayez de consulter n'existe pas ou vous n'avez pas les droits pour la consulter."}
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Déclaration
            <DeclarationStatusBadge status={declaration.status} />
          </h1>
          <p className="text-muted-foreground">
            Créée le {format(parseISO(declaration.created_at), 'PPP', { locale: fr })}
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
            {declaration.course_element_name && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Élément Constitutif</h3>
                <p className="mt-1">{declaration.course_element_name}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">CM</h3>
              <p className="mt-1">{declaration.cm_hours} heures</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">TD</h3>
              <p className="mt-1">{declaration.td_hours} heures</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">TP</h3>
              <p className="mt-1">{declaration.tp_hours} heures</p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Statut de validation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${declaration.status === 'soumise' || declaration.status === 'verifiee' || declaration.status === 'validee' || declaration.status === 'approuvee' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Soumission</p>
                  {declaration.status !== 'brouillon' && (
                    <p className="text-xs text-gray-500">
                      {format(parseISO(declaration.updated_at), 'PPP', { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${declaration.status === 'verifiee' || declaration.status === 'validee' || declaration.status === 'approuvee' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Vérification</p>
                  {declaration.verified_by && (
                    <p className="text-xs text-gray-500">
                      par {declaration.verified_by}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${declaration.status === 'validee' || declaration.status === 'approuvee' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Validation</p>
                  {declaration.validated_by && (
                    <p className="text-xs text-gray-500">
                      par {declaration.validated_by}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${declaration.status === 'approuvee' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  4
                </div>
                <div>
                  <p className="text-sm font-medium">Approbation</p>
                  {declaration.approved_by && (
                    <p className="text-xs text-gray-500">
                      par {declaration.approved_by}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {declaration.rejection_reason && (
            <>
              <Separator className="my-6" />
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800">Motif de rejet</h3>
                <p className="mt-2 text-sm text-red-700">{declaration.rejection_reason}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewDeclarationPage;
