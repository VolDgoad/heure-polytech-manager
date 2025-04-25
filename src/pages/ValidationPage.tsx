import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDeclarations } from '@/context/DeclarationContext';
import { Declaration } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import DeclarationCard from '@/components/DeclarationCard';

const ValidationPage = () => {
  const { user } = useAuth();
  const { declarations, pendingDeclarations } = useDeclarations();
  const navigate = useNavigate();
  const [validatedDeclarations, setValidatedDeclarations] = useState<Declaration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'chef_departement' && user.role !== 'directrice_etudes') {
      navigate('/unauthorized');
      return;
    }
    
    setLoading(true);
    
    try {
      // Filter validated declarations based on user role
      let validated: Declaration[] = [];
      
      if (user.role === 'chef_departement' && user.department_id) {
        validated = declarations.filter(d => 
          (d.status === 'validee' || d.status === 'approuvee' || d.status === 'rejetee') && 
          d.department_id === user.department_id &&
          d.validated_by === user.id
        );
        
        console.log("Chef département - validated declarations:", validated);
        console.log("Chef département - pending declarations:", pendingDeclarations);
        
      } else if (user.role === 'directrice_etudes') {
        validated = declarations.filter(d => 
          (d.status === 'approuvee' || d.status === 'rejetee') && 
          d.approved_by === user.id
        );
        
        console.log("Directrice études - validated declarations:", validated);
        console.log("Directrice études - pending declarations:", pendingDeclarations);
      }
      
      setValidatedDeclarations(validated);
    } catch (error) {
      console.error('Error filtering declarations:', error);
    } finally {
      setLoading(false);
    }
  }, [user, declarations, pendingDeclarations, navigate]);

  // Filter declarations based on search
  const filteredPending = pendingDeclarations.filter(
    (declaration) => 
      (declaration.teacherName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (declaration.departmentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (declaration.course_element_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredValidated = validatedDeclarations.filter(
    (declaration) => 
      (declaration.teacherName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (declaration.departmentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (declaration.course_element_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const validateAction = user?.role === 'chef_departement' ? 'approve' : 'approve';
  
  if (!user || (user.role !== 'chef_departement' && user.role !== 'directrice_etudes')) {
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
  
  console.log("ValidationPage - rendering with filtered pending:", pendingDeclarations);
  
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
