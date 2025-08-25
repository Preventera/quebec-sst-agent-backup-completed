import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Volume2, VolumeX, Settings, History, Trash2, Zap, Brain, Copy, Download, Share2, Sparkles, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActionLogger } from "@/hooks/useActionLogger";
import { useConversationLogger } from "@/hooks/useConversationLogger";
import { InteractiveFAQ } from "@/components/InteractiveFAQ";
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator";
import { VoiceSettings } from "@/components/VoiceSettings";
import { ConversationHistory } from "@/components/ConversationHistory";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  confidence?: number;
  duration?: number;
  tokens?: number;
}

const AssistantVocal = () => {
  const { toast } = useToast();
  const { logAction } = useActionLogger();
  const { logAgentInteraction } = useConversationLogger();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [sessionStats, setSessionStats] = useState({ questions: 0, totalTime: 0 });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '🎙️ Bonjour ! Je suis votre assistant SST vocal intelligent. Posez-moi vos questions sur la sécurité et santé au travail au Québec. Je peux vous aider avec les règlements LMRSST, les obligations légales, l\'évaluation des risques et bien plus.',
      timestamp: new Date(),
      confidence: 1
    }
  ]);
  const [volume, setVolume] = useState(0.8);
  const [ttsProvider, setTtsProvider] = useState<'openai' | 'elevenlabs'>('openai');
  const [assistantProvider, setAssistantProvider] = useState<'claude' | 'openai'>('claude');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [guidedMode, setGuidedMode] = useState(false);
  
  // Réinitialiser la voix quand on change de provider
  useEffect(() => {
    if (ttsProvider === 'openai') {
      setSelectedVoice('alloy');
    } else {
      setSelectedVoice('Aria');
    }
  }, [ttsProvider]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationContext = useRef<Array<{role: string, content: string}>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sessionStartTime = useRef<Date>(new Date());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Log de l'ouverture de la page
    logAction({
      action_type: 'page_visit',
      component: 'AssistantVocal'
    });
  }, [logAction]);

  const handleStartListening = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      const recordingStartTime = Date.now();
      
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
        
        const recordingDuration = Date.now() - recordingStartTime;
        
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
            
            try {
              // Transcription avec voice-to-text
              const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
                body: { audio: base64Audio }
              });
              
              if (transcriptionError) {
                console.error('Transcription error:', transcriptionError);
                setIsProcessing(false);
                setConnectionStatus('disconnected');
                
                // Afficher toast d'erreur avec action
                toast({
                  title: "❌ Erreur de transcription",
                  description: transcriptionError.message?.includes('quota') ? 
                    "Quota OpenAI dépassé. Cliquez pour gérer votre quota." : 
                    "Service temporairement indisponible",
                  variant: "destructive",
                  action: transcriptionError.message?.includes('quota') ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open('https://platform.openai.com/usage', '_blank')}
                    >
                      Gérer quota
                    </Button>
                  ) : undefined
                });
                
                throw new Error('Erreur de transcription');
              }
              
              const confidence = transcriptionData.confidence || 0.85;
              const userMessage: Message = {
                id: Date.now().toString(),
                type: 'user',
                content: transcriptionData.text,
                timestamp: new Date(),
                confidence,
                duration: recordingDuration
              };
              
              setMessages(prev => [...prev, userMessage]);
              
              // Ajouter au contexte de conversation
              conversationContext.current.push({
                role: 'user',
                content: transcriptionData.text
              });
              
              // Log de l'interaction
              await logAction({
                action_type: 'voice_query_full',
                component: 'AssistantVocal',
                details: { 
                  query: transcriptionData.text, 
                  confidence,
                  duration: recordingDuration
                }
              });
              
              // Obtenir la réponse de l'assistant SST selon le provider choisi
              const assistantStartTime = Date.now();
              let assistantData, assistantError;
              
              if (assistantProvider === 'claude') {
                // Utiliser Claude
                try {
                  const { data, error } = await supabase.functions.invoke('claude-assistant', {
                    body: { 
                      message: transcriptionData.text, 
                      context: conversationContext.current 
                    }
                  });
                  assistantData = data;
                  assistantError = error;
                  console.log('✅ Claude assistant utilisé');
                } catch (claudeError) {
                  console.warn('⚠️ Claude échoué, basculement vers OpenAI:', claudeError);
                  
                  // Fallback automatique vers OpenAI si Claude échoue
                  const { data, error } = await supabase.functions.invoke('sst-assistant', {
                    body: { 
                      message: transcriptionData.text, 
                      context: conversationContext.current 
                    }
                  });
                  assistantData = data;
                  assistantError = error;
                  console.log('🔄 OpenAI fallback utilisé');
                }
              } else {
                // Utiliser OpenAI directement
                const { data, error } = await supabase.functions.invoke('sst-assistant', {
                  body: { 
                    message: transcriptionData.text, 
                    context: conversationContext.current 
                  }
                });
                assistantData = data;
                assistantError = error;
                console.log('🤖 OpenAI assistant utilisé');
              }
              
              if (assistantError) {
                console.error('Assistant error:', assistantError);
                throw new Error(`Erreur de l'assistant: ${assistantError.message || 'Service temporairement indisponible'}`);
              }
            
            const responseTime = Date.now() - assistantStartTime;
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: 'assistant',
              content: assistantData.response,
              timestamp: new Date(),
              confidence: 1,
              tokens: assistantData.tokens_used || 0,
              duration: responseTime
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            
            // Ajouter au contexte de conversation
            conversationContext.current.push({
              role: 'assistant',
              content: assistantData.response
            });
            
            // Log de la conversation complète
            await logAgentInteraction(
              'AssistantVocalSST',
              transcriptionData.text,
              assistantData.response,
              {
                confidence,
                recordingDuration,
                responseTime,
                tokens: assistantData.tokens_used
              }
            );
            
            // Mettre à jour les statistiques
            setSessionStats(prev => ({
              questions: prev.questions + 1,
              totalTime: prev.totalTime + recordingDuration + responseTime
            }));
            
            setIsProcessing(false);
            setConnectionStatus('connected');
            
            // Lecture audio automatique de la réponse avec fallback
            try {
              setIsSpeaking(true);
              let voiceFunction = ttsProvider === 'elevenlabs' ? 'text-to-voice-elevenlabs' : 'text-to-voice';
              let voiceParam = ttsProvider === 'elevenlabs' ? { text: assistantData.response, voice: selectedVoice } : { text: assistantData.response, voice: selectedVoice };
              
              const { data: voiceData, error: voiceError } = await supabase.functions.invoke(voiceFunction, {
                body: voiceParam
              });
              
              // Fallback automatique sur ElevenLabs si OpenAI échoue
              if (voiceError && ttsProvider === 'openai') {
                console.log('OpenAI TTS failed, switching to ElevenLabs fallback...');
                
                // Basculer automatiquement sur ElevenLabs
                setTtsProvider('elevenlabs');
                setSelectedVoice('Aria');
                
                toast({
                  title: "🔄 Basculement automatique",
                  description: "Passage à ElevenLabs pour la synthèse vocale",
                  duration: 3000,
                });
                
                // Réessayer avec ElevenLabs
                const { data: fallbackVoiceData, error: fallbackError } = await supabase.functions.invoke('text-to-voice-elevenlabs', {
                  body: { text: assistantData.response, voice: 'Aria' }
                });
                
                if (!fallbackError) {
                  const audio = new Audio(`data:audio/mp3;base64,${fallbackVoiceData.audioContent}`);
                  audio.volume = volume;
                  await audio.play();
                  
                  audio.onended = () => {
                    setIsSpeaking(false);
                  };
                } else {
                  setIsSpeaking(false);
                  console.error('Fallback to ElevenLabs also failed:', fallbackError);
                }
              } else if (!voiceError) {
                const audio = new Audio(`data:audio/mp3;base64,${voiceData.audioContent}`);
                audio.volume = volume;
                await audio.play();
                
                audio.onended = () => {
                  setIsSpeaking(false);
                };
              } else {
                setIsSpeaking(false);
                console.error('Both TTS services failed');
              }
            } catch (voiceError) {
              console.error('Erreur lecture audio:', voiceError);
              setIsSpeaking(false);
            }
            
            } catch (error: any) {
              console.error('Erreur dans le traitement:', error);
              setIsListening(false);
              setIsProcessing(false);
              setConnectionStatus('disconnected');
              
              // Pas de message d'erreur dupliqué dans la conversation
              
              toast({
                title: "❌ Erreur de traitement",
                description: error.message || "Erreur lors du traitement audio. Quota OpenAI peut être dépassé.",
                variant: "destructive",
              });
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error: any) {
          console.error('Erreur traitement audio:', error);
          setIsListening(false);
          setIsProcessing(false);
          setConnectionStatus('disconnected');
          
          // Pas de message d'erreur dupliqué dans la conversation
          
          toast({
            title: "❌ Erreur de traitement",
            description: error.message || "Erreur lors du traitement audio. Quota OpenAI peut être dépassé.",
            variant: "destructive",
          });
        }
        
        // Arrêter le flux audio
        stream.getTracks().forEach(track => track.stop());
      };

      setIsListening(true);
      setConnectionStatus('connected');
      mediaRecorder.start();
      
      toast({
        title: "🎤 Écoute activée",
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
  }, [setupAudioMonitoring, volume, logAction, logAgentInteraction]);

  const handleStopListening = useCallback(() => {
    // Arrêter immédiatement l'état d'écoute
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
  }, []);

  const handleClearHistory = useCallback(() => {
    setMessages([messages[0]]); // Garde le message de bienvenue
    conversationContext.current = []; // Réinitialiser le contexte
    setSessionStats({ questions: 0, totalTime: 0 });
    sessionStartTime.current = new Date();
    
    logAction({
      action_type: 'conversation_cleared',
      component: 'AssistantVocal'
    });
    
    toast({
      title: "🗑️ Historique effacé",
      description: "La conversation a été réinitialisée",
      duration: 2000,
    });
  }, [messages, logAction]);

  // Fonction pour traiter les questions sélectionnées depuis FAQ
  const handleQuestionSelect = useCallback(async (question: string) => {
    if (isListening || isProcessing || isSpeaking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
      confidence: 1
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setConnectionStatus('connecting');
    
    try {
      const { data: assistantData, error: assistantError } = await supabase.functions.invoke(
        assistantProvider === 'claude' ? 'claude-assistant' : 'sst-assistant', 
        {
          body: { 
            message: question, 
            context: conversationContext.current 
          }
        }
      );
      
      if (!assistantError && assistantData) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: assistantData.response,
          timestamp: new Date(),
          confidence: 1,
          tokens: assistantData.tokens_used || 0
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setSessionStats(prev => ({ 
          questions: prev.questions + 1, 
          totalTime: prev.totalTime + 1000 
        }));

        // Ajouter au contexte
        conversationContext.current.push(
          { role: 'user', content: question },
          { role: 'assistant', content: assistantData.response }
        );

        await logAgentInteraction('AssistantVocalSST', question, assistantData.response);
      }
    } catch (error) {
      console.error('Erreur suggestion:', error);
    }
    
    setIsProcessing(false);
    setConnectionStatus('connected');
  }, [isListening, isProcessing, isSpeaking, assistantProvider, logAgentInteraction]);

  // Fonction pour tester la voix
  const handleTestVoice = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      const voiceFunction = ttsProvider === 'elevenlabs' ? 'text-to-voice-elevenlabs' : 'text-to-voice';
      const voiceParam = { text, voice: selectedVoice };
      
      const { data: voiceData, error: voiceError } = await supabase.functions.invoke(voiceFunction, {
        body: voiceParam
      });
      
      if (!voiceError) {
        const audio = new Audio(`data:audio/mp3;base64,${voiceData.audioContent}`);
        audio.volume = volume;
        await audio.play();
        audio.onended = () => setIsSpeaking(false);
      } else {
        setIsSpeaking(false);
        toast({
          title: "❌ Erreur",
          description: "Impossible de tester la voix",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsSpeaking(false);
      console.error('Erreur test voix:', error);
    }
  }, [ttsProvider, selectedVoice, volume]);

  const handleExportConversation = useCallback(() => {
    const conversationText = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.type === 'user' ? 'Vous' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-sst-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "📄 Conversation exportée",
      description: "Fichier téléchargé avec succès",
      duration: 2000,
    });
  }, [messages]);

  const getStatusColor = () => {
    if (isListening) return "bg-gradient-to-r from-red-500 to-red-600 animate-pulse shadow-lg shadow-red-500/30";
    if (isProcessing) return "bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse shadow-lg shadow-yellow-500/30";
    if (isSpeaking) return "bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse shadow-lg shadow-blue-500/30";
    if (connectionStatus === 'disconnected') return "bg-gradient-to-r from-gray-400 to-gray-500";
    return "bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30";
  };

  const getStatusText = () => {
    if (isListening) return "🎤 Écoute en cours...";
    if (isProcessing) return "⚡ Traitement...";
    if (isSpeaking) return "🔊 Assistant en train de parler...";
    if (connectionStatus === 'disconnected') return "❌ Déconnecté";
    return "✅ Prêt à vous écouter";
  };

  const getConnectionIcon = () => {
    switch(connectionStatus) {
      case 'connected': return <Zap className="h-4 w-4 text-green-500" />;
      case 'connecting': return <Settings className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'disconnected': return <Trash2 className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
                
        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-primary/5 to-secondary/5">
          {/* Page Header amélioré */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
                      <div className="absolute -top-1 -right-1">
                        {getConnectionIcon()}
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Assistant Vocal SST
                      </h1>
                      <p className="text-xs text-muted-foreground">Intelligence artificielle pour la sécurité au travail</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Brain className="h-3 w-3" />
                    {getStatusText()}
                  </Badge>
                </div>
                
                {/* Statistiques de session */}
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{sessionStats.questions} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <History className="h-4 w-4" />
                      <span>{Math.round(sessionStats.totalTime / 1000)}s</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ConnectionStatusIndicator status={connectionStatus} />
                    
                    <ConversationHistory 
                      messages={messages}
                      onClearHistory={handleClearHistory}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
              
              {/* Zone de conversation principale */}
              <Card className="lg:col-span-3 flex flex-col border-primary/20 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span>Conversation</span>
                    </div>
                    <Badge variant="outline">
                      {messages.length - 1} échanges
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col">
                  {/* Messages améliorés */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] relative group ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground' 
                            : 'bg-gradient-to-r from-muted to-muted/80 border border-primary/10'
                        } p-4 rounded-2xl shadow-sm`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.type === 'user' 
                                ? 'bg-white/20' 
                                : 'bg-primary/10'
                            }`}>
                              {message.type === 'user' ? (
                                <Mic className="h-4 w-4" />
                              ) : (
                                <Brain className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <div className="flex items-center justify-between mt-3 text-xs opacity-70">
                                <span>{message.timestamp.toLocaleTimeString()}</span>
                                <div className="flex items-center gap-2">
                                  {message.confidence && (
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(message.confidence * 100)}% précis
                                    </Badge>
                                  )}
                                  {message.duration && (
                                    <span>{Math.round(message.duration / 1000)}s</span>
                                  )}
                                  {message.type === 'assistant' && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => {
                                            navigator.clipboard.writeText(message.content);
                                            toast({ 
                                              title: "📋 Copié", 
                                              description: "Réponse copiée",
                                              duration: 2000 
                                            });
                                          }}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Copier la réponse</TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <Separator className="bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                  {/* Contrôles vocaux améliorés */}
                  <div className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <div className="flex flex-col items-center justify-center gap-6">
                      <div className="flex flex-col items-center gap-4">
                        {/* Bouton de démarrage - toujours visible */}
                         <div className="relative">
                           <Button
                             size="lg"
                             onClick={handleStartListening}
                             disabled={isListening || isProcessing || isSpeaking}
                             className="h-24 w-24 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-4 border-green-300 shadow-lg shadow-green-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                             aria-label="Démarrer l'enregistrement vocal"
                           >
                             <Mic className="h-12 w-12" />
                           </Button>
                           {isListening && (
                             <div className="absolute -inset-2 rounded-full bg-red-500/20 animate-ping border-2 border-red-500/50" />
                           )}
                         </div>
                        
                        {/* Bouton d'arrêt - visible seulement pendant l'enregistrement */}
                        {isListening && (
                          <Button
                            size="lg"
                            onClick={handleStopListening}
                            className="h-20 w-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white animate-pulse border-4 border-red-300 shadow-lg shadow-red-500/30 hover:scale-105 transition-all duration-300"
                            aria-label="Arrêter l'enregistrement vocal"
                          >
                            <MicOff className="h-10 w-10" />
                          </Button>
                        )}
                        
                         <div className="text-center">
                           <p className={`text-lg font-medium ${isListening ? 'text-red-600 animate-pulse' : ''}`}>
                             {isListening ? "🎤 ENREGISTREMENT EN COURS" : 
                              isProcessing ? "⚡ Traitement en cours..." : 
                              isSpeaking ? "🔊 Assistant en train de parler..." : 
                              "🎙️ Prêt à vous écouter"}
                           </p>
                           <p className="text-sm text-muted-foreground mt-1">
                             {isListening ? "Parlez maintenant, cliquez STOP quand vous avez terminé" : 
                              isProcessing ? "Analyse de votre question SST en cours" : 
                              isSpeaking ? "Réponse en cours de lecture" :
                              "Cliquez sur le micro vert pour commencer votre question"}
                           </p>
                          
                          {/* Indicateur de niveau audio */}
                          {isListening && audioLevel > 0 && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span>Niveau audio</span>
                                <span className="font-mono">{Math.round(audioLevel)}%</span>
                              </div>
                              <Progress value={audioLevel} className="w-48 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Contrôles volume avec design amélioré */}
                      <div className="flex items-center gap-4 bg-background/80 rounded-lg p-3 border">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                              className="gap-2"
                            >
                              {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                              <span className="hidden sm:inline">Volume</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {volume > 0 ? `Volume: ${Math.round(volume * 100)}%` : "Audio coupé"}
                          </TooltipContent>
                        </Tooltip>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer 
                                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
                                      [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full 
                                      [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
                            aria-label="Réglage du volume"
                          />
                          <span className="text-xs text-muted-foreground w-10 font-mono">
                            {Math.round(volume * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar d'aide et statistiques */}
              <div className="lg:col-span-1 space-y-4">
                {/* FAQ Interactive */}
                <InteractiveFAQ onQuestionSelect={handleQuestionSelect} />
                
                {/* Statistiques de session */}
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Questions</span>
                      <Badge variant="outline">{sessionStats.questions}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Temps</span>
                      <Badge variant="outline">{Math.round(sessionStats.totalTime / 1000)}s</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Configuration IA et voix */}
                <VoiceSettings
                  ttsProvider={ttsProvider}
                  setTtsProvider={setTtsProvider}
                  assistantProvider={assistantProvider}
                  setAssistantProvider={setAssistantProvider}
                  selectedVoice={selectedVoice}
                  setSelectedVoice={setSelectedVoice}
                  onTestVoice={handleTestVoice}
                />

                {/* Guide d'utilisation rapide */}
                <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />
                      Guide rapide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary font-bold text-xs">1</span>
                        </div>
                        <p>Cliquez sur le micro pour commencer</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary font-bold text-xs">2</span>
                        </div>
                        <p>Posez votre question clairement</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary font-bold text-xs">3</span>
                        </div>
                        <p>Recevez une réponse vocale et écrite</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AssistantVocal;