import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Code2, FileJson, Database, Settings, MessageSquare, Brain, FolderGit2, FileText, ChevronLeft, Pin, FileCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const stages = {
  stage1: [
    { href: "/prompt-to-interface", label: "Prompt to Interface", icon: <Code2 className="w-4 h-4" /> },
    { href: "/schema-creator", label: "Schema Creator", icon: <FileJson className="w-4 h-4" /> },
    { href: "/interface-to-schema", label: "Interface to Schema", icon: <FileJson className="w-4 h-4" /> },
  ],
  stage2: [
    { href: "/prompt-with-schema", label: "Prompt with Schema", icon: <MessageSquare className="w-4 h-4" /> },
    { href: "/structured-conversations", label: "Runnable Conversations", icon: <Brain className="w-4 h-4" /> },
  ],
  stage3: [
    { href: "/repository", label: "Repository", icon: <FolderGit2 className="w-4 h-4" /> },
    { href: "/validator", label: "Validator", icon: <Database className="w-4 h-4" /> },
    { href: "/simple-message-validation", label: "Message Validation", icon: <FileCheck className="w-4 h-4" /> },
    { href: "/ai-config", label: "AI Config", icon: <Settings className="w-4 h-4" /> },
    { href: "/sdk-docs", label: "SDK Documentation", icon: <FileText className="w-4 h-4" /> },
  ],
};

export function NavBar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (location === '/prompt-with-schema') {
      setIsPinned(true);
      setIsCollapsed(false);
    }
  }, [location]);

  const shouldShow = isPinned || (!isPinned && isHovered);

  // Add effect to manage body class for layout adjustment
  useEffect(() => {
    document.body.classList.toggle('sidebar-expanded', shouldShow && !isCollapsed);
    document.body.classList.toggle('sidebar-collapsed', shouldShow && isCollapsed);
    return () => {
      document.body.classList.remove('sidebar-expanded', 'sidebar-collapsed');
    };
  }, [shouldShow, isCollapsed]);

  return (
    <>
      <div
        className={cn(
          "fixed left-0 top-0 h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "border-r shadow-lg transition-all duration-300 ease-in-out",
          shouldShow ? (isCollapsed ? "w-20" : "w-64") : "w-2",
          "z-50",
          // Enhanced shadow states
          shouldShow && "shadow-xl",
          !shouldShow && "hover:shadow-lg",
          // Dynamic border and background effects
          "hover:border-r-2 hover:border-primary/20",
          isPinned && "border-r-2 border-primary/30",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          "flex flex-col h-full p-4",
          "transition-opacity duration-200",
          !shouldShow && "opacity-0",
          shouldShow && "opacity-100"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {(!isCollapsed || !shouldShow) && (
              <Link href="/">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    Generative Typed Chat
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* Navigation Sections */}
          <div className="flex-1 space-y-6">
            {Object.entries(stages).map(([stage, items], index) => (
              <div key={stage} className="space-y-2">
                {!isCollapsed && (
                  <div className="flex items-center gap-2 px-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <h2 className="text-sm font-semibold text-muted-foreground">
                      {stage === 'stage1' ? 'Interface Creation' :
                        stage === 'stage2' ? 'Runnable Conversations' : 'Advanced Tools'}
                    </h2>
                  </div>
                )}
                <nav className="space-y-1">
                  {items.map((item) => (
                    <TooltipProvider key={item.href} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={item.href}>
                            <div
                              className={cn(
                                "flex items-center px-2 py-2 text-sm rounded-md",
                                "transition-all duration-200",
                                isCollapsed ? "justify-center" : "space-x-2",
                                // Enhanced hover and active states
                                "hover:bg-accent hover:text-accent-foreground hover:shadow-md",
                                "active:scale-98 hover:scale-[1.02]",
                                location === item.href && "bg-accent text-accent-foreground shadow-sm"
                              )}
                            >
                              {item.icon}
                              {!isCollapsed && <span>{item.label}</span>}
                            </div>
                          </Link>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t space-y-2">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start",
                      "transition-colors duration-200",
                      "hover:bg-accent/50"
                    )}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    disabled={location === '/prompt-with-schema'}
                  >
                    <ChevronLeft className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isCollapsed ? "rotate-180" : ""
                    )} />
                    {!isCollapsed && <span className="ml-2">Collapse</span>}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">Toggle Collapse</TooltipContent>}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start",
                      "transition-colors duration-200",
                      "hover:bg-accent/50",
                      isPinned && "bg-accent/30"
                    )}
                    onClick={() => setIsPinned(!isPinned)}
                    disabled={location === '/prompt-with-schema'}
                  >
                    <Pin className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isPinned ? "rotate-45" : ""
                    )} />
                    {!isCollapsed && <span className="ml-2">Pin Sidebar</span>}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">Toggle Pin</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      {/* Add a spacer div that matches the sidebar width */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          shouldShow ? (isCollapsed ? "w-20" : "w-64") : "w-2"
        )}
      />
    </>
  );
}