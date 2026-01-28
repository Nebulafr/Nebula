"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TagInputField } from "./tag-input-field";
import { AvailabilitySettings } from "@/components/availability-settings";
import { useTranslations } from "next-intl";

export interface ProfileFormData {
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies: string[];
  linkedinUrl: string;
  availability: string;
  hourlyRate: number;
  qualifications: string[];
  experience: string;
  timezone: string;
  languages: string[];
}

interface ProfileFormProps {
  formData: ProfileFormData;
  onFormDataChange: (data: Partial<ProfileFormData>) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export function ProfileForm({
  formData,
  onFormDataChange,
  onSave,
  isLoading = false,
}: ProfileFormProps) {
  const t = useTranslations("dashboard.coach.settings.profile");
  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    onFormDataChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("professionalTitle")}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder={t("professionalTitlePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">{t("hourlyRate")}</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={formData.hourlyRate}
              onChange={(e) =>
                handleInputChange("hourlyRate", Number(e.target.value))
              }
              placeholder={t("hourlyRatePlaceholder")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">{t("bio")}</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            rows={5}
            placeholder={t("bioPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">{t("style")}</Label>
          <Input
            id="style"
            value={formData.style}
            onChange={(e) => handleInputChange("style", e.target.value)}
            placeholder={t("stylePlaceholder")}
          />
        </div>
        <div className="space-y-2"></div>

        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">{t("linkedin")}</Label>
          <Input
            id="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
            placeholder={t("linkedinPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">{t("experience")}</Label>
          <Textarea
            id="experience"
            value={formData.experience}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            rows={3}
            placeholder={t("experiencePlaceholder")}
          />
        </div>

        <TagInputField
          label={t("specialties")}
          description={t("specialtiesDesc")}
          tags={formData.specialties}
          onTagsChange={(tags) => handleInputChange("specialties", tags)}
          placeholder={t("addSpecialty")}
        />

        <TagInputField
          label={t("pastCompanies")}
          description={t("pastCompaniesDesc")}
          tags={formData.pastCompanies}
          onTagsChange={(tags) => handleInputChange("pastCompanies", tags)}
          placeholder={t("addCompany")}
        />

        <TagInputField
          label={t("qualifications")}
          tags={formData.qualifications}
          onTagsChange={(tags) => handleInputChange("qualifications", tags)}
          placeholder={t("addQualification")}
        />

        <TagInputField
          label={t("languages")}
          tags={formData.languages}
          onTagsChange={(tags) => handleInputChange("languages", tags)}
          placeholder={t("addLanguage")}
          protectedTags={["English"]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">{t("timezone")}</Label>
            <Input
              id="timezone"
              value={formData.timezone}
              onChange={(e) => handleInputChange("timezone", e.target.value)}
              placeholder={t("timezonePlaceholder")}
            />
          </div>
        </div>

        <Separator />
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? t("saving") : t("save")}
          </Button>
        </div>
      </CardContent>
      <AvailabilitySettings
        showHeader={true}
        showSaveButton={true}
        title={t("availabilityTitle")}
        description={t("availabilityDesc")}
      />
    </Card>
  );
}
