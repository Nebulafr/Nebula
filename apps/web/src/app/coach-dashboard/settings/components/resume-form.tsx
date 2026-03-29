'use client';

import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { updateCoachExperiencesSchema, type UpdateCoachExperiencesData } from '@/lib/validations';

interface ResumeFormProps {
  initialData: UpdateCoachExperiencesData;
  onSave: (data: UpdateCoachExperiencesData) => void;
  isLoading?: boolean;
}

export function ResumeForm({ initialData, onSave, isLoading = false }: ResumeFormProps) {
  const t = useTranslations('dashboard.coach.settings.resume');

  const form = useForm<UpdateCoachExperiencesData>({
    resolver: zodResolver(updateCoachExperiencesSchema),
    defaultValues: {
      experiences: initialData.experiences?.map(exp => ({
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
        endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : null,
      })) || [],
    },
  });

  const { reset } = form;
  useEffect(() => {
    reset({
      experiences: initialData.experiences?.map(exp => ({
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
        endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : null,
      })) || [],
    });
  }, [initialData, reset]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'experiences',
  });

  const onSubmit = (data: UpdateCoachExperiencesData) => {
    onSave(data);
  };

  return (
    <Card>
      <CardContent className="pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="sticky top-[-1px] z-20 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 -mx-6 px-6 py-4 border-b flex items-center justify-between rounded-t-lg transition-all duration-200">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold leading-none tracking-tight">{t('title')}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{t('description')}</CardDescription>
              </div>
              <Button type="submit" disabled={isLoading} className="min-w-[140px] shadow-sm hover:shadow-md transition-all">
                {isLoading ? t('saving') : t('save')}
              </Button>
            </div>

            <div className="space-y-6 pt-6">
              {fields.map((field, index) => (
                <div key={field.id} className="relative p-6 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`experiences.${index}.role`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('role')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t('rolePlaceholder')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experiences.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('company')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t('companyPlaceholder')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experiences.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('startDate')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value as string} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experiences.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('endDate')} ({t('present')} if empty)</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={(field.value as string) || ''}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`experiences.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('workDescription')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ''}
                            rows={3}
                            placeholder={t('workDescriptionPlaceholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                className="w-full border-dashed border-2 border-muted-foreground/20 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all py-8 h-auto"
                onClick={() => append({ role: '', company: '', startDate: '', endDate: null, description: '' })}
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('addExperience')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
