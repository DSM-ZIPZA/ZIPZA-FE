import * as React from "react";

interface UseCompositionHandlers<T extends HTMLElement> {
  onKeyDown?: (event: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (event: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (event: React.CompositionEvent<T>) => void;
}

export function useComposition<T extends HTMLElement>(
  handlers: UseCompositionHandlers<T>
) {
  return handlers;
}
