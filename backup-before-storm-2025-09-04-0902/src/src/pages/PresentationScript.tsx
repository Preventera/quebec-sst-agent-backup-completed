import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Share } from "lucide-react";
import { Link } from "react-router-dom";

const PresentationScript = () => {
  const handleDownload = () => {
    const content = `# Script de Présentation - AgenticSST Québec™

## Introduction et Positionnement

**Bonjour et bienvenue à la présentation d'AgenticSST Québec™**, la première plateforme d'intelligence artificielle multi-agents dédiée à la santé et sécurité au travail au Québec.

AgenticSST Québec™ révolutionne la gestion de la SST en combinant l'expertise réglementaire québécoise avec la puissance de l'IA conversationnelle. Notre système multi-agents vous accompagne 24/7 pour transformer votre approche de la conformité SST.

---

## Présentation du Système Multi-Agents

### Architecture Intelligente

Notre plateforme repose sur **8 agents spécialisés** qui collaborent pour vous offrir une expertise complète :

#### 1. **Agent Diagnostic SST** 🔍
- **Rôle** : Évaluation complète des risques
- **Expertise** : Analyse LMRSST, identification des dangers
- **Capacités** : 
  - Diagnostic en temps réel des situations de travail
  - Évaluation matricielle des risques
  - Recommandations personnalisées

#### 2. **Agent Conformité Réglementaire** ⚖️
- **Rôle** : Veille juridique et compliance
- **Expertise** : LSST, RSST, réglementations CNESST
- **Capacités** :
  - Analyse de conformité instantanée
  - Alertes réglementaires
  - Interprétation des obligations légales

#### 3. **Agent Prévention** 🛡️
- **Rôle** : Conception de programmes préventifs
- **Expertise** : Plans d'action, mesures correctives
- **Capacités** :
  - Génération de programmes de prévention
  - Planification d'interventions
  - Suivi des actions correctives

#### 4. **Agent Documentation** 📋
- **Rôle** : Génération automatique de documents
- **Expertise** : Politiques, procédures, rapports
- **Capacités** :
  - Création de politiques SST
  - Rapports d'incidents automatisés
  - Documentation de conformité

#### 5. **Agent Formation** 🎓
- **Rôle** : Conception pédagogique SST
- **Expertise** : Programmes d'apprentissage adaptatifs
- **Capacités** :
  - Parcours de formation personnalisés
  - Évaluation des connaissances
  - Certification des compétences

#### 6. **Agent Surveillance** 👁️
- **Rôle** : Monitoring continu des indicateurs
- **Expertise** : Tableaux de bord, alertes proactives
- **Capacités** :
  - Surveillance temps réel des KPI SST
  - Détection d'anomalies
  - Alertes préventives

#### 7. **Agent Communication** 📢
- **Rôle** : Diffusion et sensibilisation
- **Expertise** : Campagnes de sensibilisation
- **Capacités** :
  - Messages personnalisés par secteur
  - Rappels automatiques
  - Communication multicanale

#### 8. **Agent Vocal Québécois** 🎙️
- **Rôle** : Interface conversationnelle naturelle
- **Expertise** : Traitement du langage naturel en français québécois
- **Capacités** :
  - Reconnaissance vocale adaptée
  - Réponses contextuelles
  - Interaction mains-libres

---

## Logique Multi-Agents : L'Intelligence Collaborative

### Orchestration Intelligente

Notre système utilise une **logique de collaboration avancée** où chaque agent :

1. **Analyse sa zone d'expertise** sur votre demande
2. **Consulte les autres agents** si nécessaire
3. **Synthétise une réponse complète** intégrant tous les aspects
4. **Apprend de chaque interaction** pour s'améliorer continuellement

### Exemples de Collaboration

**Scénario 1 : Accident de travail**
- 🔍 Agent Diagnostic → Analyse les causes
- ⚖️ Agent Conformité → Vérifie les obligations légales
- 📋 Agent Documentation → Génère le rapport d'incident
- 🛡️ Agent Prévention → Propose des mesures correctives

**Scénario 2 : Nouvelle réglementation**
- ⚖️ Agent Conformité → Identifie les impacts
- 📢 Agent Communication → Prépare la diffusion
- 🎓 Agent Formation → Adapte les formations
- 👁️ Agent Surveillance → Met à jour les indicateurs

---

## Fonctionnalités Principales

### 1. **Centre de Diagnostic Intelligent**
- Évaluation instantanée des situations SST
- Matrice de risques interactive
- Recommandations priorisées
- Suivi des actions correctives

### 2. **Assistant Vocal Conversationnel**
- Interaction en français québécois
- Compréhension contextuelle
- Réponses expertes en temps réel
- Mode mains-libres pour le terrain

### 3. **Générateur de Documentation**
- Politiques SST personnalisées
- Procédures de travail sécuritaire
- Rapports de conformité automatiques
- Mise à jour réglementaire continue

### 4. **Base de Connaissances SST**
- Réglementations québécoises à jour
- Jurisprudence CNESST
- Meilleures pratiques sectorielles
- Outils d'aide à la décision

### 5. **Tableau de Bord Analytics**
- Indicateurs de performance SST
- Tendances et alertes
- Tableaux de conformité
- Rapports exécutifs automatisés

### 6. **Module d'Apprentissage Continu**
- Formation du personnel adaptative
- Évaluation des connaissances
- Certification des compétences
- Suivi des progressions

---

## Cas d'Usage Concrets

### Secteur Manufacturier
**Défi** : Gestion des risques machines et équipements
**Solution AgenticSST** :
- Diagnostic automatique des postes de travail
- Génération de procédures de cadenassage
- Formation ciblée sur les EPI
- Surveillance des incidents machines

**Résultat** : -45% d'accidents, conformité CNESST 100%

### Secteur Construction
**Défi** : Sécurité sur chantiers mobiles
**Solution AgenticSST** :
- Assistant vocal pour consignes sécurité
- Évaluation risques par phase de chantier
- Documentation automatique des inspections
- Communication d'équipe en temps réel

**Résultat** : -60% d'incidents, gain de 2h/jour en documentation

### Secteur Services de Santé
**Défi** : Protection des travailleurs et patients
**Solution AgenticSST** :
- Protocoles de désinfection personnalisés
- Gestion des risques biologiques
- Formation continue du personnel
- Suivi épidémiologique

**Résultat** : Conformité INSPQ 100%, -30% d'absences maladie

### PME Généraliste
**Défi** : Ressources SST limitées
**Solution AgenticSST** :
- Diagnostic SST complet automatisé
- Génération de politiques clé-en-main
- Formation en ligne du personnel
- Veille réglementaire proactive

**Résultat** : Mise en conformité en 30 jours, -70% temps de gestion SST

---

## Bénéfices Terrain Mesurables

### Opérationnels
- **Gain de temps : 65%** en moyenne sur les tâches administratives SST
- **Réduction des accidents : 40-60%** selon les secteurs
- **Amélioration conformité : 95%+** des clients atteignent 100%
- **ROI moyen : 300%** en première année

### Stratégiques
- **Expertise accessible 24/7** sans recruter de spécialistes
- **Conformité automatique** aux évolutions réglementaires
- **Décisions éclairées** basées sur l'IA et les données
- **Amélioration continue** par apprentissage automatique

### Humains
- **Réduction du stress** des responsables SST
- **Montée en compétence** de tous les employés
- **Culture sécurité renforcée** par la sensibilisation continue
- **Engagement amélioré** grâce aux outils interactifs

---

## Avantages Concurrentiels

### 1. **Expertise Québécoise Native**
- Formé sur la réglementation québécoise complète
- Compréhension des spécificités CNESST
- Adaptation aux secteurs d'activité locaux

### 2. **Technologie Multi-Agents Unique**
- Seule solution SST avec 8 agents spécialisés
- Collaboration intelligente entre domaines
- Évolutivité et personnalisation maximales

### 3. **Interface Conversationnelle Avancée**
- Reconnaissance vocale français québécois
- Compréhension contextuelle poussée
- Interaction naturelle et intuitive

### 4. **Apprentissage Continu**
- Amélioration constante par l'usage
- Personnalisation selon votre organisation
- Mise à jour automatique des connaissances

---

## Déploiement et Intégration

### Phase 1 : Évaluation (Semaine 1)
- Diagnostic initial de votre situation SST
- Configuration des agents selon vos besoins
- Formation de l'équipe utilisatrice

### Phase 2 : Déploiement Pilote (Semaines 2-4)
- Mise en service progressive
- Test des fonctionnalités prioritaires
- Ajustements selon vos retours

### Phase 3 : Généralisation (Mois 2-3)
- Déploiement complet
- Intégration aux processus existants
- Optimisation des performances

### Support Continu
- Assistance technique 24/7
- Mises à jour automatiques
- Formations continues
- Accompagnement stratégique

---

## Tarification Transparente

### Forfait Essentiel PME
- Jusqu'à 50 employés
- Accès aux 8 agents
- Support email
- **299$/mois**

### Forfait Professionnel
- Jusqu'à 200 employés
- Fonctionnalités avancées
- Support téléphonique
- **699$/mois**

### Forfait Entreprise
- Employés illimités
- Personnalisation complète
- Support dédié
- **Sur mesure**

**Garantie 30 jours satisfait ou remboursé**

---

## Conclusion et Appel à l'Action

AgenticSST Québec™ n'est pas juste un outil de plus : c'est votre **partenaire intelligent pour une SST d'excellence**.

Avec nos 8 agents spécialisés travaillant en collaboration, vous disposez d'une expertise SST complète, disponible 24/7, qui s'adapte à vos besoins et apprend de votre contexte.

### Prochaines Étapes

1. **Démo personnalisée** gratuite de 30 minutes
2. **Évaluation SST** de votre organisation
3. **Essai pilote** gratuit de 14 jours
4. **Déploiement accompagné** avec notre équipe

---

**Prêt à révolutionner votre approche SST ?**

**Contactez-nous dès aujourd'hui :**
- 📧 info@agenticsst.quebec
- 📱 1-800-SST-AGENT
- 🌐 www.agenticsst.quebec

**"Avec AgenticSST Québec™, la sécurité devient intelligente"**

---

*AgenticSST Québec™ - L'Intelligence Artificielle au Service de Votre Sécurité*`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Script_Presentation_AgenticSST_Quebec.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Script de Présentation AgenticSST Québec™',
        text: 'Découvrez le script complet de présentation d\'AgenticSST Québec™',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">Script de Présentation</h1>
              <p className="text-muted-foreground">AgenticSST Québec™ - Présentation complète</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Partager
            </Button>
            <Button onClick={handleDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid gap-8 max-w-6xl mx-auto">
          
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Introduction et Positionnement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 p-6 rounded-lg">
                <p className="text-lg font-semibold">
                  <strong>Bonjour et bienvenue à la présentation d'AgenticSST Québec™</strong>, 
                  la première plateforme d'intelligence artificielle multi-agents dédiée à la santé et sécurité au travail au Québec.
                </p>
              </div>
              <p className="text-base">
                AgenticSST Québec™ révolutionne la gestion de la SST en combinant l'expertise réglementaire québécoise 
                avec la puissance de l'IA conversationnelle. Notre système multi-agents vous accompagne 24/7 pour 
                transformer votre approche de la conformité SST.
              </p>
            </CardContent>
          </Card>

          {/* Système Multi-Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Système Multi-Agents</CardTitle>
              <p className="text-muted-foreground">8 agents spécialisés qui collaborent pour votre expertise complète</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { 
                    title: "Agent Diagnostic SST", 
                    icon: "🔍", 
                    role: "Évaluation complète des risques",
                    capabilities: ["Diagnostic temps réel", "Matrice de risques", "Recommandations personnalisées"]
                  },
                  { 
                    title: "Agent Conformité Réglementaire", 
                    icon: "⚖️", 
                    role: "Veille juridique et compliance",
                    capabilities: ["Analyse conformité", "Alertes réglementaires", "Interprétation légale"]
                  },
                  { 
                    title: "Agent Prévention", 
                    icon: "🛡️", 
                    role: "Conception de programmes préventifs",
                    capabilities: ["Programmes prévention", "Plans d'action", "Suivi correctives"]
                  },
                  { 
                    title: "Agent Documentation", 
                    icon: "📋", 
                    role: "Génération automatique de documents",
                    capabilities: ["Politiques SST", "Rapports incidents", "Documentation conformité"]
                  },
                  { 
                    title: "Agent Formation", 
                    icon: "🎓", 
                    role: "Conception pédagogique SST",
                    capabilities: ["Parcours personnalisés", "Évaluations", "Certifications"]
                  },
                  { 
                    title: "Agent Surveillance", 
                    icon: "👁️", 
                    role: "Monitoring continu des indicateurs",
                    capabilities: ["Surveillance KPI", "Détection anomalies", "Alertes préventives"]
                  },
                  { 
                    title: "Agent Communication", 
                    icon: "📢", 
                    role: "Diffusion et sensibilisation",
                    capabilities: ["Messages personnalisés", "Rappels automatiques", "Multi-canaux"]
                  },
                  { 
                    title: "Agent Vocal Québécois", 
                    icon: "🎙️", 
                    role: "Interface conversationnelle naturelle",
                    capabilities: ["Reconnaissance vocale", "Réponses contextuelles", "Mains-libres"]
                  }
                ].map((agent, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{agent.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{agent.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {agent.capabilities.map((cap, capIndex) => (
                          <Badge key={capIndex} variant="secondary" className="mr-2 mb-1">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logique Collaborative */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Logique Multi-Agents : L'Intelligence Collaborative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Orchestration Intelligente</h3>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">1</span>
                    </div>
                    <p className="text-sm">Analyse sa zone d'expertise</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">2</span>
                    </div>
                    <p className="text-sm">Consulte les autres agents</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">3</span>
                    </div>
                    <p className="text-sm">Synthétise une réponse complète</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">4</span>
                    </div>
                    <p className="text-sm">Apprend continuellement</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-800/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Scénario : Accident de travail</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>🔍 Agent Diagnostic → Analyse les causes</p>
                    <p>⚖️ Agent Conformité → Vérifie obligations légales</p>
                    <p>📋 Agent Documentation → Génère rapport</p>
                    <p>🛡️ Agent Prévention → Mesures correctives</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Scénario : Nouvelle réglementation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>⚖️ Agent Conformité → Identifie impacts</p>
                    <p>📢 Agent Communication → Prépare diffusion</p>
                    <p>🎓 Agent Formation → Adapte formations</p>
                    <p>👁️ Agent Surveillance → Met à jour KPI</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Cas d'Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Cas d'Usage Concrets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    sector: "Secteur Manufacturier",
                    challenge: "Gestion des risques machines et équipements",
                    solutions: ["Diagnostic automatique postes", "Procédures cadenassage", "Formation EPI ciblée", "Surveillance incidents machines"],
                    result: "-45% d'accidents, conformité CNESST 100%"
                  },
                  {
                    sector: "Secteur Construction",
                    challenge: "Sécurité sur chantiers mobiles",
                    solutions: ["Assistant vocal consignes", "Évaluation risques par phase", "Documentation inspections", "Communication équipe temps réel"],
                    result: "-60% d'incidents, gain 2h/jour documentation"
                  },
                  {
                    sector: "Services de Santé",
                    challenge: "Protection travailleurs et patients",
                    solutions: ["Protocoles désinfection", "Gestion risques biologiques", "Formation continue", "Suivi épidémiologique"],
                    result: "Conformité INSPQ 100%, -30% absences maladie"
                  },
                  {
                    sector: "PME Généraliste",
                    challenge: "Ressources SST limitées",
                    solutions: ["Diagnostic SST automatisé", "Politiques clé-en-main", "Formation en ligne", "Veille réglementaire"],
                    result: "Conformité en 30 jours, -70% temps gestion SST"
                  }
                ].map((useCase, index) => (
                  <Card key={index} className="border-l-4 border-l-secondary">
                    <CardHeader>
                      <CardTitle className="text-lg text-secondary">{useCase.sector}</CardTitle>
                      <p className="text-sm text-muted-foreground font-semibold">Défi : {useCase.challenge}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-medium mb-2">Solution AgenticSST :</p>
                        <ul className="space-y-1">
                          {useCase.solutions.map((solution, sIndex) => (
                            <li key={sIndex} className="text-sm">• {solution}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                        <p className="font-semibold text-green-800 dark:text-green-200">
                          Résultat : {useCase.result}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bénéfices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Bénéfices Terrain Mesurables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Opérationnels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Gain de temps : 65%</strong> en moyenne</p>
                    <p><strong>Réduction accidents : 40-60%</strong></p>
                    <p><strong>Conformité : 95%+</strong> atteignent 100%</p>
                    <p><strong>ROI moyen : 300%</strong> première année</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Stratégiques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Expertise 24/7</strong> sans recrutement</p>
                    <p><strong>Conformité automatique</strong></p>
                    <p><strong>Décisions éclairées</strong> par l'IA</p>
                    <p><strong>Amélioration continue</strong></p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Humains</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Réduction stress</strong> responsables SST</p>
                    <p><strong>Montée en compétence</strong> employés</p>
                    <p><strong>Culture sécurité renforcée</strong></p>
                    <p><strong>Engagement amélioré</strong></p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Tarification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Tarification Transparente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    plan: "Essentiel PME",
                    price: "299$/mois",
                    features: ["Jusqu'à 50 employés", "Accès aux 8 agents", "Support email"],
                    highlight: false
                  },
                  {
                    plan: "Professionnel",
                    price: "699$/mois", 
                    features: ["Jusqu'à 200 employés", "Fonctionnalités avancées", "Support téléphonique"],
                    highlight: true
                  },
                  {
                    plan: "Entreprise",
                    price: "Sur mesure",
                    features: ["Employés illimités", "Personnalisation complète", "Support dédié"],
                    highlight: false
                  }
                ].map((plan, index) => (
                  <Card key={index} className={plan.highlight ? "ring-2 ring-primary" : ""}>
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.plan}</CardTitle>
                      <p className="text-2xl font-bold text-primary">{plan.price}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className="text-sm">✓ {feature}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Badge variant="secondary">Garantie 30 jours satisfait ou remboursé</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Conclusion */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Conclusion et Appel à l'Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg font-semibold text-center">
                AgenticSST Québec™ n'est pas juste un outil de plus : c'est votre <strong>partenaire intelligent pour une SST d'excellence</strong>.
              </p>
              
              <Separator />
              
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Prochaines Étapes</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto text-white font-bold">
                      1
                    </div>
                    <p className="font-medium">Démo personnalisée</p>
                    <p className="text-sm text-muted-foreground">gratuite de 30 minutes</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto text-white font-bold">
                      2
                    </div>
                    <p className="font-medium">Évaluation SST</p>
                    <p className="text-sm text-muted-foreground">de votre organisation</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto text-white font-bold">
                      3
                    </div>
                    <p className="font-medium">Essai pilote</p>
                    <p className="text-sm text-muted-foreground">gratuit de 14 jours</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto text-white font-bold">
                      4
                    </div>
                    <p className="font-medium">Déploiement accompagné</p>
                    <p className="text-sm text-muted-foreground">avec notre équipe</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Contactez-nous dès aujourd'hui</h3>
                <div className="flex flex-wrap justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span>info@agenticsst.quebec</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span>1-800-SST-AGENT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <span>www.agenticsst.quebec</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold text-primary italic">
                  "Avec AgenticSST Québec™, la sécurité devient intelligente"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PresentationScript;