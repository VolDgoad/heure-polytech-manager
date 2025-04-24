
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Declaration } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeclarationStatusBadge from '@/components/DeclarationStatusBadge';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  const getStepStatus = (step: 'submission' | 'verification' | 'validation' | 'approval') => {
    switch (step) {
      case 'submission':
        return { completed: true, date: declaration.declaration_date };
      case 'verification':
        if (declaration.verified_at) return { completed: true, date: declaration.verified_at };
        if (declaration.rejected_at && declaration.rejected_by) return { rejected: true, date: declaration.rejected_at };
        if (declaration.status === 'soumise') return { active: true };
        return { waiting: true };
      case 'validation':
        if (declaration.validated_at) return { completed: true, date: declaration.validated_at };
        if (declaration.rejected_at && declaration.rejected_by) return { rejected: true, date: declaration.rejected_at };
        if (declaration.status === 'verifiee') return { active: true };
        return { waiting: true };
      case 'approval':
        if (declaration.approved_at) return { completed: true, date: declaration.approved_at };
        if (declaration.rejected_at && declaration.rejected_by) return { rejected: true, date: declaration.rejected_at };
        if (declaration.status === 'validee') return { active: true };
        return { waiting: true };
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Détails de la déclaration</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/declarations')}>
            Retour
          </Button>
        </div>
      </div>
      
      <Card className="mb-6 shadow-md border-t-4 border-t-blue-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Déclaration #{id.slice(0, 8)}</CardTitle>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4" />
                {new Date(declaration.declaration_date).toLocaleDateString(undefined, { 
                  day: 'numeric',
                  month: 'long',  
                  year: 'numeric'
                })}
              </div>
            </div>
            <DeclarationStatusBadge status={declaration.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-base font-medium mb-3 text-gray-700 border-b pb-2">Informations générales</h3>
              <div className="space-y-3">
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
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-base font-medium mb-3 text-gray-700 border-b pb-2">Heures déclarées</h3>
              <div className="space-y-3">
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
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-6 text-center">Progression de la validation</h3>
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <StepItem 
                title="Soumission" 
                number={1} 
                icon={<FileText className="h-7 w-7" />}
                status={getStepStatus('submission')}
                actor="Enseignant"
              />
              
              <div className="hidden md:block mt-10 flex-grow h-0.5 bg-gray-300"></div>
              
              <StepItem 
                title="Vérification" 
                number={2} 
                icon={<CheckCircle className="h-7 w-7" />}
                status={getStepStatus('verification')}
                actor="Scolarité"
              />
              
              <div className="hidden md:block mt-10 flex-grow h-0.5 bg-gray-300"></div>
              
              <StepItem 
                title="Validation" 
                number={3} 
                icon={<CheckCircle className="h-7 w-7" />}
                status={getStepStatus('validation')}
                actor="Chef du Département"
              />
              
              <div className="hidden md:block mt-10 flex-grow h-0.5 bg-gray-300"></div>
              
              <StepItem 
                title="Approbation" 
                number={4} 
                icon={<CheckCircle className="h-7 w-7" />}
                status={getStepStatus('approval')}
                actor="Directrice"
              />
            </div>
          </div>
          
          {declaration.rejected_at && declaration.rejection_reason && (
            <div className="mt-8 p-4 border-l-4 border-red-500 bg-red-50 rounded">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-red-700">Déclaration rejetée</h4>
                  <p className="text-sm text-red-600 mt-1">
                    Raison: {declaration.rejection_reason}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Le {new Date(declaration.rejected_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface StepItemProps {
  title: string;
  number: number;
  icon: React.ReactNode;
  status: {
    completed?: boolean;
    active?: boolean;
    waiting?: boolean;
    rejected?: boolean;
    date?: string;
  };
  actor: string;
}

const StepItem = ({ title, number, icon, status, actor }: StepItemProps) => {
  const getBadgeColor = () => {
    if (status.completed) return "bg-green-500";
    if (status.active) return "bg-blue-500";
    if (status.rejected) return "bg-red-500";
    return "bg-gray-500";
  };
  
  const getCircleColor = () => {
    if (status.completed) return "bg-green-100";
    if (status.active) return "bg-blue-100";
    if (status.rejected) return "bg-red-100";
    return "bg-gray-100";
  };
  
  const getIconColor = () => {
    if (status.completed) return "text-green-600";
    if (status.active) return "text-blue-600";
    if (status.rejected) return "text-red-600";
    return "text-gray-500";
  };
  
  const getOpacity = () => {
    if (status.waiting) return "opacity-60";
    return "";
  };
  
  const getStatusText = () => {
    if (status.completed) return "Complété";
    if (status.active) return "En cours";
    if (status.rejected) return "Rejeté";
    return "En attente";
  };
  
  const getStatusColor = () => {
    if (status.completed) return "text-green-600";
    if (status.active) return "text-blue-600";
    if (status.rejected) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div className="flex flex-col items-center">
      <Badge className={`${getBadgeColor()} mb-2`}>Étape {number}</Badge>
      <div className={`w-20 h-20 rounded-full ${getCircleColor()} flex items-center justify-center ${getOpacity()}`}>
        <div className={getIconColor()}>{icon}</div>
      </div>
      <h3 className="mt-2 font-medium text-center">{title}</h3>
      <p className={`${getStatusColor()} font-medium text-sm mt-1`}>{getStatusText()}</p>
      <p className="text-xs text-gray-500 mt-1">{actor}</p>
      {status.date && (
        <p className="text-xs text-gray-500 mt-1">
          {format(new Date(status.date), 'dd/MM/yyyy', { locale: fr })}
        </p>
      )}
    </div>
  );
};

export default ViewDeclarationPage;
