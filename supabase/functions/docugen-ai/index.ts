import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentGenerationRequest {
  templateId: string;
  companyProfile: {
    name: string;
    size: number;
    sector: string;
    scianCode?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    specificActivities?: string[];
    existingMeasures?: string[];
  };
  diagnosticData?: any;
  scianActions?: string[];
  placeholders: Record<string, any>;
  options: {
    language: 'fr' | 'en' | 'es';
    includeSignatures: boolean;
    includeTimestamp: boolean;
    generateTOC: boolean;
    addLegalHyperlinks: boolean;
  };
}

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const request: DocumentGenerationRequest = await req.json();
    console.log('DocuGen AI request:', request);

    // Préparer le contexte pour Claude
    const contextPrompt = `
Vous êtes DocuGen, l'assistant IA spécialisé en génération de documents SST conformes aux lois québécoises.

CONTEXTE ENTREPRISE:
- Nom: ${request.companyProfile.name}
- Taille: ${request.companyProfile.size} employés
- Secteur: ${request.companyProfile.sector}
- Code SCIAN: ${request.companyProfile.scianCode || 'Non spécifié'}
- Niveau de risque: ${request.companyProfile.riskLevel}
- Activités spécifiques: ${request.companyProfile.specificActivities?.join(', ') || 'Aucune'}
- Mesures existantes: ${request.companyProfile.existingMeasures?.join(', ') || 'Aucune'}

DONNÉES DIAGNOSTIQUES:
${JSON.stringify(request.diagnosticData, null, 2)}

ACTIONS SCIAN:
${request.scianActions?.join('\n') || 'Aucune action SCIAN spécifiée'}

PLACEHOLDERS À REMPLIR:
${JSON.stringify(request.placeholders, null, 2)}

INSTRUCTIONS:
1. Générez un contenu professionnel en français québécois
2. Respectez scrupuleusement les obligations légales LMRSST/LSST
3. Adaptez le niveau de complexité selon la taille de l'entreprise
4. Intégrez les données diagnostiques existantes
5. Proposez des mesures concrètes et réalisables
6. Utilisez un langage clair et accessible
7. Structurez le contenu de manière logique

STYLE:
- Ton professionnel mais accessible
- Phrases courtes et claires
- Évitez le jargon juridique excessif
- Incluez des exemples concrets
- Utilisez des listes à puces pour la clarté

Générez maintenant le contenu documentaire pour le template: ${request.templateId}
`;

    // Appel à Claude 4 Sonnet
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: contextPrompt
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${claudeResponse.status} - ${errorText}`);
    }

    const claudeResult: ClaudeResponse = await claudeResponse.json();
    console.log('Claude response:', claudeResult);

    const generatedContent = claudeResult.content[0]?.text || '';

    // Post-traitement du contenu généré
    const processedContent = await postProcessContent(generatedContent, request);

    // Préparation de la réponse
    const response = {
      success: true,
      generatedContent: processedContent,
      metadata: {
        templateId: request.templateId,
        company: request.companyProfile.name,
        generatedAt: new Date().toISOString(),
        language: request.options.language,
        wordCount: processedContent.split(' ').length,
        aiModel: 'claude-3-5-sonnet-20241022'
      },
      qualityChecks: await performQualityChecks(processedContent, request),
      traceability: {
        documentHash: await generateHash(processedContent),
        sourceDataHash: await generateHash(JSON.stringify(request)),
        generationTimestamp: new Date().toISOString(),
        aiModel: 'claude-3-5-sonnet-20241022'
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in docugen-ai function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function postProcessContent(content: string, request: DocumentGenerationRequest): Promise<string> {
  let processed = content;
  
  // Ajout des timestamps si requis
  if (request.options.includeTimestamp) {
    const timestamp = new Date().toLocaleDateString('fr-CA');
    processed = processed.replace(/\{DATE_GENERATION\}/g, timestamp);
  }

  // Ajout des hyperliens légaux si requis
  if (request.options.addLegalHyperlinks) {
    processed = processed.replace(
      /article (\d+)/gi,
      '<a href="https://legisquebec.gouv.qc.ca/fr/document/lc/S-2.1#se:$1" target="_blank">article $1</a>'
    );
  }

  // Remplacement des placeholders personnalisés
  Object.entries(request.placeholders).forEach(([key, value]) => {
    const placeholder = `{${key.toUpperCase()}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return processed;
}

async function performQualityChecks(content: string, request: DocumentGenerationRequest) {
  const checks = [];

  // Vérification présence nom entreprise
  if (content.includes(request.companyProfile.name)) {
    checks.push({
      checkId: 'company_name',
      checkName: 'Nom de l\'entreprise présent',
      status: 'pass',
      message: 'Le nom de l\'entreprise est correctement inclus'
    });
  } else {
    checks.push({
      checkId: 'company_name',
      checkName: 'Nom de l\'entreprise présent',
      status: 'fail',
      message: 'Le nom de l\'entreprise est manquant'
    });
  }

  // Vérification longueur minimale
  const wordCount = content.split(' ').length;
  if (wordCount >= 200) {
    checks.push({
      checkId: 'content_length',
      checkName: 'Longueur du contenu',
      status: 'pass',
      message: `Contenu suffisant (${wordCount} mots)`
    });
  } else {
    checks.push({
      checkId: 'content_length',
      checkName: 'Longueur du contenu',
      status: 'warning',
      message: `Contenu court (${wordCount} mots)`
    });
  }

  // Vérification présence articles légaux
  const legalReferences = content.match(/article \d+/gi);
  if (legalReferences && legalReferences.length > 0) {
    checks.push({
      checkId: 'legal_references',
      checkName: 'Références légales',
      status: 'pass',
      message: `${legalReferences.length} références légales trouvées`
    });
  } else {
    checks.push({
      checkId: 'legal_references',
      checkName: 'Références légales',
      status: 'warning',
      message: 'Aucune référence légale explicite trouvée'
    });
  }

  return checks;
}

async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}