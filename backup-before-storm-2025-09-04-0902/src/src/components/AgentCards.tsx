import { Brain, Search, FileText, AlertTriangle, FileCheck, Users, User, Cog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const agents = [
  {
    name: "Hugo",
    role: "Orchestrateur principal",
    description: "Coordonne tous les agents selon la taille et le secteur de l'entreprise",
    icon: Cog,
    color: "primary",
    status: "active"
  },
  {
    name: "DiagSST",
    role: "Diagnostic conformité",
    description: "Évalue la conformité réglementaire selon les réponses utilisateur",
    icon: Brain,
    color: "secondary",
    status: "active"
  },
  {
    name: "LexiNorm",
    role: "Référentiel légal",
    description: "Fournit les interprétations des articles de la LMRSST",
    icon: Search,
    color: "accent",
    status: "active"
  },
  {
    name: "Prioris",
    role: "Plan d'action",
    description: "Génère les actions à prioriser selon les écarts détectés",
    icon: FileText,
    color: "warning",
    status: "active"
  },
  {
    name: "Sentinelle",
    role: "Alertes réglementaires",
    description: "Détecte et alerte sur les échéances et risques de non-conformité",
    icon: AlertTriangle,
    color: "destructive",
    status: "active"
  },
  {
    name: "DocuGen",
    role: "Générateur de rapports",
    description: "Compile les rapports de conformité et les exports CNESST",
    icon: FileCheck,
    color: "success",
    status: "standby"
  },
  {
    name: "CoSS",
    role: "Comité SST virtuel",
    description: "Prend les décisions pour les entreprises de 20+ employés",
    icon: Users,
    color: "primary",
    status: "standby"
  },
  {
    name: "ALSS",
    role: "Agent de liaison SST",
    description: "Gère la SST dans les entreprises de moins de 20 employés",
    icon: User,
    color: "secondary",
    status: "standby"
  }
];

const AgentCards = () => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Agents Intelligents</h3>
        <Badge variant="outline" className="text-xs">
          Architecture Multi-Agents
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent, idx) => {
          const IconComponent = agent.icon;
          return (
            <Card key={idx} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-${agent.color}/10`}>
                      <IconComponent className={`h-4 w-4 text-${agent.color}`} />
                    </div>
                    <Badge 
                      variant={agent.status === 'active' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {agent.status === 'active' ? 'Actif' : 'Attente'}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-sm font-semibold">{agent.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground font-medium mb-2">
                  {agent.role}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {agent.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Système d'intelligence artificielle distribuée pour la conformité LMRSST
        </p>
      </div>
    </section>
  );
};

export default AgentCards;