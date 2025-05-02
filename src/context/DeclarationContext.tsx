import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Declaration, DeclarationStatus, PaymentStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { NotificationService } from '@/services/NotificationService';

// Define the context type
interface DeclarationContextType {
  declarations: Declaration[];
  pendingDeclarations: Declaration[];
  validatedDeclarations: Declaration[];
  getDeclarationById: (id: string) => Declaration | undefined;
  createDeclaration: (sessions: any) => Promise<void>;
  updateDeclaration: (id: string, sessions: any) => Promise<void>;
  submitDeclaration: (id: string) => Promise<void>;
  verifyDeclaration: (id: string, isVerified: boolean, rejectionReason?: string) => Promise<void>;
  validateDeclaration: (id: string, isValidated: boolean, rejectionReason?: string) => Promise<void>;
  approveDeclaration: (id: string, isApproved: boolean, rejectionReason?: string) => Promise<void>;
  rejectDeclaration: (id: string, rejectionReason: string) => Promise<void>;
}

// Create the context with default values
const DeclarationContext = createContext<DeclarationContextType>({
  declarations: [],
  pendingDeclarations: [],
  validatedDeclarations: [],
  getDeclarationById: () => undefined,
  createDeclaration: async () => {},
  updateDeclaration: async () => {},
  submitDeclaration: async () => {},
  verifyDeclaration: async () => {},
  validateDeclaration: async () => {},
  approveDeclaration: async () => {},
  rejectDeclaration: async () => {},
});

