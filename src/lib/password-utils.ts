import { hash, compare } from "bcryptjs";

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

export interface PasswordStrength {
  score: number; // 0-100
  requirements: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
  message: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Calculate score based on met requirements
  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const score = (metRequirements / 5) * 100;

  // Get encouraging message based on score
  const message = getStrengthMessage(score);

  return {
    score,
    requirements,
    message,
  };
}

function getStrengthMessage(score: number): string {
  if (score === 100) return "🎉 Perfect Your password is super strong";
  if (score >= 80) return "💪 Almost there! Just a bit more to perfection";
  if (score >= 60) return "🚀 Good progress! Keep going";
  if (score >= 40) return "🌱 Getting stronger! You can do better";
  if (score >= 20) return "🔑 Starting good! Let's make it stronger";
  return "🎮 Let's create a strong password together";
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    // Add logging to debug
    console.log("Verifying password...");
    console.log("Plain password length:", plainPassword.length);
    console.log("Hashed password length:", hashedPassword.length);
    
    const isValid = await compare(plainPassword, hashedPassword);
    console.log("Password verification result:", isValid);
    
    return isValid;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

export function isPasswordExpired(lastChanged: Date): boolean {
  const expirationDays = 14;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastChanged.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > expirationDays;
}