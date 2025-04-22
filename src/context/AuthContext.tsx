
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Dr. Amadou Diop',
    email: 'enseignant@polytech.edu',
    role: 'enseignant',
    department: 'Informatique',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Mme Fatou Ndiaye',
    email: 'scolarite@polytech.edu',
    role: 'scolarite',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Prof. Mamadou Sow',
    email: 'chef@polytech.edu',
    role: 'chef_departement',
    department: 'Informatique',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    name: 'Dr. Aïssatou Ba',
    email: 'directrice@polytech.edu',
    role: 'directrice',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('polytechUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // This is a mock authentication
    // In a real app, you would make an API call to your backend
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && password === 'password') { // Simple password check for demo
      setUser(foundUser);
      localStorage.setItem('polytechUser', JSON.stringify(foundUser));
    } else {
      throw new Error('Identifiants invalides');
    }
    
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('polytechUser');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
