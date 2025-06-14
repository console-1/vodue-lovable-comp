
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Code, Workflow, Zap } from 'lucide-react';

interface SidebarProps {
  currentMode: 'build' | 'interact';
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode }) => {
  const buildContent = {
    title: "The Art of Workflow Creation",
    sections: [
      {
        icon: Sparkles,
        title: "Natural Language Processing",
        content: "Describe your automation vision in natural language. VODUE translates your intent into sophisticated n8n workflows with editorial precision."
      },
      {
        icon: Code,
        title: "JSON Generation",
        content: "Each workflow is crafted as clean, maintainable JSON that integrates seamlessly with n8n's architecture."
      },
      {
        icon: Workflow,
        title: "Visual Preview",
        content: "See your workflow structure in our magazine-inspired layout before deployment."
      }
    ]
  };

  const interactContent = {
    title: "Workflow Interaction",
    sections: [
      {
        icon: Zap,
        title: "Live Execution",
        content: "Interact with your deployed workflows through beautifully crafted interfaces that match their sophistication."
      },
      {
        icon: Workflow,
        title: "Real-time Feedback",
        content: "Monitor workflow execution with elegant status updates and result visualization."
      },
      {
        icon: Code,
        title: "Webhook Integration",
        content: "Seamless integration with n8n webhooks for real-time workflow triggering."
      }
    ]
  };

  const content = currentMode === 'build' ? buildContent : interactContent;

  return (
    <div className="w-80 border-l border-stone-200 bg-gradient-to-b from-stone-50 to-white">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 bg-gradient-to-br from-stone-800 to-stone-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <Badge variant="outline" className="text-xs uppercase tracking-wider">
            {currentMode} mode
          </Badge>
        </div>
        <h3 className="text-lg font-light text-stone-800">{content.title}</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {content.sections.map((section, index) => (
            <Card key={index} className="p-4 bg-white/50 border-stone-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <section.icon className="w-4 h-4 text-stone-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-stone-800 mb-2">
                    {section.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          <div className="pt-4 border-t border-stone-200">
            <p className="text-xs text-stone-500 italic text-center">
              "Where vibe-coding meets haute couture design"
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
