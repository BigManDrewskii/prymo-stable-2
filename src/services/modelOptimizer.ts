/**
 * Model Optimizer Service
 * Intelligent model selection and parameter optimization based on industry research
 */

import { EnhancementRequest, TextAnalysis } from './openRouterApi';

export interface ModelRecommendation {
  modelId: string;
  confidence: number;
  reasoning: string[];
  fallbackModels: string[];
}

export interface OptimizedParameters {
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export class ModelOptimizer {
  // Research-backed model hierarchy based on industry analysis
  private static readonly MODEL_HIERARCHY = {
    // Primary models for each content type (based on research)
    primary: {
      'creative': 'anthropic/claude-3.5-sonnet',      // Best for nuanced, creative text
      'professional': 'openai/gpt-4o',                // Best for business content
      'academic': 'anthropic/claude-3.5-sonnet',      // Best for analytical content
      'general': 'openai/gpt-4o-mini',                // Best balance quality/cost
      'concise': 'anthropic/claude-3-haiku',          // Best for quick, concise edits
      'technical': 'openai/gpt-4o'                    // Best for technical accuracy
    },
    
    // Fallback models if primary fails
    fallback: {
      'creative': ['openai/gpt-4o', 'openai/gpt-4o-mini'],
      'professional': ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini'],
      'academic': ['openai/gpt-4o', 'openai/gpt-4o-mini'],
      'general': ['anthropic/claude-3-haiku', 'openai/gpt-4o'],
      'concise': ['openai/gpt-4o-mini', 'openai/gpt-4o'],
      'technical': ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini']
    }
  };

  private static readonly MODEL_CAPABILITIES = {
    'openai/gpt-4o': {
      strengths: ['complex reasoning', 'professional writing', 'technical content', 'consistency'],
      speed: 'medium',
      cost: 'high',
      maxTokens: 4096,
      bestFor: ['professional', 'technical', 'complex analysis'],
      optimalTemp: 0.4,
      reliability: 95
    },
    'openai/gpt-4o-mini': {
      strengths: ['balanced performance', 'general enhancement', 'cost-effective', 'speed'],
      speed: 'fast',
      cost: 'medium',
      maxTokens: 4096,
      bestFor: ['general', 'professional', 'moderate complexity'],
      optimalTemp: 0.3,
      reliability: 90
    },
    'anthropic/claude-3.5-sonnet': {
      strengths: ['creative writing', 'nuanced language', 'complex analysis', 'natural flow'],
      speed: 'medium',
      cost: 'high',
      maxTokens: 4096,
      bestFor: ['creative', 'academic', 'sophisticated writing'],
      optimalTemp: 0.3,
      reliability: 93
    },
    'anthropic/claude-3-haiku': {
      strengths: ['speed', 'efficiency', 'concise writing', 'cost-effective'],
      speed: 'very fast',
      cost: 'low',
      maxTokens: 4096,
      bestFor: ['concise', 'simple content', 'quick enhancements'],
      optimalTemp: 0.2,
      reliability: 85
    },
    'google/gemini-pro-1.5': {
      strengths: ['multilingual', 'structured content', 'analytical'],
      speed: 'medium',
      cost: 'medium',
      maxTokens: 2048,
      bestFor: ['general', 'analytical content', 'structured writing'],
      optimalTemp: 0.4,
      reliability: 80
    },
    'meta-llama/llama-3.1-8b-instruct': {
      strengths: ['open source', 'cost-effective', 'general purpose'],
      speed: 'fast',
      cost: 'low',
      maxTokens: 2048,
      bestFor: ['general', 'budget-conscious', 'simple enhancements'],
      optimalTemp: 0.5,
      reliability: 75
    }
  };

  /**
   * Get complete model hierarchy for retry logic
   */
  static getModelHierarchy(
    request: EnhancementRequest, 
    analysis: TextAnalysis
  ): string[] {
    const enhancementType = request.enhancementType || 'general';
    const models: string[] = [];
    
    // Add primary model
    const primaryModel = this.MODEL_HIERARCHY.primary[enhancementType];
    if (primaryModel) {
      models.push(primaryModel);
    }
    
    // Add fallback models
    const fallbackModels = this.MODEL_HIERARCHY.fallback[enhancementType] || [];
    models.push(...fallbackModels);
    
    // Content-specific adjustments
    if (analysis.complexity === 'complex') {
      // Prioritize high-capability models for complex content
      const complexModels = ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o'];
      const uniqueModels = [...new Set([...complexModels, ...models])];
      return uniqueModels;
    }
    
    if (analysis.wordCount < 100 && analysis.complexity === 'simple') {
      // Prioritize fast models for simple, short content
      const fastModels = ['anthropic/claude-3-haiku', 'openai/gpt-4o-mini'];
      const uniqueModels = [...new Set([...fastModels, ...models])];
      return uniqueModels;
    }
    
    // Remove duplicates and return
    return [...new Set(models)];
  }

  /**
   * Select the optimal model based on request and text analysis
   */
  static selectOptimalModel(
    request: EnhancementRequest, 
    analysis: TextAnalysis,
    availableModels: string[] = Object.keys(this.MODEL_CAPABILITIES)
  ): ModelRecommendation {
    const scores = new Map<string, { score: number; reasoning: string[] }>();

    for (const modelId of availableModels) {
      const capabilities = this.MODEL_CAPABILITIES[modelId as keyof typeof this.MODEL_CAPABILITIES];
      if (!capabilities) continue;

      let score = 50; // Base score
      const reasoning: string[] = [];

      // Enhancement type scoring (primary factor)
      const enhancementType = request.enhancementType || 'general';
      if (capabilities.bestFor.includes(enhancementType)) {
        score += 30;
        reasoning.push(`Optimized for ${enhancementType} enhancement`);
      }

      // Content type scoring
      if (analysis.contentType === 'technical' && capabilities.strengths.includes('technical content')) {
        score += 25;
        reasoning.push('Excellent for technical content');
      }

      if (analysis.contentType === 'creative' && capabilities.strengths.includes('creative writing')) {
        score += 25;
        reasoning.push('Superior creative writing capabilities');
      }

      if (analysis.contentType === 'business' && capabilities.strengths.includes('professional writing')) {
        score += 20;
        reasoning.push('Strong professional writing skills');
      }

      // Complexity scoring
      if (analysis.complexity === 'complex') {
        if (capabilities.strengths.includes('complex reasoning') || capabilities.strengths.includes('complex analysis')) {
          score += 20;
          reasoning.push('Handles complex content well');
        }
        if (capabilities.reliability >= 90) {
          score += 15;
          reasoning.push('High reliability for complex tasks');
        }
      } else if (analysis.complexity === 'simple') {
        if (capabilities.speed === 'very fast' || capabilities.speed === 'fast') {
          score += 15;
          reasoning.push('Fast processing for simple content');
        }
        if (capabilities.cost === 'low') {
          score += 10;
          reasoning.push('Cost-efficient for simple tasks');
        }
      }

      // Length considerations
      if (analysis.wordCount > 500) {
        if (capabilities.maxTokens >= 4096) {
          score += 15;
          reasoning.push('Suitable for longer content');
        }
      } else if (analysis.wordCount < 100) {
        if (capabilities.speed === 'very fast') {
          score += 20;
          reasoning.push('Optimized for short content');
        }
      }

      // Specific enhancement type bonuses
      if (request.enhancementType === 'concise') {
        if (capabilities.strengths.includes('concise writing')) {
          score += 25;
          reasoning.push('Specialized in concise writing');
        }
        if (capabilities.speed === 'very fast') {
          score += 15;
          reasoning.push('Fast processing for concise tasks');
        }
      }

      if (request.enhancementType === 'creative') {
        if (capabilities.strengths.includes('creative writing') || capabilities.strengths.includes('nuanced language')) {
          score += 30;
          reasoning.push('Exceptional creative capabilities');
        }
      }

      if (request.enhancementType === 'professional' || request.enhancementType === 'academic') {
        if (capabilities.strengths.includes('complex reasoning') || capabilities.strengths.includes('professional writing')) {
          score += 25;
          reasoning.push('Strong analytical and professional writing');
        }
      }

      // Reliability bonus
      score += (capabilities.reliability - 80) * 0.5;
      if (capabilities.reliability >= 90) {
        reasoning.push('High reliability rating');
      }

      scores.set(modelId, { score, reasoning });
    }

    // Find the best model
    let bestModel = '';
    let bestScore = 0;
    let bestReasoning: string[] = [];

    for (const [modelId, { score, reasoning }] of scores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestModel = modelId;
        bestReasoning = reasoning;
      }
    }

    // Get fallback models
    const enhancementType = request.enhancementType || 'general';
    const fallbackModels = this.MODEL_HIERARCHY.fallback[enhancementType] || [];

    return {
      modelId: bestModel || 'openai/gpt-4o-mini',
      confidence: Math.min(100, bestScore),
      reasoning: bestReasoning,
      fallbackModels
    };
  }

