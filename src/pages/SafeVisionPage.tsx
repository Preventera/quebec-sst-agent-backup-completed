import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Filter, 
  DollarSign, 
  Clock, 
  Users, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PROVIDERS_DATABASE = [
  {
    id: 'demo-prototype',
    name: 'Mode Démo',
    description: 'Prototype interactif avec storyboard et TTS gratuit',
    logo: '🔬',
    pricing: 'free',
    costPerMinute: 0,
    maxDuration: '5min',
    processingTime: '< 1min',
    quality: 'prototype',
    capabilities: ['storyboard', 'tts-gratuit', 'preview-html'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: false,
      interactivity: true,
      analytics: false,
      customization: 'limited'
    },
    useCases: ['prototypage', 'validation-concept', 'demonstration'],
    businessModel: 'freemium',
    techComplexity: 'simple',
    apiRequired: false
  },
  {
    id: 'colossyan',
    name: 'Colossyan Creator',
    description: 'Avatars IA éducatifs spécialisés formation professionnelle',
    logo: '👨‍🏫',
    pricing: 'subscription',
    costPerMinute: 8,
    maxDuration: '10min',
    processingTime: '5-10min',
    quality: 'professional',
    capabilities: ['avatars-education', 'multi-langues', 'formation-sst'],
    features: {
      avatars: true,
      voiceCloning: false,
      multiLanguage: true,
      interactivity: true,
      analytics: true,
      customization: 'moderate'
    },
    useCases: ['formation', 'education', 'demonstration-client'],
    businessModel: 'subscription',
    techComplexity: 'simple',
    apiRequired: true
  },
  {
    id: 'synthesia',
    name: 'Synthesia',
    description: 'Avatars IA ultra-professionnels et voix humaines premium',
    logo: '🤖',
    pricing: 'paid',
    costPerMinute: 30,
    maxDuration: '30min',
    processingTime: '10-20min',
    quality: 'enterprise',
    capabilities: ['avatars-premium', 'voix-humaines', 'multi-langues', 'branding'],
    features: {
      avatars: true,
      voiceCloning: true,
      multiLanguage: true,
      interactivity: false,
      analytics: true,
      customization: 'extensive'
    },
    useCases: ['production-enterprise', 'formation-corporate', 'communication-officielle'],
    businessModel: 'per-minute',
    techComplexity: 'moderate',
    apiRequired: true
  },
  {
    id: 'veo3',
    name: 'Google Veo 3',
    description: 'Génération vidéo IA ultra-réaliste de nouvelle génération',
    logo: '🎬',
    pricing: 'enterprise',
    costPerMinute: 10,
    maxDuration: '10min',
    processingTime: '15-30min',
    quality: 'cutting-edge',
    capabilities: ['generation-video-ia', 'realisme-extreme', 'personnalisation-avancee'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: false,
      interactivity: false,
      analytics: false,
      customization: 'creative'
    },
    useCases: ['demonstration-premium', 'contenu-innovant', 'presentation-executives'],
    businessModel: 'per-minute',
    techComplexity: 'complex',
    apiRequired: true
  },
  {
    id: 'runway',
    name: 'Runway Gen-3',
    description: 'Création vidéo IA créative avec effets visuels avancés',
    logo: '✨',
    pricing: 'paid',
    costPerMinute: 15,
    maxDuration: '5min',
    processingTime: '8-15min',
    quality: 'creative',
    capabilities: ['generation-creative', 'effets-visuels', 'montage-ia'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: false,
      interactivity: false,
      analytics: false,
      customization: 'creative'
    },
    useCases: ['contenu-creative', 'marketing', 'presentation-visuelle'],
    businessModel: 'credit-system',
    techComplexity: 'moderate',
    apiRequired: true
  },
  {
    id: 'luma',
    name: 'Luma Dream Machine',
    description: 'Génération vidéo IA rapide et accessible',
    logo: '🌟',
    pricing: 'freemium',
    costPerMinute: 2,
    maxDuration: '2min',
    processingTime: '3-8min',
    quality: 'standard',
    capabilities: ['generation-rapide', 'qualite-hd', 'cout-reduit'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: false,
      interactivity: false,
      analytics: false,
      customization: 'basic'
    },
    useCases: ['tests-rapides', 'prototypage-avance', 'budget-limite'],
    businessModel: 'freemium',
    techComplexity: 'simple',
    apiRequired: true
  }
];

