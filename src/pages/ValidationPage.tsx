
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Filter, Search } from 'lucide-react';
import { Declaration, DeclarationStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import DeclarationStatusBadge from '@/components/DeclarationStatusBadge';

const statusLabels: Record<DeclarationStatus, string> = {
  brouillon: 'Brouillon',
  soumise: 'Soumise',
  verifiee: 'Vérifiée',
  validee: 'Validée',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée'
};

const ValidationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchDeclarations = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Construction de la requête en fonction du rôle
        let query = supabase
          .from('declarations')
          .select(`
            *,
            course_elements(name),
            departments(name),
            profiles!declarations_teacher_id_fkey(first_name, last_name)
          `);

        // Filtre selon le rôle
        if (user.role === 'chef_departement') {
          // Chef de département: uniquement déclarations vérifiées de son département
          query = query
            .eq('department_id', user.department_id)
            .eq('status', 'verifiee');
        } else if (user.role === 'directrice_etudes') {
          // Directrice: déclarations validées en attente d'approbation
          query = query.eq('status', 'validee');
        }

        const { data, error } = await query;

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
      // Recherche
      let matchesSearch = true;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        matchesSearch =
          declaration.departmentName?.toLowerCase().includes(searchLower) ||
          declaration.teacherName?.toLowerCase().includes(searchLower) ||
          declaration.course_element_name?.toLowerCase().includes(searchLower);
      }

      // Filtrage par statut
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = declaration.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });

  const getPageTitle = () => {
    if (user?.role === 'chef_departement') {
      return 'Validation des déclarations';
    } else if (user?.role === 'directrice_etudes') {
      return 'Approbation des déclarations';
    }
    return 'Gestion des déclarations';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
        <p className="text-muted-foreground">
          {user?.role === 'chef_departement'
            ? 'Validez les déclarations vérifiées de votre département'
            : 'Approuvez les déclarations validées par les chefs de département'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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

        {user?.role === 'directrice_etudes' && (
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 opacity-50" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="validee">Validée</SelectItem>
                <SelectItem value="approuvee">Approuvée</SelectItem>
                <SelectItem value="rejetee">Rejetée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
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
                      onClick={() => navigate(`/validation/${declaration.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <p className="text-lg text-muted-foreground">Aucune déclaration à {user?.role === 'chef_departement' ? 'valider' : 'approuver'} pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default ValidationPage;
