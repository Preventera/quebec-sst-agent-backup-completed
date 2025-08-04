import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@1.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize clients
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const firecrawl = new FirecrawlApp({
  apiKey: Deno.env.get('FIRECRAWL_API_KEY') ?? ''
});

// ========== INTERFACES & TYPES ==========

interface CrawledData {
  title: string;
  content: string;
  url: string;
  articleNumber?: string;
  section?: string;
  tags: string[];
  sourceType?: string;
  sector?: string;
  importance?: number;
  keywords?: string[];
  semanticCategory?: string;
}

interface AdvancedCrawlOptions {
  maxDepth?: number;
  includeSubdomains?: boolean;
  usePDFExtraction?: boolean;
  useFirecrawl?: boolean;
  semanticProcessing?: boolean;
  sectorClassification?: boolean;
}

interface NotificationData {
  type: 'NEW' | 'UPDATED' | 'CRITICAL_CHANGE';
  title: string;
  content: string;
  url: string;
  importance: number;
  affectedSectors?: string[];
}

// ========== SEMANTIC PROCESSING ==========

class SemanticProcessor {
  private static readonly SST_KEYWORDS = {
    'sécurité': ['sécurité', 'securité', 'safety', 'protection', 'prévention'],
    'santé': ['santé', 'health', 'médical', 'maladie', 'blessure'],
    'travail': ['travail', 'work', 'emploi', 'employé', 'travailleur'],
    'équipement': ['équipement', 'EPI', 'protection individuelle', 'casque', 'gants'],
    'formation': ['formation', 'training', 'éducation', 'sensibilisation'],
    'inspection': ['inspection', 'audit', 'vérification', 'contrôle'],
    'urgence': ['urgence', 'emergency', 'évacuation', 'secours'],
    'chimique': ['chimique', 'toxique', 'substance', 'produit dangereux'],
    'construction': ['construction', 'chantier', 'bâtiment', 'échafaudage'],
    'manufacturing': ['manufacturing', 'usine', 'production', 'machine']
  };

  private static readonly SECTOR_MAPPING = {
    '23': 'construction',
    '31-33': 'manufacturing', 
    '44-45': 'retail',
    '48-49': 'transport',
    '62': 'healthcare',
    '72': 'hospitality'
  };

  static extractKeywords(text: string): string[] {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const keywords = new Set<string>();

    for (const [category, terms] of Object.entries(this.SST_KEYWORDS)) {
      if (terms.some(term => text.toLowerCase().includes(term))) {
        keywords.add(category);
      }
    }

    return Array.from(keywords);
  }

  static categorizeContent(title: string, content: string): string {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('loi') || text.includes('règlement') || text.includes('article')) {
      return 'legislation';
    }
    if (text.includes('guide') || text.includes('procédure') || text.includes('instruction')) {
      return 'guide';
    }
    if (text.includes('formation') || text.includes('éducation')) {
      return 'formation';
    }
    if (text.includes('statistique') || text.includes('rapport') || text.includes('données')) {
      return 'statistics';
    }
    if (text.includes('alerte') || text.includes('avis') || text.includes('bulletin')) {
      return 'alert';
    }
    
    return 'general';
  }

  static classifySector(content: string, scianCode?: string): string {
    if (scianCode && this.SECTOR_MAPPING[scianCode]) {
      return this.SECTOR_MAPPING[scianCode];
    }

    const text = content.toLowerCase();
    
    if (text.includes('construction') || text.includes('chantier')) return 'construction';
    if (text.includes('manufacture') || text.includes('usine')) return 'manufacturing';
    if (text.includes('santé') || text.includes('hôpital')) return 'healthcare';
    if (text.includes('transport') || text.includes('camion')) return 'transport';
    
    return 'general';
  }

  static calculateImportance(title: string, content: string, sourceType: string): number {
    let importance = 1;
    const text = (title + ' ' + content).toLowerCase();

    // Source type importance
    if (sourceType.includes('legislation')) importance += 3;
    if (sourceType.includes('cnesst')) importance += 2;
    if (sourceType.includes('regulation')) importance += 2;

    // Content importance indicators
    if (text.includes('obligatoire') || text.includes('mandatory')) importance += 2;
    if (text.includes('sanction') || text.includes('amende')) importance += 2;
    if (text.includes('nouveau') || text.includes('modifi')) importance += 1;
    if (text.includes('urgent') || text.includes('immédiat')) importance += 3;

    return Math.min(importance, 5); // Cap at 5
  }
}

// ========== PDF PROCESSING ==========

