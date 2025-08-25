/**
 * Quality Validation Service
 * Validates AI responses and implements retry logic based on industry best practices
 */

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  confidence: number;
}

export interface ValidationConfig {
  minScore: number;
  maxRetries: number;
  strictMode: boolean;
}

export class EnhancementQualityValidator {
  private static readonly DEFAULT_CONFIG: ValidationConfig = {
    minScore: 70,
    maxRetries: 3,
    strictMode: true
  };

  /**
   * Comprehensive validation of enhancement responses
   */
  static validateEnhancement(
    original: string, 
    enhanced: string, 
    config: Partial<ValidationConfig> = {}
  ): ValidationResult {
    const validationConfig = { ...this.DEFAULT_CONFIG, ...config };
    const issues: string[] = [];
    let score = 100;
    let confidence = 100;

    // Critical validation checks based on industry research
    
    // 1. Check for question responses (main issue reported)
    if (this.containsQuestions(enhanced)) {
      issues.push('Response contains questions instead of enhancement');
      score -= 60;
      confidence -= 40;
    }

    // 2. Check for explanatory text instead of direct enhancement
    if (this.containsExplanations(enhanced)) {
      issues.push('Response contains explanations instead of direct enhancement');
      score -= 40;
      confidence -= 30;
    }

    // 3. Check for meta-commentary
    if (this.containsMetaCommentary(enhanced)) {
      issues.push('Response contains meta-commentary about the enhancement process');
      score -= 35;
      confidence -= 25;
    }

    // 4. Length validation
    const lengthValidation = this.validateLength(original, enhanced);
    if (!lengthValidation.isValid) {
      issues.push(lengthValidation.issue);
      score -= lengthValidation.penalty;
      confidence -= 15;
    }

    // 5. Content preservation check
    const contentValidation = this.validateContentPreservation(original, enhanced);
    if (!contentValidation.isValid) {
      issues.push(contentValidation.issue);
      score -= contentValidation.penalty;
      confidence -= 20;
    }

    // 6. Basic quality checks
    const qualityValidation = this.validateBasicQuality(enhanced);
    if (!qualityValidation.isValid) {
      issues.push(...qualityValidation.issues);
      score -= qualityValidation.penalty;
      confidence -= 10;
    }

    // 7. Tone consistency check
    const toneValidation = this.validateToneConsistency(original, enhanced);
    if (!toneValidation.isValid) {
      issues.push(toneValidation.issue);
      score -= toneValidation.penalty;
      confidence -= 10;
    }

    // 8. Strict mode additional checks
    if (validationConfig.strictMode) {
      const strictValidation = this.strictModeValidation(enhanced);
      if (!strictValidation.isValid) {
        issues.push(...strictValidation.issues);
        score -= strictValidation.penalty;
        confidence -= 15;
      }
    }

    // Ensure minimum bounds
    score = Math.max(0, score);
    confidence = Math.max(0, confidence);

    return {
      isValid: score >= validationConfig.minScore && issues.length === 0,
      score,
      issues,
      confidence
    };
  }

