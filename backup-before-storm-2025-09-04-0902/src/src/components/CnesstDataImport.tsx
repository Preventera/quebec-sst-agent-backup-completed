import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  Database, 
  Calendar,
  Building2,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function CnesstDataImport() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    secteur: '',
    scianCode: '',
    anneeDebut: '2020',
    anneeFin: '2024',
    typeImport: 'api' // 'api' ou 'csv'
  });

  const handleDirectImport = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Import CNESST en cours...",
        description: "Récupération directe depuis la source officielle"
      });

      const { data, error } = await supabase.functions.invoke('cnesst-data-import', {
        body: {
          action: 'import_direct',
          filters: {
            secteur: filters.secteur || undefined,
            scianCode: filters.scianCode || undefined,
            anneeDebut: parseInt(filters.anneeDebut),
            anneeFin: parseInt(filters.anneeFin),
            typeImport: filters.typeImport
          }
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Import CNESST réussi",
        description: `${data.recordsImported} nouveaux enregistrements importés`
      });

    } catch (error) {
      console.error('Erreur import CNESST:', error);
      toast({
        title: "❌ Erreur d'import",
        description: "Impossible d'importer depuis CNESST",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const secteurs = [
    'Agriculture, foresterie, pêche et chasse',
    'Extraction minière, exploitation en carrière, et extraction de pétrole et de gaz',
    'Services publics',
    'Construction',
    'Fabrication',
    'Commerce de gros',
    'Commerce de détail',
    'Transport et entreposage',
    'Industrie de l\'information et industrie culturelle',
    'Finance et assurances',
    'Services immobiliers et services de location et de location à bail',
    'Services professionnels, scientifiques et techniques',
    'Gestion de sociétés et d\'entreprises',
    'Services administratifs, services de soutien, services de gestion des déchets et services d\'assainissement',
    'Services d\'enseignement',
    'Soins de santé et assistance sociale',
    'Arts, spectacles et loisirs',
    'Services d\'hébergement et de restauration',
    'Autres services (sauf les administrations publiques)',
    'Administrations publiques'
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Import direct CNESST
            </CardTitle>
            <CardDescription>
              Récupération directe des données officielles de la CNESST
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Source officielle
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtres d'import */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="secteur">Secteur d'activité</Label>
            <Select value={filters.secteur} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, secteur: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Tous les secteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les secteurs</SelectItem>
                {secteurs.map((secteur) => (
                  <SelectItem key={secteur} value={secteur}>
                    {secteur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scianCode">Code SCIAN (optionnel)</Label>
            <Input
              id="scianCode"
              placeholder="ex: 236220"
              value={filters.scianCode}
              onChange={(e) => setFilters(prev => ({ ...prev, scianCode: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anneeDebut">Année de début</Label>
            <Select value={filters.anneeDebut} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, anneeDebut: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => 2024 - i).map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anneeFin">Année de fin</Label>
            <Select value={filters.anneeFin} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, anneeFin: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => 2024 - i).map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleDirectImport} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Importer depuis CNESST
          </Button>
        </div>

        {/* Informations */}
        <div className="p-4 bg-accent/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Source de données</p>
              <p className="text-muted-foreground">
                Données officielles de la Commission des normes, de l'équité, de la santé et de la sécurité du travail (CNESST) du Québec.
              </p>
              <p className="text-muted-foreground">
                Import direct via API officielle ou fichiers CSV publics.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}