import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Structure pour les données crawlées
interface CrawledData {
  title: string;
  content: string;
  url: string;
  articleNumber?: string;
  section?: string;
  tags: string[];
}

// Fonction pour calculer le hash du contenu
function calculateContentHash(content: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  return Array.from(new Uint8Array(data)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Fonction pour extraire les données SST d'une page
async function extractSSTData(url: string, sourceType: string): Promise<CrawledData[]> {
  console.log(`Starting extraction from: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AgenticSST/1.0 (Compliance Bot; Quebec SST Monitoring)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Fetched ${html.length} characters from ${url}`);

    // Extraction basée sur le type de source
    const extractedData: CrawledData[] = [];

    if (sourceType === 'LMRSST' || sourceType === 'RSST') {
      // Extraction pour les lois du Québec
      extractedData.push(...extractLegislationData(html, url));
    } else if (sourceType === 'CNESST_GUIDE' || sourceType === 'CNESST_BULLETIN') {
      // Extraction pour les guides CNESST
      extractedData.push(...extractCNESSTData(html, url));
    } else if (sourceType === 'PUBLICATION_QUEBEC') {
      // Extraction pour Publications Québec
      extractedData.push(...extractPublicationData(html, url));
    }

    console.log(`Extracted ${extractedData.length} items from ${url}`);
    return extractedData;

  } catch (error) {
    console.error(`Error extracting data from ${url}:`, error);
    return [];
  }
}

// Extraction spécialisée pour la législation
function extractLegislationData(html: string, url: string): CrawledData[] {
  const results: CrawledData[] = [];
  
  // Regex pour extraire les articles de loi
  const articleRegex = /<div[^>]*class="[^"]*article[^"]*"[^>]*>(.*?)<\/div>/gis;
  const titleRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  const contentRegex = /<p[^>]*>(.*?)<\/p>/gi;
  
  let match;
  let articleNumber = 1;
  
  // Extraction des articles
  while ((match = articleRegex.exec(html)) !== null) {
    const articleHtml = match[1];
    
    // Extraire le titre
    const titleMatch = titleRegex.exec(articleHtml);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : `Article ${articleNumber}`;
    
    // Extraire le contenu
    let content = '';
    let contentMatch;
    while ((contentMatch = contentRegex.exec(articleHtml)) !== null) {
      content += contentMatch[1].replace(/<[^>]*>/g, '').trim() + '\n';
    }
    
    if (content.trim()) {
      results.push({
        title,
        content: content.trim(),
        url: `${url}#article-${articleNumber}`,
        articleNumber: articleNumber.toString(),
        section: extractSection(articleHtml),
        tags: extractTags(title, content, 'LEGISLATION')
      });
    }
    
    articleNumber++;
  }
  
  return results;
}

// Extraction spécialisée pour CNESST
function extractCNESSTData(html: string, url: string): CrawledData[] {
  const results: CrawledData[] = [];
  
  // Regex pour les guides CNESST
  const guideRegex = /<div[^>]*class="[^"]*guide[^"]*"[^>]*>(.*?)<\/div>/gis;
  const sectionRegex = /<section[^>]*>(.*?)<\/section>/gis;
  
  let match;
  let sectionNumber = 1;
  
  while ((match = sectionRegex.exec(html)) !== null) {
    const sectionHtml = match[1];
    
    const title = extractTitle(sectionHtml) || `Section ${sectionNumber}`;
    const content = extractCleanText(sectionHtml);
    
    if (content.length > 100) { // Filtrer le contenu trop court
      results.push({
        title,
        content,
        url: `${url}#section-${sectionNumber}`,
        section: `Section ${sectionNumber}`,
        tags: extractTags(title, content, 'CNESST')
      });
    }
    
    sectionNumber++;
  }
  
  return results;
}

// Extraction pour Publications Québec
function extractPublicationData(html: string, url: string): CrawledData[] {
  const results: CrawledData[] = [];
  
  // Logique d'extraction pour Publications Québec
  const docRegex = /<div[^>]*class="[^"]*document[^"]*"[^>]*>(.*?)<\/div>/gis;
  
  let match;
  let docNumber = 1;
  
  while ((match = docRegex.exec(html)) !== null) {
    const docHtml = match[1];
    
    const title = extractTitle(docHtml) || `Document ${docNumber}`;
    const content = extractCleanText(docHtml);
    
    if (content.length > 200) {
      results.push({
        title,
        content,
        url: `${url}#doc-${docNumber}`,
        tags: extractTags(title, content, 'PUBLICATION')
      });
    }
    
    docNumber++;
  }
  
  return results;
}

// Utilitaires d'extraction
function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
  return titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : null;
}