  /**
   * Check for question patterns that indicate the AI is asking instead of enhancing
   */
  private static containsQuestions(text: string): boolean {
    const questionPatterns = [
      /\?/,                           // Any question mark
      /could you/i,                   // "Could you..."
      /would you like/i,              // "Would you like..."
      /do you want/i,                 // "Do you want..."
      /should i/i,                    // "Should I..."
      /what would you prefer/i,       // "What would you prefer..."
      /would you prefer/i,            // "Would you prefer..."
      /can you clarify/i,             // "Can you clarify..."
      /do you need/i,                 // "Do you need..."
      /are you looking for/i,         // "Are you looking for..."
      /what kind of/i,                // "What kind of..."
      /which would you/i,             // "Which would you..."
      /how would you like/i           // "How would you like..."
    ];
    
    return questionPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Check for explanatory phrases that indicate meta-commentary
   */
  private static containsExplanations(text: string): boolean {
    const explanationPatterns = [
      /here is/i,                     // "Here is the enhanced version"
      /i have enhanced/i,             // "I have enhanced your text"
      /the improved version/i,        // "The improved version is"
      /here's the enhanced/i,         // "Here's the enhanced text"
      /i've rewritten/i,              // "I've rewritten your text"
      /i've improved/i,               // "I've improved the text"
      /the enhanced text/i,           // "The enhanced text is"
      /below is the/i,                // "Below is the improved version"
      /the following is/i,            // "The following is the enhanced"
      /i've made the following/i,     // "I've made the following improvements"
      /here are the improvements/i,   // "Here are the improvements"
      /the revised version/i          // "The revised version"
    ];
    
    return explanationPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Check for meta-commentary about the enhancement process
   */
  private static containsMetaCommentary(text: string): boolean {
    const metaPatterns = [
      /i understand/i,                // "I understand you want..."
      /based on your request/i,       // "Based on your request"
      /as requested/i,                // "As requested, I have..."
      /to improve/i,                  // "To improve this text"
      /in order to enhance/i,         // "In order to enhance"
      /for better/i,                  // "For better readability"
      /this will help/i,              // "This will help improve"
      /the goal is to/i,              // "The goal is to make"
      /i've focused on/i,             // "I've focused on improving"
      /the changes include/i,         // "The changes include"
      /improvements made/i,           // "Improvements made include"
      /to make it more/i              // "To make it more professional"
    ];
    
    return metaPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Validate text length appropriateness
   */
  private static validateLength(original: string, enhanced: string): {
    isValid: boolean;
    issue: string;
    penalty: number;
  } {
    const originalLength = original.length;
    const enhancedLength = enhanced.length;
    const ratio = enhancedLength / originalLength;

    if (ratio < 0.3) {
      return {
        isValid: false,
        issue: 'Enhanced text is too short (less than 30% of original)',
        penalty: 30
      };
    }

    if (ratio > 4.0) {
      return {
        isValid: false,
        issue: 'Enhanced text is too long (more than 400% of original)',
        penalty: 25
      };
    }

    if (enhancedLength < 10) {
      return {
        isValid: false,
        issue: 'Enhanced text is extremely short',
        penalty: 40
      };
    }

    return { isValid: true, issue: '', penalty: 0 };
  }

  /**
   * Validate content preservation
   */
  private static validateContentPreservation(original: string, enhanced: string): {
    isValid: boolean;
    issue: string;
    penalty: number;
  } {
    // Check if enhanced text is identical to original (no enhancement)
    if (original.trim() === enhanced.trim()) {
      return {
        isValid: false,
        issue: 'No enhancement detected - text is identical to original',
        penalty: 50
      };
    }

    // Check for completely different content (hallucination)
    const originalWords = original.toLowerCase().split(/\s+/);
    const enhancedWords = enhanced.toLowerCase().split(/\s+/);
    
    // Calculate word overlap
    const commonWords = originalWords.filter(word => 
      enhancedWords.includes(word) && word.length > 3
    );
    
    const overlapRatio = commonWords.length / Math.max(originalWords.length, 1);
    
    if (overlapRatio < 0.3) {
      return {
        isValid: false,
        issue: 'Enhanced text appears to be completely different content',
        penalty: 45
      };
    }

    return { isValid: true, issue: '', penalty: 0 };
  }

  /**
   * Basic quality validation
   */
  private static validateBasicQuality(enhanced: string): {
    isValid: boolean;
    issues: string[];
    penalty: number;
  } {
    const issues: string[] = [];
    let penalty = 0;

    // Check for empty or whitespace-only response
    if (!enhanced.trim()) {
      issues.push('Response is empty or contains only whitespace');
      penalty += 100;
    }

    // Check for incomplete sentences
    if (enhanced.trim().length > 20 && !enhanced.match(/[.!?]$/)) {
      issues.push('Response appears to be incomplete (no ending punctuation)');
      penalty += 15;
    }

    // Check for repeated phrases (basic detection)
    const words = enhanced.split(/\s+/);
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 4) {
        wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1);
      }
    });

