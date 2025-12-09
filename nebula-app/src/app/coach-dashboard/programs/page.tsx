"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  MoreHorizontal,
  Briefcase,
  GraduationCap,
  Star,
  Users,
} from "lucide-react";
import { createProgram, getPrograms } from "@/actions/programs";
import { toast } from "react-toastify";
import { useCategories } from "@/contexts/CategoryContext";
import { useAuth } from "@/hooks/use-auth";
import { IProgram, ProgramCard } from "./components/program-card";
import { CreateProgramDialog, ProgramFormData } from "./components/create-program-dialog";

export default function CoachProgramsPage() {
  const { profile, coachProfile } = useAuth();
  const { categories } = useCategories();
  const [programs, setPrograms] = useState<IProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  console.log({ programs });

  useEffect(() => {
    if (!coachProfile) return;

    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const result = await getPrograms({ coachId: coachProfile!.id });

        if (result.success) {
          setPrograms(result.programs);
        } else {
          console.error("Error fetching programs:", result.error);
          setPrograms([]);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [coachProfile]);

  const refreshPrograms = async () => {
    if (!coachProfile) return;
    try {
      const result = await getPrograms({ coachId: coachProfile.id });
      if (result.success) {
        setPrograms(result.programs);
      } else {
        console.error("Error refreshing programs:", result.error);
        setPrograms([]);
      }
    } catch (error) {
      console.error("Error refreshing programs:", error);
      setPrograms([]);
    }
  };

  const handleCreateProgram = async (programData: ProgramFormData) => {
    if (!profile) {
      toast.error("You must be logged in.");
      return;
    }

    try {
      // Convert to the format expected by createProgram action
      const createProgramData = {
        title: programData.title,
        category: programData.category,
        description: programData.description,
        objectives: programData.objectives,
        modules: programData.modules,
      };

      const result = await createProgram(createProgramData);

      if (result.success) {
        toast.success(result.message || "Your new program has been created.");
        await refreshPrograms();
        return true;
      } else {
        toast.error(result.message || "Could not create the program.");
        return false;
      }
    } catch (error) {
      toast.error("Could not create the program.");
      console.error(error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">My Programs</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="flex gap-4">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Programs</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Program
        </Button>
      </div>

      {programs.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No programs yet</h3>
                <p className="text-muted-foreground">
                  Create your first program to get started.
                </p>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Program
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}

      <CreateProgramDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories.map(cat => cat.name)}
        onCreateProgram={handleCreateProgram}
        loading={loading}
      />
    </div>
  );
}
