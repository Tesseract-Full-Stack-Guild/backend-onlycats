// utils/passwordStrength.ts

export interface PasswordStrengthResult {
  score: number;           // 0-4 (0=very weak, 4=very strong)
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  isValid: boolean;        // Meets minimum requirements
  errors: string[];        // List of missing requirements
  feedback: string;        // User-friendly message
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = [];
  let score = 0;

  // Check if password exists
  if (!password) {
    return {
      score: 0,
      strength: 'Very Weak',
      isValid: false,
      errors: ['Password is required'],
      feedback: 'Please enter a password'
    };
  }

  // Length checks
  if (password.length < 8) {
    errors.push('At least 8 characters');
  } else if (password.length >= 8) {
    score += 1;
  }
  
  if (password.length >= 12) {
    score += 1; // Extra point for longer passwords
  }

  // Character type checks
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  // Upper + lower case (alphabetical variety)
  if (hasUpperCase && hasLowerCase) {
    score += 1;
  } else if (hasUpperCase || hasLowerCase) {
    // Has letters but not both cases
    if (!hasUpperCase) errors.push('At least one uppercase letter');
    if (!hasLowerCase) errors.push('At least one lowercase letter');
  } else {
    errors.push('At least one letter');
  }

  // Numbers
  if (hasNumbers) {
    score += 1;
  } else {
    errors.push('At least one number');
  }

  // Special characters
  if (hasSpecial) {
    score += 1;
  }

  // Additional checks for common patterns
  const commonPatterns = [
    'password', '123456', 'qwerty', 'abc123', 
    'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    errors.push('Avoid common words or patterns');
    score = Math.max(0, score - 1);
  }

  // Check for sequential characters (123, abc)
  const sequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  if (sequential) {
    errors.push('Avoid sequential characters');
    score = Math.max(0, score - 1);
  }

  // Check for repeated characters (aaa, 111)
  const repeated = /(.)\1{2,}/.test(password);
  if (repeated) {
    errors.push('Avoid repeated characters');
    score = Math.max(0, score - 1);
  }

  // Determine strength label
  let strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  if (score <= 1) strength = 'Very Weak';
  else if (score <= 2) strength = 'Weak';
  else if (score <= 3) strength = 'Fair';
  else if (score <= 4) strength = 'Good';
  else strength = 'Strong';

  // Determine if password meets minimum requirements
  const isValid = 
    password.length >= 8 && 
    hasUpperCase && 
    hasLowerCase && 
    hasNumbers;

  // Create user-friendly feedback
  let feedback = '';
  if (isValid) {
    if (score >= 5) {
      feedback = 'Strong password!';
    } else if (score >= 4) {
      feedback = 'Good password. Adding special characters would make it stronger.';
    } else {
      feedback = 'Valid password but could be stronger.';
    }
  } else {
    feedback = `Password must: ${errors.join(', ')}`;
  }

  return {
    score: Math.min(5, score), // Cap at 5
    strength,
    isValid,
    errors,
    feedback
  };
}

// Simplified version for quick checks
export function isPasswordStrong(password: string): boolean {
  return checkPasswordStrength(password).isValid;
}

// Get strength percentage (0-100)
export function getPasswordStrengthPercentage(password: string): number {
  const result = checkPasswordStrength(password);
  return (result.score / 5) * 100;
}