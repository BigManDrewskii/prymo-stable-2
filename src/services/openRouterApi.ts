/**
 * OpenRouter API Service
 * Simple two-model approach: Claude 3.5 Sonnet (primary) + GPT-4o Mini (fallback)
 */

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
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
  improvements: string[];
  processingTime: number;
}

export class OpenRouterApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'OpenRouterApiError';
  }
}

/**
 * Simple configuration storage utility
 */
export class ApiConfigStorage {
  private static readonly STORAGE_KEY = 'openrouter_config';

  static save(config: OpenRouterConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save API configuration:', error);
    }
  }

  static load(): Partial<OpenRouterConfig> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load API configuration:', error);
      return {};
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear API configuration:', error);
    }
  }
}

export class OpenRouterApiService {
  private config: OpenRouterConfig;
  private baseUrl: string;
  
  // Updated model hierarchy: Use correct free model IDs from OpenRouter
  private static readonly PRIMARY_MODEL = 'moonshotai/kimi-k2:free'; // Correct free Kimi model
  private static readonly FALLBACK_MODEL = 'anthropic/claude-3-haiku'; // Fast and affordable
  private static readonly PREMIUM_FALLBACK = 'anthropic/claude-3.5-sonnet'; // Premium option

  constructor(config: OpenRouterConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
  }

  /**
   * Generate prompt for enhancing user prompts (not generating content)
   */
  private generateEnhancementPrompt(request: EnhancementRequest): string {
    const { text } = request;
    
    // Much more explicit instruction to prevent content generation
    return `You are a prompt enhancement specialist. Your job is to rewrite messy, unclear prompts into clean, professional versions.

IMPORTANT: Do NOT create content. Do NOT fulfill the request. Only rewrite the prompt to be clearer.

Take this messy prompt and rewrite it into a clean, professional version:

"${text}"

Rewritten prompt:`;
  }

  /**
   * Enhanced text enhancement with proper error handling and model fallback
   */
  async enhanceText(request: EnhancementRequest): Promise<EnhancementResponse> {
    const startTime = Date.now();
    
    // Try models in order: free -> free fallback -> paid
    const models = [
      OpenRouterApiService.PRIMARY_MODEL,
      OpenRouterApiService.FALLBACK_MODEL,
      OpenRouterApiService.PREMIUM_FALLBACK
    ];
    
    let lastError: Error | null = null;
    
    for (const modelId of models) {
      try {
        console.log(`Trying model: ${modelId}`);
        
        const prompt = this.generateEnhancementPrompt(request);
        
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'PRYMO Text Enhancer'
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 1000,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          })
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`Model ${modelId} failed:`, response.status, errorData);
          throw new OpenRouterApiError(
            `API request failed: ${response.status} - ${errorData}`,
            response.status,
            errorData
          );
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new OpenRouterApiError('Invalid response format from API');
        }

        const enhancedText = data.choices[0].message.content.trim();
        const processingTime = Date.now() - startTime;

        // Basic validation - make sure we got actual enhancement
        if (!enhancedText || enhancedText.length < 10) {
          throw new OpenRouterApiError('Enhancement response too short or empty');
        }

        return {
          enhancedText,
          originalLength: request.text.length,
          enhancedLength: enhancedText.length,
          improvements: this.analyzeImprovements(request.text, enhancedText),
          processingTime
        };

      } catch (error) {
        console.error(`Model ${modelId} failed:`, error);
        lastError = error as Error;
        continue; // Try next model
      }
    }

    // If all models failed, throw the last error
    throw lastError || new OpenRouterApiError('All models failed to enhance text');
  }

  /**
   * Analyze improvements between original and enhanced text
   */
  private analyzeImprovements(original: string, enhanced: string): string[] {
    const improvements: string[] = [];
    
    const originalWords = original.split(/\s+/).length;
    const enhancedWords = enhanced.split(/\s+/).length;
    
    if (enhancedWords > originalWords * 1.2) {
      improvements.push('Expanded content for better clarity');
    } else if (enhancedWords < originalWords * 0.8) {
      improvements.push('Condensed content for better focus');
    }
    
    if (/[.!?]/.test(enhanced) && enhanced.split(/[.!?]/).length > original.split(/[.!?]/).length) {
      improvements.push('Improved sentence structure');
    }
    
    if (enhanced.includes('🎉') || enhanced.includes('✨') || enhanced.includes('🚀')) {
      improvements.push('Added engaging elements');
    }
    
    improvements.push('Enhanced professional tone');
    improvements.push('Improved readability and flow');
    
    return improvements;
  }

  /**
   * Test connection to OpenRouter API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}