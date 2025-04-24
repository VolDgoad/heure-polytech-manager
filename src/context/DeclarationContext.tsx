import React, { createContext, useContext, useState, useEffect } from 'react';
import { Declaration, CourseSession, DeclarationStatus } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface DeclarationContextType {
  declarations: Declaration[];
  userDeclarations: Declaration[];
  pendingDeclarations: Declaration[];
  createDeclaration: (sessions: CourseSession[]) => void;
  updateDeclaration: (id: string, sessions: CourseSession[]) => void;
  verifyDeclaration: (id: string, verify: boolean, reason?: string) => void;
  approveDeclaration: (id: string, approve: boolean, reason?: string) => void;
  deleteDeclaration: (id: string) => void;
  getDeclarationById: (id: string) => Declaration | undefined;
  submitDeclaration: (id: string) => void;
  loading: boolean;
}

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
  verifyDeclaration: () => {},
  approveDeclaration: () => {},
  deleteDeclaration: () => {},
  getDeclarationById: () => undefined,
  submitDeclaration: () => {},
  loading: true,
});

export const DeclarationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedDeclarations = localStorage.getItem('polytechDeclarations');
    if (storedDeclarations) {
      setDeclarations(JSON.parse(storedDeclarations));
    } else {
      setDeclarations(INITIAL_DECLARATIONS);
      localStorage.setItem('polytechDeclarations', JSON.stringify(INITIAL_DECLARATIONS));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (declarations.length > 0) {
      localStorage.setItem('polytechDeclarations', JSON.stringify(declarations));
      console.log("Updated declarations in localStorage:", declarations);
    }
  }, [declarations]);

  const userDeclarations = user 
    ? declarations.filter(d => d.teacher_id === user.id)
    : [];

  const pendingDeclarations = user 
    ? (() => {
        console.log("Determining pending declarations for user role:", user.role);
        console.log("Current declarations:", declarations);
        
        switch(user.role) {
          case 'scolarite':
            const scolariteDeclarations = declarations.filter(d => d.status === 'soumise');
            console.log("Scolarité pending declarations:", scolariteDeclarations);
            return scolariteDeclarations;
          case 'chef_departement':
            const deptDeclarations = declarations.filter(
              d => d.status === 'verifiee' && 
              d.department_id === user.department_id
            );
            console.log("Chef département pending declarations:", deptDeclarations);
            return deptDeclarations;
          case 'directrice_etudes':
            const dirDeclarations = declarations.filter(d => d.status === 'validee');
            console.log("Directrice études pending declarations:", dirDeclarations);
            return dirDeclarations;
          default:
            return [];
        }
      })()
    : [];

  const createDeclaration = (sessions: CourseSession[]) => {
    if (!user) return;
    
    const totalHours = sessions.reduce((total, session) => {
      if (session.hoursCount) {
        return total + session.hoursCount;
      }
      return total + session.duration;
    }, 0);
    
    const userName = `${user.first_name} ${user.last_name}`;
    
    const newDeclaration: Declaration = {
      id: Date.now().toString(),
      teacher_id: user.id,
      teacherName: userName,
      department_id: user.department_id || '',
      departmentName: '',
      course_element_id: '',
      cm_hours: 0,
      td_hours: 0,
      tp_hours: 0,
      declaration_date: new Date().toISOString().split('T')[0],
      status: 'soumise',
      payment_status: 'non_paye',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      totalHours
    };
    
    setDeclarations(prev => [newDeclaration, ...prev]);
    toast.success('Déclaration soumise pour vérification');
    toast.info('La scolarité a été notifiée');
    
    console.log("Created new declaration:", newDeclaration);
  };

  const updateDeclaration = (id: string, sessions: CourseSession[]) => {
    const totalHours = sessions.reduce((total, session) => {
      if (session.hoursCount) {
        return total + session.hoursCount;
      }
      return total + session.duration;
    }, 0);
    
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
    console.log("Updated declaration:", id);
  };

  const submitDeclaration = (id: string) => {
    console.log("Submitting declaration:", id);
    
    const declaration = declarations.find(d => d.id === id);
    if (!declaration) {
      console.error("Declaration not found for submission:", id);
      toast.error('Déclaration introuvable');
      return;
    }
    
    const updatedDeclarations = declarations.map(d =>
      d.id === id
        ? {
            ...d,
            status: 'soumise' as DeclarationStatus,
            updated_at: new Date().toISOString(),
          }
        : d
    );
    
    setDeclarations(updatedDeclarations);
    toast.success('Déclaration soumise pour vérification');
    toast.info('La scolarité a été notifiée');
    console.log("Updated declaration status to submitted:", id);
  };

  const verifyDeclaration = (id: string, verify: boolean, reason?: string) => {
    if (!user || user.role !== 'scolarite') return;
    
    console.log("Verifying declaration:", id, "verify:", verify);

    const declaration = declarations.find(d => d.id === id);
    if (!declaration) {
      console.error("Declaration not found for verification:", id);
      toast.error('Déclaration introuvable');
      return;
    }

    if (verify) {
      const updatedDeclarations = declarations.map(d =>
        d.id === id
          ? {
              ...d,
              status: 'verifiee' as DeclarationStatus,
              updated_at: new Date().toISOString(),
              verified_by: user.id,
              verified_at: new Date().toISOString(),
            }
          : d
      );
      
      console.log("Updated declaration to verified:", id);
      setDeclarations(updatedDeclarations);
      toast.success('Déclaration vérifiée avec succès');
      toast.info(`L'enseignant ${declaration.teacherName} a été notifié`);
      toast.info('Le chef du département concerné a été notifié');
    } else {
      const updatedDeclarations = declarations.map(d =>
        d.id === id
          ? {
              ...d,
              status: 'rejetee' as DeclarationStatus,
              updated_at: new Date().toISOString(),
              rejected_by: user.id,
              rejected_at: new Date().toISOString(),
              rejection_reason: reason,
            }
          : d
      );
      
      console.log("Updated declaration to rejected:", id);
      setDeclarations(updatedDeclarations);
      toast.error('Déclaration rejetée');
      toast.info(`L'enseignant ${declaration.teacherName} a été notifié du rejet`);
    }
  };

  const approveDeclaration = (id: string, approve: boolean, reason?: string) => {
    if (!user) return;

    console.log("Approving declaration:", id, "approve:", approve, "user role:", user.role);
    
    const declaration = declarations.find(d => d.id === id);
    if (!declaration) {
      console.error("Declaration not found:", id);
      toast.error('Déclaration introuvable');
      return;
    }

    if (user.role === 'chef_departement') {
      if (declaration.department_id === user.department_id) {
        if (approve) {
          console.log("Chef department validating");
          const updatedDeclarations = declarations.map(d =>
            d.id === id
              ? {
                  ...d,
                  status: 'validee' as DeclarationStatus,
                  updated_at: new Date().toISOString(),
                  validated_by: user.id,
                  validated_at: new Date().toISOString(),
                }
              : d
          );
          
          setDeclarations(updatedDeclarations);
          toast.success('Déclaration validée avec succès');
          toast.info(`L'enseignant ${declaration.teacherName} a été notifié`);
          toast.info('La directrice des études a été notifiée');
        } else {
          const updatedDeclarations = declarations.map(d =>
            d.id === id
              ? {
                  ...d,
                  status: 'rejetee' as DeclarationStatus,
                  updated_at: new Date().toISOString(),
                  rejected_by: user.id,
                  rejected_at: new Date().toISOString(),
                  rejection_reason: reason,
                }
              : d
          );
          
          setDeclarations(updatedDeclarations);
          toast.error('Déclaration rejetée');
          toast.info(`L'enseignant ${declaration.teacherName} a été notifié du rejet`);
        }
      } else {
        console.error("Department mismatch for validation:", declaration.department_id, user.department_id);
        toast.error('Vous n\'avez pas les droits pour valider cette déclaration');
      }
    }

    if (user.role === 'directrice_etudes') {
      if (approve) {
        console.log("Directrice approving");
        const updatedDeclarations = declarations.map(d =>
          d.id === id
            ? {
                ...d,
                status: 'approuvee' as DeclarationStatus,
                updated_at: new Date().toISOString(),
                approved_by: user.id,
                approved_at: new Date().toISOString(),
              }
            : d
        );
        
        setDeclarations(updatedDeclarations);
        toast.success('Déclaration approuvée avec succès');
        toast.info(`L'enseignant ${declaration.teacherName} a été notifié`);
        toast.info('Le chef de département a été notifié');
      } else {
        console.log("Directrice rejecting");
        const updatedDeclarations = declarations.map(d =>
          d.id === id
            ? {
                ...d,
                status: 'rejetee' as DeclarationStatus,
                updated_at: new Date().toISOString(),
                rejected_by: user.id,
                rejected_at: new Date().toISOString(),
                rejection_reason: reason,
              }
            : d
        );
        
        setDeclarations(updatedDeclarations);
        toast.error('Déclaration rejetée');
        toast.info(`L'enseignant ${declaration.teacherName} a été notifié du rejet`);
        toast.info('Le chef de département a été notifié du rejet');
      }
    }
  };

  const deleteDeclaration = (id: string) => {
    setDeclarations(prev => prev.filter(declaration => declaration.id !== id));
    toast.success('Déclaration supprimée');
    console.log("Deleted declaration:", id);
  };

  const getDeclarationById = (id: string) => {
    console.log("Getting declaration by ID:", id);
    console.log("Available declarations:", declarations);
    
    if (!id) {
      console.error("Invalid ID provided:", id);
      return undefined;
    }
    
    const declaration = declarations.find(d => d.id === id);
    console.log("Found declaration:", declaration);
    return declaration;
  };

  return (
    <DeclarationContext.Provider
      value={{
        declarations,
        userDeclarations,
        pendingDeclarations,
        createDeclaration,
        updateDeclaration,
        verifyDeclaration,
        approveDeclaration,
        deleteDeclaration,
        getDeclarationById,
        submitDeclaration,
        loading,
      }}
    >
      {children}
    </DeclarationContext.Provider>
  );
};

export const useDeclarations = () => useContext(DeclarationContext);
