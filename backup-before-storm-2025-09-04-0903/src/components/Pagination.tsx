import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  className?: string;
}

export default function Pagination({ 
  currentPage = 1, 
  totalItems = 0, 
  itemsPerPage = 12, 
  onPageChange,
  className = ""
}: PaginationProps) {
  const safeCurrentPage = Math.max(1, currentPage || 1);
  const safeTotalItems = Math.max(0, totalItems || 0);
  const safeItemsPerPage = Math.max(1, itemsPerPage || 12);
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safeItemsPerPage));

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-muted-foreground">
        {safeTotalItems > 0 ? (
          `${(safeCurrentPage - 1) * safeItemsPerPage + 1}-${Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems)} sur ${safeTotalItems}`
        ) : (
          "Aucun élément"
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange && onPageChange(Math.max(1, safeCurrentPage - 1))}
          disabled={safeCurrentPage <= 1}
        >
          Précédent
        </Button>
        <div className="text-sm">
          Page {safeCurrentPage} sur {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange && onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
          disabled={safeCurrentPage >= totalPages}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}