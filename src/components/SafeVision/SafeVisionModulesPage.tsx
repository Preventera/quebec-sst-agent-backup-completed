import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Video, 
  Users, 
  Settings,
  FileText,
  Monitor,
  Palette,
  Volume2,
  Share2,
  Download,
  CheckCircle
} from 'lucide-react';

const SafeVisionModulesPage = () => {
  const [selectedModule, setSelectedModule] = useState('avatar');
  const [moduleConfigs, setModuleConfigs] = useState({
    avatar: {
      id: 'anna_costume1_cameraA',
      type: 'Professional Female',
      clothing: 'Business casual avec casque sécurité',
      age: '30-40',
      ethnicity: 'Caucasian',
      language: 'French Canadian'
    },
    visual: {
      resolution: '1080p',
      aspectRatio: '16:9',
      template: 'SST Construction',
      branding: 'AgenticSST Québec',
      assets: ['Logo CNESST', 'Graphiques statistiques', 'Icônes sécurité']
    },
    audio: {
      voice: 'French Canadian Professional',
      tone: 'Serious but Approachable',
      speed: 'Normal',
      background: 'None'
    },
    interaction: {
      cta: true,
      buttons: ['Diagnostic gratuit', 'Contactez-nous'],
      urls: ['agenticsst.quebec/diagnostic', 'agenticsst.quebec/contact'],
      quiz: true
    }
  });

  const modules = [
    {
      id: 'avatar',
      name: 'Configuration Avatar',
      icon: Users,
      color: 'blue',
      description: 'Sélection et personnalisation de l\'avatar Synthesia'
    },
    {
      id: 'visual',
      name: 'Éléments Visuels',
      icon: Monitor,
      color: 'green',
      description: 'Templates, résolution, branding et assets graphiques'
    },
    {
      id: 'audio',
      name: 'Configuration Audio',
      icon: Volume2,
      color: 'purple',
      description: 'Voix, accent, ton et effets sonores'
    },
    {
      id: 'interaction',
      name: 'Éléments Interactifs',
      icon: Share2,
      color: 'orange',
      description: 'CTA, boutons, quiz et liens cliquables'
    }
  ];

  const getModuleColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const exportSynthesiaConfig = () => {
    const synthesiaConfig = {
      project_name: "SafeVision SST Construction PME",
      avatar: moduleConfigs.avatar,
      video_settings: {
        ...moduleConfigs.visual,
        duration: "2:45",
        output_format: "mp4"
      },
      audio_settings: moduleConfigs.audio,
      interactive_elements: moduleConfigs.interaction,
      script_metadata: {
        generated_by: "AgenticSST Québec - SafeVision",
        agents: ["CoSS", "DiagSST", "LexiNorm", "Hugo"],
        confidence: "94%",
        production_ready: true
      }
    };

    const blob = new Blob([JSON.stringify(synthesiaConfig, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SafeVision_Synthesia_Config_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderModuleConfig = () => {
    const config = moduleConfigs[selectedModule];
    
    switch(selectedModule) {
      case 'avatar':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Avatar Synthesia ID</label>
              <input 
                type="text" 
                value={config.id}
                onChange={(e) => setModuleConfigs(prev => ({
                  ...prev,
                  avatar: { ...prev.avatar, id: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="ex: anna_costume1_cameraA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Type Professionnel</label>
              <select 
                value={config.type}
                onChange={(e) => setModuleConfigs(prev => ({
                  ...prev,
                  avatar: { ...prev.avatar, type: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="Professional Female">Professionnelle Femme</option>
                <option value="Professional Male">Professionnel Homme</option>
                <option value="Construction Supervisor">Superviseur Construction</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tenue Vestimentaire</label>
              <input 
                type="text" 
                value={config.clothing}
                onChange={(e) => setModuleConfigs(prev => ({
                  ...prev,
                  avatar: { ...prev.avatar, clothing: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Âge</label>
                <select 
                  value={config.age}
                  onChange={(e) => setModuleConfigs(prev => ({
                    ...prev,
                    avatar: { ...prev.avatar, age: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="25-35">25-35 ans</option>
                  <option value="30-40">30-40 ans</option>
                  <option value="40-50">40-50 ans</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Langue</label>
                <select 
                  value={config.language}
                  onChange={(e) => setModuleConfigs(prev => ({
                    ...prev,
                    avatar: { ...prev.avatar, language: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="French Canadian">Français Canadien</option>
                  <option value="French">Français International</option>
                  <option value="English Canadian">Anglais Canadien</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'visual':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Résolution</label>
                <select 
                  value={config.resolution}
                  onChange={(e) => setModuleConfigs(prev => ({
                    ...prev,
                    visual: { ...prev.visual, resolution: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="720p">720p HD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="4K">4K Ultra HD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <select 
                  value={config.aspectRatio}
                  onChange={(e) => setModuleConfigs(prev => ({
                    ...prev,
                    visual: { ...prev.visual, aspectRatio: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="16:9">16:9 (Paysage)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Carré)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Template Visuel</label>
              <select 
                value={config.template}
                onChange={(e) => setModuleConfigs(prev => ({
                  ...prev,
                  visual: { ...prev.visual, template: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="SST Construction">SST Construction</option>
                <option value="SST Manufacturier">SST Manufacturier</option>
                <option value="SST Services">SST Services</option>
                <option value="Formation Générale">Formation Générale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Assets Visuels Requis</label>
              <div className="flex flex-wrap gap-2">
                {config.assets.map((asset, index) => (
                  <Badge key={index} variant="secondary">
                    {asset}
                  </Badge>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Ajouter un asset..."
                className="w-full p-2 border border-gray-300 rounded-lg mt-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    setModuleConfigs(prev => ({
                      ...prev,
                      visual: { 
                        ...prev.visual, 
                        assets: [...prev.visual.assets, e.target.value]
                      }
                    }));
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type de Voix</label>
              <select 
                value={config.voice}
                onChange={(e) => setModuleConfigs(prev => ({
                  ...prev,
                  audio: { ...prev.audio, voice: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="French Canadian Professional">Français Canadien Professionnel</option>
                <option value="French Canadian Casual">Français Canadien Décontracté</option>
                <option value="French Professional">Français Professionnel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tonalité</label>
              <select 
                value={config.tone}
                onChange={(e) => setModuleConfigs(prev => ({
                  ...prev,
                  audio: { ...prev.audio, tone: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="Serious but Approachable">Sérieux mais Accessible</option>
                <option value="Friendly Professional">Professionnel Amical</option>
                <option value="Authoritative">Autoritaire</option>
                <option value="Conversational">Conversationnel</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Vitesse</label>
                <select 
                  value={config.speed}
                  onChange={(e) => setModuleConfigs(prev => ({
                    ...prev,
                    audio: { ...prev.audio, speed: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="Slow">Lent</option>
                  <option value="Normal">Normal</option>
                  <option value="Fast">Rapide</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Musique de Fond</label>
                <select 
                  value={config.background}
                  onChange={(e) => setModuleConfigs(prev => ({
                    ...prev,
                    audio: { ...prev.audio, background: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="None">Aucune</option>
                  <option value="Corporate">Corporative</option>
                  <option value="Industrial">Industrielle</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'interaction':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Call-to-Action Activés</label>
              <input 
                type="checkbox" 
                checked={config.cta}
                onChange={(e) => setModuleConfigs(prev => ({
                  ...prev,
                  interaction: { ...prev.interaction, cta: e.target.checked }
                }))}
                className="h-4 w-4"
              />
            </div>

            {config.cta && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Boutons CTA</label>
                  <div className="space-y-2">
                    {config.buttons.map((button, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={button}
                          onChange={(e) => {
                            const newButtons = [...config.buttons];
                            newButtons[index] = e.target.value;
                            setModuleConfigs(prev => ({
                              ...prev,
                              interaction: { ...prev.interaction, buttons: newButtons }
                            }));
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-lg"
                        />
                        <input 
                          type="text" 
                          value={config.urls[index]}
                          onChange={(e) => {
                            const newUrls = [...config.urls];
                            newUrls[index] = e.target.value;
                            setModuleConfigs(prev => ({
                              ...prev,
                              interaction: { ...prev.interaction, urls: newUrls }
                            }));
                          }}
                          placeholder="URL de destination"
                          className="flex-1 p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Quiz Intégré</label>
              <input 
                type="checkbox" 
                checked={config.quiz}
                onChange={(e) => setModuleConfigs(prev => ({
                  ...prev,
                  interaction: { ...prev.interaction, quiz: e.target.checked }
                }))}
                className="h-4 w-4"
              />
            </div>
          </div>
        );

      default:
        return <div>Module non trouvé</div>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Video className="h-8 w-8 text-blue-600" />
            SafeVision - Configuration Modules
          </h1>
          <p className="text-gray-600 mt-2">
            Configuration avancée pour génération vidéo Synthesia
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={exportSynthesiaConfig}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter Config Synthesia
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Modules Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Modules SafeVision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    className={"w-full text-left p-3 rounded-lg border transition-colors " + 
                      (selectedModule === module.id 
                        ? getModuleColor(module.color)
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      )
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <module.icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{module.name}</span>
                    </div>
                    <p className="text-xs opacity-80">{module.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Configuration */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(
                  modules.find(m => m.id === selectedModule)?.icon || Settings,
                  { className: "h-5 w-5" }
                )}
                {modules.find(m => m.id === selectedModule)?.name || 'Configuration'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderModuleConfig()}
            </CardContent>
          </Card>

          {/* Preview Configuration */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Aperçu Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Avatar:</span>
                    <p className="text-gray-600">{moduleConfigs.avatar.type} - {moduleConfigs.avatar.language}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Format:</span>
                    <p className="text-gray-600">{moduleConfigs.visual.resolution} - {moduleConfigs.visual.aspectRatio}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Voix:</span>
                    <p className="text-gray-600">{moduleConfigs.audio.voice}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Interactivité:</span>
                    <p className="text-gray-600">
                      {moduleConfigs.interaction.cta ? 'CTA Activés' : 'CTA Désactivés'} • 
                      {moduleConfigs.interaction.quiz ? ' Quiz Activé' : ' Quiz Désactivé'}
                    </p>
                  </div>
                </div>
              </div>
              
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Configuration prête pour Synthesia !</strong><br />
                  Tous les modules sont configurés. Exportez le fichier JSON pour l'importer dans Synthesia.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SafeVisionModulesPage;