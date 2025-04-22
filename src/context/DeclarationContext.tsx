
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Declaration, CourseSession, DeclarationStatus } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';

interface DeclarationContextType {
  declarations: Declaration[];
  userDeclarations: Declaration[];
  pendingDeclarations: Declaration[];
  createDeclaration: (sessions: CourseSession[]) => void;
  updateDeclaration: (id: string, sessions: CourseSession[]) => void;
  submitDeclaration: (id: string) => void;
  verifyDeclaration: (id: string, verify: boolean, reason?: string) => void;
  approveDeclaration: (id: string, approve: boolean, reason?: string) => void;
  deleteDeclaration: (id: string) => void;
  getDeclarationById: (id: string) => Declaration | undefined;
  loading: boolean;
}

// Sample initial declarations for demonstration
const INITIAL_DECLARATIONS: Declaration[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Dr. Amadou Diop',
    department: 'Informatique',
    sessions: [
      {
        id: '101',
        date: '2023-05-10',
        startTime: '08:00',
        endTime: '10:00',
        courseTitle: 'Introduction à la Programmation',
        courseType: 'CM',
        hoursCount: 2,
        department: 'Informatique',
      },
      {
        id: '102',
        date: '2023-05-11',
        startTime: '13:00',
        endTime: '16:00',
        courseTitle: 'Travaux Pratiques Python',
        courseType: 'TP',
        hoursCount: 3,
        department: 'Informatique',
      },
    ],
    status: 'submitted',
    totalHours: 5,
    createdAt: '2023-05-09T10:30:00Z',
    updatedAt: '2023-05-09T15:45:00Z',
  },
  {
    id: '2',
    userId: '1',
    userName: 'Dr. Amadou Diop',
    department: 'Informatique',
    sessions: [
      {
        id: '201',
        date: '2023-05-15',
        startTime: '09:00',
        endTime: '12:00',
        courseTitle: 'Algorithmes et Structures de Données',
        courseType: 'CM',
        hoursCount: 3,
        department: 'Informatique',
      },
    ],
    status: 'verified',
    totalHours: 3,
    createdAt: '2023-05-14T08:20:00Z',
    updatedAt: '2023-05-16T14:10:00Z',
    verifiedBy: 'Mme Fatou Ndiaye',
  },
];

const DeclarationContext = createContext<DeclarationContextType>({
  declarations: [],
  userDeclarations: [],
  pendingDeclarations: [],
  createDeclaration: () => {},
  updateDeclaration: () => {},
  submitDeclaration: () => {},
  verifyDeclaration: () => {},
  approveDeclaration: () => {},
  deleteDeclaration: () => {},
  getDeclarationById: () => undefined,
  loading: true,
});

export const DeclarationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load declarations from localStorage or use initial data
    const storedDeclarations = localStorage.getItem('polytechDeclarations');
    if (storedDeclarations) {
      setDeclarations(JSON.parse(storedDeclarations));
    } else {
      setDeclarations(INITIAL_DECLARATIONS);
      localStorage.setItem('polytechDeclarations', JSON.stringify(INITIAL_DECLARATIONS));
    }
    setLoading(false);
  }, []);

  // Save declarations to localStorage whenever they change
  useEffect(() => {
    if (declarations.length > 0) {
      localStorage.setItem('polytechDeclarations', JSON.stringify(declarations));
    }
  }, [declarations]);

  // Filter declarations based on user role
  const userDeclarations = user 
    ? declarations.filter(d => d.userId === user.id)
    : [];

  const pendingDeclarations = user 
    ? (() => {
        switch(user.role) {
          case 'scolarite':
            return declarations.filter(d => d.status === 'submitted');
          case 'chef_departement':
            return declarations.filter(
              d => d.status === 'verified' && 
              d.department === user.department
            );
          case 'directrice':
            return declarations.filter(d => 
              d.status === 'verified' || 
              (d.status === 'approved' && d.approvedBy !== 'Dr. Aïssatou Ba')
            );
          default:
            return [];
        }
      })()
    : [];

  const createDeclaration = (sessions: CourseSession[]) => {
    if (!user) return;
    
    const totalHours = sessions.reduce((total, session) => total + session.hoursCount, 0);
    
    const newDeclaration: Declaration = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      department: user.department || '',
      sessions,
      status: 'draft',
      totalHours,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setDeclarations(prev => [newDeclaration, ...prev]);
    toast.success('Déclaration créée avec succès');
  };

  const updateDeclaration = (id: string, sessions: CourseSession[]) => {
    const totalHours = sessions.reduce((total, session) => total + session.hoursCount, 0);
    
    setDeclarations(prev => 
      prev.map(declaration => 
        declaration.id === id 
          ? {
              ...declaration,
              sessions,
              totalHours,
              updatedAt: new Date().toISOString(),
            }
          : declaration
      )
    );
    toast.success('Déclaration mise à jour');
  };

  const submitDeclaration = (id: string) => {
    setDeclarations(prev => 
      prev.map(declaration => 
        declaration.id === id 
          ? {
              ...declaration,
              status: 'submitted',
              updatedAt: new Date().toISOString(),
            }
          : declaration
      )
    );
    toast.success('Déclaration soumise avec succès');
  };

  const verifyDeclaration = (id: string, verify: boolean, reason?: string) => {
    if (!user) return;
    
    setDeclarations(prev => 
      prev.map(declaration => 
        declaration.id === id 
          ? {
              ...declaration,
              status: verify ? 'verified' : 'rejected',
              updatedAt: new Date().toISOString(),
              verifiedBy: verify ? user.name : undefined,
              rejectionReason: verify ? undefined : reason,
            }
          : declaration
      )
    );
    
    toast.success(verify 
      ? 'Déclaration vérifiée avec succès' 
      : 'Déclaration rejetée');
  };

  const approveDeclaration = (id: string, approve: boolean, reason?: string) => {
    if (!user) return;
    
    setDeclarations(prev => 
      prev.map(declaration => 
        declaration.id === id 
          ? {
              ...declaration,
              status: approve ? 'approved' : 'rejected',
              updatedAt: new Date().toISOString(),
              approvedBy: approve ? user.name : undefined,
              rejectionReason: approve ? undefined : reason,
            }
          : declaration
      )
    );
    
    toast.success(approve 
      ? 'Déclaration approuvée avec succès' 
      : 'Déclaration rejetée');
  };

  const deleteDeclaration = (id: string) => {
    setDeclarations(prev => prev.filter(declaration => declaration.id !== id));
    toast.success('Déclaration supprimée');
  };

  const getDeclarationById = (id: string) => {
    return declarations.find(declaration => declaration.id === id);
  };

  return (
    <DeclarationContext.Provider
      value={{
        declarations,
        userDeclarations,
        pendingDeclarations,
        createDeclaration,
        updateDeclaration,
        submitDeclaration,
        verifyDeclaration,
        approveDeclaration,
        deleteDeclaration,
        getDeclarationById,
        loading,
      }}
    >
      {children}
    </DeclarationContext.Provider>
  );
};

export const useDeclarations = () => useContext(DeclarationContext);
