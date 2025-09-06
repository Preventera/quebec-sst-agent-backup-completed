import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ExternalLink,
  AlertCircle,
  WifiOff,
  Server,
  Shield
} from "lucide-react"

interface ErrorStateProps {
  className?: string
  variant?: "network" | "server" | "permission" | "validation" | "generic"
  title?: string
  message?: string
  error?: Error | string
  showErrorDetails?: boolean
  onRetry?: () => void
  onGoHome?: () => void
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary" | "destructive"
    icon?: ReactNode
  }>
}

const errorVariants = {
  network: {
    icon: <WifiOff className="h-6 w-6" />,
    title: "Problème de connexion",
    defaultMessage: "Vérifiez votre connexion internet et réessayez."
  },
  server: {
    icon: <Server className="h-6 w-6" />,
    title: "Erreur du serveur",
    defaultMessage: "Le service est temporairement indisponible. Veuillez réessayer dans quelques instants."
  },
  permission: {
    icon: <Shield className="h-6 w-6" />,
    title: "Accès refusé",
    defaultMessage: "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource."
  },
  validation: {
    icon: <AlertCircle className="h-6 w-6" />,
    title: "Données invalides",
    defaultMessage: "Les données fournies ne sont pas valides. Veuillez vérifier et corriger."
  },
  generic: {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: "Une erreur s'est produite",
    defaultMessage: "Une erreur inattendue s'est produite. Veuillez réessayer."
  }
}

export function ErrorState({
  className,
  variant = "generic",
  title,
  message,
  error,
  showErrorDetails = false,
  onRetry,
  onGoHome,
  actions = []
}: ErrorStateProps) {
  const config = errorVariants[variant]
  const displayTitle = title || config.title
  const displayMessage = message || config.defaultMessage
  
  const errorDetails = error ? (
    typeof error === 'string' ? error : error.message
  ) : null

  const defaultActions = []
  
  if (onRetry) {
    defaultActions.push({
      label: "Réessayer",
      onClick: onRetry,
      variant: "default" as const,
      icon: <RefreshCw className="h-4 w-4" />
    })
  }
  
  if (onGoHome) {
    defaultActions.push({
      label: "Retour à l'accueil",
      onClick: onGoHome,
      variant: "outline" as const,
      icon: <Home className="h-4 w-4" />
    })
  }

  const allActions = [...defaultActions, ...actions]

  return (
    <div className={cn("p-6 max-w-lg mx-auto text-center", className)}>
      <Alert variant={variant === "validation" ? "default" : "destructive"} className="mb-6">
        <div className="flex items-center justify-center mb-2">
          {config.icon}
        </div>
        <AlertTitle className="text-center mb-2">{displayTitle}</AlertTitle>
        <AlertDescription className="text-center">
          {displayMessage}
        </AlertDescription>
      </Alert>

      {showErrorDetails && errorDetails && (
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Détails techniques
          </summary>
          <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto text-muted-foreground">
            {errorDetails}
          </pre>
        </details>
      )}

      {allActions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {allActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="min-w-[120px]"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

// Preset error states for common scenarios
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      variant="network"
      onRetry={onRetry}
    />
  )
}

export function ServerError({ onRetry, onGoHome }: { 
  onRetry?: () => void
  onGoHome?: () => void 
}) {
  return (
    <ErrorState
      variant="server"
      onRetry={onRetry}
      onGoHome={onGoHome}
    />
  )
}

export function PermissionError({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <ErrorState
      variant="permission"
      onGoHome={onGoHome}
    />
  )
}

export function ValidationError({ 
  message, 
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <ErrorState
      variant="validation"
      message={message}
      onRetry={onRetry}
    />
  )
}