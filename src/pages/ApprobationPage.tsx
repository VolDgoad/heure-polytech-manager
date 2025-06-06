
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDeclarations } from '@/context/DeclarationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import DeclarationCard from '@/components/DeclarationCard';
import { supabase } from '@/integrations/supabase/client';

const ApprobationPage = () => {
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
    
    // Cette page est réservée à la directrice des études
    if (user.role !== 'directrice_etudes') {
      navigate('/unauthorized');
      return;
    }
    
    const fetchDeclarations = async () => {
      try {
        // Log that we're attempting to fetch declarations
        console.log("ApprobationPage - Attempting to fetch declarations from Supabase");
        
        // You would fetch declarations from Supabase here
        // For now, we'll just use the context data and set loading to false
        setLoading(false);
      } catch (error) {
        console.error("Error fetching declarations:", error);
        setLoading(false);
      }
    };
    
    fetchDeclarations();
    
    console.log("ApprobationPage - User role:", user.role);
    console.log("ApprobationPage - Directrice études - pending declarations:", pendingDeclarations);
    console.log("ApprobationPage - Directrice études - validated declarations:", validatedDeclarations);
    
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
  
  if (!user || user.role !== 'directrice_etudes') {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approbation des fiches de service</h1>
        <p className="text-muted-foreground">
          Approuvez les fiches de service validées par les chefs de département
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
              <p className="text-muted-foreground">Aucune fiche en attente d'approbation.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPending.map((declaration) => (
                <DeclarationCard 
                  key={declaration.id} 
                  declaration={declaration} 
                  actions="approve" 
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

export default ApprobationPage;
