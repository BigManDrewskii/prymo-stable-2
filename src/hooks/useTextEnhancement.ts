import { useState, useCallback, useEffect } from 'react';
import { 
  OpenRouterApiService, 
  OpenRouterApiError, 
  EnhancementRequest, 
  EnhancementResponse,
  ApiConfigStorage,
  OpenRouterConfig
} from '@/services/openRouterApi';
import { ModelOptimizer } from '@/services/modelOptimizer';

export interface UseTextEnhancementState {
  isEnhancing: boolean;
  lastEnhancement: EnhancementResponse | null;
  error: string | null;
  isConfigured: boolean;
  apiService: OpenRouterApiService | null;
  currentModel: string | null;
  modelRecommendation: string | null;
}

export interface UseTextEnhancementActions {
  enhanceText: (request: EnhancementRequest) => Promise<void>;
  configureApi: (config: OpenRouterConfig) => void;
  clearError: () => void;
  testConnection: () => Promise<boolean>;
  resetEnhancement: () => void;
  getModelInsights: (modelId: string) => any;
}

export type UseTextEnhancementReturn = UseTextEnhancementState & UseTextEnhancementActions;

/**
 * Custom hook for managing text enhancement functionality with AI optimization
 */
export function useTextEnhancement(): UseTextEnhancementReturn {
  const [state, setState] = useState<UseTextEnhancementState>({
    isEnhancing: false,
    lastEnhancement: null,
    error: null,
    isConfigured: false,
    apiService: null,
    currentModel: null,
    modelRecommendation: null
  });

  // Initialize API service from stored config
  useEffect(() => {
    const storedConfig = ApiConfigStorage.load();
    if (storedConfig.apiKey && storedConfig.model) {
      const service = new OpenRouterApiService({
        apiKey: storedConfig.apiKey,
        model: storedConfig.model
      });
      
      setState(prev => ({
        ...prev,
        apiService: service,
        isConfigured: true,
        currentModel: storedConfig.model
      }));
    }
  }, []);

  /**
   * Configure the API service with new credentials
   */
  const configureApi = useCallback((config: OpenRouterConfig) => {
    const service = new OpenRouterApiService(config);
    
    // Save to localStorage
    ApiConfigStorage.save(config);
    
    setState(prev => ({
      ...prev,
      apiService: service,
      isConfigured: true,
      currentModel: config.model,
      error: null
    }));
  }, []);

  /**
   * Test the API connection
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!state.apiService) {
      setState(prev => ({ ...prev, error: 'API service not configured' }));
      return false;
    }

    try {
      const isConnected = await state.apiService.testConnection();
      if (!isConnected) {
        setState(prev => ({ ...prev, error: 'Failed to connect to OpenRouter API. Please check your API key.' }));
      }
      return isConnected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, [state.apiService]);

  /**
   * Get model insights for the current or specified model
   */
  const getModelInsights = useCallback((modelId: string) => {
    return ModelOptimizer.getModelInsights(modelId);
  }, []);

  /**
   * Enhance text using the configured API service with AI optimization
   */
  const enhanceText = useCallback(async (request: EnhancementRequest): Promise<void> => {
    if (!state.apiService) {
      setState(prev => ({ 
        ...prev, 
        error: 'API service not configured. Please set up your OpenRouter API key and model in settings.' 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isEnhancing: true, 
      error: null,
      lastEnhancement: null 
    }));

    try {
      // Get text analysis for optimization
      const analysis = (state.apiService as any).analyzeText(request.text);
      
      // Get model recommendation (for future use - currently using configured model)
      const availableModels = [
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'anthropic/claude-3.5-sonnet',
        'anthropic/claude-3-haiku',
        'google/gemini-pro-1.5',
        'meta-llama/llama-3.1-8b-instruct'
      ];
      
      const recommendation = ModelOptimizer.selectOptimalModel(request, analysis, availableModels);
      
      // Enhance the text
      const result = await state.apiService.enhanceText(request);
      
      // Calculate quality score based on various factors
      const qualityScore = calculateQualityScore(request.text, result.enhancedText, analysis);
      
      // Estimate token usage
      const tokensUsed = estimateTokenUsage(request.text, result.enhancedText);
      
      const enhancedResult: EnhancementResponse = {
        ...result,
        qualityScore,
        tokensUsed
      };
      
      setState(prev => ({
        ...prev,
        isEnhancing: false,
        lastEnhancement: enhancedResult,
        error: null,
        modelRecommendation: recommendation.modelId !== state.currentModel ? recommendation.modelId : null
      }));
    } catch (error) {
      let errorMessage = 'Failed to enhance text';
      
      if (error instanceof OpenRouterApiError) {
        if (error.statusCode === 401) {
          errorMessage = 'Invalid API key. Please check your OpenRouter API key in settings.';
        } else if (error.statusCode === 429) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else if (error.statusCode === 402) {
          errorMessage = 'Insufficient credits. Please check your OpenRouter account balance.';
        } else if (error.statusCode === 503) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        isEnhancing: false,
        error: errorMessage
      }));
    }
  }, [state.apiService, state.currentModel]);

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset enhancement state
   */
  const resetEnhancement = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastEnhancement: null,
      error: null,
      modelRecommendation: null
    }));
  }, []);

  return {
    ...state,
    enhanceText,
    configureApi,
    clearError,
    testConnection,
    resetEnhancement,
    getModelInsights
  };
}

