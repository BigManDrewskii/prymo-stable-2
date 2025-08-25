import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiSettingsModal } from "@/components/ApiSettingsModal";
import { Settings, Sparkles, Copy, Check, RotateCcw, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import { formatMarkdown } from '@/lib/markdown';
import { OpenRouterApiService, ApiConfigStorage, EnhancementRequest } from "@/services/openRouterApi";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeLogo } from "@/components/ThemeLogo";
import { FallingPattern } from "@/components/FallingPattern";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasEnhanced, setHasEnhanced] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [apiService, setApiService] = useState<OpenRouterApiService | null>(null);
  const { toast } = useToast();
  const { logout } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check for existing API configuration on mount
  useEffect(() => {
    const config = ApiConfigStorage.load();
    const urlParams = new URLSearchParams(window.location.search);
    const isDemo = urlParams.get('demo') === 'true';
    
    if (config.apiKey) {
      const service = new OpenRouterApiService({
        apiKey: config.apiKey,
        model: 'moonshotai/kimi-k2:free' // Default primary model
      });
      setApiService(service);
      setIsConfigured(true);
    } else if (isDemo) {
      // For demo mode, allow UI interaction without actual API calls
      setIsConfigured(true);
    }
  }, []);

  // Handle API configuration saved
  const handleConfigSaved = (apiKey: string) => {
    const service = new OpenRouterApiService({
      apiKey: apiKey,
      model: 'moonshotai/kimi-k2:free' // Default primary model
    });
    setApiService(service);
    setIsConfigured(true);
    setSettingsOpen(false);
    toast({
      title: "Settings saved",
      description: "Your API configuration has been saved successfully.",
    });
  };

  const handleEnhance = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No text to enhance",
        description: "Please enter some text to enhance.",
        variant: "destructive",
      });
      return;
    }

    if (!isConfigured || !apiService) {
      setSettingsOpen(true);
      return;
    }

    // Reset existing enhanced text if any
    if (enhancedText) {
      setEnhancedText("");
      setHasEnhanced(false);
    }
    
    setIsEnhancing(true);
    try {
      const request: EnhancementRequest = {
        text: inputText.trim(),
        enhancementType: 'general'
      };

      const response = await apiService.enhanceText(request);
      
      // Set enhanced text with a small delay for better animation
      setTimeout(() => {
        setEnhancedText(response.enhancedText);
        setHasEnhanced(true);
        
        toast({
          title: "Text enhanced successfully",
          description: "Your text has been improved and is ready to use.",
        });
      }, 300);
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Failed to enhance text. Please try again.",
        variant: "destructive",
      });
      setIsEnhancing(false);
    } finally {
      // Only set isEnhancing to false after the content is displayed
      // to ensure a smooth transition
      setTimeout(() => {
        setIsEnhancing(false);
      }, 300);
    }
  };

  const handleCopy = async () => {
    if (!enhancedText) return;
    
    try {
      await navigator.clipboard.writeText(enhancedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Enhanced text has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setInputText("");
    setEnhancedText("");
    setHasEnhanced(false);
    setCopied(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const characterCount = inputText.length;
  const maxCharacters = 8000;
  const progressPercentage = (characterCount / maxCharacters) * 100;
  const { theme } = useTheme();

  return (
    <div className="animate-theme-transition overflow-hidden bg-background dark:bg-neutral-950 flex flex-col justify-center items-center">
      <FallingPattern 
        className="absolute inset-0 -z-10" 
        color="hsl(var(--primary) / 0.8)" 
        backgroundColor="hsl(var(--background) / 0.95)"
        duration={180}
        blurIntensity="1.5em"
        density={1.2}
      />
      {/* Floating Modal Overlay */}
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 md:p-6 h-auto flex-grow-0 w-auto self-center">
        {/* Main Floating Modal */}
        <div className="w-full max-w-[1000px] inline-flex flex-col justify-start items-center gap-5">
          {/* Header */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <div className="flex justify-start items-center gap-4">
                <Link
                to="/"
                className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group"
                onClick={() => logout()}
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-normal">Back to Home</span>
              </Link>
              <div className="flex justify-start items-center gap-3">
                <ThemeLogo className="h-8 w-auto" />
                <div className="px-3 pb-1 rounded-full bg-neutral-200/80 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-800/50">
                  <span className="text-xs font-normal text-neutral-600 dark:text-neutral-400">Powered by OpenRouter</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-start items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="relative w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full p-0 hover:bg-primary/15 dark:hover:bg-primary/20 transition-all duration-300"
              >
                <Settings className="h-5 w-5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              </Button>
            </div>
          </div>

          {/* Main Two Column Layout */}
          <div className="self-stretch flex flex-col md:flex-row justify-start items-start gap-4">
            {/* Input Card */}
            <div className="w-full md:flex-1 self-stretch p-4 bg-white/95 dark:bg-neutral-900/95 rounded-2xl shadow-[0px_0px_0px_1px_rgba(38,38,38,0.08)] dark:shadow-[0px_0px_0px_1px_rgba(38,38,38,0.10)] shadow-[0px_20px_40px_-8px_rgba(10,10,10,0.12)] dark:shadow-[0px_20px_40px_-8px_rgba(10,10,10,0.20)] border border-neutral-200 dark:border-neutral-800/80 backdrop-blur-[5px] flex flex-col justify-start items-start gap-3">
              <div className="self-stretch h-9 pb-2 flex flex-col justify-start items-start">
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="inline-flex flex-col justify-start items-start">
                    <h2 className="text-lg font-semibold text-foreground dark:text-neutral-50">Input Text</h2>
                  </div>
                  <div className="h-9 px-3 py-2 rounded-[10px] flex justify-center items-center gap-2">
                    <div className="flex justify-start items-center gap-2">
                      <span className="text-neutral-600 dark:text-neutral-400 text-xs font-mono">{characterCount.toLocaleString()}</span>
                      <span className="text-neutral-600 dark:text-neutral-400 text-xs">/</span>
                      <span className="text-neutral-600 dark:text-neutral-400 text-xs font-mono">{maxCharacters.toLocaleString()}</span>
                      <span className="text-neutral-600 dark:text-neutral-400 text-xs">characters</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="self-stretch h-60 sm:h-72 md:h-80 pb-3 flex flex-col justify-center items-start">
                <div className="self-stretch flex-1 relative flex flex-col justify-center items-start">
                  <div className="self-stretch flex-1 min-h-48 sm:min-h-64 md:min-h-72 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border-2 border-primary/40 dark:border-primary/30 transition-all duration-200 flex justify-start items-start overflow-hidden">
                    <Textarea
                      ref={textareaRef}
                      placeholder="Enter your text here to enhance it..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full h-full resize-none text-base leading-7 font-normal text-foreground dark:text-neutral-50 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 p-0 border-none border-1"
                      maxLength={maxCharacters}
                    />
                  </div>
                  
                  {/* Character Progress Bar */}
                  <div className="w-20 absolute bottom-3 right-3">
                    <div className="w-20 h-1.5 bg-neutral-300 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/60 dark:bg-stone-400 rounded-full" 
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch inline-flex justify-start items-start gap-3">
                <Button
                  onClick={handleEnhance}
                  disabled={isEnhancing || !inputText.trim()}
                  size="lg"
                  className="flex-1 btn-primary text-lg px-8 py-4"
                >
                  {isEnhancing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-neutral-900/30 border-t-neutral-900 rounded-full animate-spin mr-2" />
                      Enhancing...
                    </>
                  ) : (
                    "Enhance Text"
                  )}
                </Button>
                
                {(inputText || enhancedText) && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                    className="text-lg px-8 py-4 border-border/50 hover:bg-muted/50"
                  >
                    <RotateCcw className="w-4 h-4 text-neutral-700 dark:text-neutral-50" />
                  </Button>
                )}
              </div>
            </div>

            {/* Output Card */}
            <div className="w-full md:flex-1 self-stretch p-4 bg-white/95 dark:bg-neutral-900/95 rounded-2xl shadow-[0px_0px_0px_1px_rgba(38,38,38,0.08)] dark:shadow-[0px_0px_0px_1px_rgba(38,38,38,0.10)] shadow-[0px_20px_40px_-8px_rgba(10,10,10,0.12)] dark:shadow-[0px_20px_40px_-8px_rgba(10,10,10,0.20)] border border-neutral-200 dark:border-neutral-800/80 backdrop-blur-[5px] flex flex-col justify-start items-start gap-3">
              <div className="self-stretch h-9 pb-2 flex flex-col justify-start items-start">
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="inline-flex flex-col justify-start items-start">
                    <h2 className="text-lg font-semibold text-foreground dark:text-neutral-50">Enhanced Text</h2>
                  </div>
                  {enhancedText && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleCopy}
                      className="text-lg px-8 py-4 border-border/50 hover:bg-muted/50"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-green-500 text-sm font-normal">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          <span className="text-sm font-normal">Copy</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="self-stretch h-60 sm:h-72 md:h-80 pb-3 flex flex-col justify-center items-start">
                <div className={`self-stretch flex-1 min-h-48 sm:min-h-64 md:min-h-72 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border-2 ${enhancedText ? 'border-primary/70 dark:border-primary/60 shadow-[0px_0px_15px_2px_rgba(0,0,0,0.05)] dark:shadow-[0px_0px_15px_2px_rgba(255,255,255,0.03)] scale-[1.01]' : 'border-primary/40 dark:border-primary/30'} transition-all duration-500 shadow-[0px_0px_0px_1px_rgba(38,38,38,0.05)] shadow-[0px_10px_25px_-5px_rgba(163,163,163,0.10)] backdrop-blur-[6px] flex flex-col justify-start items-start overflow-hidden`}>
                  {enhancedText && (
                    <div className="self-stretch text-foreground dark:text-neutral-50 text-base font-normal leading-7">
                      {formatMarkdown(enhancedText)}
                    </div>
                  )}
                  {!enhancedText && hasEnhanced && (
                    <div className="text-neutral-600 dark:text-neutral-400">Your enhanced text will appear here...</div>
                  )}
                  {!enhancedText && !hasEnhanced && !isEnhancing && (
                    <div className="text-neutral-600 dark:text-neutral-400 opacity-70 dark:opacity-50">Enhanced text will appear here</div>
                  )}
                  
                  {!enhancedText && isEnhancing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50/90 dark:bg-neutral-900/90">
                      <div className="text-center py-8 px-4">
                        <div className="w-8 h-8 mx-auto mb-4 border-2 border-primary/30 border-t-primary/80 dark:border-stone-400/30 dark:border-t-stone-400 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-50">Enhancing your text...</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">This may take a few moments</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {hasEnhanced && enhancedText && (
                <div className="self-stretch p-4 bg-emerald-500/5 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-emerald-500/20 flex flex-col justify-start items-start gap-2">
                  <div className="self-stretch inline-flex justify-start items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex justify-center items-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Enhancement Complete</span>
                  </div>
                  <div className="self-stretch pl-8 flex flex-col justify-start items-start">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Your text has been successfully enhanced and is ready to use.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings Modal */}
      <ApiSettingsModal 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
        onConfigSaved={handleConfigSaved}
      />
    </div>
  );
};

export default Index;
