export interface Student {
  id: string;
  userId: string;
  interestedCategoryId?: string | null;
  skillLevel?: string | null;
  commitment?: string | null;
  learningGoals: string[];
  currentLevel?: string | null;
  timeZone?: string | null;
  createdAt: string;
  updatedAt: string;
}
