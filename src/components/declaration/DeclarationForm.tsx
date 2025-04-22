
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Department, CourseElement, Declaration } from '@/types';

const formSchema = z.object({
  course_element_id: z.string().min(1, { message: "Veuillez sélectionner un élément constitutif" }),
  department_id: z.string().min(1, { message: "Veuillez sélectionner un département" }),
  cm_hours: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0, { message: "La valeur ne peut pas être négative" })
  ),
  td_hours: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0, { message: "La valeur ne peut pas être négative" })
  ),
  tp_hours: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0, { message: "La valeur ne peut pas être négative" })
  ),
  declaration_date: z.date({
    required_error: "La date de déclaration est requise",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface DeclarationFormProps {
  existingDeclaration?: Declaration;
  isReadOnly?: boolean;
}

const DeclarationForm = ({ existingDeclaration, isReadOnly = false }: DeclarationFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courseElements, setCourseElements] = useState<CourseElement[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: existingDeclaration
      ? {
          course_element_id: existingDeclaration.course_element_id,
          department_id: existingDeclaration.department_id,
          cm_hours: existingDeclaration.cm_hours,
          td_hours: existingDeclaration.td_hours,
          tp_hours: existingDeclaration.tp_hours,
          declaration_date: new Date(existingDeclaration.declaration_date),
        }
      : {
          course_element_id: '',
          department_id: user?.department_id || '',
          cm_hours: 0,
          td_hours: 0,
          tp_hours: 0,
          declaration_date: new Date(),
        }
  });

  useEffect(() => {
    const fetchDepartmentsAndCourseElements = async () => {
      try {
        setLoading(true);
        // Fetching departments
        const { data: departmentsData, error: departmentsError } = await supabase
          .from('departments')
          .select('*')
          .order('name');

        if (departmentsError) throw departmentsError;
        setDepartments(departmentsData || []);

        // Fetching course elements with their teaching units
        const { data: elementsData, error: elementsError } = await supabase
          .from('course_elements')
          .select(`
            id,
            name,
            teaching_unit_id,
            teaching_units(
              name,
              semester_id,
              semesters(
                name,
                level_id,
                levels(
                  name,
                  program_id,
                  programs(
                    name,
                    department_id
                  )
                )
              )
            )
          `);

        if (elementsError) throw elementsError;
        setCourseElements(elementsData || []);
      } catch (error: any) {
        toast.error(`Erreur lors du chargement des données: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentsAndCourseElements();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour soumettre une déclaration");
      return;
    }

    setSubmitting(true);
    try {
      const declarationData = {
        teacher_id: user.id,
        course_element_id: data.course_element_id,
        department_id: data.department_id,
        cm_hours: data.cm_hours,
        td_hours: data.td_hours,
        tp_hours: data.tp_hours,
        declaration_date: format(data.declaration_date, 'yyyy-MM-dd'),
        status: existingDeclaration ? existingDeclaration.status : 'brouillon',
      };

      let response;
      
      if (existingDeclaration) {
        response = await supabase
          .from('declarations')
          .update(declarationData)
          .eq('id', existingDeclaration.id)
          .select();
      } else {
        response = await supabase
          .from('declarations')
          .insert(declarationData)
          .select();
      }

      if (response.error) throw response.error;
      
      toast.success(existingDeclaration 
        ? "Déclaration mise à jour avec succès" 
        : "Déclaration créée avec succès");
        
      navigate('/declarations');
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const submitDeclaration = async () => {
    if (!existingDeclaration) return;
    
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('declarations')
        .update({ status: 'soumise' })
        .eq('id', existingDeclaration.id);
        
      if (error) throw error;
      
      toast.success("Déclaration soumise pour vérification");
      navigate('/declarations');
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalHours = () => {
    const cm = form.watch('cm_hours') || 0;
    const td = form.watch('td_hours') || 0;
    const tp = form.watch('tp_hours') || 0;
    return cm + td + tp;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des données...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {existingDeclaration ? 'Modifier la déclaration' : 'Nouvelle déclaration d\'heures'}
          </h1>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Total des heures:</span>
            <span className="px-2 py-1 bg-polytech-primary text-white rounded font-bold">
              {calculateTotalHours()} h
            </span>
          </div>
        </div>

        <Card className="border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-3">
            <CardTitle className="text-lg">Informations de la déclaration</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Département</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly || user?.role !== 'admin' && user?.role !== 'directrice_etudes'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un département" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="course_element_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Élément Constitutif (EC)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un EC" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courseElements.map((element) => (
                        <SelectItem key={element.id} value={element.id}>
                          {element.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="declaration_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de déclaration</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isReadOnly}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cm_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heures CM</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="td_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heures TD</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tp_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heures TP</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <CardFooter className="bg-gray-50 p-4 rounded-lg flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/declarations')}
          >
            Annuler
          </Button>
          
          {!isReadOnly && (
            <>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Enregistrement...' : existingDeclaration ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
              
              {existingDeclaration && existingDeclaration.id && existingDeclaration.status === 'brouillon' && (
                <Button
                  type="button"
                  onClick={submitDeclaration}
                  variant="default"
                  className="bg-polytech-secondary hover:bg-polytech-secondary/90"
                  disabled={submitting}
                >
                  Soumettre pour vérification
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </form>
    </Form>
  );
};

export default DeclarationForm;
