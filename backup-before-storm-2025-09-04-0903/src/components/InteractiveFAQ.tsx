import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  HardHat, 
  FileText, 
  AlertTriangle, 
  Users, 
  Zap,
  MessageSquare,
  Sparkles
} from "lucide-react";

interface FAQItem {
  id: string;
  category: 'legal' | 'equipment' | 'training' | 'accidents' | 'workplace' | 'inspection';
  question: string;
  keywords: string[];
  icon: any;
  color: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    category: 'legal',
    question: "Quelles sont mes obligations légales selon la LMRSST ?",
    keywords: ['obligations', 'LMRSST', 'légal', 'conformité'],
    icon: FileText,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  {
    id: '2', 
    category: 'equipment',
    question: "Quels équipements de protection sont obligatoires dans mon secteur ?",
    keywords: ['EPI', 'équipements', 'protection', 'obligatoire'],
    icon: HardHat,
    color: 'bg-green-100 text-green-700 hover:bg-green-200'
  },
  {
    id: '3',
    category: 'training',
    question: "Quelles formations SST dois-je organiser pour mes employés ?",
    keywords: ['formation', 'SST', 'employés', 'obligatoire'],
    icon: Users,
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  },
  {
    id: '4',
    category: 'accidents',
    question: "Comment déclarer un accident de travail à la CNESST ?",
    keywords: ['accident', 'déclaration', 'CNESST', 'procédure'],
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-700 hover:bg-red-200'
  },
  {
    id: '5',
    category: 'workplace',
    question: "Quelles sont les exigences d'aménagement sécuritaire des lieux de travail ?",
    keywords: ['aménagement', 'sécurité', 'lieux', 'travail'],
    icon: Shield,
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
  },
  {
    id: '6',
    category: 'inspection',
    question: "Comment me préparer à une inspection de la CNESST ?",
    keywords: ['inspection', 'CNESST', 'préparation', 'conformité'],
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
  }
];

interface InteractiveFAQProps {
  onQuestionSelect: (question: string) => void;
  className?: string;
}

export const InteractiveFAQ = ({ onQuestionSelect, className = "" }: InteractiveFAQProps) => {
  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Questions fréquentes
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Cliquez pour poser
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {FAQ_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start h-auto p-3 text-left hover:scale-[1.02] transition-all ${item.color}`}
              onClick={() => onQuestionSelect(item.question)}
            >
              <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
              <span className="text-sm leading-relaxed">{item.question}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};