    const repeatedWords = Array.from(wordCounts.entries()).filter(([_, count]) => count > 3);
    if (repeatedWords.length > 0) {
      issues.push('Response contains excessive word repetition');
      penalty += 10;
    }

    return {
      isValid: issues.length === 0,
      issues,
      penalty
    };
  }

  /**
   * Validate tone consistency
   */
  private static validateToneConsistency(original: string, enhanced: string): {
    isValid: boolean;
    issue: string;
    penalty: number;
  } {
    // Basic tone shift detection
    const originalHasExclamation = /!/.test(original);
    const enhancedHasExclamation = /!/.test(enhanced);
    
    const originalHasQuestion = /\?/.test(original);
    const enhancedHasQuestion = /\?/.test(enhanced);

    // If original had questions but enhanced doesn't (and vice versa)
    if (originalHasQuestion && !enhancedHasQuestion) {
      return {
        isValid: false,
        issue: 'Original questions were removed in enhancement',
        penalty: 20
      };
    }

    // Major tone shift detection (basic)
    const originalCaps = (original.match(/[A-Z]/g) || []).length;
    const enhancedCaps = (enhanced.match(/[A-Z]/g) || []).length;
    const capsRatio = enhancedCaps / Math.max(originalCaps, 1);

    if (capsRatio > 3 || capsRatio < 0.3) {
      return {
        isValid: false,
        issue: 'Significant tone shift detected in capitalization',
        penalty: 15
      };
    }

    return { isValid: true, issue: '', penalty: 0 };
  }

  /**
   * Strict mode additional validation
   */
  private static strictModeValidation(enhanced: string): {
    isValid: boolean;
    issues: string[];
    penalty: number;
  } {
    const issues: string[] = [];
    let penalty = 0;

    // Check for AI-like phrases
    const aiPhrases = [
      /as an ai/i,
      /i'm an ai/i,
      /i cannot/i,
      /i don't have/i,
      /i'm not able/i,
      /i apologize/i,
      /i'm sorry/i,
      /unfortunately/i,
      /however, i/i
    ];

    if (aiPhrases.some(phrase => phrase.test(enhanced))) {
      issues.push('Response contains AI-like phrases or limitations');
      penalty += 25;
    }

    // Check for formatting instructions in output
    const formatInstructions = [
      /\*\*.*\*\*/,  // Bold markdown
      /\*.*\*/,      // Italic markdown
      /#.*#/,        // Headers
      /```.*```/,    // Code blocks
      /\[.*\]/       // Brackets
    ];

    if (formatInstructions.some(format => format.test(enhanced))) {
      issues.push('Response contains formatting markup instead of plain text');
      penalty += 10;
    }

    return {
      isValid: issues.length === 0,
      issues,
      penalty
    };
  }

  /**
   * Get validation recommendations based on issues
   */
  static getValidationRecommendations(validation: ValidationResult): string[] {
    const recommendations: string[] = [];

    if (validation.issues.includes('Response contains questions instead of enhancement')) {
      recommendations.push('Use stricter prompt with explicit "NO QUESTIONS" instruction');
      recommendations.push('Lower temperature to 0.3 or below for more focused responses');
    }

    if (validation.issues.includes('Response contains explanations instead of direct enhancement')) {
      recommendations.push('Add "RESPOND WITH ENHANCED TEXT ONLY" to prompt');
      recommendations.push('Use system message to enforce output format');
    }

    if (validation.score < 50) {
      recommendations.push('Consider using a different model for this content type');
      recommendations.push('Retry with more specific instructions');
    }

    if (validation.confidence < 60) {
      recommendations.push('Manual review recommended before using this enhancement');
    }

    return recommendations;
  }
}