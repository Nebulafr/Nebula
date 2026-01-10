"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { DifficultyLevel } from "@/generated/prisma";

export interface ProgramModule {
  title: string;
  week: number;
  description: string;
  materials: File[];
}

export interface CoCoach {
  id: string;
  name: string;
  avatar?: string;
}

export interface ProposeProgramFormData {
  // Step 1: Acknowledgments
  acknowledgments: {
    isExpert: boolean;
    canCommit: boolean;
    isOriginal: boolean;
  };

  // Step 2: Program Details
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  objectives: string[];
  modules: ProgramModule[];
  isMultiCoach: boolean;
  coCoaches: CoCoach[];

  // Step 2: Additional fields
  price: number;
  duration: number;
  difficultyLevel: DifficultyLevel;
  maxStudents: number;
  tags: string[];
  prerequisites: string[];
}

interface ProposeProgramContextValue {
  formData: ProposeProgramFormData;
  updateFormData: (data: Partial<ProposeProgramFormData>) => void;
  updateAcknowledgments: (
    key: keyof ProposeProgramFormData["acknowledgments"]
  ) => void;
  addObjective: (objective: string) => void;
  removeObjective: (index: number) => void;
  addModule: () => void;
  updateModule: (index: number, module: Partial<ProgramModule>) => void;
  removeModule: (index: number) => void;
  addModuleMaterial: (moduleIndex: number, files: File[]) => void;
  removeModuleMaterial: (moduleIndex: number, file: File) => void;
  addCoCoach: (coach: CoCoach) => void;
  removeCoCoach: (coachId: string) => void;
  addTag: (tag: string) => void;
  removeTag: (index: number) => void;
  addPrerequisite: (prerequisite: string) => void;
  removePrerequisite: (index: number) => void;
  resetForm: () => void;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  submitError: string | null;
  setSubmitError: (error: string | null) => void;
  submitSuccess: boolean;
  setSubmitSuccess: (success: boolean) => void;
}

const initialFormData: ProposeProgramFormData = {
  acknowledgments: {
    isExpert: false,
    canCommit: false,
    isOriginal: false,
  },
  title: "",
  description: "",
  category: "",
  targetAudience: "",
  objectives: [],
  modules: [
    { title: "Week 1: ", week: 1, description: "", materials: [] },
    { title: "Week 2: ", week: 2, description: "", materials: [] },
    { title: "Week 3: ", week: 3, description: "", materials: [] },
  ],
  isMultiCoach: false,
  coCoaches: [],
  price: 0,
  duration: 3,
  difficultyLevel: DifficultyLevel.BEGINNER,
  maxStudents: 30,
  tags: [],
  prerequisites: [],
};

const ProposeProgramContext = createContext<
  ProposeProgramContextValue | undefined
>(undefined);

export function ProposeProgramProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] =
    useState<ProposeProgramFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const updateFormData = useCallback(
    (data: Partial<ProposeProgramFormData>) => {
      setFormData((prev) => ({ ...prev, ...data }));
    },
    []
  );

  const updateAcknowledgments = useCallback(
    (key: keyof ProposeProgramFormData["acknowledgments"]) => {
      setFormData((prev) => ({
        ...prev,
        acknowledgments: {
          ...prev.acknowledgments,
          [key]: !prev.acknowledgments[key],
        },
      }));
    },
    []
  );

  const addObjective = useCallback((objective: string) => {
    if (objective.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, objective.trim()],
      }));
    }
  }, []);

  const removeObjective = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  }, []);

  const addModule = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: `Week ${prev.modules.length + 1}: `,
          week: prev.modules.length + 1,
          description: "",
          materials: [],
        },
      ],
    }));
  }, []);

  const updateModule = useCallback(
    (index: number, module: Partial<ProgramModule>) => {
      setFormData((prev) => ({
        ...prev,
        modules: prev.modules.map((m, i) =>
          i === index ? { ...m, ...module } : m
        ),
      }));
    },
    []
  );

  const removeModule = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules
        .filter((_, i) => i !== index)
        .map((m, i) => ({ ...m, week: i + 1 })),
    }));
  }, []);

  const addModuleMaterial = useCallback(
    (moduleIndex: number, files: File[]) => {
      setFormData((prev) => ({
        ...prev,
        modules: prev.modules.map((m, i) =>
          i === moduleIndex
            ? { ...m, materials: [...m.materials, ...files] }
            : m
        ),
      }));
    },
    []
  );

  const removeModuleMaterial = useCallback(
    (moduleIndex: number, file: File) => {
      setFormData((prev) => ({
        ...prev,
        modules: prev.modules.map((m, i) =>
          i === moduleIndex
            ? { ...m, materials: m.materials.filter((f) => f !== file) }
            : m
        ),
      }));
    },
    []
  );

  const addCoCoach = useCallback((coach: CoCoach) => {
    setFormData((prev) => ({
      ...prev,
      coCoaches: [...prev.coCoaches, coach],
    }));
  }, []);

  const removeCoCoach = useCallback((coachId: string) => {
    setFormData((prev) => ({
      ...prev,
      coCoaches: prev.coCoaches.filter((c) => c.id !== coachId),
    }));
  }, []);

  const addTag = useCallback((tag: string) => {
    if (tag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    }
  }, []);

  const removeTag = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  }, []);

  const addPrerequisite = useCallback((prerequisite: string) => {
    if (prerequisite.trim()) {
      setFormData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisite.trim()],
      }));
    }
  }, []);

  const removePrerequisite = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  const isStep1Valid = Object.values(formData.acknowledgments).every(Boolean);

  const isStep2Valid =
    formData.title.trim().length > 0 &&
    formData.description.trim().length >= 10 &&
    formData.category.trim().length > 0 &&
    formData.objectives.length > 0 &&
    formData.modules.length > 0 &&
    formData.modules.every(
      (m) => m.title.trim().length > 0 && m.description.trim().length > 0
    );

  const value: ProposeProgramContextValue = {
    formData,
    updateFormData,
    updateAcknowledgments,
    addObjective,
    removeObjective,
    addModule,
    updateModule,
    removeModule,
    addModuleMaterial,
    removeModuleMaterial,
    addCoCoach,
    removeCoCoach,
    addTag,
    removeTag,
    addPrerequisite,
    removePrerequisite,
    resetForm,
    isStep1Valid,
    isStep2Valid,
    submitting,
    setSubmitting,
    submitError,
    setSubmitError,
    submitSuccess,
    setSubmitSuccess,
  };

  return (
    <ProposeProgramContext.Provider value={value}>
      {children}
    </ProposeProgramContext.Provider>
  );
}

export function useProposeProgramContext() {
  const context = useContext(ProposeProgramContext);
  if (context === undefined) {
    throw new Error(
      "useProposeProgramContext must be used within a ProposeProgramProvider"
    );
  }
  return context;
}
