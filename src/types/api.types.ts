export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
