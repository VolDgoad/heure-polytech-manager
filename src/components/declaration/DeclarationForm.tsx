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
import { Declaration } from '@/types';
import { Program, Level, Semester, TeachingUnit, CourseElement } from '@/types/academic';
import { useDeclarations } from '@/context/DeclarationContext';

interface HierarchyData {
  departments: { id: string; name: string; }[];
  programs: Program[];
  levels: Level[];
  semesters: Semester[];
  teachingUnits: TeachingUnit[];
  courseElements: CourseElement[];
}

const formSchema = z.object({
  department_id: z.string().min(1, { message: "Veuillez sélectionner un département" }),
  program_id: z.string().min(1, { message: "Veuillez sélectionner une filière" }),
  level_id: z.string().min(1, { message: "Veuillez sélectionner un niveau" }),
  semester_id: z.string().min(1, { message: "Veuillez sélectionner un semestre" }),
  teaching_unit_id: z.string().min(1, { message: "Veuillez sélectionner une unité d'enseignement" }),
  course_element_id: z.string().min(1, { message: "Veuillez sélectionner un élément constitutif" }),
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
  const { submitDeclaration } = useDeclarations();
  const [submitting, setSubmitting] = useState(false);
  const [hierarchyData, setHierarchyData] = useState<HierarchyData>({
    departments: [],
    programs: [],
    levels: [],
    semesters: [],
    teachingUnits: [],
    courseElements: [],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: existingDeclaration
      ? {
          department_id: existingDeclaration.department_id,
          program_id: existingDeclaration.program_id || '',
          level_id: existingDeclaration.level_id || '',
          semester_id: existingDeclaration.semester_id || '',
          teaching_unit_id: existingDeclaration.teaching_unit_id || '',
          course_element_id: existingDeclaration.course_element_id,
          cm_hours: existingDeclaration.cm_hours,
          td_hours: existingDeclaration.td_hours,
          tp_hours: existingDeclaration.tp_hours,
          declaration_date: new Date(existingDeclaration.declaration_date),
        }
      : {
          department_id: '',
          program_id: '',
          level_id: '',
          semester_id: '',
          teaching_unit_id: '',
          course_element_id: '',
          cm_hours: 0,
          td_hours: 0,
          tp_hours: 0,
          declaration_date: new Date(),
        }
  });

  const watchDepartment = form.watch('department_id');
  const watchProgram = form.watch('program_id');
  const watchLevel = form.watch('level_id');
  const watchSemester = form.watch('semester_id');
  const watchTeachingUnit = form.watch('teaching_unit_id');

  useEffect(() => {
    const fetchHierarchyData = async () => {
      try {
        setSubmitting(true);
        const [
          { data: departments },
          { data: programs },
          { data: levels },
          { data: semesters },
          { data: teachingUnits },
          { data: courseElements }
        ] = await Promise.all([
          supabase.from('departments').select('*').order('name'),
          supabase.from('programs').select('*').order('name'),
          supabase.from('levels').select('*').order('name'),
          supabase.from('semesters').select('*').order('name'),
          supabase.from('teaching_units').select('*').order('name'),
          supabase.from('course_elements').select('*').order('name')
        ]);

        setHierarchyData({
          departments: departments || [],
          programs: programs || [],
          levels: levels || [],
          semesters: semesters || [],
          teachingUnits: teachingUnits || [],
          courseElements: courseElements || [],
        });
      } catch (error: any) {
        toast.error(`Erreur lors du chargement des données: ${error.message}`);
      } finally {
        setSubmitting(false);
      }
    };

    fetchHierarchyData();
  }, []);

  const filteredPrograms = hierarchyData.programs.filter(
    program => program.department_id === watchDepartment
  );

  const filteredLevels = hierarchyData.levels.filter(
    level => level.program_id === watchProgram
  );

  const filteredSemesters = hierarchyData.semesters.filter(
    semester => semester.level_id === watchLevel
  );

  const filteredTeachingUnits = hierarchyData.teachingUnits.filter(
    unit => unit.semester_id === watchSemester
  );

  const filteredCourseElements = hierarchyData.courseElements.filter(
    element => element.teaching_unit_id === watchTeachingUnit
  );

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
        program_id: data.program_id,
        level_id: data.level_id,
        semester_id: data.semester_id,
        teaching_unit_id: data.teaching_unit_id,
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

  const calculateTotalHours = () => {
    const cm = form.watch('cm_hours') || 0;
    const td = form.watch('td_hours') || 0;
    const tp = form.watch('tp_hours') || 0;
    return cm + td + tp;
  };

  const handleSubmitDeclaration = () => {
    if (existingDeclaration && existingDeclaration.id) {
      console.log("Submitting declaration with ID:", existingDeclaration.id);
      submitDeclaration(existingDeclaration.id);
      navigate('/declarations');
    } else {
      console.error("Cannot submit declaration: missing ID");
    }
  };

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
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg">Informations académiques</CardTitle>
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
                    disabled={isReadOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un département" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hierarchyData.departments.map((dept) => (
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
              name="program_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filière</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly || !watchDepartment}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une filière" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredPrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
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
              name="level_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly || !watchProgram}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un niveau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
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
              name="semester_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semestre</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly || !watchLevel}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un semestre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSemesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name}
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
              name="teaching_unit_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unité d'enseignement</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly || !watchSemester}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une UE" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredTeachingUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
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
                  <FormLabel>Élément constitutif</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly || !watchTeachingUnit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un EC" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCourseElements.map((element) => (
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
                  onClick={handleSubmitDeclaration}
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
