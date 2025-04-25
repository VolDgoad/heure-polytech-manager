
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Declaration, DeclarationStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

// Define the context type
interface DeclarationContextType {
  declarations: Declaration[];
  pendingDeclarations: Declaration[];
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
  getDeclarationById: () => undefined,
  createDeclaration: async () => {},
  updateDeclaration: async () => {},
  submitDeclaration: async () => {},
  verifyDeclaration: async () => {},
  validateDeclaration: async () => {},
  approveDeclaration: async () => {},
  rejectDeclaration: async () => {},
});

// Update the INITIAL_DECLARATIONS array to include a draft declaration
const INITIAL_DECLARATIONS: Declaration[] = [
  {
    id: '1',
    teacher_id: '1',
    teacherName: 'Dr. Amadou Diop',
    departmentName: 'Informatique',
    department_id: 'dept1',
    course_element_id: 'ce1',
    cm_hours: 2,
    td_hours: 0,
    tp_hours: 3,
    declaration_date: '2023-05-09',
    status: 'soumise',
    payment_status: 'non_paye',
    created_at: '2023-05-09T10:30:00Z',
    updated_at: '2023-05-09T15:45:00Z',
    totalHours: 5
  },
  {
    id: '2',
    teacher_id: '1',
    teacherName: 'Dr. Amadou Diop',
    departmentName: 'Informatique',
    department_id: 'dept1',
    course_element_id: 'ce2',
    cm_hours: 3,
    td_hours: 0,
    tp_hours: 0,
    declaration_date: '2023-05-14',
    status: 'verifiee',
    payment_status: 'non_paye',
    created_at: '2023-05-14T08:20:00Z',
    updated_at: '2023-05-16T14:10:00Z',
    verified_by: 'uid123',
    verified_at: '2023-05-16T14:10:00Z',
    totalHours: 3
  },
  {
    id: '3',
    teacher_id: '1',
    teacherName: 'Dr. Amadou Diop',
    departmentName: 'Informatique',
    department_id: 'dept1',
    course_element_id: 'ce3',
    cm_hours: 1,
    td_hours: 2,
    tp_hours: 1,
    declaration_date: '2023-05-20',
    status: 'brouillon',
    payment_status: 'non_paye',
    created_at: '2023-05-20T09:00:00Z',
    updated_at: '2023-05-20T09:00:00Z',
    totalHours: 4
  },
];