  /**
   * Get optimal parameters for a specific model and content
   */
  static getOptimalParameters(
    modelId: string, 
    analysis: TextAnalysis, 
    enhancementType: string = 'general'
  ): OptimizedParameters {
    const capabilities = this.MODEL_CAPABILITIES[modelId as keyof typeof this.MODEL_CAPABILITIES];
    
    // Base parameters from research
    let baseParams: OptimizedParameters = {
      temperature: capabilities?.optimalTemp || 0.3,
      max_tokens: Math.min(2000, Math.max(200, analysis.wordCount * 2.5)),
      top_p: 0.8,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    };

    // Model-specific optimizations based on research
    if (modelId.includes('claude')) {
      baseParams.temperature = Math.max(0.2, baseParams.temperature - 0.1); // Claude works better with lower temperature
      baseParams.top_p = 0.8;
      baseParams.frequency_penalty = 0.05; // Lower for Claude
    } else if (modelId.includes('gpt-4o')) {
      baseParams.frequency_penalty = 0.2; // Higher to reduce repetition in GPT models
      baseParams.presence_penalty = 0.15;
    } else if (modelId.includes('gemini')) {
      baseParams.temperature = 0.4;
      baseParams.top_p = 0.9;
    }

    // Content-specific adjustments
    if (analysis.complexity === 'complex') {
      baseParams.temperature = Math.max(0.2, baseParams.temperature - 0.1);
      baseParams.max_tokens = Math.min(3000, baseParams.max_tokens * 1.2);
    }

    if (enhancementType === 'creative') {
      baseParams.temperature = Math.min(0.6, baseParams.temperature + 0.1);
      baseParams.top_p = 0.9;
    } else if (enhancementType === 'concise') {
      baseParams.temperature = Math.max(0.2, baseParams.temperature - 0.1);
      baseParams.max_tokens = Math.min(1000, analysis.wordCount * 1.5);
    } else if (enhancementType === 'professional' || enhancementType === 'academic') {
      baseParams.temperature = Math.max(0.2, baseParams.temperature - 0.05);
      baseParams.frequency_penalty = 0.15;
    }

    // Length-based adjustments
    if (analysis.wordCount < 50) {
      baseParams.max_tokens = Math.min(300, baseParams.max_tokens);
      baseParams.temperature = Math.max(0.2, baseParams.temperature - 0.1);
    } else if (analysis.wordCount > 500) {
      baseParams.max_tokens = Math.min(4000, analysis.wordCount * 2);
    }

    return baseParams;
  }

  /**
   * Get model insights for UI display
   */
  static getModelInsights(modelId: string): any {
    const capabilities = this.MODEL_CAPABILITIES[modelId as keyof typeof this.MODEL_CAPABILITIES];
    if (!capabilities) {
      return {
        name: modelId,
        strengths: ['General purpose'],
        speed: 'medium',
        cost: 'medium',
        reliability: 80
      };
    }

    return {
      name: modelId,
      ...capabilities
    };
  }

  /**
   * Determine if a model should be avoided for specific content
   */
  static shouldAvoidModel(modelId: string, analysis: TextAnalysis, enhancementType: string): boolean {
    // Avoid low-reliability models for complex content
    const capabilities = this.MODEL_CAPABILITIES[modelId as keyof typeof this.MODEL_CAPABILITIES];
    if (!capabilities) return false;

    if (analysis.complexity === 'complex' && capabilities.reliability < 85) {
      return true;
    }

    // Avoid Llama models for professional/academic content (based on research)
    if (modelId.includes('llama') && (enhancementType === 'professional' || enhancementType === 'academic')) {
      return true;
    }

    // Avoid low-token models for long content
    if (analysis.wordCount > 400 && capabilities.maxTokens < 3000) {
      return true;
    }

    return false;
  }
}