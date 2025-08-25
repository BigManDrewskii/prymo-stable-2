/**
 * Prompt Enhancement Service
 * Converts raw user requests into refined, actionable prompts for optimal AI performance
 */

export interface PromptEnhancementRequest {
  rawText: string;
  enhancementType?: 'general' | 'professional' | 'creative' | 'academic' | 'concise';
  tone?: 'formal' | 'casual' | 'friendly' | 'authoritative' | 'persuasive';
  targetAudience?: string;
  customInstructions?: string;
}

export interface EnhancedPrompt {
  originalRequest: string;
  enhancedPrompt: string;
  clarity: number;
  specificity: number;
  actionability: number;
  overallScore: number;
}

export class PromptEnhancer {
  /**
   * Transform raw user input into a refined, actionable prompt
   */
  static enhancePrompt(request: PromptEnhancementRequest): EnhancedPrompt {
    const { rawText, enhancementType = 'general', tone = 'professional', targetAudience, customInstructions } = request;
    
    // Analyze the raw text to understand intent
    const analysis = this.analyzeRawText(rawText);
    
    // Build the enhanced prompt
    const enhancedPrompt = this.buildEnhancedPrompt(rawText, analysis, {
      enhancementType,
      tone,
      targetAudience,
      customInstructions
    });
    
    // Score the enhancement quality
    const scores = this.scorePromptQuality(enhancedPrompt);
    
    return {
      originalRequest: rawText,
      enhancedPrompt,
      ...scores
    };
  }

  /**
   * Analyze raw text to understand user intent and requirements
   */
  private static analyzeRawText(text: string) {
    const analysis = {
      hasVagueLanguage: /\b(like|kinda|maybe|idk|just|whatever|something)\b/i.test(text),
      hasFillerWords: /\b(uh|um|er|ah|well)\b/i.test(text),
      hasUnclearInstructions: /\b(make it good|sound nice|do something|fix this)\b/i.test(text),
      hasSpecificRequirements: /\b(must|should|need to|required|important)\b/i.test(text),
      hasLengthIndicators: /\b(short|long|brief|detailed|concise|comprehensive)\b/i.test(text),
      hasToneIndicators: /\b(formal|casual|friendly|professional|fun|serious)\b/i.test(text),
      hasAudienceIndicators: /\b(users|customers|team|boss|clients|audience)\b/i.test(text),
      hasContentType: /\b(email|post|article|report|letter|message|announcement)\b/i.test(text),
      hasNumbers: /\d+/.test(text),
      hasDeadlines: /\b(today|tomorrow|urgent|asap|deadline)\b/i.test(text),
      wordCount: text.split(/\s+/).length,
      sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    };

    return analysis;
  }

  /**
   * Build an enhanced, actionable prompt from the raw text
   */
  private static buildEnhancedPrompt(
    rawText: string, 
    analysis: any, 
    options: {
      enhancementType: string;
      tone: string;
      targetAudience?: string;
      customInstructions?: string;
    }
  ): string {
    const { enhancementType, tone, targetAudience, customInstructions } = options;

    // Extract key information from raw text
    const extractedInfo = this.extractKeyInformation(rawText, analysis);
    
    // Build structured prompt
    let enhancedPrompt = `Enhance the following text with these specifications:

ENHANCEMENT TYPE: ${enhancementType}
TARGET TONE: ${tone}
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}

EXTRACTED REQUIREMENTS:
${extractedInfo.requirements.map(req => `• ${req}`).join('\n')}

CONTENT SPECIFICATIONS:
${extractedInfo.contentSpecs.map(spec => `• ${spec}`).join('\n')}

QUALITY STANDARDS:
• Maintain the original intent and key information
• Improve clarity and readability
• Ensure grammatical correctness
• Match the specified tone consistently
• Make the content engaging and purposeful

${customInstructions ? `ADDITIONAL INSTRUCTIONS: ${customInstructions}` : ''}

ORIGINAL TEXT:
"""
${rawText}
"""

Please provide the enhanced version:`;

    return enhancedPrompt;
  }

