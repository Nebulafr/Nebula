'use client';

import { useEffect, useState, useRef } from 'react';
import { Loading } from '@/components/shared/loading';
import { ProfileAvatar } from './components/profile-avatar';
import { ProfileForm, ProfileFormData } from './components/profile-form';
import { ResumeForm } from './components/resume-form';
import { StripeConnect } from '../payouts/components/stripe-connect';
import { updateCoachProfile, updateCoachExperiences } from '@/actions/coaches';
import { uploadUserAvatar, changePassword } from '@/actions/user';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, CreditCard, Shield } from 'lucide-react';
import { SecuritySection } from '@/app/dashboard/settings/components/security-section';
import { type ChangePasswordData, type UpdateCoachExperiencesData } from '@/lib/validations';
import { useTranslations } from 'next-intl';

export default function CoachSettingsPage() {
  const t = useTranslations('dashboard.coach.settings');
  const { profile, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    fullName: '',
    title: '',
    bio: '',
    style: '',
    specialties: [],
    pastCompanies: [],
    linkedinUrl: '',
    availability: '',
    hourlyRate: 0,
    qualifications: [],
    timezone: '',
    languages: ['English'],
    country: '',
    countryIso: '',
  });

  useEffect(() => {
    if (profile && profile.coach) {
      const coachProfile = profile.coach;

      let firstName = profile.firstName;
      let lastName = profile.lastName;

      // Fallback: extract from fullName if firstName or lastName are missing
      if ((!firstName || !lastName) && profile.fullName) {
        const parts = profile.fullName.trim().split(/\s+/);
        firstName = firstName || parts[0] || '';
        lastName = lastName || (parts.length > 1 ? parts.slice(1).join(' ') : '');
      }

      setFormData({
        firstName: firstName || '',
        lastName: lastName || '',
        fullName: profile.fullName || '',
        title: coachProfile.title || '',
        bio: coachProfile.bio || '',
        style: coachProfile.style || '',
        specialties: coachProfile.specialties?.map((s: any) => s.id || s) || [],
        pastCompanies: coachProfile.pastCompanies || [],
        linkedinUrl: coachProfile.linkedinUrl || '',
        availability: coachProfile.availability || '',
        hourlyRate: coachProfile.hourlyRate || 0,
        qualifications: coachProfile.qualifications || [],
        timezone: coachProfile.timezone || 'UTC',
        languages: coachProfile.languages || ['English'],
        country: profile.country || '',
        countryIso: profile.countryIso || '',
      });
    }
  }, [profile]);

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('avatar.errorFileType'));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(t('avatar.errorFileSize'));
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewFile(file);
    setPreviewUrl(url);

    // Clear the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmUpload = async () => {
    if (!previewFile) return;

    setIsUploadingAvatar(true);
    try {
      const response = await uploadUserAvatar(previewFile);

      if (response.success) {
        await refreshUser();
        toast.success(t('avatar.uploadSuccess'));
        handleCancelPreview();
      } else {
        toast.error(response.message || t('avatar.uploadError'));
      }
    } catch (error) {
      toast.error(t('errorUnexpected'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSave = async (data: ProfileFormData) => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const response = await updateCoachProfile(data);

      if (response.success) {
        toast.success(t('profile.saveSuccess') || 'Profile updated');
        await refreshUser();
      } else {
        toast.error(response.message || t('profile.errorUpdate'));
      }
    } catch (error) {
      toast.error(t('profile.errorUnexpected') || t('errorUnexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSave = async (data: UpdateCoachExperiencesData) => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const response = await updateCoachExperiences(data.experiences);

      if (response.success) {
        toast.success(t('resume.saveSuccess') || 'Resume updated');
        await refreshUser();
      } else {
        toast.error(response.message || t('resume.errorUpdate'));
      }
    } catch (error) {
      toast.error(t('resume.errorUnexpected') || t('errorUnexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    setIsPasswordLoading(true);
    try {
      const response = await changePassword(data);

      if (response.success) {
        toast.success(t('security.passwordSuccess') || 'Password changed');
      } else {
        toast.error(response.message || t('security.errorPassword'));
      }
    } catch (error: any) {
      toast.error(error.message || t('errorUnexpected'));
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!profile) {
    return <Loading fullPage message={t('loading')} />;
  }

  const isGoogleUser = !profile.hashedPassword && !!profile.googleId;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            {t('tabs.account')}
          </TabsTrigger>
          <TabsTrigger value="payout" className="gap-2">
            <CreditCard className="h-4 w-4" />
            {t('tabs.payout')}
          </TabsTrigger>
          <TabsTrigger value="resume" className="gap-2">
            <User className="h-4 w-4" />
            {t('tabs.resume')}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            {t('tabs.security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <ProfileAvatar
                avatarUrl={profile?.avatarUrl || undefined}
                previewUrl={previewUrl || undefined}
                firstName={profile?.firstName || ''}
                lastName={profile?.lastName || ''}
                fullName={profile?.fullName || ''}
                title={formData.title}
                onChangePhoto={handleChangePhoto}
                onSave={handleConfirmUpload}
                onCancel={handleCancelPreview}
                isUploading={isUploadingAvatar}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="md:col-span-2">
              <ProfileForm
                formData={formData}
                onSave={handleSave}
                isLoading={isLoading}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payout">
          <div className="max-w-2xl">
            <StripeConnect profile={profile} />
          </div>
        </TabsContent>

        <TabsContent value="resume" className="space-y-6">
          <ResumeForm
            initialData={{ experiences: profile?.coach?.experiences || [] }}
            onSave={handleResumeSave}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="security">
          <div className="max-w-2xl">
            <SecuritySection
              onChangePassword={handleChangePassword}
              isLoading={isPasswordLoading}
              isGoogleUser={isGoogleUser}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
