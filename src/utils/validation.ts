export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const sanitizeObject = <T extends object>(obj: T, allowedFields: (keyof T)[]): Partial<T> => {
  const sanitized: Partial<T> = {};
  
  for (const field of allowedFields) {
    if (obj[field] !== undefined) {
      sanitized[field] = obj[field];
    }
  }
  
  return sanitized;
};
