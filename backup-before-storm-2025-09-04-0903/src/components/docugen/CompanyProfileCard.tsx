// Carte de profil d'entreprise améliorée
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Building2, Users, MapPin, HelpCircle, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompanyProfile } from '@/types/docugen';
import { getSuggestedScianCodes } from '@/data/scianMapping';

interface CompanyProfileCardProps {
  profile: CompanyProfile;
  onProfileChange: (field: keyof CompanyProfile, value: any) => void;
  errors?: Record<string, string>;
}

const ProfileCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, icon, children, className }) => (
  <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        {icon}
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {children}
    </CardContent>
  </Card>
);

const FieldWithValidation: React.FC<{
  label: string;
  required?: boolean;
  tooltip?: string;
  error?: string;
  value?: string | number;
  children: React.ReactNode;
}> = ({ label, required, tooltip, error, value, children }) => {
  const isValid = !error && value !== undefined && value !== '';
  const isEmpty = !value || value === '';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {required && !isEmpty && (
          <Badge 
            variant={isValid ? "default" : "destructive"}
            className="h-5 text-xs flex items-center gap-1"
          >
            {isValid ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Valide
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                Erreur
              </>
            )}
          </Badge>
        )}
      </div>
      {children}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export const CompanyProfileCard: React.FC<CompanyProfileCardProps> = ({
  profile,
  onProfileChange,
  errors = {}
}) => {
  const [suggestedScianCodes, setSuggestedScianCodes] = useState<Array<{code: string, label: string}>>([]);
  const [showScianSuggestion, setShowScianSuggestion] = useState(false);

  // Auto-suggestion des codes SCIAN selon le secteur
  useEffect(() => {
    if (profile.sector) {
      const suggestions = getSuggestedScianCodes(profile.sector);
      setSuggestedScianCodes(suggestions);
      setShowScianSuggestion(suggestions.length > 0 && !profile.scianCode);
    } else {
      setSuggestedScianCodes([]);
      setShowScianSuggestion(false);
    }
  }, [profile.sector, profile.scianCode]);

  const handleScianSuggestion = (scianCode: string) => {
    onProfileChange('scianCode', scianCode);
    setShowScianSuggestion(false);
  };
  const sectors = [
    { value: 'construction', label: 'Construction' },
    { value: 'manufacturier', label: 'Manufacturier' },
    { value: 'services', label: 'Services' },
    { value: 'commerce', label: 'Commerce' },
    { value: 'transport', label: 'Transport' },
    { value: 'sante', label: 'Santé' },
    { value: 'education', label: 'Éducation' },
    { value: 'autre', label: 'Autre' }
  ];

  const riskLevels = [
    { value: 'low', label: 'Faible', color: 'bg-green-500' },
    { value: 'medium', label: 'Moyen', color: 'bg-yellow-500' },
    { value: 'high', label: 'Élevé', color: 'bg-orange-500' },
    { value: 'critical', label: 'Critique', color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Informations de base */}
      <ProfileCard
        title="Identification"
        description="Informations de base de votre entreprise"
        icon={<Building2 className="h-5 w-5 text-primary" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldWithValidation
            label="Nom de l'entreprise"
            required
            tooltip="Raison sociale officielle de votre entreprise"
            error={errors.name}
            value={profile.name}
          >
            <Input
              placeholder="Ex: Entreprise ABC Inc."
              value={profile.name}
              onChange={(e) => onProfileChange('name', e.target.value)}
              className={cn(
                "transition-all duration-200",
                errors.name ? "border-destructive focus:border-destructive" : ""
              )}
            />
          </FieldWithValidation>

          <FieldWithValidation
            label="Adresse principale"
            tooltip="Adresse du siège social ou établissement principal"
            value={profile.address}
          >
            <Input
              placeholder="Ex: 123 Rue Example, Montréal, QC"
              value={profile.address || ''}
              onChange={(e) => onProfileChange('address', e.target.value)}
            />
          </FieldWithValidation>
        </div>
      </ProfileCard>

      {/* Effectif et secteur */}
      <ProfileCard
        title="Classification"
        description="Taille, secteur d'activité et niveau de risque"
        icon={<Users className="h-5 w-5 text-primary" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FieldWithValidation
            label="Nombre d'employés"
            required
            tooltip="Nombre total d'employés (détermine les obligations LMRSST)"
            error={errors.size}
            value={profile.size}
          >
            <Input
              type="number"
              min="1"
              placeholder="Ex: 25"
              value={profile.size || ''}
              onChange={(e) => onProfileChange('size', parseInt(e.target.value) || 0)}
              className={cn(
                errors.size ? "border-destructive focus:border-destructive" : ""
              )}
            />
          </FieldWithValidation>

          <FieldWithValidation
            label="Secteur d'activité"
            required
            tooltip="Secteur principal selon la classification SCIAN"
            error={errors.sector}
            value={profile.sector}
          >
            <Select
              value={profile.sector}
              onValueChange={(value) => onProfileChange('sector', value)}
            >
              <SelectTrigger className={cn(
                errors.sector ? "border-destructive focus:border-destructive" : ""
              )}>
                <SelectValue placeholder="Sélectionner un secteur" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector.value} value={sector.value}>
                    {sector.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWithValidation>

          <FieldWithValidation
            label="Niveau de risque"
            tooltip="Évaluation du niveau de risque SST de votre secteur"
            value={profile.riskLevel}
          >
            <Select
              value={profile.riskLevel || ''}
              onValueChange={(value) => onProfileChange('riskLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Évaluer le risque" />
              </SelectTrigger>
              <SelectContent>
                {riskLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", level.color)} />
                      {level.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWithValidation>
        </div>
      </ProfileCard>

      {/* Informations optionnelles */}
      <ProfileCard
        title="Détails supplémentaires"
        description="Informations optionnelles pour personnaliser les documents"
        icon={<MapPin className="h-5 w-5 text-primary" />}
        className="bg-muted/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <FieldWithValidation
              label="Code SCIAN"
              tooltip="Code SCIAN spécifique (optionnel)"
              value={profile.scianCode}
            >
              <Input
                placeholder="Ex: 236220"
                value={profile.scianCode || ''}
                onChange={(e) => onProfileChange('scianCode', e.target.value)}
              />
            </FieldWithValidation>

            {/* Suggestions SCIAN automatiques */}
            {showScianSuggestion && suggestedScianCodes.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">Codes SCIAN suggérés pour {profile.sector}</p>
                      <p className="text-xs text-muted-foreground">Cliquez pour appliquer automatiquement</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {suggestedScianCodes.slice(0, 3).map((suggestion) => (
                      <button
                        key={suggestion.code}
                        onClick={() => handleScianSuggestion(suggestion.code)}
                        className="w-full text-left p-2 rounded-md hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
                      >
                        <span className="font-mono text-sm font-medium text-primary">{suggestion.code}</span>
                        <span className="text-xs text-muted-foreground ml-2">{suggestion.label}</span>
                      </button>
                    ))}
                    {suggestedScianCodes.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-1">
                        +{suggestedScianCodes.length - 3} autres codes disponibles
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <FieldWithValidation
            label="Activités spécifiques"
            tooltip="Activités particulières nécessitant une attention SST"
            value={profile.specificActivities?.join(', ')}
          >
            <Input
              placeholder="Ex: Soudure, Travail en hauteur"
              value={profile.specificActivities?.join(', ') || ''}
              onChange={(e) => 
                onProfileChange('specificActivities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))
              }
            />
          </FieldWithValidation>

          <FieldWithValidation
            label="Responsable du registre"
            tooltip="Personne chargée de la tenue du registre (requis pour certains documents)"
            value={profile.responsible_person}
          >
            <Input
              placeholder="Ex: Jean Dupont, Superviseur SST"
              value={profile.responsible_person || ''}
              onChange={(e) => onProfileChange('responsible_person', e.target.value)}
            />
          </FieldWithValidation>

          {/* Membres du comité SST - pour entreprises de 20+ employés */}
          {profile.size >= 20 && (
            <FieldWithValidation
              label="Membres du comité SST"
              tooltip="Membres du comité paritaire de santé et sécurité (requis pour les entreprises de 20 employés et plus)"
              value={profile.committee_members?.join(', ')}
            >
              <div className="space-y-2">
                {(profile.committee_members || []).map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={member}
                      onChange={(e) => {
                        const newMembers = [...(profile.committee_members || [])];
                        newMembers[index] = e.target.value;
                        onProfileChange('committee_members', newMembers);
                      }}
                      placeholder="Ex: Marie Tremblay - Représentante employée"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newMembers = (profile.committee_members || []).filter((_, i) => i !== index);
                        onProfileChange('committee_members', newMembers);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onProfileChange('committee_members', [...(profile.committee_members || []), '']);
                  }}
                >
                  + Ajouter un membre
                </Button>
              </div>
            </FieldWithValidation>
          )}
        </div>
      </ProfileCard>
    </div>
  );
};