export interface ErrorResponse {
  code: string;
}

export class ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: ErrorResponse | null;

  constructor({
    success,
    message,
    data = null,
    error = null,
  }: {
    success: boolean;
    message: string;
    data?: T | null;
    error?: ErrorResponse | null;
  }) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  static success<T>(data: T, message: string = "SUCCESS"): ApiResponse<T> {
    return new ApiResponse<T>({
      success: true,
      message,
      data,
      error: null,
    });
  }

  static failure(
    message: string,
    errorCode: string = "INTERNAL_ERROR"
  ): ApiResponse<null> {
    return new ApiResponse<null>({
      success: false,
      message,
      data: null,
      error: {
        code: errorCode,
      },
    });
  }
}