// Create the provider component
export const DeclarationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [pendingDeclarations, setPendingDeclarations] = useState<Declaration[]>([]);
  const [validatedDeclarations, setValidatedDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch declarations on mount or when user changes
  useEffect(() => {
    if (!user) return;
    
    const fetchDeclarations = async () => {
      try {
        setLoading(true);
        console.log('Fetching declarations from Supabase for user:', user.id, user.role);
        
        const { data, error } = await supabase
          .from('declarations')
          .select(`*, 
            profiles!declarations_teacher_id_fkey(first_name, last_name),
            departments!declarations_department_id_fkey(name)
          `);
          
        if (error) {
          console.error('Error fetching declarations:', error);
          throw error;
        }
        
        console.log('Fetched declarations from Supabase:', data);
        
        // Process and set declarations
        const processedDeclarations: Declaration[] = data.map((declaration: any) => ({
          ...declaration,
          teacherName: declaration.profiles ? 
            `${declaration.profiles.first_name} ${declaration.profiles.last_name}` : 
            'Enseignant inconnu',
          departmentName: declaration.departments ? declaration.departments.name : 'Département inconnu',
          totalHours: (declaration.cm_hours || 0) + (declaration.td_hours || 0) + (declaration.tp_hours || 0)
        }));
        
        setDeclarations(processedDeclarations);
        setLoading(false);
        
      } catch (error: any) {
        console.error('Error fetching declarations:', error.message);
        setLoading(false);
      }
    };
    
    fetchDeclarations();
    
  }, [user]);

  // Filter declarations based on user role whenever declarations change
  useEffect(() => {
    filterDeclarations();
  }, [declarations, user]);
  
  // Function to filter declarations based on user role
  const filterDeclarations = () => {
    if (!user) {
      setPendingDeclarations([]);
      setValidatedDeclarations([]);
      return;
    }
    
    let pendingFiltered: Declaration[] = [];
    let validatedFiltered: Declaration[] = [];
    
    console.log('Filtering declarations for user role:', user.role);
    console.log('Current declarations:', declarations);
    
    switch(user.role) {
      case 'scolarite':
        // Scolarité sees declarations with status "soumise"
        pendingFiltered = declarations.filter(d => d.status === 'soumise');
        validatedFiltered = declarations.filter(d => 
          (d.status === 'verifiee' || d.status === 'rejetee') && 
          d.verified_by === user.id
        );
        console.log('Scolarité filtered pending:', pendingFiltered);
        console.log('Scolarité filtered validated:', validatedFiltered);
        break;
        
      case 'chef_departement':
        // Chef de département sees declarations with status "verifiee" and matching department_id
        pendingFiltered = declarations.filter(d => 
          d.status === 'verifiee' && 
          d.department_id === user.department_id
        );
        validatedFiltered = declarations.filter(d => 
          (d.status === 'validee' || d.status === 'rejetee') && 
          d.validated_by === user.id
        );
        console.log('Chef département filtered pending:', pendingFiltered);
        console.log('Chef département filtered validated:', validatedFiltered);
        break;
        
      case 'directrice_etudes':
        // Directrice des études sees declarations with status "validee"
        pendingFiltered = declarations.filter(d => d.status === 'validee');
        validatedFiltered = declarations.filter(d => 
          (d.status === 'approuvee' || d.status === 'rejetee') && 
          d.approved_by === user.id
        );
        console.log('Directrice études filtered pending:', pendingFiltered);
        console.log('Directrice études filtered validated:', validatedFiltered);
        break;
        
      case 'enseignant':
        // Enseignants see their own declarations with status "brouillon"
        pendingFiltered = declarations.filter(d => 
          d.teacher_id === user.id && 
          d.status === 'brouillon'
        );
        validatedFiltered = declarations.filter(d => 
          d.teacher_id === user.id && 
          d.status !== 'brouillon'
        );
        console.log('Enseignant filtered pending:', pendingFiltered);
        console.log('Enseignant filtered validated:', validatedFiltered);
        break;
        
      default:
        pendingFiltered = [];
        validatedFiltered = [];
    }
    
    setPendingDeclarations(pendingFiltered);
    setValidatedDeclarations(validatedFiltered);
    console.log('Setting pendingDeclarations to:', pendingFiltered);
    console.log('Setting validatedDeclarations to:', validatedFiltered);
  };

  // Function to get a declaration by ID
  const getDeclarationById = (id: string): Declaration | undefined => {
    return declarations.find(d => d.id === id);
  };

  // Function to create a new declaration
  const createDeclaration = async (sessions: any) => {
    try {
      if (!user) {
        toast.error('Vous devez être connecté pour créer une déclaration');
        return;
      }
      
      const newDeclaration = {
        teacher_id: user.id,
        department_id: user.department_id || '', // Make sure to handle the case where department_id is null
        course_element_id: sessions.course_element_id || '',
        cm_hours: sessions.cm_hours || 0,
        td_hours: sessions.td_hours || 0,
        tp_hours: sessions.tp_hours || 0,
        status: 'brouillon' as DeclarationStatus,
        payment_status: 'non_paye' as PaymentStatus
      };
      
      const { data, error } = await supabase
        .from('declarations')
        .insert(newDeclaration)
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        // Add computed fields
        const createdDeclaration: Declaration = {
          ...data[0],
          teacherName: `${user.first_name} ${user.last_name}`,
          departmentName: '', // Would come from a lookup
          totalHours: (data[0].cm_hours || 0) + (data[0].td_hours || 0) + (data[0].tp_hours || 0)
        };
        
        setDeclarations([...declarations, createdDeclaration]);
        toast.success('Déclaration créée avec succès');
      }
      
    } catch (error: any) {
      console.error('Error creating declaration:', error);
      toast.error(`Erreur lors de la création: ${error.message}`);
    }
  };

  // Function to update a declaration
  const updateDeclaration = async (id: string, sessions: any) => {
    try {
      const { error } = await supabase
        .from('declarations')
        .update({
          ...sessions,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          const updatedDeclaration = { ...d, ...sessions, updated_at: new Date().toISOString() };
          updatedDeclaration.totalHours = (updatedDeclaration.cm_hours || 0) + 
                                          (updatedDeclaration.td_hours || 0) + 
                                          (updatedDeclaration.tp_hours || 0);
          return updatedDeclaration;
        }
        return d;
      });
      
      setDeclarations(updatedDeclarations);
      toast.success('Déclaration mise à jour avec succès');
      
    } catch (error: any) {
      console.error('Error updating declaration:', error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  };

  // Function to submit a declaration for verification
  const submitDeclaration = async (id: string) => {
    try {
      console.log("Submitting declaration with ID:", id);
      
      const { error } = await supabase
        .from('declarations')
        .update({
          status: 'soumise' as DeclarationStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          return { 
            ...d, 
            status: 'soumise' as DeclarationStatus,
            updated_at: new Date().toISOString()
          };
        }
        return d;
      });
      
      // Get the updated declaration
      const updatedDeclaration = updatedDeclarations.find(d => d.id === id);
      
      // Send notification
      if (updatedDeclaration && user) {
        await NotificationService.notifyStatusChange(updatedDeclaration, user, 'soumise');
      }
      
      setDeclarations(updatedDeclarations);
      toast.success('Déclaration soumise avec succès');
      
    } catch (error: any) {
      console.error('Error submitting declaration:', error);
      toast.error(`Erreur lors de la soumission: ${error.message}`);
    }
  };

  // Function to verify a declaration
  const verifyDeclaration = async (id: string, isVerified: boolean, rejectionReason?: string) => {
    try {
      if (!user) return;
      
      const updateData = isVerified ? {
        status: 'verifiee' as DeclarationStatus,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : {
        status: 'rejetee' as DeclarationStatus,
        rejected_by: user.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('declarations')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          return { ...d, ...updateData };
        }
        return d;
      });
      
      // Get the updated declaration
      const updatedDeclaration = updatedDeclarations.find(d => d.id === id);
      
      // Send notification
      if (updatedDeclaration && user) {
        await NotificationService.notifyStatusChange(
          updatedDeclaration, 
          user, 
          isVerified ? 'verifiee' : 'rejetee'
        );
      }
      
      setDeclarations(updatedDeclarations);
      
      if (isVerified) {
        toast.success('Déclaration vérifiée avec succès');
      } else {
        toast.success('Déclaration rejetée');
      }
      
    } catch (error: any) {
      console.error('Error verifying declaration:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  // Function to validate a declaration
  const validateDeclaration = async (id: string, isValidated: boolean, rejectionReason?: string) => {
    try {
      if (!user) return;
      
      const updateData = isValidated ? {
        status: 'validee' as DeclarationStatus,
        validated_by: user.id,
        validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : {
        status: 'rejetee' as DeclarationStatus,
        rejected_by: user.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('declarations')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          return { ...d, ...updateData };
        }
        return d;
      });
      
      // Get the updated declaration
      const updatedDeclaration = updatedDeclarations.find(d => d.id === id);
      
      // Send notification
      if (updatedDeclaration && user) {
        await NotificationService.notifyStatusChange(
          updatedDeclaration, 
          user, 
          isValidated ? 'validee' : 'rejetee'
        );
      }
      
      setDeclarations(updatedDeclarations);
      
      if (isValidated) {
        toast.success('Déclaration validée avec succès');
      } else {
        toast.success('Déclaration rejetée');
      }
      
    } catch (error: any) {
      console.error('Error validating declaration:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  // Function to approve a declaration
  const approveDeclaration = async (id: string, isApproved: boolean, rejectionReason?: string) => {
    try {
      if (!user) return;
      
      const updateData = isApproved ? {
        status: 'approuvee' as DeclarationStatus,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : {
        status: 'rejetee' as DeclarationStatus,
        rejected_by: user.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('declarations')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          return { ...d, ...updateData };
        }
        return d;
      });
      
      // Get the updated declaration
      const updatedDeclaration = updatedDeclarations.find(d => d.id === id);
      
      // Send notification
      if (updatedDeclaration && user) {
        await NotificationService.notifyStatusChange(
          updatedDeclaration, 
          user, 
          isApproved ? 'approuvee' : 'rejetee'
        );
      }
      
      setDeclarations(updatedDeclarations);
      
      if (isApproved) {
        toast.success('Déclaration approuvée avec succès');
      } else {
        toast.success('Déclaration rejetée');
      }
      
    } catch (error: any) {
      console.error('Error approving declaration:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  // Function to reject a declaration
  const rejectDeclaration = async (id: string, rejectionReason: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('declarations')
        .update({
          status: 'rejetee' as DeclarationStatus,
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          return { 
            ...d, 
            status: 'rejetee' as DeclarationStatus,
            rejected_by: user.id,
            rejected_at: new Date().toISOString(),
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString()
          };
        }
        return d;
      });
      
      setDeclarations(updatedDeclarations);
      toast.success('Déclaration rejetée');
      
    } catch (error: any) {
      console.error('Error rejecting declaration:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  return (
    <DeclarationContext.Provider value={{
      declarations,
      pendingDeclarations,
      validatedDeclarations,
      getDeclarationById,
      createDeclaration,
      updateDeclaration,
      submitDeclaration,
      verifyDeclaration,
      validateDeclaration,
      approveDeclaration,
      rejectDeclaration
    }}>
      {children}
    </DeclarationContext.Provider>
  );
};

// Create a custom hook to use the declaration context
export const useDeclarations = () => {
  const context = useContext(DeclarationContext);
  if (context === undefined) {
    throw new Error('useDeclarations must be used within a DeclarationProvider');
  }
  return context;
};
