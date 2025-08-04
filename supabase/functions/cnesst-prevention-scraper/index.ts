import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedLink {
  title: string;
  url: string;
}

interface CrawlResponse {
  success: boolean;
  totalLinks: number;
  savedToDatabase: number;
  data?: ScrapedLink[];
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting CNESST Prevention Info scraper...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const BASE = "https://www.cnesst.gouv.qc.ca";
    const LIST_URL = BASE + "/fr/prevention-securite/informations-prevention/liste-informations-prevention";
    const MAX_PAGES = 15;

    // Function to scrape a single page
    async function scrapePage(page: number = 0): Promise<ScrapedLink[]> {
      const url = page > 0 ? `${LIST_URL}?page=${page}` : LIST_URL;
      console.log(`Scraping page ${page}: ${url}`);

      try {
        const response = await fetch(url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        console.log(`Page ${page} HTML length: ${html.length}`);

        // Parse HTML to extract links - TypeScript implementation
        const data: ScrapedLink[] = [];
        
        // Simple regex-based parsing to find prevention info links
        // Looking for links in the prevention info listing
        const linkRegex = /<a[^>]+href="([^"]*(?:prevention|information)[^"]*)"[^>]*>([^<]+)<\/a>/gi;
        let match;

        while ((match = linkRegex.exec(html)) !== null) {
          const href = match[1];
          const title = match[2].trim();
          
          // Ensure full URL
          const fullUrl = href.startsWith('http') ? href : BASE + href;
          
          // Filter for prevention-related content
          if (title && href.includes('prevention') || href.includes('information')) {
            data.push({
              title: title.replace(/\s+/g, ' ').trim(),
              url: fullUrl
            });
          }
        }

        // Alternative: look for specific CSS selectors in the HTML
        // This mimics the BeautifulSoup logic from the Python script
        const viewRowRegex = /<div[^>]*class="[^"]*views-row[^"]*"[^>]*>(.*?)<\/div>/gis;
        let rowMatch;

        while ((rowMatch = viewRowRegex.exec(html)) !== null) {
          const rowContent = rowMatch[1];
          const linkInRowRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
          let linkMatch;

          while ((linkMatch = linkInRowRegex.exec(rowContent)) !== null) {
            const href = linkMatch[1];
            const title = linkMatch[2].trim();
            
            if (title && href) {
              const fullUrl = href.startsWith('http') ? href : BASE + href;
              data.push({
                title: title.replace(/\s+/g, ' ').trim(),
                url: fullUrl
              });
            }
          }
        }

        console.log(`Page ${page} extracted ${data.length} links`);
        return data;
      } catch (error) {
        console.error(`Error scraping page ${page}:`, error);
        return [];
      }
    }

    // Scrape all pages
    console.log(`Scraping ${MAX_PAGES} pages...`);
    const allLinks: ScrapedLink[] = [];
    
    for (let page = 0; page < MAX_PAGES; page++) {
      const pageLinks = await scrapePage(page);
      allLinks.push(...pageLinks);
      
      // Small delay between requests to be respectful
      if (page < MAX_PAGES - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Remove duplicates based on URL
    const uniqueLinks = allLinks.filter((link, index, self) => 
      index === self.findIndex(l => l.url === link.url)
    );

    console.log(`Total unique links found: ${uniqueLinks.length}`);

    // Save to database - first ensure we have a CNESST source
    let sourceId: string;
    
    // Check if CNESST source exists
    const { data: existingSource } = await supabase
      .from('sst_sources')
      .select('id')
      .eq('url', LIST_URL)
      .eq('source_type', 'cnesst')
      .single();

    if (existingSource) {
      sourceId = existingSource.id;
      console.log('Using existing CNESST source:', sourceId);
    } else {
      // Create new CNESST source
      const { data: newSource, error: sourceError } = await supabase
        .from('sst_sources')
        .insert({
          name: 'CNESST - Informations Prévention',
          url: LIST_URL,
          source_type: 'cnesst',
          is_active: true,
          crawl_frequency: 86400,
          use_firecrawl: false,
          supports_pdf: false,
          crawling_depth: 1
        })
        .select('id')
        .single();

      if (sourceError) {
        throw new Error(`Failed to create CNESST source: ${sourceError.message}`);
      }

      sourceId = newSource!.id;
      console.log('Created new CNESST source:', sourceId);
    }

    // Save each link to crawled content
    let savedCount = 0;
    
    for (const link of uniqueLinks) {
      try {
        // Check if content already exists
        const { data: existing } = await supabase
          .from('sst_crawled_content')
          .select('id')
          .eq('url', link.url)
          .single();

        if (!existing) {
          // Generate basic content hash
          const contentHash = btoa(link.title + link.url).substring(0, 32);
          
          const { error: insertError } = await supabase
            .from('sst_crawled_content')
            .insert({
              source_id: sourceId,
              title: link.title,
              content: `Page d'information prévention: ${link.title}`,
              url: link.url,
              content_hash: contentHash,
              tags: ['prevention', 'cnesst', 'information'],
              keywords: ['prévention', 'sécurité', 'travail'],
              semantic_category: 'guide',
              importance: 2,
              sector: 'général'
            });

          if (insertError) {
            console.error(`Failed to insert link ${link.url}:`, insertError.message);
          } else {
            savedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing link ${link.url}:`, error);
      }
    }

    // Update source stats
    await supabase
      .from('sst_sources')
      .update({
        last_crawled_at: new Date().toISOString(),
        total_content_crawled: savedCount
      })
      .eq('id', sourceId);

    const response: CrawlResponse = {
      success: true,
      totalLinks: uniqueLinks.length,
      savedToDatabase: savedCount,
      data: uniqueLinks.slice(0, 10) // Return first 10 as sample
    };

    console.log(`Scraping completed: ${savedCount}/${uniqueLinks.length} links saved`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in CNESST scraper:', error);
    
    const errorResponse: CrawlResponse = {
      success: false,
      totalLinks: 0,
      savedToDatabase: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});