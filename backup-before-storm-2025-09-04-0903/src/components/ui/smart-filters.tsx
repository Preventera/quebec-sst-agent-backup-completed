import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Search, Filter, X, RotateCcw } from "lucide-react"

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterConfig {
  key: string
  label: string
  type: "select" | "multi-select" | "search" | "range"
  options?: FilterOption[]
  placeholder?: string
}

export interface ActiveFilter {
  key: string
  value: string | string[]
  label: string
  displayValue: string
}

interface SmartFiltersProps {
  className?: string
  configs: FilterConfig[]
  values: Record<string, any>
  onChange: (filters: Record<string, any>) => void
  onReset?: () => void
  searchPlaceholder?: string
  showActiveCount?: boolean
}

export function SmartFilters({
  className,
  configs,
  values,
  onChange,
  onReset,
  searchPlaceholder = "Rechercher...",
  showActiveCount = true
}: SmartFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Calculate active filters
  const activeFilters: ActiveFilter[] = configs.reduce((acc, config) => {
    const value = values[config.key]
    if (!value || (Array.isArray(value) && value.length === 0)) return acc

    if (config.type === "multi-select" && Array.isArray(value)) {
      value.forEach(v => {
        const option = config.options?.find(opt => opt.value === v)
        if (option) {
          acc.push({
            key: config.key,
            value: v,
            label: config.label,
            displayValue: option.label
          })
        }
      })
    } else if (config.type === "select") {
      const option = config.options?.find(opt => opt.value === value)
      if (option) {
        acc.push({
          key: config.key,
          value,
          label: config.label,
          displayValue: option.label
        })
      }
    } else if (config.type === "search" && value.trim()) {
      acc.push({
        key: config.key,
        value,
        label: config.label,
        displayValue: `"${value}"`
      })
    }

    return acc
  }, [] as ActiveFilter[])

  const handleFilterChange = useCallback((key: string, newValue: any) => {
    onChange({
      ...values,
      [key]: newValue
    })
  }, [values, onChange])

  const removeFilter = useCallback((filter: ActiveFilter) => {
    if (Array.isArray(values[filter.key])) {
      const newValue = values[filter.key].filter((v: string) => v !== filter.value)
      handleFilterChange(filter.key, newValue)
    } else {
      handleFilterChange(filter.key, "")
    }
  }, [values, handleFilterChange])

  const clearAllFilters = useCallback(() => {
    const clearedValues = Object.keys(values).reduce((acc, key) => {
      acc[key] = Array.isArray(values[key]) ? [] : ""
      return acc
    }, {} as Record<string, any>)
    onChange(clearedValues)
    onReset?.()
  }, [values, onChange, onReset])

  // Find search config
  const searchConfig = configs.find(c => c.type === "search")
  const filterConfigs = configs.filter(c => c.type !== "search")

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        {searchConfig && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchConfig.placeholder || searchPlaceholder}
              value={values[searchConfig.key] || ""}
              onChange={(e) => handleFilterChange(searchConfig.key, e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Filters Popover */}
        {filterConfigs.length > 0 && (
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {showActiveCount && activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtres</h4>
                  {activeFilters.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 px-2"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Réinitialiser
                    </Button>
                  )}
                </div>

                {filterConfigs.map(config => (
                  <div key={config.key} className="space-y-2">
                    <Label className="text-sm font-medium">{config.label}</Label>
                    
                    {config.type === "select" && (
                      <Select
                        value={values[config.key] || ""}
                        onValueChange={(value) => handleFilterChange(config.key, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={config.placeholder || `Sélectionner ${config.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {config.options?.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex justify-between items-center w-full">
                                <span>{option.label}</span>
                                {option.count !== undefined && (
                                  <span className="text-muted-foreground text-xs ml-2">
                                    ({option.count})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Multi-select implementation would go here */}
                    {config.type === "multi-select" && (
                      <div className="text-sm text-muted-foreground">
                        Multi-select à implémenter
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filtres actifs:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.key}-${filter.value}-${index}`}
              variant="secondary"
              className="h-7 pr-1"
            >
              <span className="mr-1 text-xs">{filter.displayValue}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeFilter(filter)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {activeFilters.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 px-2 text-xs"
            >
              Tout effacer
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Hook for managing filter state
export function useSmartFilters<T extends Record<string, any>>(
  initialValues: T,
  onFiltersChange?: (filters: T) => void
) {
  const [filters, setFilters] = useState<T>(initialValues)

  const updateFilters = useCallback((newFilters: T) => {
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }, [onFiltersChange])

  const resetFilters = useCallback(() => {
    setFilters(initialValues)
    onFiltersChange?.(initialValues)
  }, [initialValues, onFiltersChange])

  return {
    filters,
    updateFilters,
    resetFilters
  }
}