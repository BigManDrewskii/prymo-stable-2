/**
 * Single Model Enhancement Service
 * Uses one super-refined model with intelligent prompt enhancement
 */

import { PromptEnhancer, PromptEnhancementRequest } from './promptEnhancer';
import { EnhancementQualityValidator } from './qualityValidator';

export interface SingleModelConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface EnhancementRequest {
  text: string;
  enhancementType?: 'general' | 'professional' | 'creative' | 'academic' | 'concise';
  tone?: 'formal' | 'casual' | 'friendly' | 'authoritative' | 'persuasive';
  targetAudience?: string;
  customInstructions?: string;
}

export interface EnhancementResponse {
  enhancedText: string;
  originalLength: number;
  enhancedLength: number;
  processingTime: number;
  qualityScore: number;
  promptScore: number;
  modelUsed: string;
  improvements: string[];
}

export class SingleModelEnhancer {
  private config: SingleModelConfig;
  private baseUrl: string;
  
  // The ONE super-refined model we'll use for everything
  private static readonly OPTIMAL_MODEL = 'anthropic/claude-3.5-sonnet';
  
  // Optimized parameters for our chosen model
  private static readonly OPTIMAL_PARAMETERS = {
    temperature: 0.3,        // Low for consistency
    max_tokens: 2000,        // Generous for detailed enhancements
    top_p: 0.8,             // Focused but not too narrow
    frequency_penalty: 0.1,  // Slight penalty to avoid repetition
    presence_penalty: 0.0    // No penalty for topic consistency
  };

  constructor(config: SingleModelConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
  }

  /**
   * Enhanced text processing with two-stage approach
   */
  async enhanceText(request: EnhancementRequest): Promise<EnhancementResponse> {
    const startTime = Date.now();
    
    try {
      // Stage 1: Enhance the prompt for better AI understanding
      const promptEnhancement = PromptEnhancer.enhancePrompt({
        rawText: request.text,
        enhancementType: request.enhancementType,
        tone: request.tone,
        targetAudience: request.targetAudience,
        customInstructions: request.customInstructions
      });

      console.log('🔧 Prompt Enhancement Score:', promptEnhancement.overallScore);
      
      // Stage 2: Use the enhanced prompt with our optimal model
      const enhancedText = await this.callOptimalModel(promptEnhancement.enhancedPrompt);
      
      // Stage 3: Validate the result
      const validation = EnhancementQualityValidator.validateEnhancement(
        request.text, 
        enhancedText,
        { minScore: 70, maxRetries: 2, strictMode: true }
      );

      // If quality is too low, retry with stricter prompt
      if (!validation.isValid && validation.score < 70) {
        console.log('⚠️ Quality too low, retrying with stricter prompt...');
        const stricterPrompt = this.createStricterPrompt(promptEnhancement.enhancedPrompt, validation.issues);
        const retryResult = await this.callOptimalModel(stricterPrompt);
        
        // Re-validate
        const retryValidation = EnhancementQualityValidator.validateEnhancement(
          request.text, 
          retryResult,
          { minScore: 60, maxRetries: 1, strictMode: true }
        );
        
        if (retryValidation.isValid || retryValidation.score > validation.score) {
          return this.buildResponse(
            request.text, 
            retryResult, 
            startTime, 
            retryValidation.score,
            promptEnhancement.overallScore
          );
        }
      }

      // Return the result
      return this.buildResponse(
        request.text, 
        enhancedText, 
        startTime, 
        validation.score,
        promptEnhancement.overallScore
      );

    } catch (error) {
      console.error('Enhancement failed:', error);
      throw new Error(`Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Call our optimal model with the enhanced prompt
   */
  private async callOptimalModel(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://prymo.ai',
        'X-Title': 'PRYMO Text Enhancer'
      },
      body: JSON.stringify({
        model: SingleModelEnhancer.OPTIMAL_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        ...SingleModelEnhancer.OPTIMAL_PARAMETERS,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from API');
    }

    return data.choices[0].message.content.trim();
  }

  /**
   * Create a stricter prompt when quality is low
   */
  private createStricterPrompt(originalPrompt: string, issues: string[]): string {
    const stricterInstructions = `
CRITICAL: The previous attempt had these issues:
${issues.map(issue => `• ${issue}`).join('\n')}

STRICT REQUIREMENTS - FOLLOW EXACTLY:
1. Provide ONLY the enhanced text - no explanations
2. Do NOT ask questions or seek clarification
3. Do NOT add meta-commentary about the enhancement
4. Start your response directly with the enhanced text
5. Maintain the original meaning precisely
6. Keep similar length (±30% maximum)

${originalPrompt}

ENHANCED TEXT (respond with enhanced text only):`;

    return stricterInstructions;
  }

  /**
   * Build the response object
   */
  private buildResponse(
    originalText: string, 
    enhancedText: string, 
    startTime: number,
    qualityScore: number,
    promptScore: number
  ): EnhancementResponse {
    const processingTime = Date.now() - startTime;
    const originalLength = originalText.length;
    const enhancedLength = enhancedText.length;
    
    // Generate improvement summary
    const improvements = this.generateImprovements(originalText, enhancedText, qualityScore);

    return {
      enhancedText,
      originalLength,
      enhancedLength,
      processingTime,
      qualityScore,
      promptScore,
      modelUsed: SingleModelEnhancer.OPTIMAL_MODEL,
      improvements
    };
  }

  /**
   * Generate improvement summary
   */
  private generateImprovements(original: string, enhanced: string, qualityScore: number): string[] {
    const improvements: string[] = [];
    
    const originalWords = original.split(/\s+/).length;
    const enhancedWords = enhanced.split(/\s+/).length;
    const lengthChange = ((enhancedWords - originalWords) / originalWords * 100);
    
    if (Math.abs(lengthChange) > 5) {
      if (lengthChange > 0) {
        improvements.push(`Expanded content by ${Math.round(lengthChange)}% for better clarity`);
      } else {
        improvements.push(`Condensed content by ${Math.round(Math.abs(lengthChange))}% for conciseness`);
      }
    }
    
    if (qualityScore >= 90) {
      improvements.push('Significantly improved clarity and flow');
      improvements.push('Enhanced professional tone and readability');
    } else if (qualityScore >= 80) {
      improvements.push('Improved overall clarity and structure');
      improvements.push('Enhanced readability and engagement');
    } else if (qualityScore >= 70) {
      improvements.push('Basic improvements to clarity and grammar');
    }
    
    // Check for specific improvements
    if (enhanced.includes('.') && !original.includes('.')) {
      improvements.push('Added proper sentence structure');
    }
    
    if (enhanced.length > original.length * 1.1) {
      improvements.push('Added detail and context for better understanding');
    }
    
    return improvements;
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const testPrompt = "Enhance this text: Hello world.";
      await this.callOptimalModel(testPrompt);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  static getModelInfo() {
    return {
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      description: 'Optimal model for text enhancement with superior natural language understanding',
      strengths: [
        'Excellent at maintaining original meaning',
        'Superior natural language flow',
        'Consistent quality output',
        'Great at following complex instructions',
        'Minimal hallucination risk'
      ],
      parameters: SingleModelEnhancer.OPTIMAL_PARAMETERS
    };
  }
}

// Configuration storage utilities
export class SingleModelConfigStorage {
  private static readonly STORAGE_KEY = 'prymo_single_model_config';

  static save(config: SingleModelConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save config to localStorage:', error);
    }
  }

  static load(): Partial<SingleModelConfig> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load config from localStorage:', error);
      return {};
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear config from localStorage:', error);
    }
  }
}