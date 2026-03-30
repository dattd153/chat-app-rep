/** Standardized API Response and Helpers for the Chat Application */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export const successResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  error: null,
});

export const errorResponse = (code: string, message: string): ApiResponse<null> => ({
  success: false,
  data: null,
  error: { code, message },
});
