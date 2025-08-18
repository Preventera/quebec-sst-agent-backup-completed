import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  History, 
  User, 
  Bot, 
  Clock, 
  Download, 
  Copy, 
  Share2,
  MessageSquare,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  duration?: number;
  tokens?: number;
}

interface ConversationHistoryProps {
  messages: Message[];
  onClearHistory: () => void;
  className?: string;
}

export const ConversationHistory = ({ messages, onClearHistory, className = "" }: ConversationHistoryProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const conversationMessages = messages.filter(m => m.id !== '1'); // Exclure le message d'accueil

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  };

  const exportConversation = () => {
    const conversationText = conversationMessages
      .map(msg => {
        const timestamp = msg.timestamp.toLocaleString('fr-CA');
        const prefix = msg.type === 'user' ? '[Vous]' : '[Assistant SST]';
        return `${timestamp} - ${prefix}\n${msg.content}\n`;
      })
      .join('\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-sst-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📄 Conversation exportée",
      description: "Le fichier a été téléchargé avec succès",
    });
  };

  const copyToClipboard = () => {
    const conversationText = conversationMessages
      .map(msg => `${msg.type === 'user' ? 'Vous' : 'Assistant SST'}: ${msg.content}`)
      .join('\n\n');

    navigator.clipboard.writeText(conversationText);
    toast({
      title: "📋 Copié",
      description: "Conversation copiée dans le presse-papiers",
    });
  };

  const shareConversation = async () => {
    if (navigator.share) {
      const conversationText = conversationMessages
        .map(msg => `${msg.type === 'user' ? 'Vous' : 'Assistant SST'}: ${msg.content}`)
        .join('\n\n');

      try {
        await navigator.share({
          title: 'Conversation Assistant SST',
          text: conversationText,
        });
      } catch (error) {
        copyToClipboard(); // Fallback
      }
    } else {
      copyToClipboard(); // Fallback pour navigateurs sans support
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <History className="h-4 w-4 mr-2" />
          Historique
          {conversationMessages.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {conversationMessages.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Historique de conversation
            {conversationMessages.length > 0 && (
              <Badge variant="outline">
                {conversationMessages.length} échange{conversationMessages.length > 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {conversationMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune conversation enregistrée</p>
            <p className="text-sm">Commencez à poser des questions pour voir l'historique</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={exportConversation}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Télécharger la conversation en .txt</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copier dans le presse-papiers</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={shareConversation}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Partager la conversation</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onClearHistory}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Effacer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Effacer l'historique</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator />

            {/* Messages */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {conversationMessages.map((message) => (
                  <Card key={message.id} className={message.type === 'user' ? 'ml-8' : 'mr-8'}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          message.type === 'user' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{message.type === 'user' ? 'Vous' : 'Assistant SST'}</span>
                            <Clock className="h-3 w-3" />
                            <span>{message.timestamp.toLocaleTimeString('fr-CA')}</span>
                            {message.duration && (
                              <Badge variant="outline" className="text-xs">
                                {formatDuration(message.duration)}
                              </Badge>
                            )}
                            {message.confidence && message.confidence < 0.9 && (
                              <Badge variant="secondary" className="text-xs">
                                Confiance: {Math.round(message.confidence * 100)}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};