class PDFProcessor {
  static async extractTextFromPDF(url: string): Promise<string> {
    try {
      console.log(`Extracting PDF content from: ${url}`);
      
      // Use Firecrawl for PDF extraction if available
      if (Deno.env.get('FIRECRAWL_API_KEY')) {
        const result = await firecrawl.scrapeUrl(url, {
          formats: ['markdown'],
          includeTags: ['text'],
          excludeTags: ['nav', 'footer', 'header']
        });

        if (result.success && result.data?.markdown) {
          return result.data.markdown;
        }
      }

      // Fallback: Try to download and process PDF manually
      const response = await fetch(url);
      if (!response.ok) throw new Error(`PDF fetch failed: ${response.status}`);

      // For now, return a placeholder - in production, you'd use a PDF parsing library
      return `PDF content from ${url} - Content extraction requires additional processing`;
      
    } catch (error) {
      console.error('PDF extraction error:', error);
      return '';
    }
  }
}

// ========== ADVANCED CRAWLER ==========

class AdvancedCrawler {
  static async crawlWithDepth(
    startUrl: string, 
    sourceType: string, 
    options: AdvancedCrawlOptions = {}
  ): Promise<CrawledData[]> {
    const {
      maxDepth = 3,
      includeSubdomains = false,
      usePDFExtraction = true,
      useFirecrawl = false,
      semanticProcessing = true,
      sectorClassification = true
    } = options;

    const visited = new Set<string>();
    const results: CrawledData[] = [];
    const queue: Array<{url: string, depth: number}> = [{url: startUrl, depth: 0}];

    while (queue.length > 0 && results.length < 100) { // Limit total results
      const {url, depth} = queue.shift()!;
      
      if (visited.has(url) || depth > maxDepth) continue;
      visited.add(url);

      console.log(`Crawling ${url} at depth ${depth}`);

      try {
        let extractedData: CrawledData[];

        if (url.endsWith('.pdf') && usePDFExtraction) {
          const pdfContent = await PDFProcessor.extractTextFromPDF(url);
          if (pdfContent) {
            extractedData = [{
              title: `PDF Document - ${url.split('/').pop()}`,
              content: pdfContent,
              url,
              tags: [],
              sourceType
            }];
          } else {
            continue;
          }
        } else if (useFirecrawl && Deno.env.get('FIRECRAWL_API_KEY')) {
          extractedData = await this.extractWithFirecrawl(url, sourceType);
        } else {
          extractedData = await this.extractWithStandardMethod(url, sourceType);
        }

        // Apply semantic processing
        if (semanticProcessing) {
          extractedData = extractedData.map(data => ({
            ...data,
            keywords: SemanticProcessor.extractKeywords(data.title + ' ' + data.content),
            semanticCategory: SemanticProcessor.categorizeContent(data.title, data.content),
            importance: SemanticProcessor.calculateImportance(data.title, data.content, sourceType),
            sector: sectorClassification ? SemanticProcessor.classifySector(data.content) : undefined
          }));
        }

        results.push(...extractedData);

        // Find links for deeper crawling
        if (depth < maxDepth) {
          const links = await this.extractLinks(url, includeSubdomains);
          links.forEach(link => {
            if (!visited.has(link)) {
              queue.push({url: link, depth: depth + 1});
            }
          });
        }

      } catch (error) {
        console.error(`Error crawling ${url}:`, error);
      }
    }

    return results;
  }

  private static async extractWithFirecrawl(url: string, sourceType: string): Promise<CrawledData[]> {
    try {
      const result = await firecrawl.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        includeTags: ['article', 'main', 'section', 'div.content'],
        excludeTags: ['nav', 'footer', 'aside', 'script']
      });

      if (!result.success || !result.data) return [];

      const content = result.data.markdown || result.data.html || '';
      const title = result.data.metadata?.title || 'Untitled';

      return [{
        title,
        content,
        url,
        tags: [],
        sourceType
      }];
    } catch (error) {
      console.error('Firecrawl extraction error:', error);
      return [];
    }
  }

  private static async extractWithStandardMethod(url: string, sourceType: string): Promise<CrawledData[]> {
    // Reuse existing extraction logic from original crawler
    return await extractSSTData(url, sourceType);
  }

  private static async extractLinks(url: string, includeSubdomains: boolean): Promise<string[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const html = await response.text();
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
      const links: string[] = [];
      const baseUrl = new URL(url);
      
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        try {
          const linkUrl = new URL(match[1], url);
          
          // Filter links based on subdomain policy
          if (includeSubdomains || linkUrl.hostname === baseUrl.hostname) {
            links.push(linkUrl.toString());
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }

      return [...new Set(links)].slice(0, 10); // Limit to 10 links per page
    } catch (error) {
      console.error('Link extraction error:', error);
      return [];
    }
  }
}

