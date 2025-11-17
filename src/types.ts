export interface ModuleFormData {
  title: string;
  week: number;
  description: string;
}

export interface CourseFormData {
  modules: ModuleFormData[];
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}
