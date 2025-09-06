// src/lib/cache/IntelligentCacheSystem.ts
// Système de cache multi-niveaux pour DocuAnalyzer et SafeVision
// Optimise les performances et évite le retraitement des 196 documents

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
  accessCount: number;
  lastAccessed: number;
  metadata: {
    filters?: any;
    documentIds?: string[];
    computeTime?: number;
    size?: number;
  };
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  averageComputeTime: number;
}

export class IntelligentCacheSystem {
  private documentCache: Map<string, CacheEntry<any>> = new Map();
  private analysisCache: Map<string, CacheEntry<any>> = new Map();
  private safevisionCache: Map<string, CacheEntry<any>> = new Map();
  
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 heures
  private readonly CACHE_VERSION = "1.0.0";
  
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    averageComputeTime: 0
  };

  /**
   * NIVEAU 1 : Cache Documents CNESST
   * Cache les 196 documents crawlés pour éviter le re-parsing
   */
  async cacheDocument(documentId: string, content: any, metadata?: any): Promise<void> {
    const key = `doc_${documentId}`;
    const entry: CacheEntry<any> = {
      data: content,
      timestamp: Date.now(),
      version: this.CACHE_VERSION,
      accessCount: 0,
      lastAccessed: Date.now(),
      metadata: {
        size: JSON.stringify(content).length,
        ...metadata
      }
    };

    // Vérifier l'espace disponible
    await this.ensureCacheSpace(entry.metadata.size || 0);
    
    this.documentCache.set(key, entry);
    this.updateStats('miss'); // Premier ajout = miss initial
    
    console.log(`Document ${documentId} mis en cache (${entry.metadata.size} bytes)`);
  }

  async getDocument(documentId: string): Promise<any | null> {
    const key = `doc_${documentId}`;
    const entry = this.documentCache.get(key);
    
    if (!entry || this.isExpired(entry)) {
      this.updateStats('miss');
      return null;
    }
    
    // Mise à jour des statistiques d'accès
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateStats('hit');
    
    return entry.data;
  }

  /**
   * NIVEAU 2 : Cache Analyses DocuAnalyzer
   * Cache les résultats d'analyse selon les filtres appliqués
   */
  async cacheAnalysis(filters: any, results: any, computeTime: number): Promise<void> {
    const key = this.generateFilterKey(filters);
    const entry: CacheEntry<any> = {
      data: results,
      timestamp: Date.now(),
      version: this.CACHE_VERSION,
      accessCount: 0,
      lastAccessed: Date.now(),
      metadata: {
        filters,
        computeTime,
        size: JSON.stringify(results).length,
        documentIds: results.documentReferences?.map((doc: any) => doc.id) || []
      }
    };

    await this.ensureCacheSpace(entry.metadata.size || 0);
    this.analysisCache.set(key, entry);
    
    console.log(`Analyse mise en cache: ${key} (${computeTime}ms, ${entry.metadata.size} bytes)`);
  }

  async getAnalysis(filters: any): Promise<any | null> {
    const key = this.generateFilterKey(filters);
    const entry = this.analysisCache.get(key);
    
    if (!entry || this.isExpired(entry)) {
      this.updateStats('miss');
      return null;
    }
    
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateStats('hit');
    
    console.log(`Cache hit pour analyse: ${key} (évite ${entry.metadata.computeTime}ms de calcul)`);
    return entry.data;
  }

  /**
   * NIVEAU 3 : Cache Scripts SafeVision
   * Cache les scripts générés par l'orchestration multi-agents
   */
  async cacheSafeVisionScript(scenarioId: number, filters: any, script: any, agentContributions: any[]): Promise<void> {
    const key = `safevision_${scenarioId}_${this.generateFilterKey(filters)}`;
    const entry: CacheEntry<any> = {
      data: {
        script,
        agentContributions,
        generatedAt: new Date().toISOString()
      },
      timestamp: Date.now(),
      version: this.CACHE_VERSION,
      accessCount: 0,
      lastAccessed: Date.now(),
      metadata: {
        scenarioId,
        filters,
        agentCount: agentContributions.length,
        size: JSON.stringify(script).length
      }
    };

    await this.ensureCacheSpace(entry.metadata.size || 0);
    this.safevisionCache.set(key, entry);
    
    console.log(`Script SafeVision mis en cache: scénario ${scenarioId}`);
  }

  async getSafeVisionScript(scenarioId: number, filters: any): Promise<any | null> {
    const key = `safevision_${scenarioId}_${this.generateFilterKey(filters)}`;
    const entry = this.safevisionCache.get(key);
    
    if (!entry || this.isExpired(entry)) {
      this.updateStats('miss');
      return null;
    }
    
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateStats('hit');
    
    console.log(`Cache hit SafeVision: scénario ${scenarioId} (évite orchestration complète)`);
    return entry.data;
  }

  /**
   * INVALIDATION INTELLIGENTE
   * Invalide le cache selon différents critères
   */
  invalidateByDocumentUpdate(documentId: string): void {
    // Invalider le document lui-même
    this.documentCache.delete(`doc_${documentId}`);
    
    // Invalider toutes les analyses qui utilisent ce document
    for (const [key, entry] of this.analysisCache.entries()) {
      if (entry.metadata.documentIds?.includes(documentId)) {
        this.analysisCache.delete(key);
        this.stats.evictions++;
      }
    }
    
    // Invalider les scripts SafeVision affectés
    for (const [key, entry] of this.safevisionCache.entries()) {
      if (this.scriptUsesDocument(entry.data, documentId)) {
        this.safevisionCache.delete(key);
        this.stats.evictions++;
      }
    }
    
    console.log(`Cache invalidé pour document: ${documentId}`);
  }

  invalidateByFilters(filters: any): void {
    const filterKey = this.generateFilterKey(filters);
    
    // Invalider l'analyse spécifique
    this.analysisCache.delete(filterKey);
    
    // Invalider les scripts SafeVision basés sur ces filtres
    for (const [key, entry] of this.safevisionCache.entries()) {
      if (key.includes(filterKey)) {
        this.safevisionCache.delete(key);
        this.stats.evictions++;
      }
    }
  }

  invalidateExpired(): void {
    const now = Date.now();
    let evicted = 0;
    
    [this.documentCache, this.analysisCache, this.safevisionCache].forEach(cache => {
      for (const [key, entry] of cache.entries()) {
        if (this.isExpired(entry)) {
          cache.delete(key);
          evicted++;
        }
      }
    });
    
    this.stats.evictions += evicted;
    console.log(`${evicted} entrées expirées supprimées du cache`);
  }

  /**
   * GESTION ESPACE ET PERFORMANCE
   */
  private async ensureCacheSpace(newEntrySize: number): Promise<void> {
    const currentSize = this.calculateTotalSize();
    
    if (currentSize + newEntrySize > this.MAX_CACHE_SIZE) {
      await this.evictLRU(newEntrySize);
    }
  }

  private async evictLRU(spaceNeeded: number): Promise<void> {
    const allEntries: Array<{key: string, entry: CacheEntry<any>, cache: Map<string, CacheEntry<any>>}> = [];
    
    // Collecter toutes les entrées avec leur cache source
    this.documentCache.forEach((entry, key) => 
      allEntries.push({key, entry, cache: this.documentCache}));
    this.analysisCache.forEach((entry, key) => 
      allEntries.push({key, entry, cache: this.analysisCache}));
    this.safevisionCache.forEach((entry, key) => 
      allEntries.push({key, entry, cache: this.safevisionCache}));
    
    // Trier par dernière utilisation (LRU)
    allEntries.sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);
    
    let freedSpace = 0;
    let evicted = 0;
    
    for (const {key, entry, cache} of allEntries) {
      if (freedSpace >= spaceNeeded) break;
      
      freedSpace += entry.metadata.size || 1000; // Estimation par défaut
      cache.delete(key);
      evicted++;
    }
    
    this.stats.evictions += evicted;
    console.log(`Éviction LRU: ${evicted} entrées supprimées, ${freedSpace} bytes libérés`);
  }

  /**
   * PRÉCHARGEMENT INTELLIGENT
   */
  async preloadFrequentDocuments(): Promise<void> {
    // Identifier les documents les plus accédés
    const documentStats = new Map<string, number>();
    
    for (const [key, entry] of this.documentCache.entries()) {
      if (key.startsWith('doc_')) {
        documentStats.set(key, entry.accessCount);
      }
    }
    
    // Précharger les analyses courantes pour ces documents
    const topDocuments = Array.from(documentStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log(`Préchargement des ${topDocuments.length} documents les plus fréquents`);
  }

  /**
   * MÉTRIQUES ET MONITORING
   */
  getCacheStats(): CacheStats & {
    documentCacheSize: number;
    analysisCacheSize: number;
    safevisionCacheSize: number;
    hitRate: number;
  } {
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      ...this.stats,
      documentCacheSize: this.documentCache.size,
      analysisCacheSize: this.analysisCache.size,
      safevisionCacheSize: this.safevisionCache.size,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      totalSize: this.calculateTotalSize()
    };
  }

  logCachePerformance(): void {
    const stats = this.getCacheStats();
    console.log(`
📊 CACHE PERFORMANCE REPORT
├─ Hit Rate: ${stats.hitRate.toFixed(2)}%
├─ Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB
├─ Documents: ${stats.documentCacheSize} entries
├─ Analyses: ${stats.analysisCacheSize} entries  
├─ SafeVision: ${stats.safevisionCacheSize} entries
├─ Evictions: ${stats.evictions}
└─ Avg Compute Time Saved: ${stats.averageComputeTime.toFixed(0)}ms
    `);
  }

  /**
   * UTILITAIRES PRIVÉS
   */
  private generateFilterKey(filters: any): string {
    // Générer une clé stable basée sur les filtres
    const normalized = JSON.stringify(filters, Object.keys(filters).sort());
    return btoa(normalized).substring(0, 32); // Hash court
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.DEFAULT_TTL;
  }

  private calculateTotalSize(): number {
    let total = 0;
    
    [this.documentCache, this.analysisCache, this.safevisionCache].forEach(cache => {
      for (const entry of cache.values()) {
        total += entry.metadata.size || 1000; // Estimation par défaut
      }
    });
    
    return total;
  }

  private scriptUsesDocument(scriptData: any, documentId: string): boolean {
    // Vérifier si un script SafeVision utilise un document spécifique
    const scriptStr = JSON.stringify(scriptData);
    return scriptStr.includes(documentId);
  }

  private updateStats(type: 'hit' | 'miss'): void {
    if (type === 'hit') {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
  }

  /**
   * API PUBLIQUE POUR INTÉGRATION
   */
  
  // Interface pour DocuAnalyzer
  async cacheDocumentAnalysis(filters: any, results: any, computeTimeMs: number): Promise<void> {
    await this.cacheAnalysis(filters, results, computeTimeMs);
  }

  async getCachedDocumentAnalysis(filters: any): Promise<any | null> {
    return await this.getAnalysis(filters);
  }

  // Interface pour SafeVision
  async cacheSafeVisionGeneration(scenarioId: number, filters: any, script: any, contributions: any[]): Promise<void> {
    await this.cacheSafeVisionScript(scenarioId, filters, script, contributions);
  }

  async getCachedSafeVisionGeneration(scenarioId: number, filters: any): Promise<any | null> {
    return await this.getSafeVisionScript(scenarioId, filters);
  }

  // Maintenance
  async performMaintenance(): Promise<void> {
    this.invalidateExpired();
    await this.preloadFrequentDocuments();
    this.logCachePerformance();
  }

  // Nettoyage
  clearAll(): void {
    this.documentCache.clear();
    this.analysisCache.clear();
    this.safevisionCache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      averageComputeTime: 0
    };
    console.log('Cache complètement vidé');
  }
}

// Instance singleton pour utilisation globale
export const intelligentCache = new IntelligentCacheSystem();

// Démarrage de la maintenance automatique (toutes les heures)
setInterval(() => {
  intelligentCache.performMaintenance();
}, 60 * 60 * 1000);