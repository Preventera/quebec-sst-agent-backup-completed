import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  FileText, 
  Users, 
  FolderOpen, 
  Database,
  AlertCircle,
  Plus,
  Inbox
} from "lucide-react"

interface EmptyStateProps {
  className?: string
  variant?: "search" | "data" | "error" | "default"
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

const defaultIcons = {
  search: <Search className="h-12 w-12 text-muted-foreground" />,
  data: <Database className="h-12 w-12 text-muted-foreground" />,
  error: <AlertCircle className="h-12 w-12 text-destructive" />,
  default: <Inbox className="h-12 w-12 text-muted-foreground" />
}

export function EmptyState({
  className,
  variant = "default",
  icon,
  title,
  description,
  action,
  secondaryAction
}: EmptyStateProps) {
  const displayIcon = icon || defaultIcons[variant]

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 min-h-[300px]",
      className
    )}>
      <div className="mb-4">
        {displayIcon}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
            className="min-w-[120px]"
          >
            {action.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
            className="min-w-[120px]"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// Preset empty states for common scenarios
export function SearchEmptyState({ 
  searchTerm, 
  onClear 
}: { 
  searchTerm?: string
  onClear?: () => void 
}) {
  return (
    <EmptyState
      variant="search"
      title={searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Aucun résultat trouvé"}
      description="Essayez d'ajuster vos filtres ou termes de recherche pour trouver ce que vous cherchez."
      action={onClear ? {
        label: "Effacer les filtres",
        onClick: onClear,
        variant: "outline"
      } : undefined}
    />
  )
}

export function DataEmptyState({ 
  entityName = "éléments",
  onAdd
}: { 
  entityName?: string
  onAdd?: () => void 
}) {
  return (
    <EmptyState
      variant="data"
      icon={<Plus className="h-12 w-12 text-muted-foreground" />}
      title={`Aucun ${entityName} pour le moment`}
      description={`Commencez par ajouter votre premier ${entityName.slice(0, -1)} pour voir du contenu ici.`}
      action={onAdd ? {
        label: `Ajouter ${entityName.slice(0, -1)}`,
        onClick: onAdd
      } : undefined}
    />
  )
}

export function ErrorEmptyState({ 
  onRetry,
  errorMessage
}: { 
  onRetry?: () => void
  errorMessage?: string
}) {
  return (
    <EmptyState
      variant="error"
      title="Une erreur s'est produite"
      description={errorMessage || "Impossible de charger les données. Veuillez réessayer."}
      action={onRetry ? {
        label: "Réessayer",
        onClick: onRetry
      } : undefined}
    />
  )
}