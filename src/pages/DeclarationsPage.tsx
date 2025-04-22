
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Search, Filter } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DeclarationStatus, Declaration } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<DeclarationStatus, string> = {
  brouillon: 'bg-gray-200 text-gray-800',
  soumise: 'bg-blue-100 text-blue-800',
  verifiee: 'bg-purple-100 text-purple-800',
  validee: 'bg-yellow-100 text-yellow-800',
  approuvee: 'bg-green-100 text-green-800',
  rejetee: 'bg-red-100 text-red-800'
};

const statusLabels: Record<DeclarationStatus, string> = {
  brouillon: 'Brouillon',
  soumise: 'Soumise',
  verifiee: 'Vérifiée',
  validee: 'Validée',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée'
};

const DeclarationsPage = () => {
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
        
        let query = supabase
          .from('declarations')
          .select(`
            *,
            course_elements(name),
            departments(name)
          `)
          .order('created_at', { ascending: false });
          
        // Only fetch user's declarations if they're not admin or specific roles
        if (!['admin', 'directrice_etudes', 'scolarite'].includes(user.role)) {
          query = query.eq('teacher_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setDeclarations(data || []);
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
      let matchesSearch = true;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        // Access course element name through the relation
        const courseName = declaration.course_elements?.name?.toLowerCase() || '';
        // Access department name through the relation
        const departmentName = declaration.departments?.name?.toLowerCase() || '';
        
        matchesSearch = courseName.includes(searchLower) || 
                      departmentName.includes(searchLower);
      }
      
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = declaration.status === statusFilter;
      }
      
      return matchesSearch && matchesStatus;
    });
    
  const getTotalHours = (declaration: Declaration) => {
    return Number(declaration.cm_hours) + Number(declaration.td_hours) + Number(declaration.tp_hours);
  };
    
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mes Déclarations</h1>
          <p className="text-muted-foreground">
            Gérez vos déclarations d'heures d'enseignement
          </p>
        </div>
        <Button onClick={() => navigate('/declarations/new')}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Déclaration
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
            <Input
              placeholder="Rechercher par EC ou département..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            Réinitialiser
          </Button>
        </div>
        
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
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="soumise">Soumise</SelectItem>
              <SelectItem value="verifiee">Vérifiée</SelectItem>
              <SelectItem value="validee">Validée</SelectItem>
              <SelectItem value="approuvee">Approuvée</SelectItem>
              <SelectItem value="rejetee">Rejetée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <p>Chargement des déclarations...</p>
        </div>
      ) : filteredDeclarations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeclarations.map((declaration) => (
            <div 
              key={declaration.id} 
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/declarations/${declaration.id}`)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-sm truncate flex-1">
                    {declaration.course_elements?.name || 'EC non spécifié'}
                  </h3>
                  <Badge className={statusColors[declaration.status]}>
                    {statusLabels[declaration.status]}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  Département: {declaration.departments?.name || 'Non spécifié'}
                </p>
                
                <p className="text-sm text-gray-600 mb-3">
                  Date: {format(new Date(declaration.declaration_date), 'PPP', { locale: fr })}
                </p>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-xs text-gray-500">CM</p>
                    <p className="font-medium">{declaration.cm_hours}h</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-xs text-gray-500">TD</p>
                    <p className="font-medium">{declaration.td_hours}h</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-xs text-gray-500">TP</p>
                    <p className="font-medium">{declaration.tp_hours}h</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">
                    Total: {getTotalHours(declaration)}h
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {format(new Date(declaration.created_at), 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <FileText className="h-20 w-20 text-gray-300" />
          <h3 className="text-xl font-semibold">Aucune déclaration trouvée</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {searchTerm || statusFilter !== 'all'
              ? "Aucune déclaration ne correspond à votre recherche. Essayez d'autres critères."
              : "Vous n'avez pas encore de déclarations. Créez votre première déclaration d'heures."}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => navigate('/declarations/new')}>
              Créer une déclaration
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DeclarationsPage;
