
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeclarationForm from '@/components/declaration/DeclarationForm';
import { Declaration } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

const EditDeclarationPage = () => {
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
            teacher:teacher_id(first_name, last_name),
            department:department_id(name),
            course_element:course_element_id(name)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Check if user can edit this declaration
        if (user.role !== 'admin' && user.id !== data.teacher_id) {
          throw new Error("Vous n'avez pas les droits pour modifier cette déclaration");
        }
        
        // Check if declaration can be edited
        if (data.status !== 'brouillon') {
          navigate(`/declarations/${id}`);
          toast.info("Les déclarations soumises ne peuvent plus être modifiées");
          return;
        }
        
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
  }, [id, user, navigate]);
  
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
            {error || "La déclaration que vous essayez de modifier n'existe pas ou vous n'avez pas les droits pour la modifier."}
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
  
  return <DeclarationForm existingDeclaration={declaration} />;
};

export default EditDeclarationPage;
