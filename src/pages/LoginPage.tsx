
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';

const formSchema = z.object({
  email: z.string().email({
    message: "L'adresse email n'est pas valide.",
  }),
  password: z.string().min(1, {
    message: "Le mot de passe est requis.",
  }),
});

const LoginPage = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (loading || authLoading) return;
    
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Connexion réussie");
      // Navigation is handled in the AuthContext
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur s'est produite lors de la connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Polytech Diamniadio
        </h1>
        <h2 className="mt-2 text-center text-xl font-semibold text-polytech-primary">
          Plateforme de Déclaration des Charges Horaires
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse e-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@polytech.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-polytech-primary hover:bg-polytech-primary/90"
                  disabled={loading || authLoading}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-6">
            <div className="text-sm text-center">
              <span>Vous n'avez pas de compte? </span>
              <Link 
                to="/register" 
                className="font-medium text-polytech-primary hover:text-polytech-primary/90"
              >
                S'inscrire
              </Link>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-2">
              <div className="text-xs bg-gray-50 p-2 rounded">
                <strong>Enseignant:</strong> enseignant@polytech.edu / password
              </div>
              <div className="text-xs bg-gray-50 p-2 rounded">
                <strong>Scolarité:</strong> scolarite@polytech.edu / password
              </div>
              <div className="text-xs bg-gray-50 p-2 rounded">
                <strong>Chef de département:</strong> chef@polytech.edu / password
              </div>
              <div className="text-xs bg-gray-50 p-2 rounded">
                <strong>Directrice:</strong> directrice@polytech.edu / password
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
