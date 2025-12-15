/**
 * Vue-specific Error Handling Utilities for Screen Builder
 *
 * This module provides Vue component lifecycle and reactive error handling utilities
 */

import type { App, ComponentPublicInstance } from 'vue';

/**
 * Error information interface
 */
export interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  componentName?: string;
  hook?: string;
  info?: string;
}

/**
 * Error logger interface for custom error reporting
 */
export interface ErrorLogger {
  log: (error: ErrorInfo) => void;
  clear: () => void;
  getErrors: () => ErrorInfo[];
}

/**
 * Creates a simple in-memory error logger
 */
export function createErrorLogger(maxErrors: number = 100): ErrorLogger {
  const errors: ErrorInfo[] = [];

  return {
    log(error: ErrorInfo) {
      errors.unshift(error);
      if (errors.length > maxErrors) {
        errors.pop();
      }
      console.error('[Error Logger]', error);
    },
    clear() {
      errors.length = 0;
    },
    getErrors() {
      return [...errors];
    },
  };
}

/**
 * Installs global Vue error handlers
 * Catches errors in component lifecycle hooks and render functions
 *
 * @param app - Vue application instance
 * @param logger - Optional error logger
 */
export function installGlobalErrorHandler(
  app: App,
  logger?: ErrorLogger
): void {
  if (!app) {
    throw new Error('Vue app instance is required for error handler installation');
  }

  const errorLogger = logger || createErrorLogger();

  app.config.errorHandler = (
    err: unknown,
    instance: ComponentPublicInstance | null,
    info: string
  ) => {
    const error = err instanceof Error ? err : new Error(String(err));
    const componentName = instance?.$options?.name || instance?.$?.type?.name || 'Unknown';

    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      componentName,
      info,
    };

    errorLogger.log(errorInfo);

    // Log to console for development
    if (import.meta.env.DEV) {
      console.error(
        `[Vue Error Handler] Error in component ${componentName} during ${info}:`,
        error
      );
    }
  };

  app.config.warnHandler = (msg: string, instance: ComponentPublicInstance | null, trace: string) => {
    if (import.meta.env.DEV) {
      const componentName = instance?.$options?.name || instance?.$?.type?.name || 'Unknown';
      console.warn(`[Vue Warning] in ${componentName}:`, msg, trace);
    }
  };
}

/**
 * Safe wrapper for component lifecycle hooks
 * Prevents errors in one hook from breaking the entire component
 *
 * @param hook - The lifecycle hook function
 * @param hookName - Name of the hook for error reporting
 * @param componentName - Name of the component for error reporting
 * @returns Wrapped hook function
 */
export function safeLifecycleHook<T extends (...args: any[]) => any>(
  hook: T,
  hookName: string,
  componentName: string = 'Unknown'
): T {
  if (!hook || typeof hook !== 'function') {
    throw new Error('Hook must be a function');
  }

  return (async (...args: any[]) => {
    try {
      return await hook(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Error in ${hookName} hook of component ${componentName}:`,
        err
      );
      throw err;
    }
  }) as T;
}

/**
 * Safe wrapper for component methods
 * Adds error handling and logging to component methods
 *
 * @param method - The method to wrap
 * @param methodName - Name of the method for error reporting
 * @param componentName - Name of the component for error reporting
 * @param fallbackValue - Optional fallback value to return on error
 * @returns Wrapped method
 */
export function safeComponentMethod<T extends (...args: any[]) => any>(
  method: T,
  methodName: string,
  componentName: string = 'Unknown',
  fallbackValue?: ReturnType<T>
): T {
  if (!method || typeof method !== 'function') {
    throw new Error('Method must be a function');
  }

  return (async (...args: any[]) => {
    try {
      return await method(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Error in method ${methodName} of component ${componentName}:`,
        err.message
      );

      if (fallbackValue !== undefined) {
        console.log(`Returning fallback value for ${methodName}`);
        return fallbackValue;
      }

      throw err;
    }
  }) as T;
}

/**
 * Safe wrapper for Pinia actions with Vue integration
 * Handles errors in store actions and provides user feedback
 *
 * @param action - The Pinia action to wrap
 * @param actionName - Name of the action for error reporting
 * @param storeName - Name of the store for error reporting
 * @param onError - Optional error callback
 * @returns Wrapped action
 */
