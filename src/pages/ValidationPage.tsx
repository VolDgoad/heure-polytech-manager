
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDeclarations } from '@/context/DeclarationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import DeclarationCard from '@/components/DeclarationCard';

const ValidationPage = () => {
  const { user } = useAuth();
  const { pendingDeclarations, validatedDeclarations } = useDeclarations();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Cette page est réservée aux chefs de département
    if (user.role !== 'chef_departement') {
      navigate('/unauthorized');
      return;
    }
    
    setLoading(false);
    console.log("ValidationPage - Chef département - pending declarations:", pendingDeclarations);
    console.log("ValidationPage - Chef département - validated declarations:", validatedDeclarations);
    
  }, [user, pendingDeclarations, validatedDeclarations, navigate]);

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
  
  if (!user || user.role !== 'chef_departement') {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Validation des fiches de service</h1>
        <p className="text-muted-foreground">
          Validez les fiches de service vérifiées par la scolarité pour votre département
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
              <p className="text-muted-foreground">Aucune fiche en attente de validation par le chef de département.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPending.map((declaration) => (
                <DeclarationCard 
                  key={declaration.id} 
                  declaration={declaration} 
                  actions="approve"  // Changed from "validate" to "approve"
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
