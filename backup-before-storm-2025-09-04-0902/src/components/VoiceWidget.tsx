import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mic, MicOff, X, Maximize2, Volume2, Zap, Settings2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActionLogger } from "@/hooks/useActionLogger";

interface VoiceWidgetProps {
  className?: string;
}

const VoiceWidget = ({ className }: VoiceWidgetProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logAction } = useActionLogger();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const setupAudioMonitoring = useCallback(async (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(Math.min(100, (average / 128) * 100));
        }
        
        if (isListening) {
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Erreur monitoring audio:', error);
    }
  }, [isListening]);

  const handleQuickVoice = useCallback(async () => {
    if (!isOpen) {
      setIsOpen(true);
      await logAction({
        action_type: 'voice_widget_opened',
        component: 'VoiceWidget'
      });
      return;
    }

    if (isListening) {
      // Arrêter l'enregistrement immédiatement
      setIsListening(false);
      setIsProcessing(false);
      setAudioLevel(0);
      setConnectionStatus('connected');
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      
      // Nettoyer le contexte audio
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      // Arrêter les pistes du flux audio
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      toast({
        title: "🛑 Enregistrement arrêté",
        description: "L'écoute a été interrompue",
        duration: 2000,
      });
      
      return;
    }

    try {
      setConnectionStatus('connecting');
      // Démarrer l'enregistrement audio avec contraintes avancées
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      await setupAudioMonitoring(stream);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);
        setAudioLevel(0);
        setConnectionStatus('connecting');
        
        try {
          // Nettoyer le contexte audio
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          
          // Convertir l'audio en base64
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            // Transcription avec voice-to-text
            const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });
            
            if (transcriptionError) throw transcriptionError;
            
            const userMessage = transcriptionData.text;
            setConfidence(transcriptionData.confidence || 0.85);
            
            // Log de l'interaction
            await logAction({
              action_type: 'voice_query',
              component: 'VoiceWidget',
              details: { query: userMessage, confidence: transcriptionData.confidence }
            });
            
            // Obtenir la réponse de l'assistant SST
            const { data: assistantData, error: assistantError } = await supabase.functions.invoke('sst-assistant', {
              body: { message: userMessage, context: [] }
            });
            
            if (assistantError) throw assistantError;
            
            setLastResponse(assistantData.response);
            setIsProcessing(false);
            setConnectionStatus('connected');
            
            toast({
              title: "✨ Réponse prête",
              description: `Transcription: "${userMessage.substring(0, 50)}..."`,
              duration: 4000,
            });
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error: any) {
          console.error('Erreur traitement audio:', error);
          setConnectionStatus('disconnected');
          toast({
            title: "❌ Erreur",
            description: error.message || "Erreur lors du traitement audio",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
        
        // Arrêter le flux audio
        stream.getTracks().forEach(track => track.stop());
      };

      setIsListening(true);
      setConnectionStatus('connected');
      mediaRecorder.start();
      
      toast({
        title: "🎤 Écoute en cours...",
        description: "Parlez maintenant, cliquez à nouveau pour arrêter",
        duration: 2000,
      });

    } catch (error: any) {
      setConnectionStatus('disconnected');
      toast({
        title: "❌ Erreur d'accès",
        description: "Impossible d'accéder au microphone",
        variant: "destructive",
      });
      setIsListening(false);
    }
  }, [isOpen, isListening, logAction, setupAudioMonitoring]);

  const handleOpenFullAssistant = useCallback(() => {
    setIsOpen(false);
    logAction({
      action_type: 'navigate_full_assistant',
      component: 'VoiceWidget'
    });
    navigate('/assistant-vocal');
  }, [logAction, navigate]);

  const getStatusColor = () => {
    if (isListening) return "bg-gradient-to-br from-red-500 to-red-600 animate-pulse shadow-lg shadow-red-500/30";
    if (isProcessing) return "bg-gradient-to-br from-yellow-500 to-orange-500 animate-pulse shadow-lg shadow-yellow-500/30";
    if (connectionStatus === 'disconnected') return "bg-gradient-to-br from-gray-400 to-gray-500";
    return "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30";
  };

  const getConnectionIcon = () => {
    switch(connectionStatus) {
      case 'connected': return <Zap className="h-3 w-3 text-green-500" />;
      case 'connecting': return <Settings2 className="h-3 w-3 text-yellow-500 animate-spin" />;
      case 'disconnected': return <X className="h-3 w-3 text-red-500" />;
    }
  };

  return (
    <TooltipProvider>
      {/* Bouton flottant amélioré */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleQuickVoice}
                size="lg"
                className={`h-16 w-16 rounded-full hover:scale-110 transition-all duration-300 border-2 border-white/20 ${getStatusColor()}`}
                disabled={false}
                aria-label={isListening ? "Arrêter l'enregistrement" : "Commencer l'enregistrement vocal"}
              >
                {isListening ? (
                  <MicOff className="h-7 w-7 text-white" />
                ) : (
                  <Mic className="h-7 w-7 text-white" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <div className="text-center">
                <p className="font-medium">
                  {isListening ? "Cliquez pour arrêter" : "Assistant Vocal SST"}
                </p>
                <p className="text-xs opacity-80">
                  {isListening ? "Parlez maintenant..." : "Posez vos questions SST"}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
          
          {/* Indicateurs d'état multiples */}
          <div className="absolute -top-1 -right-1 flex flex-col gap-1">
            {/* Statut de connexion */}
            <div className="bg-background rounded-full p-1 shadow-sm">
              {getConnectionIcon()}
            </div>
            
            {/* Badge d'état */}
            {(isListening || isProcessing) && (
              <Badge 
                variant={isListening ? "destructive" : "secondary"} 
                className="text-xs animate-bounce min-w-fit whitespace-nowrap"
              >
                {isListening ? "🎤 Écoute" : "⚡ Traitement"}
              </Badge>
            )}
          </div>
          
          {/* Indicateur de niveau audio */}
          {isListening && audioLevel > 0 && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-background rounded-full px-2 py-1 shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <div className="text-xs font-mono">{Math.round(audioLevel)}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog modal amélioré */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Assistant Vocal SST
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {connectionStatus === 'connected' ? '🟢 Connecté' : connectionStatus === 'connecting' ? '🟡 Connexion' : '🔴 Déconnecté'}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenFullAssistant}
                className="gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                Mode complet
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* État actuel avec indicateurs avancés */}
            <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border">
              <div className="flex flex-col items-center gap-4">
                {/* Bouton de démarrage */}
                <Button
                  size="lg"
                  onClick={() => !isListening && handleQuickVoice()}
                  disabled={isListening || isProcessing}
                  className="h-20 w-20 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-3 border-green-300 shadow-lg shadow-green-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50"
                  aria-label="Démarrer l'enregistrement vocal"
                >
                  <Mic className="h-8 w-8" />
                </Button>
                
                {/* Bouton d'arrêt - visible seulement pendant l'enregistrement */}
                {isListening && (
                  <Button
                    size="lg"
                    onClick={handleQuickVoice}
                    className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white animate-pulse border-3 border-red-300 shadow-lg shadow-red-500/30 hover:scale-105 transition-all duration-300"
                    aria-label="Arrêter l'enregistrement vocal"
                  >
                    <MicOff className="h-6 w-6" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 mt-4">
                <p className="text-lg font-semibold">
                  {isListening && "🎤 ENREGISTREMENT EN COURS"}
                  {isProcessing && "⚡ Analyse en cours..."}
                  {!isListening && !isProcessing && "✨ Prêt à vous aider"}
                </p>
                
                <p className="text-sm text-muted-foreground">
                  {isListening && "Cliquez sur STOP rouge pour finaliser"}
                  {isProcessing && "Traitement de votre demande SST"}
                  {!isListening && !isProcessing && "Cliquez sur le micro vert pour commencer"}
                </p>
              </div>
              
              {/* Barre de progression du niveau audio */}
              {isListening && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Niveau audio</span>
                    <span className="font-mono">{Math.round(audioLevel)}%</span>
                  </div>
                  <Progress value={audioLevel} className="h-2" />
                </div>
              )}
              
              {/* Indicateur de confiance */}
              {confidence > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Précision de transcription</span>
                    <span className="font-mono">{Math.round(confidence * 100)}%</span>
                  </div>
                  <Progress value={confidence * 100} className="h-2" />
                </div>
              )}
            </div>

            {/* Dernière réponse avec design amélioré */}
            {lastResponse && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Réponse de l'assistant
                    </span>
                    {confidence > 0 && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {Math.round(confidence * 100)}% précis
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-background/80 rounded-lg p-4 border">
                    <p className="text-sm leading-relaxed">{lastResponse}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase.functions.invoke('text-to-voice', {
                            body: { text: lastResponse, voice: 'alloy' }
                          });
                          
                          if (error) throw error;
                          
                          // Jouer l'audio
                          const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
                          audio.play();
                          
                          toast({ 
                            title: "🔊 Lecture audio", 
                            description: "Audio en cours de lecture",
                            duration: 2000 
                          });
                        } catch (error: any) {
                          toast({ 
                            title: "❌ Erreur audio", 
                            description: "Impossible de lire l'audio",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Écouter la réponse
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(lastResponse);
                        toast({ 
                          title: "📋 Copié", 
                          description: "Réponse copiée dans le presse-papiers",
                          duration: 2000 
                        });
                      }}
                    >
                      📋
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions avec guides visuels */}
            <div className="space-y-4">
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleQuickVoice}
                  disabled={isProcessing}
                  size="lg"
                  className={`px-8 transition-all duration-300 ${
                    isListening 
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse" 
                      : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-5 w-5 mr-2" />
                      Arrêter l'enregistrement
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      {lastResponse ? "Nouvelle question" : "Commencer"}
                    </>
                  )}
                </Button>
              </div>
              
              {/* Guide d'utilisation rapide */}
              {!lastResponse && !isListening && !isProcessing && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Suggestions de questions
                  </h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• "Quelles sont mes obligations SST ?"</p>
                    <p>• "Comment évaluer les risques ?"</p>
                    <p>• "Formation obligatoire des employés"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default VoiceWidget;