
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDeclarations } from '@/context/DeclarationContext';
import { Declaration } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import DeclarationCard from '@/components/DeclarationCard';
import { supabase } from '@/integrations/supabase/client';

const ValidationPage = () => {
  const { user } = useAuth();
  const { declarations } = useDeclarations();
  const navigate = useNavigate();
  const [pendingDeclarations, setPendingDeclarations] = useState<Declaration[]>([]);
  const [validatedDeclarations, setValidatedDeclarations] = useState<Declaration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Initialize declarations based on role
    const fetchDeclarations = async () => {
      try {
        setLoading(true);
        
        let pendingQuery;
        let validatedQuery;
        
        if (user.role === 'chef_departement' && user.department_id) {
          // Chef département: declarations vérifiées dans son département
          pendingQuery = supabase
            .from('declarations')
            .select('*, profiles!teacher_id(first_name, last_name), departments!inner(*)')
            .eq('status', 'verifiee')
            .eq('department_id', user.department_id);
            
          validatedQuery = supabase
            .from('declarations')
            .select('*, profiles!teacher_id(first_name, last_name), departments!inner(*)')
            .in('status', ['validee', 'approuvee', 'rejetee'])
            .eq('department_id', user.department_id)
            .eq('validated_by', user.id);
            
        } else if (user.role === 'directrice_etudes') {
          // Directrice des études: toutes declarations validées
          pendingQuery = supabase
            .from('declarations')
            .select('*, profiles!teacher_id(first_name, last_name), departments!inner(*)')
            .eq('status', 'validee');
            
          validatedQuery = supabase
            .from('declarations')
            .select('*, profiles!teacher_id(first_name, last_name), departments!inner(*)')
            .in('status', ['approuvee', 'rejetee'])
            .eq('approved_by', user.id);
        } else {
          setPendingDeclarations([]);
          setValidatedDeclarations([]);
          setLoading(false);
          return;
        }
        
        // Execute queries
        const [pendingResult, validatedResult] = await Promise.all([
          pendingQuery,
          validatedQuery
        ]);
        
        // Process pending declarations
        if (pendingResult.error) throw pendingResult.error;
        const pending = pendingResult.data.map((declaration: any) => ({
          ...declaration,
          teacherName: `${declaration.profiles?.first_name || ''} ${declaration.profiles?.last_name || ''}`,
          departmentName: declaration.departments?.name || '',
          totalHours: (declaration.cm_hours || 0) + (declaration.td_hours || 0) + (declaration.tp_hours || 0)
        }));
        
        // Process validated declarations
        if (validatedResult.error) throw validatedResult.error;
        const validated = validatedResult.data.map((declaration: any) => ({
          ...declaration,
          teacherName: `${declaration.profiles?.first_name || ''} ${declaration.profiles?.last_name || ''}`,
          departmentName: declaration.departments?.name || '',
          totalHours: (declaration.cm_hours || 0) + (declaration.td_hours || 0) + (declaration.tp_hours || 0)
        }));
        
        setPendingDeclarations(pending);
        setValidatedDeclarations(validated);
      } catch (error) {
        console.error('Error fetching declarations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeclarations();
  }, [user, declarations]);

  // Filter declarations based on search
  const filteredPending = pendingDeclarations.filter(
    (declaration) => 
      declaration.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      declaration.departmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      declaration.course_element_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredValidated = validatedDeclarations.filter(
    (declaration) => 
      declaration.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      declaration.departmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      declaration.course_element_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const validateAction = user?.role === 'chef_departement' ? 'approve' : 'verify';
  
  if (!user || (user.role !== 'chef_departement' && user.role !== 'directrice_etudes')) {
    navigate('/unauthorized');
    return null;
  }
  
  const getTitle = () => {
    if (user?.role === 'chef_departement') {
      return "Validation des fiches de service";
    } else if (user?.role === 'directrice_etudes') {
      return "Approbation des fiches de service";
    }
    return "Validation";
  };
  
  const getEmptyMessage = () => {
    if (user?.role === 'chef_departement') {
      return "Aucune fiche en attente de validation par le chef de département.";
    } else if (user?.role === 'directrice_etudes') {
      return "Aucune fiche en attente d'approbation par la directrice des études.";
    }
    return "Aucune fiche en attente.";
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <p className="text-muted-foreground">
          {user?.role === 'chef_departement' 
            ? "Validez les fiches de service vérifiées par la scolarité."
            : "Approuvez les fiches de service validées par les chefs de département."}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">En attente{filteredPending.length > 0 && ` (${filteredPending.length})`}</TabsTrigger>
          <TabsTrigger value="validated">Traitées{filteredValidated.length > 0 && ` (${filteredValidated.length})`}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {loading ? (
            <div className="text-center py-8">Chargement des fiches...</div>
          ) : filteredPending.length === 0 ? (
            <Card className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">{getEmptyMessage()}</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPending.map((declaration) => (
                <DeclarationCard 
                  key={declaration.id} 
                  declaration={declaration} 
                  actions={validateAction} 
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="validated">
          {loading ? (
            <div className="text-center py-8">Chargement des fiches...</div>
          ) : filteredValidated.length === 0 ? (
            <Card className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Aucune fiche traitée.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredValidated.map((declaration) => (
                <DeclarationCard 
                  key={declaration.id} 
                  declaration={declaration} 
                  actions="view" 
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ValidationPage;