export function safePiniaAction<T extends (...args: any[]) => any>(
  action: T,
  actionName: string,
  storeName: string = 'Unknown',
  onError?: (error: Error) => void
): T {
  if (!action || typeof action !== 'function') {
    throw new Error('Action must be a function');
  }

  return (async (...args: any[]) => {
    try {
      return await action(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const errorMessage = `Store action '${actionName}' in '${storeName}' failed: ${err.message}`;

      console.error(errorMessage, err);

      if (onError) {
        try {
          onError(err);
        } catch (callbackError) {
          console.error('Error in error callback:', callbackError);
        }
      }

      throw new Error(errorMessage);
    }
  }) as T;
}

/**
 * Creates a safe event handler wrapper
 * Prevents event handler errors from breaking the application
 *
 * @param handler - The event handler function
 * @param eventName - Name of the event for error reporting
 * @returns Wrapped event handler
 */
export function safeEventHandler<T extends Event>(
  handler: (event: T) => void | Promise<void>,
  eventName: string = 'unknown'
): (event: T) => void {
  if (!handler || typeof handler !== 'function') {
    throw new Error('Handler must be a function');
  }

  return async (event: T) => {
    try {
      await handler(event);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Error in ${eventName} event handler:`,
        err.message
      );
      // Don't re-throw - we don't want to break event processing
    }
  };
}

/**
 * Safe wrapper for computed property getters
 * Provides fallback value if getter throws an error
 *
 * @param getter - The computed getter function
 * @param fallbackValue - Fallback value to return on error
 * @param propertyName - Name of the computed property for error reporting
 * @returns Wrapped getter function
 */
export function safeComputed<T>(
  getter: () => T,
  fallbackValue: T,
  propertyName: string = 'unknown'
): () => T {
  if (!getter || typeof getter !== 'function') {
    throw new Error('Getter must be a function');
  }

  return () => {
    try {
      return getter();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Error in computed property '${propertyName}':`,
        err.message
      );
      return fallbackValue;
    }
  };
}

/**
 * Safe wrapper for watchers
 * Prevents watcher errors from breaking reactivity
 *
 * @param watcher - The watcher callback function
 * @param watcherName - Name of the watcher for error reporting
 * @returns Wrapped watcher function
 */
export function safeWatcher<T, OldT = T>(
  watcher: (newValue: T, oldValue: OldT) => void | Promise<void>,
  watcherName: string = 'unknown'
): (newValue: T, oldValue: OldT) => void {
  if (!watcher || typeof watcher !== 'function') {
    throw new Error('Watcher must be a function');
  }

  return async (newValue: T, oldValue: OldT) => {
    try {
      await watcher(newValue, oldValue);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Error in watcher '${watcherName}':`,
        err.message
      );
      // Don't re-throw - we don't want to break reactivity
    }
  };
}

/**
 * Validates component props with detailed error messages
 * Useful for custom prop validators
 *
 * @param value - The prop value to validate
 * @param validator - Validation function that returns true if valid
 * @param propName - Name of the prop for error reporting
 * @param errorMessage - Custom error message
 * @returns Validation result
 */
export function validateProp<T>(
  value: T,
  validator: (value: T) => boolean,
  propName: string,
  errorMessage?: string
): boolean {
  if (!validator || typeof validator !== 'function') {
    throw new Error('Validator must be a function');
  }

  try {
    const isValid = validator(value);

    if (!isValid) {
      console.error(
        `Prop validation failed for '${propName}':`,
        errorMessage || `Invalid value: ${value}`
      );
    }

    return isValid;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(
      `Error during prop validation for '${propName}':`,
      err.message
    );
    return false;
  }
}

/**
 * Safe async component loader with error handling
 * Prevents lazy-loaded component errors from breaking the app
 *
 * @param loader - The component loader function
 * @param componentName - Name of the component for error reporting
 * @param fallbackComponent - Optional fallback component to show on error
 * @returns Wrapped loader function
 */
export function safeAsyncComponent(
  loader: () => Promise<any>,
  componentName: string = 'Unknown',
  fallbackComponent?: any
): () => Promise<any> {
  if (!loader || typeof loader !== 'function') {
    throw new Error('Loader must be a function');
  }

  return async () => {
    try {
      return await loader();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Failed to load async component '${componentName}':`,
        err.message
      );

      if (fallbackComponent) {
        console.log(`Loading fallback component for '${componentName}'`);
        return fallbackComponent;
      }

      throw new Error(
        `Failed to load component '${componentName}': ${err.message}`
      );
    }
  };
}
