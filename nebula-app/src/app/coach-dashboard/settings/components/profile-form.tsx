'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { TagInputField } from './tag-input-field';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CountrySelect } from '@/components/ui/country-select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateCoachProfileSchema,
  type CoachUpdateData,
} from '@/lib/validations';
import { useCategories } from '@/hooks/use-categories-queries';

export type ProfileFormData = CoachUpdateData;

interface ProfileFormProps {
  formData: ProfileFormData;
  onSave: (data: ProfileFormData) => void;
  isLoading?: boolean;
}

export function ProfileForm({
  formData,
  onSave,
  isLoading = false,
}: ProfileFormProps) {
  const t = useTranslations('dashboard.coach.settings.profile');

  const { data: categoriesData } = useCategories();
  const categories = useMemo(() => (categoriesData as any)?.data?.categories || [], [categoriesData]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(updateCoachProfileSchema),
    defaultValues: formData,
  });

  // Update form values when formData prop changes (e.g. after initial load)
  useEffect(() => {
    // Ensure specialties are mapped to IDs
    const refinedData = {
      ...formData,
      specialties: formData.specialties?.map((s: any) => {
        // If it's an object, extract ID
        if (typeof s === 'object') return s.id || s.categoryId;
        
        // If it's a name (not a CUID-like string), try to find matching ID from categories
        if (typeof s === 'string' && s.length < 20 && categories.length > 0) {
          const category = categories.find((c: any) => 
            c.name.toLowerCase() === s.toLowerCase() || 
            c.slug.toLowerCase() === s.toLowerCase()
          );
          if (category) return category.id;
        }
        
        return s;
      }) || [],
    };
    form.reset(refinedData);
  }, [formData, form, categories]);

  const onSubmit = (data: ProfileFormData) => {
    onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('firstName')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('firstName')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lastName')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('lastName')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('professionalTitle')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('professionalTitlePlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('hourlyRate')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder={t('hourlyRatePlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('bio')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder={t('bioPlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('style')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('stylePlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('linkedin')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('linkedinPlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('experience')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder={t('experiencePlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <TagInputField
                  label={t('specialties')}
                  description={t('specialtiesDesc')}
                  tags={field.value}
                  onTagsChange={field.onChange}
                  placeholder={t('addSpecialty')}
                  options={categories.map((c: any) => ({ id: c.id, name: c.name }))}
                />
              )}
            />

            <FormField
              control={form.control}
              name="pastCompanies"
              render={({ field }) => (
                <TagInputField
                  label={t('pastCompanies')}
                  description={t('pastCompaniesDesc')}
                  tags={field.value || []}
                  onTagsChange={field.onChange}
                  placeholder={t('addCompany')}
                />
              )}
            />

            <FormField
              control={form.control}
              name="qualifications"
              render={({ field }) => (
                <TagInputField
                  label={t('qualifications')}
                  tags={field.value || []}
                  onTagsChange={field.onChange}
                  placeholder={t('addQualification')}
                />
              )}
            />

            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <TagInputField
                  label={t('languages')}
                  tags={field.value || []}
                  onTagsChange={field.onChange}
                  placeholder={t('addLanguage')}
                  protectedTags={['English']}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('timezone')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('timezonePlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('country') || 'Country'}</FormLabel>
                    <FormControl>
                      <CountrySelect
                        value={field.value || ''}
                        onChange={(name) => field.onChange(name)}
                        onIsoChange={(iso) =>
                          form.setValue('countryIso', iso, {
                            shouldDirty: true,
                          })
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('saving') : t('save')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
