
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

const VerificationPage = () => {
  const { user } = useAuth();
  const { declarations } = useDeclarations();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingDeclarations, setPendingDeclarations] = useState<Declaration[]>([]);
  const [verifiedDeclarations, setVerifiedDeclarations] = useState<Declaration[]>([]);
  
  useEffect(() => {
    if (!user || user.role !== 'scolarite') {
      navigate('/unauthorized');
      return;
    }
    
    // Explicitly filter the declarations for the scolarité user
    if (user) {
      // Pending declarations are those with status 'soumise'
      const pending = declarations.filter(d => d.status === 'soumise');
      
      // Verified declarations are those that have been verified or rejected by this user
      const verified = declarations.filter(d => 
        (d.status === 'verifiee' || d.status === 'rejetee') && 
        d.verified_by === user.id
      );
      
      setPendingDeclarations(pending);
      setVerifiedDeclarations(verified);
      
      console.log("Pending declarations for verification:", pending);
      console.log("Verified declarations:", verified);
    }
    
    setLoading(false);
  }, [user, navigate, declarations]);
  
  // Filter declarations based on search
  const filteredPending = pendingDeclarations.filter(
    (declaration) => 
      (declaration.teacherName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (declaration.departmentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (declaration.course_element_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredVerified = verifiedDeclarations.filter(
    (declaration) => 
      (declaration.teacherName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (declaration.departmentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (declaration.course_element_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (!user || user.role !== 'scolarite') {
    return null;
  }
  
  console.log("Rendering VerificationPage with filtered pending:", filteredPending);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vérification des fiches de service</h1>
        <p className="text-muted-foreground">
          Vérifiez les fiches de service soumises par les enseignants avant validation par les chefs de département.
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
          <TabsTrigger value="verified">Vérifiées{filteredVerified.length > 0 && ` (${filteredVerified.length})`}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {loading ? (
            <div className="text-center py-8">Chargement des fiches...</div>
          ) : filteredPending.length === 0 ? (
            <Card className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Aucune fiche en attente de vérification.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPending.map((declaration) => (
                <DeclarationCard 
                  key={declaration.id} 
                  declaration={declaration} 
                  actions="verify" 
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="verified">
          {loading ? (
            <div className="text-center py-8">Chargement des fiches...</div>
          ) : filteredVerified.length === 0 ? (
            <Card className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Aucune fiche vérifiée.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredVerified.map((declaration) => (
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

export default VerificationPage;
