export interface ModuleFormData {
  title: string;
  week: number;
  description: string;
}

export interface CourseFormData {
  modules: ModuleFormData[];
}

export enum RESPONSE_CODE {
  INVALID_FIELDS,
  USER_NOT_FOUND,
  USER_ALREADY_EXIST,
  INTERNAL_SERVER_ERROR,
  VALIDATION_ERROR,
  INVALID_PARAMS,
  METHOD_NOT_ALLOWED,
  ORDER_EXISTS,
  UNAUTHORIZED,
  FORBIDDEN,
  SUCCESS,
  INVALID_TOKEN,
  ERROR,
  EMAIL_FAILED_TO_SEND,
  BAD_REQUEST,
  NOT_FOUND,
}

// lib/api-response.ts
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}>;

// Helper function to create consistent responses
export function createSuccessResponse<T>(
  data?: T,
  message: string = "Success"
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createErrorResponse(
  error: string,
  message?: string,
  code?: string
): ApiResponse {
  return {
    success: false,
    error,
    message: message || error,
    code,
  };
}
