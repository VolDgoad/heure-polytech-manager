
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        setSession(currentSession);
        
        if (currentSession?.user) {
          try {
            // Fetch user profile in a timeout to avoid deadlocks
            setTimeout(async () => {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select(`*, departments(name)`)
                .eq('id', currentSession.user.id)
                .single();
                
              if (error) {
                console.error('Error fetching profile:', error);
                setUser(null);
              } else if (profile) {
                setUser(profile);
                
                // Redirect to dashboard on login
                if (event === 'SIGNED_IN') {
                  navigate('/dashboard');
                }
              }
              setLoading(false);
            }, 0);
          } catch (error) {
            console.error('Error in auth state change:', error);
            setUser(null);
            setLoading(false);
          }
        } else {
          setUser(null);
          setLoading(false);
          
          // Redirect to login on logout
          if (event === 'SIGNED_OUT') {
            navigate('/login');
          }
        }
      }
    );

    // Initial session check
    const checkUser = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session check:', initialSession?.user?.email);
        setSession(initialSession);
        
        if (initialSession?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select(`*, departments(name)`)
            .eq('id', initialSession.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching initial profile:', error);
            setUser(null);
          } else if (profile) {
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Login error:', error);
      setLoading(false);
      throw new Error(error.message || 'Échec de connexion');
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        loading, 
        login, 
        logout,
        isAuthenticated: !!session
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