  /**
   * Extract key information and requirements from raw text
   */
  private static extractKeyInformation(rawText: string, analysis: any) {
    const requirements: string[] = [];
    const contentSpecs: string[] = [];

    // Extract content type
    const contentTypeMatch = rawText.match(/\b(email|post|article|report|letter|message|announcement|blog|tweet|caption)\b/i);
    if (contentTypeMatch) {
      contentSpecs.push(`Content type: ${contentTypeMatch[1]}`);
    }

    // Extract length requirements
    const lengthMatch = rawText.match(/\b(short|long|brief|detailed|concise|comprehensive|quick|lengthy)\b/i);
    if (lengthMatch) {
      contentSpecs.push(`Length preference: ${lengthMatch[1]}`);
    }

    // Extract tone indicators
    const toneMatch = rawText.match(/\b(formal|casual|friendly|professional|fun|serious|excited|grateful|celebratory)\b/i);
    if (toneMatch) {
      requirements.push(`Tone should be ${toneMatch[1]}`);
    }

    // Extract specific mentions (numbers, achievements, etc.)
    const numberMatches = rawText.match(/\d+[k]?\s*(downloads|users|customers|sales|views|likes)/gi);
    if (numberMatches) {
      numberMatches.forEach(match => {
        requirements.push(`Highlight achievement: ${match}`);
      });
    }

    // Extract negative requirements (what NOT to do)
    const avoidMatches = rawText.match(/not too (salesy|promotional|formal|casual|long|short)/gi);
    if (avoidMatches) {
      avoidMatches.forEach(match => {
        requirements.push(`Avoid being ${match.replace('not too ', '')}`);
      });
    }

    // Extract audience mentions
    const audienceMatch = rawText.match(/\b(users|customers|team|boss|clients|audience|community|followers)\b/i);
    if (audienceMatch) {
      requirements.push(`Target audience: ${audienceMatch[1]}`);
    }

    // Extract platform-specific requirements
    const platformMatch = rawText.match(/\b(linkedin|twitter|facebook|instagram|email|slack)\b/i);
    if (platformMatch) {
      contentSpecs.push(`Platform: ${platformMatch[1]}`);
    }

    // Default requirements if none found
    if (requirements.length === 0) {
      requirements.push('Improve overall clarity and engagement');
    }

    if (contentSpecs.length === 0) {
      contentSpecs.push('General text enhancement');
    }

    return { requirements, contentSpecs };
  }

  /**
   * Score the quality of the enhanced prompt
   */
  private static scorePromptQuality(prompt: string) {
    let clarity = 50;
    let specificity = 50;
    let actionability = 50;

    // Clarity scoring
    if (prompt.includes('ENHANCEMENT TYPE:')) clarity += 15;
    if (prompt.includes('TARGET TONE:')) clarity += 15;
    if (prompt.includes('QUALITY STANDARDS:')) clarity += 10;
    if (prompt.includes('EXTRACTED REQUIREMENTS:')) clarity += 10;

    // Specificity scoring
    const specificTerms = (prompt.match(/\b(specific|exactly|precisely|must|should|required)\b/gi) || []).length;
    specificity += Math.min(specificTerms * 5, 30);
    
    const requirementCount = (prompt.match(/•/g) || []).length;
    specificity += Math.min(requirementCount * 3, 20);

    // Actionability scoring
    if (prompt.includes('Please provide')) actionability += 15;
    if (prompt.includes('ORIGINAL TEXT:')) actionability += 15;
    if (prompt.includes('enhanced version')) actionability += 10;
    if (prompt.includes('ADDITIONAL INSTRUCTIONS:')) actionability += 10;

    // Cap scores at 100
    clarity = Math.min(clarity, 100);
    specificity = Math.min(specificity, 100);
    actionability = Math.min(actionability, 100);

    const overallScore = Math.round((clarity + specificity + actionability) / 3);

    return { clarity, specificity, actionability, overallScore };
  }
}