"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { updateCoachProfile } from "@/actions/coaches";
import { toast } from "react-toastify";
import { X, Plus } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function CoachProfilePage() {
  const { user, profile: userProfile, coachProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [style, setStyle] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [pastCompanies, setPastCompanies] = useState<string[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [availability, setAvailability] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [timezone, setTimezone] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);

  // Input states for adding new items
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newQualification, setNewQualification] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  useEffect(() => {
    if (coachProfile) {
      setTitle(coachProfile.title || "");
      setBio(coachProfile.bio || "");
      setStyle(coachProfile.style || "");
      setSpecialties(coachProfile.specialties || []);
      setPastCompanies(coachProfile.pastCompanies || []);
      setLinkedinUrl(coachProfile.linkedinUrl || "");
      setAvailability(coachProfile.availability || "");
      setHourlyRate(coachProfile.hourlyRate || 0);
      setQualifications(coachProfile.qualifications || []);
      setExperience(coachProfile.experience || "");
      setTimezone(coachProfile.timezone || "UTC");
      setLanguages(coachProfile.languages || ["English"]);
    }
  }, [coachProfile]);

  const addItem = (
    item: string,
    currentList: string[],
    setList: (list: string[]) => void
  ) => {
    if (item.trim() && !currentList.includes(item.trim())) {
      setList([...currentList, item.trim()]);
    }
  };

  const removeItem = (
    item: string,
    currentList: string[],
    setList: (list: string[]) => void
  ) => {
    setList(currentList.filter((i) => i !== item));
  };

  const handleSave = async () => {
    if (!coachProfile) return;

    setIsLoading(true);
    try {
      const profileData = {
        title,
        bio,
        style,
        specialties,
        pastCompanies,
        linkedinUrl,
        availability,
        hourlyRate,
        qualifications,
        experience,
        timezone,
        languages,
      };

      const response = await updateCoachProfile(profileData);

      if (response.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={coachProfile?.avatarUrl!} />
                <AvatarFallback>
                  {userProfile?.fullName?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{userProfile?.fullName}</CardTitle>
              <CardDescription>{title}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">Change Photo</Button>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    placeholder="150"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  placeholder="Tell potential students about yourself, your experience, and your coaching approach..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="style">Coaching Style</Label>
                  <Input
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="e.g., Hands-on, Mentoring, Strategic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="e.g., Weekdays 9-5 EST"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Summary</Label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={3}
                  placeholder="Brief overview of your professional experience..."
                />
              </div>

              <div className="space-y-2">
                <Label>Specialties</Label>
                <p className="text-sm text-muted-foreground">
                  Add tags that describe your expertise.
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {specialty}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          removeItem(specialty, specialties, setSpecialties)
                        }
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="Add a specialty..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addItem(newSpecialty, specialties, setSpecialties);
                        setNewSpecialty("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      addItem(newSpecialty, specialties, setSpecialties);
                      setNewSpecialty("");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Past Companies</Label>
                <p className="text-sm text-muted-foreground">
                  Add companies you've worked at.
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {pastCompanies.map((company) => (
                    <Badge
                      key={company}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {company}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          removeItem(company, pastCompanies, setPastCompanies)
                        }
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Add a company..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addItem(newCompany, pastCompanies, setPastCompanies);
                        setNewCompany("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      addItem(newCompany, pastCompanies, setPastCompanies);
                      setNewCompany("");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Qualifications</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {qualifications.map((qualification) => (
                    <Badge
                      key={qualification}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {qualification}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          removeItem(
                            qualification,
                            qualifications,
                            setQualifications
                          )
                        }
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    placeholder="Add a qualification..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addItem(
                          newQualification,
                          qualifications,
                          setQualifications
                        );
                        setNewQualification("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      addItem(
                        newQualification,
                        qualifications,
                        setQualifications
                      );
                      setNewQualification("");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {languages.map((language) => (
                    <Badge
                      key={language}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {language}
                      {language !== "English" && (
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            removeItem(language, languages, setLanguages)
                          }
                        />
                      )}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addItem(newLanguage, languages, setLanguages);
                        setNewLanguage("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      addItem(newLanguage, languages, setLanguages);
                      setNewLanguage("");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="UTC"
                  />
                </div>
              </div>

              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