function extractCleanText(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSection(html: string): string | null {
  const sectionMatch = html.match(/chapitre|section|titre\s+([IVX\d]+)/i);
  return sectionMatch ? sectionMatch[0] : null;
}

function extractTags(title: string, content: string, sourceType: string): string[] {
  const tags = [sourceType.toLowerCase()];
  
  // Tags basés sur le contenu
  const sstKeywords = [
    'sécurité', 'santé', 'travail', 'accident', 'prévention', 'formation',
    'inspection', 'conformité', 'risque', 'protection', 'équipement',
    'procédure', 'urgence', 'danger', 'toxique', 'chimique'
  ];
  
  const text = (title + ' ' + content).toLowerCase();
  
  sstKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  return [...new Set(tags)]; // Éliminer les doublons
}

// Fonction principale de crawling
async function crawlSource(sourceId: string) {
  console.log(`Starting crawl for source: ${sourceId}`);
  
  try {
    // Récupérer les informations de la source
    const { data: source, error: sourceError } = await supabase
      .from('sst_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      throw new Error(`Source not found: ${sourceError?.message}`);
    }

    console.log(`Crawling source: ${source.name} (${source.url})`);

    // Extraire les données
    const extractedData = await extractSSTData(source.url, source.source_type);
    
    if (extractedData.length === 0) {
      console.log(`No data extracted from ${source.url}`);
      return { success: true, message: 'No new content found', extracted: 0 };
    }

    let newCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;

    // Traiter chaque élément extrait
    for (const item of extractedData) {
      const contentHash = calculateContentHash(item.content);
      
      // Vérifier si le contenu existe déjà
      const { data: existing } = await supabase
        .from('sst_crawled_content')
        .select('id, content_hash, content')
        .eq('source_id', sourceId)
        .eq('url', item.url)
        .single();

      if (existing) {
        if (existing.content_hash !== contentHash) {
          // Contenu modifié - mettre à jour
          const { error: updateError } = await supabase
            .from('sst_crawled_content')
            .update({
              ...item,
              content_hash: contentHash,
              last_updated_at: new Date().toISOString(),
              crawled_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (!updateError) {
            // Enregistrer le changement
            await supabase
              .from('sst_content_changes')
              .insert({
                content_id: existing.id,
                change_type: 'UPDATED',
                previous_content: existing.content,
                new_content: item.content,
                summary: `Contenu mis à jour: ${item.title}`
              });
            
            updatedCount++;
            console.log(`Updated: ${item.title}`);
          }
        } else {
          unchangedCount++;
        }
      } else {
        // Nouveau contenu - insérer
        const { data: inserted, error: insertError } = await supabase
          .from('sst_crawled_content')
          .insert({
            source_id: sourceId,
            ...item,
            content_hash: contentHash
          })
          .select('id')
          .single();

        if (!insertError && inserted) {
          // Enregistrer comme nouveau
          await supabase
            .from('sst_content_changes')
            .insert({
              content_id: inserted.id,
              change_type: 'NEW',
              new_content: item.content,
              summary: `Nouveau contenu ajouté: ${item.title}`
            });
          
          newCount++;
          console.log(`Added: ${item.title}`);
        }
      }
    }

    // Mettre à jour la date de dernier crawl
    await supabase
      .from('sst_sources')
      .update({ last_crawled_at: new Date().toISOString() })
      .eq('id', sourceId);

    console.log(`Crawl completed - New: ${newCount}, Updated: ${updatedCount}, Unchanged: ${unchangedCount}`);

    return {
      success: true,
      message: `Crawl completed successfully`,
      extracted: extractedData.length,
      new: newCount,
      updated: updatedCount,
      unchanged: unchangedCount
    };

  } catch (error) {
    console.error(`Error crawling source ${sourceId}:`, error);
    return {
      success: false,
      error: error.message,
      extracted: 0
    };
  }
}

// Handler principal
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, sourceId, sourceIds } = await req.json();

    console.log(`SST Crawler called with action: ${action}`);

    if (action === 'crawl_source' && sourceId) {
      const result = await crawlSource(sourceId);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'crawl_all' || (action === 'crawl_sources' && sourceIds)) {
      const sources = sourceIds || [];
      
      // Si pas de sources spécifiées, crawler toutes les sources actives
      if (sources.length === 0) {
        const { data: activeSources } = await supabase
          .from('sst_sources')
          .select('id')
          .eq('is_active', true);
        
        sources.push(...(activeSources?.map(s => s.id) || []));
      }

      const results = [];
      
      for (const id of sources) {
        const result = await crawlSource(id);
        results.push({ sourceId: id, ...result });
      }

      const totalNew = results.reduce((sum, r) => sum + (r.new || 0), 0);
      const totalUpdated = results.reduce((sum, r) => sum + (r.updated || 0), 0);
      const totalExtracted = results.reduce((sum, r) => sum + (r.extracted || 0), 0);

      return new Response(JSON.stringify({
        success: true,
        message: `Crawl terminé pour ${sources.length} sources`,
        totalExtracted,
        totalNew,
        totalUpdated,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Action non supportée. Utilisez: crawl_source, crawl_sources ou crawl_all' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('SST Crawler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});