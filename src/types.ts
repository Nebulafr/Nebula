export interface ModuleFormData {
  title: string;
  week: number;
  description: string;
}

export interface CourseFormData {
  modules: ModuleFormData[];
}