// ========== NOTIFICATION SYSTEM ==========

class NotificationSystem {
  static async createNotification(data: NotificationData): Promise<void> {
    try {
      // Store notification in database
      await supabase.from('sst_notifications').insert({
        type: data.type,
        title: data.title,
        content: data.content,
        url: data.url,
        importance: data.importance,
        affected_sectors: data.affectedSectors,
        created_at: new Date().toISOString(),
        is_read: false
      });

      // Send email/webhook for critical changes
      if (data.importance >= 4) {
        await this.sendCriticalAlert(data);
      }

      console.log(`Notification created: ${data.title}`);
    } catch (error) {
      console.error('Notification creation error:', error);
    }
  }

  private static async sendCriticalAlert(data: NotificationData): Promise<void> {
    // Implement email/webhook sending logic here
    console.log(`CRITICAL ALERT: ${data.title}`);
    
    // Example webhook call (uncomment and configure as needed)
    /*
    try {
      await fetch(Deno.env.get('WEBHOOK_URL') || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ALERTE SST CRITIQUE: ${data.title}`,
          url: data.url,
          importance: data.importance
        })
      });
    } catch (error) {
      console.error('Webhook send error:', error);
    }
    */
  }
}

// ========== ENHANCED CRAWL FUNCTION ==========

async function enhancedCrawlSource(sourceId: string, options: AdvancedCrawlOptions = {}) {
  console.log(`Starting enhanced crawl for source: ${sourceId}`);
  
  try {
    // Get source information
    const { data: source, error: sourceError } = await supabase
      .from('sst_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      throw new Error(`Source not found: ${sourceError?.message}`);
    }

    console.log(`Enhanced crawling: ${source.name} (${source.url})`);

    // Use advanced crawler with depth and semantic processing
    const extractedData = await AdvancedCrawler.crawlWithDepth(
      source.url,
      source.source_type,
      {
        maxDepth: source.crawling_depth || 2,
        usePDFExtraction: source.supports_pdf || false,
        useFirecrawl: source.use_firecrawl || false,
        semanticProcessing: true,
        sectorClassification: true,
        ...options
      }
    );

    if (extractedData.length === 0) {
      console.log(`No data extracted from ${source.url}`);
      return { success: true, message: 'No new content found', extracted: 0 };
    }

    let newCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;

    // Process each extracted item
    for (const item of extractedData) {
      const contentHash = calculateContentHash(item.content);
      
      // Check if content already exists
      const { data: existing } = await supabase
        .from('sst_crawled_content')
        .select('id, content_hash, content, title')
        .eq('source_id', sourceId)
        .eq('url', item.url)
        .single();

      const enhancedItem = {
        ...item,
        content_hash: contentHash,
        keywords: item.keywords,
        semantic_category: item.semanticCategory,
        importance: item.importance,
        sector: item.sector,
        last_updated_at: new Date().toISOString(),
        crawled_at: new Date().toISOString()
      };

      if (existing) {
        if (existing.content_hash !== contentHash) {
          // Content modified - update
          const { error: updateError } = await supabase
            .from('sst_crawled_content')
            .update(enhancedItem)
            .eq('id', existing.id);

          if (!updateError) {
            // Record the change
            await supabase
              .from('sst_content_changes')
              .insert({
                content_id: existing.id,
                change_type: 'UPDATED',
                previous_content: existing.content,
                new_content: item.content,
                summary: `Content updated: ${item.title}`
              });

            // Create notification for important updates
            if (item.importance && item.importance >= 3) {
              await NotificationSystem.createNotification({
                type: 'UPDATED',
                title: `Mise à jour importante: ${item.title}`,
                content: item.content.substring(0, 200) + '...',
                url: item.url,
                importance: item.importance,
                affectedSectors: item.sector ? [item.sector] : undefined
              });
            }
            
            updatedCount++;
            console.log(`Updated: ${item.title}`);
          }
        } else {
          unchangedCount++;
        }
      } else {
        // New content - insert
        const { data: inserted, error: insertError } = await supabase
          .from('sst_crawled_content')
          .insert({
            source_id: sourceId,
            ...enhancedItem
          })
          .select('id')
          .single();

        if (!insertError && inserted) {
          // Record as new
          await supabase
            .from('sst_content_changes')
            .insert({
              content_id: inserted.id,
              change_type: 'NEW',
              new_content: item.content,
              summary: `New content added: ${item.title}`
            });

          // Create notification for new important content
          if (item.importance && item.importance >= 3) {
            await NotificationSystem.createNotification({
              type: 'NEW',
              title: `Nouveau contenu important: ${item.title}`,
              content: item.content.substring(0, 200) + '...',
              url: item.url,
              importance: item.importance,
              affectedSectors: item.sector ? [item.sector] : undefined
            });
          }
          
          newCount++;
          console.log(`Added: ${item.title}`);
        }
      }
    }

    // Update last crawl date
    await supabase
      .from('sst_sources')
      .update({ 
        last_crawled_at: new Date().toISOString(),
        total_content_crawled: (source.total_content_crawled || 0) + newCount
      })
      .eq('id', sourceId);

    console.log(`Enhanced crawl completed - New: ${newCount}, Updated: ${updatedCount}, Unchanged: ${unchangedCount}`);

    return {
      success: true,
      message: `Enhanced crawl completed successfully`,
      extracted: extractedData.length,
      new: newCount,
      updated: updatedCount,
      unchanged: unchangedCount
    };

  } catch (error) {
    console.error(`Error in enhanced crawl for source ${sourceId}:`, error);
    return {
      success: false,
      error: error.message,
      extracted: 0
    };
  }
}

