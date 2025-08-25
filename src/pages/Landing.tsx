import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Target, Shield, CheckCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeLogo } from "@/components/ThemeLogo";
import { useEffect } from "react";
import setupTallyRedirect from "@/components/TallyRedirect";
import { FallingPattern } from "@/components/FallingPattern";
import { getTallyAttributes } from "@/lib/config";
import { useErrorHandler } from "@/components/ErrorBoundary";

const Landing = () => {
  const { reportError } = useErrorHandler();
  
  // Initialize Tally redirect handler with error handling
  useEffect(() => {
    try {
      setupTallyRedirect();
    } catch (error) {
      console.error('Failed to setup Tally redirect:', error);
      reportError(error instanceof Error ? error : new Error('Tally setup failed'), 'Landing page initialization');
    }
  }, [reportError]);

  // Get Tally attributes from configuration
  const tallyAttributes = getTallyAttributes();

  const buildInPublicEpisodes = [
    {
      episodeNumber: 1,
      embedId: "_HonzZvJI7g",
      title: "Episode 1",
      description: "Getting Started with PRYMO"
    },
    {
      episodeNumber: 2,
      embedId: "543kqAleXTE",
      title: "Episode 2",
      description: "Building the Core Features"
    },
    {
      episodeNumber: 3,
      embedId: "vAmmy7yj62c",
      title: "Episode 3",
      description: "Enhancing the User Experience"
    },
    {
      episodeNumber: 4,
      embedId: "MHWel4dcC24",
      title: "Episode 4",
      description: "Advanced AI Integration"
    },
    {
      episodeNumber: 5,
      embedId: "25KH83jwBGw",
      title: "Episode 5",
      description: "Optimizing Performance"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Writer",
      content: "PRYMO has revolutionized my writing workflow. The AI enhancements are incredibly natural and professional.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Marketing Manager",
      content: "The quality of text enhancement is outstanding. It's like having a professional editor at your fingertips.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Academic Researcher",
      content: "Perfect for academic writing. The AI understands context and maintains the original meaning while improving clarity.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen animate-theme-transition overflow-hidden">
      <FallingPattern 
        className="absolute inset-0 -z-10" 
        color="hsl(var(--primary))" 
        backgroundColor="hsl(var(--background))" 
        duration={180}
        blurIntensity="1.5em"
        density={1.2}
      />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        
        {/* Header - Card Design */}
        <header className="relative z-10 py-4">
          <div className="container mx-auto px-4 max-w-[1440px]">
            <div className="max-w-5xl mx-auto">
              <div className="rounded-xl border border-border/40 shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <ThemeLogo className="h-8 w-auto" />
                  </div>
                  {/* Nav Links */}
                  <div className="hidden md:flex items-center gap-6">
                  </div>
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Button
                      className="btn-primary"
                      size="sm"
                      data-tally-open="nWWvgN"
                      data-tally-layout="modal"
                      data-tally-width="464"
                      data-tally-overlay="1"
                      data-tally-emoji-text="👋"
                      data-tally-emoji-animation="wave"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 max-w-[1440px] py-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Powered Text Enhancement
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Transform Your Writing with{" "}
                <span className="text-primary">Intelligent AI</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Enhance your text with advanced AI models. Improve clarity, tone, and professionalism 
                while maintaining your unique voice and original meaning.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-primary text-lg px-8 py-4"
                data-tally-open="nWWvgN"
                data-tally-layout="modal"
                data-tally-width="464"
                data-tally-overlay="1"
                data-tally-emoji-text="👋"
                data-tally-emoji-animation="wave"
              >
                Start Enhancing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-border/50 hover:bg-muted/50" asChild>
                <Link to="/app?demo=true">View Demo</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Instant results</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Build In Public Section */}
      <section id="features" className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-[1440px]">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="text-primary">Build In Public</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Follow my journey as I build PRYMO from the ground up
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {buildInPublicEpisodes.map((episode) => (
                <div 
                  key={episode.episodeNumber} 
                  className="border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all bg-card flex flex-col"
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <iframe 
                        className="w-full h-full" 
                        src={`https://www.youtube.com/embed/${episode.embedId}`}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{episode.title}</h3>
                      <span className="text-xs py-1 px-2 bg-primary/10 text-primary rounded-full">
                        Ep. {episode.episodeNumber}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{episode.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section removed */}

      {/* CTA Section - Card Design */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-[1440px]">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-border/40 shadow-lg bg-card">
              <div className="p-8 md:p-10 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to <span className="text-primary">Transform Your Writing?</span>
                </h2>
                
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Experience the power of AI-enhanced writing with just a click. No complicated setup required.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Button 
                    size="lg" 
                    className="btn-primary text-lg px-8 py-4"
                    data-tally-open="nWWvgN"
                    data-tally-layout="modal"
                    data-tally-width="464"
                    data-tally-overlay="1"
                    data-tally-emoji-text="👋"
                    data-tally-emoji-animation="wave"
                  >
                    Start Enhancing Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Start enhancing immediately</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Secure & private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Card Design */}
      <footer className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-[1440px]">
          <div className="max-w-xl mx-auto flex flex-col">
            <ThemeLogo className="h-8 w-auto mx-auto" />

            <div className="flex items-center gap-6 mx-auto mt-5">
              <Link to="/app?demo=true" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Get Started</Link>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto">Features</a>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-5">
              <p>&copy; 2025 PRYMO. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;