import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  FileText, 
  CheckCircle,
  AlertCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface UploadedFile {
  file: File;
  preview: any[];
  status: 'pending' | 'uploading' | 'success' | 'error';
  recordsCount?: number;
}

export function ManualDataUpload() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type === 'application/json' || file.type === 'text/csv' || file.name.endsWith('.json') || file.name.endsWith('.csv')) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            let data: any[];
            
            if (file.name.endsWith('.json')) {
              data = JSON.parse(e.target?.result as string);
            } else {
              // Parse CSV basique
              const csvText = e.target?.result as string;
              const lines = csvText.split('\n').filter(line => line.trim());
              const headers = lines[0].split(',');
              data = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, index) => {
                  obj[header.trim()] = values[index]?.trim() || '';
                  return obj;
                }, {} as any);
              });
            }

            const newFile: UploadedFile = {
              file,
              preview: data.slice(0, 5), // Aperçu des 5 premiers enregistrements
              status: 'pending',
              recordsCount: data.length
            };

            setUploadedFiles(prev => [...prev, newFile]);
          } catch (error) {
            toast({
              title: "❌ Erreur de lecture",
              description: `Impossible de lire le fichier ${file.name}`,
              variant: "destructive"
            });
          }
        };
        
        reader.readAsText(file);
      } else {
        toast({
          title: "❌ Format non supporté",
          description: "Seuls les fichiers JSON et CSV sont acceptés",
          variant: "destructive"
        });
      }
    });
  }, [toast]);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Aucun fichier",
        description: "Veuillez d'abord sélectionner des fichiers",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadFile = uploadedFiles[i];
        
        // Mise à jour du statut
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploading' } : f
        ));

        // Lecture du fichier complet
        const reader = new FileReader();
        const fileData = await new Promise<any[]>((resolve, reject) => {
          reader.onload = (e) => {
            try {
              let data: any[];
              
              if (uploadFile.file.name.endsWith('.json')) {
                data = JSON.parse(e.target?.result as string);
              } else {
                // Parse CSV
                const csvText = e.target?.result as string;
                const lines = csvText.split('\n').filter(line => line.trim());
                const headers = lines[0].split(',');
                data = lines.slice(1).map(line => {
                  const values = line.split(',');
                  return headers.reduce((obj, header, index) => {
                    obj[header.trim()] = values[index]?.trim() || '';
                    return obj;
                  }, {} as any);
                });
              }
              resolve(data);
            } catch (error) {
              reject(error);
            }
          };
          reader.readAsText(uploadFile.file);
        });

        // Envoi à l'API
        const { data, error } = await supabase.functions.invoke('manual-data-upload', {
          body: {
            action: 'process_manual_upload',
            fileName: uploadFile.file.name,
            fileData: fileData,
            metadata: {
              uploadedAt: new Date().toISOString(),
              originalName: uploadFile.file.name,
              recordsCount: fileData.length
            }
          }
        });

        if (error) throw error;

        // Mise à jour du statut de succès
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success' } : f
        ));

        setUploadProgress(((i + 1) / uploadedFiles.length) * 100);
      }

      toast({
        title: "✅ Upload terminé",
        description: `${uploadedFiles.length} fichier(s) traité(s) avec succès`
      });

    } catch (error) {
      console.error('Erreur upload:', error);
      toast({
        title: "❌ Erreur d'upload",
        description: "Impossible de traiter les fichiers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload manuel de données
            </CardTitle>
            <CardDescription>
              Importez vos propres fichiers CSV ou JSON de lésions professionnelles
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            CSV / JSON
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zone d'upload */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Sélectionner des fichiers</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formats acceptés: JSON, CSV. Taille max: 10MB par fichier.
            </p>
          </div>

          {/* Aperçu des fichiers uploadés */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Fichiers sélectionnés</h4>
              {uploadedFiles.map((uploadFile, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="font-medium">{uploadFile.file.name}</span>
                      <Badge variant="secondary">
                        {uploadFile.recordsCount} enregistrements
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'pending' && (
                        <Badge variant="outline">En attente</Badge>
                      )}
                      {uploadFile.status === 'uploading' && (
                        <Badge variant="default">Traitement...</Badge>
                      )}
                      {uploadFile.status === 'success' && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Terminé
                        </Badge>
                      )}
                      {uploadFile.status === 'error' && (
                        <Badge variant="destructive">Erreur</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Aperçu des données */}
                  {uploadFile.preview.length > 0 && (
                    <div className="bg-accent/50 rounded p-3 text-xs">
                      <p className="font-medium mb-1">Aperçu (5 premiers enregistrements):</p>
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(uploadFile.preview, null, 2)}
                      </pre>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Barre de progression */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Traitement en cours...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={processUpload} 
              disabled={isLoading || uploadedFiles.length === 0}
              className="flex items-center gap-2"
            >
              <Upload className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Traiter les fichiers
            </Button>
          </div>
        </div>

        {/* Informations sur le format */}
        <div className="p-4 bg-accent/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Format de données attendu</p>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>CSV:</strong> En-têtes requis: annee, secteur_activite, type_lesion, nb_cas, nb_jours_perdus, cout_total</p>
                <p><strong>JSON:</strong> Array d'objets avec les mêmes propriétés</p>
                <p><strong>Champs optionnels:</strong> scian_code, partie_lesee, nature_lesion, agent_causal, evenement_accident, gravite</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}