// ========== LEGACY FUNCTIONS (for compatibility) ==========

function calculateContentHash(content: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  return Array.from(new Uint8Array(data)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function extractSSTData(url: string, sourceType: string): Promise<CrawledData[]> {
  console.log(`Starting extraction from: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AgenticSST/2.0 (Enhanced Compliance Bot; Quebec SST Monitoring)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Fetched ${html.length} characters from ${url}`);

    const extractedData: CrawledData[] = [];

    if (sourceType === 'legislation') {
      extractedData.push(...extractLegislationData(html, url));
    } else if (sourceType === 'cnesst') {
      extractedData.push(...extractCNESSTData(html, url));
    } else if (sourceType === 'publication') {
      extractedData.push(...extractPublicationData(html, url));
    }

    console.log(`Extracted ${extractedData.length} items from ${url}`);
    return extractedData;

  } catch (error) {
    console.error(`Error extracting data from ${url}:`, error);
    return [];
  }
}

function extractLegislationData(html: string, url: string): CrawledData[] {
  const results: CrawledData[] = [];
  
  const articleRegex = /<div[^>]*class="[^"]*article[^"]*"[^>]*>(.*?)<\/div>/gis;
  const titleRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  const contentRegex = /<p[^>]*>(.*?)<\/p>/gi;
  
  let match;
  let articleNumber = 1;
  
  while ((match = articleRegex.exec(html)) !== null) {
    const articleHtml = match[1];
    
    const titleMatch = titleRegex.exec(articleHtml);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : `Article ${articleNumber}`;
    
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

function extractCNESSTData(html: string, url: string): CrawledData[] {
  const results: CrawledData[] = [];
  
  const sectionRegex = /<section[^>]*>(.*?)<\/section>/gis;
  
  let match;
  let sectionNumber = 1;
  
  while ((match = sectionRegex.exec(html)) !== null) {
    const sectionHtml = match[1];
    
    const title = extractTitle(sectionHtml) || `Section ${sectionNumber}`;
    const content = extractCleanText(sectionHtml);
    
    if (content.length > 100) {
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

function extractPublicationData(html: string, url: string): CrawledData[] {
  const results: CrawledData[] = [];
  
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
  
  return [...new Set(tags)];
}

// ========== MAIN HANDLER ==========

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, sourceId, sourceIds, options } = await req.json();

    console.log(`SST Enhanced Crawler called with action: ${action}`);

    if (action === 'crawl_source' && sourceId) {
      const result = await enhancedCrawlSource(sourceId, options);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'crawl_all' || (action === 'crawl_sources' && sourceIds)) {
      const sources = sourceIds || [];
      
      if (sources.length === 0) {
        const { data: activeSources } = await supabase
          .from('sst_sources')
          .select('id')
          .eq('is_active', true);
        
        sources.push(...(activeSources?.map(s => s.id) || []));
      }

      const results = [];
      
      for (const id of sources) {
        const result = await enhancedCrawlSource(id, options);
        results.push({ sourceId: id, ...result });
      }

      const totalNew = results.reduce((sum, r) => sum + (r.new || 0), 0);
      const totalUpdated = results.reduce((sum, r) => sum + (r.updated || 0), 0);
      const totalExtracted = results.reduce((sum, r) => sum + (r.extracted || 0), 0);

      return new Response(JSON.stringify({
        success: true,
        message: `Enhanced crawl completed for ${sources.length} sources`,
        totalExtracted,
        totalNew,
        totalUpdated,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Unsupported action. Use: crawl_source, crawl_sources or crawl_all' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('SST Enhanced Crawler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});