const ProviderFilterInterface = () => {
  const [filters, setFilters] = useState({
    budget: [0, 50], // Range 0-50$ par minute
    maxDuration: '',
    quality: [],
    features: [],
    useCases: [],
    businessModel: [],
    techComplexity: [],
    processingTime: 60 // Max minutes
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState([]);

  const filteredProviders = useMemo(() => {
    return PROVIDERS_DATABASE.filter(provider => {
      // Filtre budget
      if (provider.costPerMinute < filters.budget[0] || provider.costPerMinute > filters.budget[1]) {
        return false;
      }

      // Filtre qualité
      if (filters.quality.length > 0 && !filters.quality.includes(provider.quality)) {
        return false;
      }

      // Filtre features
      if (filters.features.length > 0) {
        const hasFeature = filters.features.some(feature => {
          switch (feature) {
            case 'avatars': return provider.features.avatars;
            case 'voiceCloning': return provider.features.voiceCloning;
            case 'multiLanguage': return provider.features.multiLanguage;
            case 'interactivity': return provider.features.interactivity;
            case 'analytics': return provider.features.analytics;
            default: return false;
          }
        });
        if (!hasFeature) return false;
      }

      // Filtre cas d'usage
      if (filters.useCases.length > 0) {
        const hasUseCase = filters.useCases.some(useCase => 
          provider.useCases.includes(useCase)
        );
        if (!hasUseCase) return false;
      }

      // Filtre modèle business
      if (filters.businessModel.length > 0 && !filters.businessModel.includes(provider.businessModel)) {
        return false;
      }

      // Filtre complexité technique
      if (filters.techComplexity.length > 0 && !filters.techComplexity.includes(provider.techComplexity)) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      budget: [0, 50],
      maxDuration: '',
      quality: [],
      features: [],
      useCases: [],
      businessModel: [],
      techComplexity: [],
      processingTime: 60
    });
    setSelectedProviders([]);
  };

  const toggleProvider = (providerId) => {
    setSelectedProviders(prev => 
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const getProviderRecommendation = (provider) => {
    if (provider.id === 'demo-prototype') return { level: 'beginner', reason: 'Idéal pour débuter et tester' };
    if (provider.costPerMinute === 0) return { level: 'budget', reason: 'Solution gratuite' };
    if (provider.costPerMinute <= 10) return { level: 'balanced', reason: 'Bon rapport qualité/prix' };
    if (provider.quality === 'enterprise') return { level: 'premium', reason: 'Qualité professionnelle' };
    return { level: 'standard', reason: 'Solution standard' };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header avec filtres actifs */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Filter className="h-6 w-6 text-blue-600" />
            Sélection Providers SafeVision
          </h2>
          <p className="text-gray-600">
            {filteredProviders.length} provider{filteredProviders.length > 1 ? 's' : ''} correspondant{filteredProviders.length > 1 ? 's' : ''} aux critères
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Filtres avancés
          </Button>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Filtres principaux */}
      <Card>
        <CardHeader>
          <CardTitle>Critères de sélection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Budget par minute: {filters.budget[0]}$ - {filters.budget[1]}$
            </label>
            <Slider
              value={filters.budget}
              onValueChange={(value) => setFilters(prev => ({ ...prev, budget: value }))}
              max={50}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Gratuit</span>
              <span>Premium (50$/min)</span>
            </div>
          </div>

          {/* Qualité */}
          <div>
            <label className="block text-sm font-medium mb-3">Niveau de qualité</label>
            <div className="flex flex-wrap gap-2">
              {['prototype', 'standard', 'professional', 'creative', 'enterprise', 'cutting-edge'].map(quality => (
                <label key={quality} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.quality.includes(quality)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters(prev => ({ ...prev, quality: [...prev.quality, quality] }));
                      } else {
                        setFilters(prev => ({ ...prev, quality: prev.quality.filter(q => q !== quality) }));
                      }
                    }}
                  />
                  <span className="text-sm capitalize">{quality}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cas d'usage */}
          <div>
            <label className="block text-sm font-medium mb-3">Cas d'usage principaux</label>
            <div className="flex flex-wrap gap-2">
              {['prototypage', 'formation', 'demonstration-client', 'production-enterprise', 'contenu-creative'].map(useCase => (
                <label key={useCase} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.useCases.includes(useCase)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters(prev => ({ ...prev, useCases: [...prev.useCases, useCase] }));
                      } else {
                        setFilters(prev => ({ ...prev, useCases: prev.useCases.filter(uc => uc !== useCase) }));
                      }
                    }}
                  />
                  <span className="text-sm">{useCase.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <>
              <div>
                <label className="block text-sm font-medium mb-3">Fonctionnalités requises</label>
                <div className="flex flex-wrap gap-2">
                  {['avatars', 'voiceCloning', 'multiLanguage', 'interactivity', 'analytics'].map(feature => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={filters.features.includes(feature)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({ ...prev, features: [...prev.features, feature] }));
                          } else {
                            setFilters(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
                          }
                        }}
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Modèle tarifaire</label>
                <div className="flex flex-wrap gap-2">
                  {['freemium', 'subscription', 'per-minute', 'credit-system'].map(model => (
                    <label key={model} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={filters.businessModel.includes(model)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({ ...prev, businessModel: [...prev.businessModel, model] }));
                          } else {
                            setFilters(prev => ({ ...prev, businessModel: prev.businessModel.filter(bm => bm !== model) }));
                          }
                        }}
                      />
                      <span className="text-sm">{model}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Résultats filtrés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => {
          const recommendation = getProviderRecommendation(provider);
          const isSelected = selectedProviders.includes(provider.id);
          
          return (
            <Card 
              key={provider.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => toggleProvider(provider.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.logo}</span>
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={`mt-1 ${
                          recommendation.level === 'premium' ? 'bg-purple-100 text-purple-800' :
                          recommendation.level === 'balanced' ? 'bg-green-100 text-green-800' :
                          recommendation.level === 'budget' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {recommendation.reason}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="h-6 w-6 text-blue-600" />}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{provider.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>{provider.costPerMinute === 0 ? 'Gratuit' : `${provider.costPerMinute}$/min`}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Traitement: {provider.processingTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gray-400" />
                    <span>Max: {provider.maxDuration}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {provider.capabilities.slice(0, 3).map(cap => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {provider.features.avatars && <Users className="h-3 w-3" />}
                    {provider.features.multiLanguage && <span>🌍</span>}
                    {provider.features.analytics && <span>📊</span>}
                    {provider.apiRequired && <AlertCircle className="h-3 w-3 text-orange-500" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Résumé de sélection */}
      {selectedProviders.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">
                {selectedProviders.length} provider{selectedProviders.length > 1 ? 's' : ''} sélectionné{selectedProviders.length > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProviders.map(providerId => {
                const provider = PROVIDERS_DATABASE.find(p => p.id === providerId);
                return (
                  <Badge key={providerId} className="bg-green-100 text-green-800">
                    {provider.logo} {provider.name}
                  </Badge>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <Button className="bg-green-600 hover:bg-green-700">
                Configurer ces providers
              </Button>
              <Button variant="outline" onClick={() => setSelectedProviders([])}>
                Effacer sélection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProviderFilterInterface;