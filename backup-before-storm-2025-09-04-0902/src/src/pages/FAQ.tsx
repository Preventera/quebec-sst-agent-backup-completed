import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      category: "Utilisation générale",
      questions: [
        {
          question: "Qu'est-ce qu'AgenticSST Québec™ ?",
          answer: "AgenticSST Québec™ est une plateforme intelligente qui utilise l'IA pour aider les entreprises québécoises à maintenir leur conformité avec la Loi sur la santé et la sécurité du travail (LMRSST). Elle offre des agents conversationnels, des diagnostics automatisés et la génération de documents de conformité."
        },
        {
          question: "Comment commencer à utiliser la plateforme ?",
          answer: "Commencez par explorer l'assistant vocal ou le diagnostic SST depuis la page d'accueil. Ces outils vous guideront dans l'évaluation de votre conformité et vous proposeront des actions correctives personnalisées."
        },
        {
          question: "La plateforme est-elle conforme aux lois québécoises ?",
          answer: "Oui, AgenticSST Québec™ est spécialement conçue pour la réglementation québécoise et intègre les dernières dispositions de la LMRSST et des règlements associés."
        }
      ]
    },
    {
      category: "Assistant vocal",
      questions: [
        {
          question: "Comment activer l'assistant vocal ?",
          answer: "Cliquez sur le bouton microphone dans l'interface ou utilisez le widget vocal flottant. Autorisez l'accès au microphone de votre navigateur lorsque demandé."
        },
        {
          question: "Quels types de questions puis-je poser à l'assistant ?",
          answer: "Vous pouvez poser des questions sur la conformité SST, les obligations légales, les procédures de sécurité, les formations requises, et demander des conseils spécifiques à votre secteur d'activité."
        },
        {
          question: "L'assistant vocal fonctionne-t-il hors ligne ?",
          answer: "Non, l'assistant vocal nécessite une connexion internet pour fonctionner car il utilise des services d'IA en temps réel pour analyser vos questions et générer des réponses précises."
        }
      ]
    },
    {
      category: "Diagnostic et conformité",
      questions: [
        {
          question: "Qu'est-ce que le diagnostic automatisé ?",
          answer: "Le diagnostic automatisé évalue votre conformité SST en analysant vos réponses à un questionnaire interactif. Il identifie les lacunes et propose des plans d'action personnalisés."
        },
        {
          question: "Combien de temps prend un diagnostic complet ?",
          answer: "Un diagnostic complet prend généralement entre 15 et 30 minutes, selon la taille de votre entreprise et la complexité de vos activités."
        },
        {
          question: "Les résultats du diagnostic sont-ils juridiquement valides ?",
          answer: "Les diagnostics fournissent des orientations basées sur la réglementation en vigueur, mais ne remplacent pas une consultation juridique professionnelle. Consultez toujours un expert en SST pour des situations complexes."
        }
      ]
    },
    {
      category: "Documents et rapports",
      questions: [
        {
          question: "Quels types de documents puis-je générer ?",
          answer: "Vous pouvez générer des politiques SST, des programmes de prévention, des rapports d'incident, des plans de formation, et d'autres documents requis pour la conformité LMRSST."
        },
        {
          question: "Les documents générés sont-ils personnalisables ?",
          answer: "Oui, tous les documents sont personnalisés selon votre secteur d'activité, la taille de votre entreprise et vos besoins spécifiques identifiés lors du diagnostic."
        },
        {
          question: "Comment puis-je télécharger mes documents ?",
          answer: "Une fois générés, vos documents sont disponibles en format PDF et Word dans la section 'Documents'. Vous pouvez les télécharger, les imprimer ou les partager directement."
        }
      ]
    },
    {
      category: "Sécurité et confidentialité",
      questions: [
        {
          question: "Mes données sont-elles sécurisées ?",
          answer: "Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Nous respectons les normes de protection des données et ne partageons jamais vos informations avec des tiers."
        },
        {
          question: "Qui a accès à mes informations d'entreprise ?",
          answer: "Seuls vous et les utilisateurs autorisés de votre organisation ont accès à vos données. Notre équipe technique peut accéder aux données anonymisées uniquement pour l'amélioration du service."
        },
        {
          question: "Puis-je supprimer mes données ?",
          answer: "Oui, vous pouvez demander la suppression de vos données à tout moment en nous contactant. Nous respectons votre droit à l'effacement selon les lois de protection des données."
        }
      ]
    },
    {
      category: "Support technique",
      questions: [
        {
          question: "Que faire si l'assistant vocal ne fonctionne pas ?",
          answer: "Vérifiez que votre navigateur autorise l'accès au microphone et que vous avez une connexion internet stable. Rafraîchissez la page et réessayez. Si le problème persiste, contactez notre support."
        },
        {
          question: "Comment signaler un bug ou un problème ?",
          answer: "Utilisez la section 'Logs' pour consulter les journaux d'activité ou contactez notre équipe de support via l'interface de contact avec une description détaillée du problème."
        },
        {
          question: "Y a-t-il des formations disponibles ?",
          answer: "Oui, consultez la section 'Learning Dashboard' qui contient des tutoriels, guides d'utilisation et bonnes pratiques pour maximiser l'utilisation d'AgenticSST Québec™."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
            
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Questions fréquemment posées
            </h1>
            <p className="text-muted-foreground text-lg">
              Trouvez rapidement les réponses à vos questions sur AgenticSST Québec™
            </p>
          </div>

          <div className="space-y-6">
            {faqData.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="border border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.questions.map((faq, questionIndex) => {
                    const itemIndex = categoryIndex * 100 + questionIndex;
                    const isOpen = openItems.includes(itemIndex);
                    
                    return (
                      <Collapsible key={questionIndex}>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-between p-4 h-auto text-left hover:bg-muted/50"
                            onClick={() => toggleItem(itemIndex)}
                          >
                            <span className="font-medium text-foreground">
                              {faq.question}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4">
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Vous ne trouvez pas votre réponse ?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Notre équipe de support est là pour vous aider
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  Contacter le support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;