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
  code?: any;
  statusCode?: number;
}

export enum RESPONSE_CODE {
  // Common Responses code
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
