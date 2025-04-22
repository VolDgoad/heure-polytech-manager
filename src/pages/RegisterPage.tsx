
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';

const formSchema = z.object({
  email: z
    .string()
    .email("L'adresse email n'est pas valide.")
    .refine((email) => email.endsWith('@uam.edu.sn'), {
      message: "L'adresse email doit être au format @uam.edu.sn",
    }),
  password: z.string().min(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  }),
  first_name: z.string().min(1, {
    message: 'Le prénom est requis.',
  }),
  last_name: z.string().min(1, {
    message: 'Le nom est requis.',
  }),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
          },
        },
      });

      if (error) throw error;

      toast.success('Compte créé avec succès! Veuillez vérifier votre email.');
      navigate('/login');
    } catch (error: any) {
      if (error.message === 'User already registered') {
        toast.error('Un compte existe déjà avec cette adresse email.');
      } else {
        toast.error(error.message || "Une erreur s'est produite lors de l'inscription.");
      }
      console.error('Registration error:', error);
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
          Créer un compte
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse e-mail</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@uam.edu.sn" 
                        {...field} 
                      />
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
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-polytech-primary hover:bg-polytech-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Inscription...' : "S'inscrire"}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-6">
            <div className="text-sm text-center">
              <span>Vous avez déjà un compte? </span>
              <Link 
                to="/login" 
                className="font-medium text-polytech-primary hover:text-polytech-primary/90"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
