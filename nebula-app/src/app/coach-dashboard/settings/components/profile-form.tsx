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
  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    onFormDataChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Update your public profile information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Professional Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={formData.hourlyRate}
              onChange={(e) =>
                handleInputChange("hourlyRate", Number(e.target.value))
              }
              placeholder="150"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biography</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            rows={5}
            placeholder="Tell potential students about yourself, your experience, and your coaching approach..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">Coaching Style</Label>
          <Input
            id="style"
            value={formData.style}
            onChange={(e) => handleInputChange("style", e.target.value)}
            placeholder="e.g., Hands-on, Mentoring, Strategic"
          />
        </div>
        <div className="space-y-2"></div>

        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input
            id="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experience Summary</Label>
          <Textarea
            id="experience"
            value={formData.experience}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            rows={3}
            placeholder="Brief overview of your professional experience..."
          />
        </div>

        <TagInputField
          label="Specialties"
          description="Add tags that describe your expertise."
          tags={formData.specialties}
          onTagsChange={(tags) => handleInputChange("specialties", tags)}
          placeholder="Add a specialty..."
        />

        <TagInputField
          label="Past Companies"
          description="Add companies you've worked at."
          tags={formData.pastCompanies}
          onTagsChange={(tags) => handleInputChange("pastCompanies", tags)}
          placeholder="Add a company..."
        />

        <TagInputField
          label="Qualifications"
          tags={formData.qualifications}
          onTagsChange={(tags) => handleInputChange("qualifications", tags)}
          placeholder="Add a qualification..."
        />

        <TagInputField
          label="Languages"
          tags={formData.languages}
          onTagsChange={(tags) => handleInputChange("languages", tags)}
          placeholder="Add a language..."
          protectedTags={["English"]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={formData.timezone}
              onChange={(e) => handleInputChange("timezone", e.target.value)}
              placeholder="UTC"
            />
          </div>
        </div>

        <Separator />
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
      <AvailabilitySettings
        showHeader={true}
        showSaveButton={true}
        title="Availability Settings"
        description="Set your weekly availability for coaching sessions"
      />
    </Card>
  );
}
