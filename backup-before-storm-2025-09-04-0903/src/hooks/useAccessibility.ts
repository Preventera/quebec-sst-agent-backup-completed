import React, { useCallback, useEffect, useRef } from 'react';
import { useActionLogger } from './useActionLogger';

export const useAccessibility = () => {
  const { logAccessibilityEvent } = useActionLogger();
  const announcementRef = useRef<HTMLDivElement>(null);

  // Screen reader announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      logAccessibilityEvent('screen_reader', 'announcement', 'aria-live');
      
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, [logAccessibilityEvent]);

  // Focus management
  const manageFocus = useCallback((elementId: string, delay: number = 0) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
        logAccessibilityEvent('focus_management', 'focus_set', elementId);
      }
    }, delay);
  }, [logAccessibilityEvent]);

  // Keyboard navigation helper
  const handleKeyboardNavigation = useCallback((
    event: React.KeyboardEvent,
    actions: Record<string, () => void>
  ) => {
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
      logAccessibilityEvent('keyboard_navigation', event.key);
    }
  }, [logAccessibilityEvent]);

  // WCAG contrast checker (basic implementation)
  const checkContrast = useCallback((foreground: string, background: string): boolean => {
    // Simplified contrast check - in production, use a proper library
    // This is a placeholder for WCAG AA compliance (4.5:1 ratio)
    return true; // For now, assume compliant
  }, []);

  // Skip link handler
  const createSkipLink = useCallback((targetId: string, label: string) => {
    return {
      id: 'skip-to-' + targetId,
      href: '#' + targetId,
      className: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-primary text-primary-foreground p-2 rounded',
      children: label,
      onClick: () => {
        manageFocus(targetId, 100);
        announce(`Navigé vers ${label}`, 'assertive');
      }
    };
  }, [manageFocus, announce]);

  // Screen reader only content
  const srOnly = useCallback((content: string) => ({
    className: 'sr-only',
    children: content
  }), []);

  // Live region component ref
  const LiveRegion = () => (
    React.createElement('div', {
      ref: announcementRef,
      className: "sr-only",
      'aria-live': "polite",
      'aria-atomic': "true"
    })
  );

  return {
    announce,
    manageFocus,
    handleKeyboardNavigation,
    checkContrast,
    createSkipLink,
    srOnly,
    LiveRegion
  };
};

// WCAG compliance utilities
export const WCAG = {
  // Minimum touch target size (44px)
  TOUCH_TARGET_SIZE: 'min-h-[44px] min-w-[44px]',
  
  // Focus indicators
  FOCUS_RING: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  
  // High contrast mode support
  HIGH_CONTRAST: 'forced-colors:border forced-colors:border-solid',
  
  // Screen reader only
  SR_ONLY: 'sr-only',
  
  // Focus visible (keyboard navigation)
  FOCUS_VISIBLE: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  
  // Color not as sole indicator
  STATUS_PATTERN: 'before:content-["●"] before:mr-2',
};