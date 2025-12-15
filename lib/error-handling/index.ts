/**
 * Error Handling Utilities - Main Export
 *
 * Comprehensive error handling utilities for the Screen Builder application.
 * Includes general utilities and Vue-specific helpers.
 */

// Export all error classes
export {
  WebGLContextError,
  NetworkError,
  ConfigurationError,
  ResourceLoadError,
} from './error-utils';

// Export general error handling utilities
export {
  initializeWebGLContext,
  safeFetch,
  safeImportJSON,
  safeLoadImage,
  safeStoreAction,
  validateConfiguration,
  retryOperation,
  parseDebugAddress,
  safeAsync,
} from './error-utils';

// Export Vue-specific error handlers
export {
  createErrorLogger,
  installGlobalErrorHandler,
  safeLifecycleHook,
  safeComponentMethod,
  safePiniaAction,
  safeEventHandler,
  safeComputed,
  safeWatcher,
  validateProp,
  safeAsyncComponent,
} from './vue-error-handlers';

// Export types
export type { ErrorInfo, ErrorLogger } from './vue-error-handlers';
