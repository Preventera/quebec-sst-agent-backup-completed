import React, { createContext, useContext, ReactNode } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';

interface AccessibilityContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  manageFocus: (elementId: string, delay?: number) => void;
  handleKeyboardNavigation: (event: React.KeyboardEvent, actions: Record<string, () => void>) => void;
  createSkipLink: (targetId: string, label: string) => any;
  srOnly: (content: string) => any;
  LiveRegion: () => JSX.Element;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const accessibilityHooks = useAccessibility();

  return (
    <AccessibilityContext.Provider value={accessibilityHooks}>
      {children}
      <accessibilityHooks.LiveRegion />
      
      {/* Skip navigation links */}
      <div className="skip-links">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-primary text-primary-foreground p-2 rounded"
        >
          Passer au contenu principal
        </a>
        <a 
          href="#navigation" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-20 z-50 bg-primary text-primary-foreground p-2 rounded"
        >
          Passer à la navigation
        </a>
      </div>
    </AccessibilityContext.Provider>
  );
};