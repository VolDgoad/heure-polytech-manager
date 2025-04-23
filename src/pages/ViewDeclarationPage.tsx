
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Declaration } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeclarationStatusBadge } from '@/components/DeclarationStatusBadge';

const ViewDeclarationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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
            profiles!declarations_teacher_id_fkey(first_name, last_name),
            department:department_id(name),
            course_element:course_element_id(name)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Process declaration data
        const processedDeclaration: Declaration = {
          ...data,
          teacherName: `${data.profiles.first_name} ${data.profiles.last_name}`,
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
  
  if (loading) {
    return <div className="flex justify-center p-8">Chargement de la déclaration...</div>;
  }
  
  if (error || !declaration) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <FileX className="h-4 w-4" />
          <AlertTitle>Déclaration introuvable</AlertTitle>
          <AlertDescription>
            {error || "La déclaration que vous essayez de consulter n'existe pas."}
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
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Détails de la déclaration</h1>
        <div className="flex space-x-2">
          {declaration.status === 'brouillon' && (
            <Button onClick={() => navigate(`/declarations/${id}/edit`)}>
              Modifier
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/declarations')}>
            Retour
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Déclaration #{id.slice(0, 8)}</CardTitle>
              <CardDescription>
                Soumis le {new Date(declaration.declaration_date).toLocaleDateString()}
              </CardDescription>
            </div>
            <DeclarationStatusBadge status={declaration.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Informations générales</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enseignant:</span>
                  <span className="font-medium">{declaration.teacherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Département:</span>
                  <span className="font-medium">{declaration.departmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Élément Constitutif:</span>
                  <span className="font-medium">{declaration.course_element_name}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Heures déclarées</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cours Magistraux (CM):</span>
                  <span className="font-medium">{declaration.cm_hours} heures</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Travaux Dirigés (TD):</span>
                  <span className="font-medium">{declaration.td_hours} heures</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Travaux Pratiques (TP):</span>
                  <span className="font-medium">{declaration.tp_hours} heures</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>{declaration.totalHours} heures</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Afficher les détails du processus de validation si la déclaration a été soumise */}
          {declaration.status !== 'brouillon' && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Processus de validation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-2">Vérification (Scolarité)</h4>
                  <p>Statut: {declaration.verified_at ? 'Vérifié' : 'En attente'}</p>
                  {declaration.verified_at && (
                    <p className="text-sm text-muted-foreground">
                      Le {new Date(declaration.verified_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-2">Validation (Chef Département)</h4>
                  <p>Statut: {declaration.validated_at ? 'Validé' : declaration.rejected_at ? 'Rejeté' : 'En attente'}</p>
                  {declaration.validated_at && (
                    <p className="text-sm text-muted-foreground">
                      Le {new Date(declaration.validated_at).toLocaleDateString()}
                    </p>
                  )}
                  {declaration.rejected_at && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Le {new Date(declaration.rejected_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-destructive mt-2">
                        Raison: {declaration.rejection_reason}
                      </p>
                    </>
                  )}
                </div>
                
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-2">Approbation (Directrice)</h4>
                  <p>Statut: {declaration.approved_at ? 'Approuvé' : 'En attente'}</p>
                  {declaration.approved_at && (
                    <p className="text-sm text-muted-foreground">
                      Le {new Date(declaration.approved_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewDeclarationPage;
