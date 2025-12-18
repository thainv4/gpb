import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    score: number; // 0-100
    strength: 'weak' | 'medium' | 'strong' | 'very_strong';
}

@Injectable()
export class PasswordService {
    private readonly saltRounds = 12; // High security salt rounds

    /**
     * Hash password using bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Verify password against hash
     */
    async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    /**
     * Validate password strength
     */
    validatePasswordStrength(password: string): PasswordValidationResult {
        const errors: string[] = [];
        let score = 0;

        // Length check
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        } else if (password.length >= 12) {
            score += 20;
        } else {
            score += 10;
        }

        // Uppercase check
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        } else {
            score += 15;
        }

        // Lowercase check
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        } else {
            score += 15;
        }

        // Number check
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        } else {
            score += 15;
        }

        // Special character check
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        } else {
            score += 15;
        }

        // Additional complexity checks
        if (password.length >= 16) {
            score += 10;
        }

        // Check for common patterns (only if password is weak overall)
        // Only flag if the pattern is a significant part of the password
        if (score < 50 && this.hasCommonPatterns(password)) {
            score -= 10;
            errors.push('Password contains common patterns that are easy to guess');
        }

        // Check for repeated characters
        if (this.hasRepeatedCharacters(password)) {
            score -= 5;
            errors.push('Password contains too many repeated characters');
        }

        // Determine strength level
        let strength: 'weak' | 'medium' | 'strong' | 'very_strong';
        if (score < 40) {
            strength = 'weak';
        } else if (score < 60) {
            strength = 'medium';
        } else if (score < 80) {
            strength = 'strong';
        } else {
            strength = 'very_strong';
        }

        return {
            isValid: errors.length === 0,
            errors,
            score: Math.max(0, Math.min(100, score)),
            strength,
        };
    }

    /**
     * Check if password has common patterns
     * Only flags if the pattern is at the start/end of password (likely intentional weak password)
     * or if password is very short and contains common patterns
     */
    private hasCommonPatterns(password: string): boolean {
        const commonPatterns = [
            '123456',
            'password',
            'qwerty',
            'abc123',
            'admin',
            'user',
            'test',
            'demo',
            'guest',
            'welcome',
            'login',
            'secret',
            'password123',
            'admin123',
            'user123',
        ];

        const lowerPassword = password.toLowerCase();
        const passwordLength = password.length;
        
        // Only check for patterns if password is short (less than 12 chars)
        // For longer passwords, if they meet other requirements, allow common substrings
        if (passwordLength >= 12) {
            // For longer passwords, only flag if pattern is at start/end
            for (const pattern of commonPatterns) {
                const patternIndex = lowerPassword.indexOf(pattern);
                if (patternIndex !== -1) {
                    const patternLength = pattern.length;
                    // Only flag if pattern is at the very start or end
                    if (patternIndex === 0 || patternIndex + patternLength === passwordLength) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        // For shorter passwords, check if pattern is significant
        for (const pattern of commonPatterns) {
            const patternIndex = lowerPassword.indexOf(pattern);
            if (patternIndex !== -1) {
                const patternLength = pattern.length;
                
                // If pattern is at least 40% of password, it's too significant
                if (patternLength >= passwordLength * 0.4) {
                    return true;
                }
                
                // If pattern is at the start or end, it's likely intentional weak password
                if (patternIndex === 0 || patternIndex + patternLength === passwordLength) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Check for repeated characters
     */
    private hasRepeatedCharacters(password: string): boolean {
        const repeatedCharRegex = /(.)\1{2,}/;
        return repeatedCharRegex.test(password);
    }

    /**
     * Generate a secure random password
     */
    generateSecurePassword(length: number = 16): string {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let password = '';
        
        // Ensure at least one character from each category
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*()';
        
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];
        
        // Fill the rest randomly
        for (let i = 4; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }
        
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    /**
     * Check if password is expired (for future use)
     */
    isPasswordExpired(lastPasswordChange: Date, maxAgeDays: number = 90): boolean {
        const now = new Date();
        const diffTime = now.getTime() - lastPasswordChange.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > maxAgeDays;
    }
}