// Create the provider component
export const DeclarationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [declarations, setDeclarations] = useState<Declaration[]>(INITIAL_DECLARATIONS);
  const [pendingDeclarations, setPendingDeclarations] = useState<Declaration[]>([]);

  // Fetch declarations on mount or when user changes
  useEffect(() => {
    if (!user) return;
    
    const fetchDeclarations = async () => {
      try {
        const { data, error } = await supabase
          .from('declarations')
          .select('*');
          
        if (error) throw error;
        
        // Process and set declarations
        const processedDeclarations = data.map((declaration: any) => ({
          ...declaration,
          totalHours: (declaration.cm_hours || 0) + (declaration.td_hours || 0) + (declaration.tp_hours || 0)
        }));
        
        setDeclarations(processedDeclarations);
        
      } catch (error: any) {
        console.error('Error fetching declarations:', error.message);
      }
    };
    
    // For now, use mock data
    // fetchDeclarations();
    
    // Filter pending declarations based on user role
    filterPendingDeclarations();
    
    console.log('DeclarationContext - User role:', user?.role);
    console.log('DeclarationContext - Initial declarations:', INITIAL_DECLARATIONS);
    
  }, [user]);

  // Filter pending declarations based on user role whenever declarations change
  useEffect(() => {
    filterPendingDeclarations();
  }, [declarations, user]);
  
  // Function to filter pending declarations based on user role
  const filterPendingDeclarations = () => {
    if (!user) {
      setPendingDeclarations([]);
      return;
    }
    
    let filtered: Declaration[] = [];
    
    switch(user.role) {
      case 'scolarite':
        filtered = declarations.filter(d => d.status === 'soumise');
        console.log('DeclarationContext - Scolarite filtered:', filtered);
        break;
      case 'chef_departement':
        filtered = declarations.filter(d => 
          d.status === 'verifiee' && 
          d.department_id === user.department_id
        );
        console.log('DeclarationContext - Chef dept filtered:', filtered);
        break;
      case 'directrice_etudes':
        filtered = declarations.filter(d => d.status === 'validee');
        console.log('DeclarationContext - Directrice filtered:', filtered);
        break;
      case 'enseignant':
        filtered = declarations.filter(d => 
          d.teacher_id === user.id && 
          d.status === 'brouillon'
        );
        console.log('DeclarationContext - Enseignant filtered:', filtered);
        break;
      default:
        filtered = [];
    }
    
    setPendingDeclarations(filtered);
    console.log('DeclarationContext - Setting pending declarations:', filtered);
  };

  // Function to get a declaration by ID
  const getDeclarationById = (id: string): Declaration | undefined => {
    return declarations.find(d => d.id === id);
  };

  // Function to create a new declaration
  const createDeclaration = async (sessions: any) => {
    try {
      const newDeclaration: Declaration = {
        id: Date.now().toString(),
        teacher_id: user?.id || '',
        teacherName: `${user?.first_name} ${user?.last_name}`,
        departmentName: 'Informatique', // Would come from department lookup
        department_id: user?.department_id || 'dept1',
        course_element_id: 'ce' + Date.now(),
        cm_hours: 2,
        td_hours: 1,
        tp_hours: 0,
        declaration_date: new Date().toISOString().split('T')[0],
        status: 'brouillon',
        payment_status: 'non_paye',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        totalHours: 3
      };
      
      setDeclarations([...declarations, newDeclaration]);
      toast.success('Déclaration créée avec succès');
      
    } catch (error: any) {
      console.error('Error creating declaration:', error);
      toast.error(`Erreur lors de la création: ${error.message}`);
    }
  };

  // Function to update a declaration
  const updateDeclaration = async (id: string, sessions: any) => {
    try {
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          return { ...d, ...sessions, updated_at: new Date().toISOString() };
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
      
      setDeclarations(updatedDeclarations);
      toast.success('Déclaration soumise avec succès');
      
      console.log("Declaration status updated to 'soumise'");
      console.log("Updated declarations:", updatedDeclarations);
      
    } catch (error: any) {
      console.error('Error submitting declaration:', error);
      toast.error(`Erreur lors de la soumission: ${error.message}`);
    }
  };

  // Function to verify a declaration
  const verifyDeclaration = async (id: string, isVerified: boolean, rejectionReason?: string) => {
    try {
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          if (isVerified) {
            return { 
              ...d, 
              status: 'verifiee' as DeclarationStatus,
              verified_by: user?.id,
              verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          } else {
            return { 
              ...d, 
              status: 'rejetee' as DeclarationStatus,
              rejected_by: user?.id,
              rejected_at: new Date().toISOString(),
              rejection_reason: rejectionReason,
              updated_at: new Date().toISOString()
            };
          }
        }
        return d;
      });
      
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
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          if (isValidated) {
            return { 
              ...d, 
              status: 'validee' as DeclarationStatus,
              validated_by: user?.id,
              validated_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          } else {
            return { 
              ...d, 
              status: 'rejetee' as DeclarationStatus,
              rejected_by: user?.id,
              rejected_at: new Date().toISOString(),
              rejection_reason: rejectionReason,
              updated_at: new Date().toISOString()
            };
          }
        }
        return d;
      });
      
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
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          if (isApproved) {
            return { 
              ...d, 
              status: 'approuvee' as DeclarationStatus,
              approved_by: user?.id,
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          } else {
            return { 
              ...d, 
              status: 'rejetee' as DeclarationStatus,
              rejected_by: user?.id,
              rejected_at: new Date().toISOString(),
              rejection_reason: rejectionReason,
              updated_at: new Date().toISOString()
            };
          }
        }
        return d;
      });
      
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
      const updatedDeclarations = declarations.map(d => {
        if (d.id === id) {
          return { 
            ...d, 
            status: 'rejetee' as DeclarationStatus,
            rejected_by: user?.id,
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
