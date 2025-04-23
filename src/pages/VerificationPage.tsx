
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search } from 'lucide-react';
import { Declaration } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import DeclarationStatusBadge from '@/components/DeclarationStatusBadge';

const VerificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDeclarations = async () => {
      if (!user || user.role !== 'scolarite') return;

      try {
        setLoading(true);

        // Récupérer uniquement les déclarations soumises en attente de vérification
        const { data, error } = await supabase
          .from('declarations')
          .select(`
            *,
            course_elements(name),
            departments(name),
            profiles!declarations_teacher_id_fkey(first_name, last_name)
          `)
          .eq('status', 'soumise');

        if (error) throw error;

        // Transformer les données
        const transformedData = data?.map(d => ({
          ...d,
          departmentName: d.departments?.name || 'Non spécifié',
          teacherName: d.profiles 
            ? `${d.profiles.first_name} ${d.profiles.last_name}` 
            : 'Enseignant inconnu',
          course_element_name: d.course_elements?.name || 'Non spécifié',
          totalHours: Number(d.cm_hours) + Number(d.td_hours) + Number(d.tp_hours)
        })) || [];

        setDeclarations(transformedData);
      } catch (error: any) {
        console.error('Error fetching declarations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarations();
  }, [user]);

  const filteredDeclarations = declarations
    .filter(declaration => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        declaration.departmentName?.toLowerCase().includes(searchLower) ||
        declaration.teacherName?.toLowerCase().includes(searchLower) ||
        declaration.course_element_name?.toLowerCase().includes(searchLower)
      );
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vérification des déclarations</h1>
        <p className="text-muted-foreground">
          Vérifiez les déclarations soumises par les enseignants
        </p>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setSearchTerm('')}>
          Réinitialiser
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <p>Chargement des déclarations...</p>
        </div>
      ) : filteredDeclarations.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Enseignant</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Élément Constitutif</TableHead>
                <TableHead>CM</TableHead>
                <TableHead>TD</TableHead>
                <TableHead>TP</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeclarations.map((declaration) => (
                <TableRow key={declaration.id}>
                  <TableCell className="font-medium">
                    {format(new Date(declaration.declaration_date), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>{declaration.teacherName}</TableCell>
                  <TableCell>{declaration.departmentName}</TableCell>
                  <TableCell>{declaration.course_element_name}</TableCell>
                  <TableCell>{declaration.cm_hours}h</TableCell>
                  <TableCell>{declaration.td_hours}h</TableCell>
                  <TableCell>{declaration.tp_hours}h</TableCell>
                  <TableCell>{declaration.totalHours}h</TableCell>
                  <TableCell>
                    <DeclarationStatusBadge status={declaration.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(`/verification/${declaration.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Vérifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <p className="text-lg text-muted-foreground">Aucune déclaration à vérifier pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
