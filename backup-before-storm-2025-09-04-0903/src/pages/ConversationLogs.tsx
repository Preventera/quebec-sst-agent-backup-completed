import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Bot, Calendar, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Pagination from "@/components/Pagination";

interface ConversationLog {
  id: string;
  user_id: string;
  agent_name: string;
  user_message: string;
  agent_response: string;
  context_data: any;
  created_at: string;
}

const ConversationLogs = () => {
  const [logs, setLogs] = useState<ConversationLog[]>([]);
  const [allLogs, setAllLogs] = useState<ConversationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const agents = ["Hugo", "DiagSST", "LexiNorm", "Prioris", "Sentinelle", "DocuGen", "CoSS", "ALSS"];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from("conversation_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (agentFilter !== "all") {
        query = query.eq("agent_name", agentFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAllLogs(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage et pagination
  const filteredLogs = allLogs.filter(log =>
    log.user_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.agent_response.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, agentFilter]);

  useEffect(() => {
    fetchLogs();
  }, [agentFilter]);

  return (
    <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              Logs des Conversations
            </h1>
            <p className="text-muted-foreground mt-2">
              Collecte et suivi des interactions utilisateur-agents pour l'amélioration continue
            </p>
          </div>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrer par agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les agents</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{allLogs.length}</div>
              <p className="text-xs text-muted-foreground">Total conversations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {new Set(allLogs.map(log => log.agent_name)).size}
              </div>
              <p className="text-xs text-muted-foreground">Agents actifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {allLogs.filter(log => log.created_at >= new Date(Date.now() - 24*60*60*1000).toISOString()).length}
              </div>
              <p className="text-xs text-muted-foreground">Dernières 24h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {allLogs.length > 0 ? Math.round(allLogs.reduce((acc, log) => acc + log.agent_response.length, 0) / allLogs.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Moy. caractères/réponse</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des conversations */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Chargement des logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune conversation trouvée</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <Badge variant="outline">{log.agent_name}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: fr })}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/annotation?log=${log.id}`, '_blank')}
                    >
                      Annoter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Message utilisateur :</p>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg">
                        {log.user_message}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Réponse agent :</p>
                      <p className="text-sm bg-primary/5 p-3 rounded-lg">
                        {log.agent_response}
                      </p>
                    </div>
                    {log.context_data && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Contexte :</p>
                        <div className="text-xs bg-muted/20 p-2 rounded font-mono">
                          {JSON.stringify(log.context_data, null, 2)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                className="justify-center"
              />
            </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationLogs;