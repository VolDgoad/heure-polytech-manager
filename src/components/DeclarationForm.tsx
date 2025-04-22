import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { CourseSession } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const sessionSchema = z.object({
  id: z.string().optional(),
  date: z.date({
    required_error: "La date est requise",
  }),
  startTime: z.string()
    .min(1, { message: "L'heure de début est requise" }),
  endTime: z.string()
    .min(1, { message: "L'heure de fin est requise" }),
  courseTitle: z.string()
    .min(3, { message: "Le titre du cours doit comporter au moins 3 caractères" }),
  courseType: z.enum(['CM', 'TD', 'TP'], {
    required_error: "Le type de cours est requis",
  }),
  hoursCount: z.number()
    .positive({ message: "Le nombre d'heures doit être positif" }),
  department: z.string()
    .min(1, { message: "Le département est requis" }),
  comments: z.string().optional(),
});

const formSchema = z.object({
  sessions: z.array(sessionSchema)
    .min(1, { message: "Au moins une session est requise" }),
});

const departments = [
  "Informatique",
  "Génie Electrique",
  "Génie Civil",
  "Génie Mécanique",
  "Mathématiques Appliquées",
];

interface DeclarationFormProps {
  existingDeclaration?: {
    id: string;
    sessions: CourseSession[];
  };
  isReadOnly?: boolean;
}

const DeclarationForm = ({ existingDeclaration, isReadOnly = false }: DeclarationFormProps) => {
  const navigate = useNavigate();
  const { createDeclaration, updateDeclaration, submitDeclaration } = useDeclarations();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessions: existingDeclaration?.sessions.map(session => ({
        ...session,
        date: new Date(session.date),
      })) || [
        {
          id: Date.now().toString(),
          date: new Date(),
          startTime: '',
          endTime: '',
          courseTitle: '',
          courseType: 'CM' as const,
          hoursCount: 0,
          department: user?.department_id || departments[0],
          comments: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "sessions",
    control: form.control,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      const processedSessions: CourseSession[] = data.sessions.map(session => ({
        id: session.id || Date.now().toString(),
        date: format(session.date, 'yyyy-MM-dd'),
        startTime: session.startTime,
        endTime: session.endTime,
        courseTitle: session.courseTitle,
        courseType: session.courseType,
        hoursCount: session.hoursCount,
        department: session.department,
        comments: session.comments,
        duration: session.hoursCount || 0,
        type: session.courseType === 'CM' ? 'cm' : session.courseType === 'TD' ? 'td' : 'tp',
        location: 'N/A',
      }));

      if (existingDeclaration) {
        updateDeclaration(existingDeclaration.id, processedSessions);
      } else {
        createDeclaration(processedSessions);
      }
      navigate('/declarations');
    } catch (error) {
      console.error('Error submitting declaration:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDeclaration = () => {
    if (existingDeclaration) {
      submitDeclaration(existingDeclaration.id);
      navigate('/declarations');
    }
  };

  const addSession = () => {
    append({
      id: Date.now().toString(),
      date: new Date(),
      startTime: '',
      endTime: '',
      courseTitle: '',
      courseType: 'CM' as const,
      hoursCount: 0,
      department: user?.department_id || departments[0],
      comments: '',
    });
  };

  const calculateTotalHours = () => {
    return form.watch('sessions').reduce((total, session) => {
      return total + (session.hoursCount || 0);
    }, 0);
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

        {fields.map((field, index) => (
          <Card key={field.id} className="border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200 flex flex-row items-center justify-between py-3">
              <CardTitle className="text-lg">Session {index + 1}</CardTitle>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`sessions.${index}.date`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`sessions.${index}.startTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de début</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          placeholder="HH:MM"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`sessions.${index}.endTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de fin</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          placeholder="HH:MM"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`sessions.${index}.courseTitle`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du cours</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Introduction à la Programmation"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`sessions.${index}.courseType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de cours</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isReadOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CM">Cours Magistral (CM)</SelectItem>
                          <SelectItem value="TD">Travaux Dirigés (TD)</SelectItem>
                          <SelectItem value="TP">Travaux Pratiques (TP)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`sessions.${index}.hoursCount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre d'heures</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`sessions.${index}.department`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly || user?.role !== 'directrice_etudes'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
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
                name={`sessions.${index}.comments`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commentaires (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes ou commentaires additionnels"
                        className="resize-none"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}

        {!isReadOnly && (
          <Button
            type="button"
            variant="outline"
            onClick={addSession}
            className="w-full"
          >
            + Ajouter une session
          </Button>
        )}

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
              
              {existingDeclaration && existingDeclaration.id && (
                <Button
                  type="button"
                  onClick={handleSubmitDeclaration}
                  variant="default"
                  className="bg-polytech-secondary hover:bg-polytech-secondary/90"
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
