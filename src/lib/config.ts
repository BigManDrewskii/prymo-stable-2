/**
 * Production Configuration Management
 * Centralized configuration for environment variables and app settings
 */

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Application Configuration
export const config = {
  // App Info
  app: {
    name: import.meta.env.VITE_APP_NAME || 'PRYMO',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENV || 'development',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:4173',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Transform your writing with AI-powered text enhancement',
    keywords: import.meta.env.VITE_APP_KEYWORDS || 'AI writing, text enhancement, writing assistant',
  },

  // Tally Form Configuration
  tally: {
    formId: import.meta.env.VITE_TALLY_FORM_ID || 'nWWvgN',
    embedUrl: import.meta.env.VITE_TALLY_EMBED_URL || 'https://tally.so/widgets/embed.js',
    modalWidth: '464',
    layout: 'modal',
    overlay: '1',
    emojiText: '👋',
    emojiAnimation: 'wave',
  },

  // Authentication Configuration
  auth: {
    storageKey: import.meta.env.VITE_AUTH_STORAGE_KEY || 'prymo_auth',
    signupStorageKey: import.meta.env.VITE_SIGNUP_STORAGE_KEY || 'tallySignupCompleted',
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '2592000000'), // 30 days
    enableDevBypass: isDevelopment,
  },

  // OpenRouter API Configuration
  api: {
    openRouterUrl: import.meta.env.VITE_OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',
    defaultModel: import.meta.env.VITE_DEFAULT_MODEL || 'moonshotai/kimi-k2:free',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    errorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    developmentTools: import.meta.env.VITE_ENABLE_DEVELOPMENT_TOOLS === 'true' && isDevelopment,
    pwa: import.meta.env.VITE_ENABLE_PWA === 'true',
    serviceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true',
  },

  // Analytics & Monitoring
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    hotjarId: import.meta.env.VITE_HOTJAR_ID,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  },

  // Social Media & SEO
  social: {
    imageUrl: import.meta.env.VITE_SOCIAL_IMAGE_URL || '/og-image.png',
    twitterHandle: import.meta.env.VITE_TWITTER_HANDLE || '@prymo_ai',
  },

  // Contact Information
  contact: {
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@prymo.com',
    contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'hello@prymo.com',
  },

  // Performance & Limits
  limits: {
    maxTextLength: parseInt(import.meta.env.VITE_MAX_TEXT_LENGTH || '8000'),
    maxRequestsPerMinute: parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_MINUTE || '10'),
    cooldownPeriod: parseInt(import.meta.env.VITE_COOLDOWN_PERIOD || '60000'),
    cacheDuration: parseInt(import.meta.env.VITE_CACHE_DURATION || '86400000'), // 24 hours
  },

  // UI Configuration
  ui: {
    theme: {
      defaultMode: 'system', // 'light', 'dark', 'system'
      enableToggle: true,
    },
    animations: {
      enabled: true,
      duration: 200,
    },
    notifications: {
      position: 'bottom-right',
      duration: 5000,
    },
  },
} as const;

// Configuration validation
export const validateConfig = (): boolean => {
  const requiredFields = [
    config.tally.formId,
    config.app.name,
    config.app.version,
  ];

  const missingFields = requiredFields.filter(field => !field);
  
  if (missingFields.length > 0) {
    console.error('Missing required configuration fields:', missingFields);
    return false;
  }

  return true;
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  if (isProduction) {
    return {
      ...config,
      features: {
        ...config.features,
        developmentTools: false,
      },
    };
  }

  return config;
};

// Utility functions
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.openRouterUrl}${endpoint}`;
};

export const getTallyAttributes = () => ({
  'data-tally-open': config.tally.formId,
  'data-tally-layout': config.tally.layout,
  'data-tally-width': config.tally.modalWidth,
  'data-tally-overlay': config.tally.overlay,
  'data-tally-emoji-text': config.tally.emojiText,
  'data-tally-emoji-animation': config.tally.emojiAnimation,
});

export const getMetaTags = () => ({
  title: config.app.name,
  description: config.app.description,
  keywords: config.app.keywords,
  'og:title': config.app.name,
  'og:description': config.app.description,
  'og:image': config.social.imageUrl,
  'og:url': config.app.url,
  'twitter:card': 'summary_large_image',
  'twitter:site': config.social.twitterHandle,
  'twitter:image': config.social.imageUrl,
});

// Initialize configuration validation
if (isProduction) {
  validateConfig();
}

export default config;