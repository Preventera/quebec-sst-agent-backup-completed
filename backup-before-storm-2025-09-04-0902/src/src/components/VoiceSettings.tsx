import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings, Volume2, Brain, Play, Info } from "lucide-react";

interface VoiceSettingsProps {
  ttsProvider: 'openai' | 'elevenlabs';
  setTtsProvider: (provider: 'openai' | 'elevenlabs') => void;
  assistantProvider: 'claude' | 'openai';
  setAssistantProvider: (provider: 'claude' | 'openai') => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  onTestVoice: (text: string) => void;
  className?: string;
}

const VOICE_OPTIONS = {
  openai: [
    { value: 'alloy', label: 'Alloy - Voix équilibrée', description: 'Voix neutre et professionnelle' },
    { value: 'echo', label: 'Echo - Voix masculine', description: 'Voix masculine claire' },
    { value: 'fable', label: 'Fable - Voix expressive', description: 'Voix expressive et engageante' },
    { value: 'onyx', label: 'Onyx - Voix grave', description: 'Voix masculine grave et posée' },
    { value: 'nova', label: 'Nova - Voix féminine', description: 'Voix féminine claire et moderne' },
    { value: 'shimmer', label: 'Shimmer - Voix douce', description: 'Voix féminine douce et apaisante' }
  ],
  elevenlabs: [
    { value: 'Aria', label: 'Aria - Voix féminine claire', description: 'Voix féminine expressive et claire' },
    { value: 'Roger', label: 'Roger - Voix masculine', description: 'Voix masculine professionnelle' },
    { value: 'Sarah', label: 'Sarah - Voix naturelle', description: 'Voix féminine naturelle et engageante' },
    { value: 'Charlie', label: 'Charlie - Voix jeune', description: 'Voix masculine jeune et dynamique' }
  ]
};

const ASSISTANT_OPTIONS = [
  { 
    value: 'claude', 
    label: 'Claude (Anthropic)', 
    description: 'Réponses nuancées et contextuelles, excellent pour les analyses détaillées',
    badge: 'Recommandé'
  },
  { 
    value: 'openai', 
    label: 'GPT (OpenAI)', 
    description: 'Réponses rapides et directes, optimal pour les questions factuelles',
    badge: 'Rapide'
  }
];

export const VoiceSettings = ({ 
  ttsProvider, 
  setTtsProvider, 
  assistantProvider, 
  setAssistantProvider, 
  selectedVoice, 
  setSelectedVoice,
  onTestVoice,
  className = "" 
}: VoiceSettingsProps) => {
  const currentVoiceOptions = VOICE_OPTIONS[ttsProvider];
  const selectedVoiceInfo = currentVoiceOptions.find(v => v.value === selectedVoice);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assistant IA */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Assistant IA
          </Label>
          <Select value={assistantProvider} onValueChange={setAssistantProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSISTANT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span>{option.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {option.badge}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {ASSISTANT_OPTIONS.find(o => o.value === assistantProvider)?.description}
          </p>
        </div>

        <Separator />

        {/* Synthèse vocale */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Synthèse vocale
          </Label>
          <Select value={ttsProvider} onValueChange={setTtsProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI TTS</SelectItem>
              <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voix */}
        <div className="space-y-2">
          <Label>Type de voix</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentVoiceOptions.map((voice) => (
                <SelectItem key={voice.value} value={voice.value}>
                  {voice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedVoiceInfo && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {selectedVoiceInfo.description}
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onTestVoice("Bonjour, je suis votre assistant SST. Comment puis-je vous aider aujourd'hui ?")}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Écouter un échantillon de cette voix</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};