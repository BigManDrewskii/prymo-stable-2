import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Key, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeLogo } from "@/components/ThemeLogo";

interface ApiSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved?: (apiKey: string) => void;
}

const OPENROUTER_MODELS = [
  { id: "openai/gpt-4o", name: "GPT-4o", description: "Most capable GPT-4 model" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", description: "Faster, more affordable GPT-4" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", description: "Advanced reasoning and analysis" },
  { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", description: "Google's flagship model" },
  { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B", description: "Fast and efficient" },
];

export function ApiSettingsModal({ open, onOpenChange, onConfigSaved }: ApiSettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedModel) {
      toast({
        title: "Model Required",
        description: "Please select a model to use.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store settings in localStorage for demo
    localStorage.setItem("openrouter_api_key", apiKey);
    localStorage.setItem("selected_model", selectedModel);

    toast({
      title: "Settings Saved",
      description: "Your OpenRouter API configuration has been saved successfully.",
    });

    setIsLoading(false);
    
    // Call the callback if provided
    if (onConfigSaved) {
      onConfigSaved(apiKey);
    }
    
    onOpenChange(false);
  };

  const handleCancel = () => {
    setApiKey("");
    setSelectedModel("");
    setShowApiKey(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-content max-w-md animate-scale-in">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <ThemeLogo className="h-10 w-auto" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                API Settings
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Configure your OpenRouter API connection and model preferences
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* API Key Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <Label htmlFor="api-key" className="text-sm font-medium text-foreground">
                OpenRouter API Key
              </Label>
            </div>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 input-enhanced focus-ring"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline transition-colors"
              >
                OpenRouter Dashboard
              </a>
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <Label htmlFor="model-select" className="text-sm font-medium text-foreground">
                Preferred Model
              </Label>
            </div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="input-enhanced focus-ring">
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent className="modal-content border-border/50">
                {OPENROUTER_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="hover:bg-muted/50 focus:bg-muted/50">
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-foreground">{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-border/50 hover:bg-muted/50 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="btn-primary transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}