// Utility functions for handling and formatting error messages

export interface ApiError {
  message: string;
  details?: string;
  statusCode?: number;
}

/**
 * Parse error from API response and return user-friendly message
 */
export function parseApiError(error: any): ApiError {
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request timeout',
        details: 'The request took too long. Please check your internet connection and try again.',
        statusCode: 0,
      };
    }
    if (error.message === 'Network Error') {
      return {
        message: 'Network error',
        details:
          'Unable to connect to the server. Please check your internet connection and try again.',
        statusCode: 0,
      };
    }
    return {
      message: 'Connection error',
      details: 'Unable to reach the server. Please try again later.',
      statusCode: 0,
    };
  }

  const status = error.response.status;
  const data = error.response.data;

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      return {
        message: 'Invalid request',
        details: typeof data === 'string' ? data : data.error || 'Please check your input and try again.',
        statusCode: status,
      };

    case 401:
      return {
        message: 'Authentication failed',
        details: typeof data === 'string' ? data : data.error || 'Invalid email or password. Please try again.',
        statusCode: status,
      };

    case 403:
      return {
        message: 'Access denied',
        details: 'You don\'t have permission to perform this action.',
        statusCode: status,
      };

    case 404:
      return {
        message: 'Not found',
        details: 'The requested resource could not be found.',
        statusCode: status,
      };

    case 409:
      return {
        message: 'Conflict',
        details: typeof data === 'string' ? data : data.error || 'This resource already exists. Please use a different value.',
        statusCode: status,
      };

    case 422:
      return {
        message: 'Validation error',
        details: typeof data === 'string' ? data : data.error || 'Some fields are invalid. Please check your input.',
        statusCode: status,
      };

    case 429:
      return {
        message: 'Too many requests',
        details: 'You\'re making requests too quickly. Please wait a moment and try again.',
        statusCode: status,
      };

    case 500:
      return {
        message: 'Server error',
        details: 'Something went wrong on our end. Please try again later.',
        statusCode: status,
      };

    case 503:
      return {
        message: 'Service unavailable',
        details: 'The server is temporarily unavailable. Please try again in a few moments.',
        statusCode: status,
      };

    default:
      return {
        message: 'An error occurred',
        details: typeof data === 'string' ? data : data.error || 'Please try again or contact support if the problem persists.',
        statusCode: status,
      };
  }
}

/**
 * Get user-friendly error message for authentication errors
 */
export function getAuthErrorMessage(error: any): string {
  const apiError = parseApiError(error);

  // Specific auth error messages
  if (apiError.statusCode === 401) {
    if (error.response?.data?.includes?.('password')) {
      return 'Incorrect password. Please try again.';
    }
    if (error.response?.data?.includes?.('email')) {
      return 'No account found with this email address.';
    }
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (apiError.statusCode === 409) {
    if (error.response?.data?.includes?.('email')) {
      return 'This email address is already registered. Please use a different email or try logging in.';
    }
    if (error.response?.data?.includes?.('username')) {
      return 'This username is already taken. Please choose a different username.';
    }
    return 'An account with these details already exists.';
  }

  return apiError.details || apiError.message;
}

/**
 * Get user-friendly error message for form validation
 */
export function getValidationMessage(field: string, value: any): string | null {
  switch (field) {
    case 'email':
      if (!value) return 'Email address is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;

    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      if (!/[A-Z]/.test(value)) {
        return 'Password should include at least one uppercase letter';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password should include at least one lowercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password should include at least one number';
      }
      return null;

    case 'username':
      if (!value) return 'Username is required';
      if (value.length < 3) {
        return 'Username must be at least 3 characters long';
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return 'Username can only contain letters, numbers, and underscores';
      }
      return null;

    default:
      return null;
  }
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: ApiError): string {
  if (error.details && error.details !== error.message) {
    return `${error.message}: ${error.details}`;
  }
  return error.message;
}