/**
 * Calculate quality score based on various factors
 */
function calculateQualityScore(original: string, enhanced: string, analysis: any): number {
  let score = 70; // Base score
  
  // Length improvement scoring
  const lengthRatio = enhanced.length / original.length;
  if (lengthRatio > 0.8 && lengthRatio < 1.5) {
    score += 10; // Good length ratio
  } else if (lengthRatio > 1.5) {
    score -= 5; // Too much expansion
  }
  
  // Grammar and structure improvements
  const originalSentences = original.split(/[.!?]+/).length;
  const enhancedSentences = enhanced.split(/[.!?]+/).length;
  
  if (enhancedSentences >= originalSentences) {
    score += 5; // Maintained or improved sentence structure
  }
  
  // Readability improvements
  const originalWords = original.split(/\s+/).length;
  const enhancedWords = enhanced.split(/\s+/).length;
  const originalAvgLength = originalWords / originalSentences;
  const enhancedAvgLength = enhancedWords / enhancedSentences;
  
  if (enhancedAvgLength < originalAvgLength && originalAvgLength > 20) {
    score += 10; // Improved sentence length for readability
  }
  
  // Content preservation (basic check)
  const originalLower = original.toLowerCase();
  const enhancedLower = enhanced.toLowerCase();
  
  // Check if key words are preserved
  const originalKeyWords = originalLower.match(/\b\w{4,}\b/g) || [];
  const enhancedKeyWords = enhancedLower.match(/\b\w{4,}\b/g) || [];
  const preservedWords = originalKeyWords.filter(word => enhancedLower.includes(word));
  const preservationRatio = preservedWords.length / originalKeyWords.length;
  
  if (preservationRatio > 0.7) {
    score += 10; // Good content preservation
  } else if (preservationRatio < 0.5) {
    score -= 15; // Poor content preservation
  }
  
  // Complexity and sophistication
  const enhancedComplexWords = (enhanced.match(/\b\w{7,}\b/g) || []).length;
  const originalComplexWords = (original.match(/\b\w{7,}\b/g) || []).length;
  
  if (enhancedComplexWords > originalComplexWords) {
    score += 5; // Added sophistication
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Estimate token usage based on text length
 */
function estimateTokenUsage(original: string, enhanced: string): number {
  // Rough estimation: ~4 characters per token for English text
  const inputTokens = Math.ceil(original.length / 4);
  const outputTokens = Math.ceil(enhanced.length / 4);
  const promptTokens = 150; // Estimated prompt overhead
  
  return inputTokens + outputTokens + promptTokens;
}

/**
 * Hook for managing enhancement options
 */
export function useEnhancementOptions() {
  const [options, setOptions] = useState<Partial<EnhancementRequest>>({
    enhancementType: 'general',
    tone: 'professional'
  });

  const updateOptions = useCallback((newOptions: Partial<EnhancementRequest>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const resetOptions = useCallback(() => {
    setOptions({
      enhancementType: 'general',
      tone: 'professional'
    });
  }, []);

  return {
    options,
    updateOptions,
    resetOptions
  };
}