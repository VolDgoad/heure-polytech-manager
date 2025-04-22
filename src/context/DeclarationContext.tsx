
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
    ? declarations.filter(d => d.teacher_id === user.id)
    : [];

  const pendingDeclarations = user 
    ? (() => {
        switch(user.role) {
          case 'scolarite':
            return declarations.filter(d => d.status === 'soumise');
          case 'chef_departement':
            return declarations.filter(
              d => d.status === 'verifiee' && 
              d.department_id === user.department_id
            );
          case 'directrice_etudes':
            return declarations.filter(d => 
              d.status === 'verifiee' || 
              (d.status === 'approuvee' && d.approved_by !== 'Dr. Aïssatou Ba')
            );
          default:
            return [];
        }
      })()
    : [];

  const createDeclaration = (sessions: CourseSession[]) => {
    if (!user) return;
    
    const totalHours = sessions.reduce((total, session) => total + session.hoursCount, 0);
    
    const userName = `${user.first_name} ${user.last_name}`;
    
    const newDeclaration: Declaration = {
      id: Date.now().toString(),
      teacher_id: user.id,
      teacherName: userName,
      department_id: user.department_id || '',
      departmentName: '',
      course_element_id: '', // This should be set properly based on course element selection
      cm_hours: 0,
      td_hours: 0,
      tp_hours: 0,
      declaration_date: new Date().toISOString().split('T')[0],
      status: 'brouillon',
      payment_status: 'non_paye',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      totalHours
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
              totalHours,
              updated_at: new Date().toISOString(),
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
              status: 'soumise' as DeclarationStatus,
              updated_at: new Date().toISOString(),
            }
          : declaration
      )
    );
    toast.success('Déclaration soumise avec succès');
  };

  const verifyDeclaration = (id: string, verify: boolean, reason?: string) => {
    if (!user) return;
    
    const userName = `${user.first_name} ${user.last_name}`;
    
    setDeclarations(prev => 
      prev.map(declaration => 
        declaration.id === id 
          ? {
              ...declaration,
              status: verify ? 'verifiee' as DeclarationStatus : 'rejetee' as DeclarationStatus,
              updated_at: new Date().toISOString(),
              verified_by: verify ? user.id : undefined,
              verified_at: verify ? new Date().toISOString() : undefined,
              rejection_reason: verify ? undefined : reason,
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
    
    const userName = `${user.first_name} ${user.last_name}`;
    
    setDeclarations(prev => 
      prev.map(declaration => 
        declaration.id === id 
          ? {
              ...declaration,
              status: approve ? 'approuvee' as DeclarationStatus : 'rejetee' as DeclarationStatus,
              updated_at: new Date().toISOString(),
              approved_by: approve ? user.id : undefined,
              approved_at: approve ? new Date().toISOString() : undefined,
              rejection_reason: approve ? undefined : reason,
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
