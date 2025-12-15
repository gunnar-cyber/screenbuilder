/**
 * Error Handling Utilities for Screen Builder
 *
 * This module provides robust error handling utilities for common scenarios
 * in the Screen Builder application.
 */

/**
 * Custom error classes for better error categorization
 */
export class WebGLContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebGLContextError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class ResourceLoadError extends Error {
  constructor(message: string, public resourcePath?: string) {
    super(message);
    this.name = 'ResourceLoadError';
  }
}

/**
 * Safely initializes WebGL context with proper error handling
 * Addresses the WebGL context loss issues mentioned in the project gotchas
 *
 * @param canvas - The canvas element to get WebGL context from
 * @param options - WebGL context attributes
 * @returns WebGL rendering context or null if initialization fails
 * @throws WebGLContextError if WebGL is not supported or context creation fails
 */
export function initializeWebGLContext(
  canvas: HTMLCanvasElement,
  options?: WebGLContextAttributes
): WebGLRenderingContext | WebGL2RenderingContext {
  if (!canvas) {
    throw new WebGLContextError('Canvas element is required for WebGL initialization');
  }

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;

  try {
    gl = canvas.getContext('webgl2', options) as WebGL2RenderingContext | null;

    if (!gl) {
      gl = canvas.getContext('webgl', options) as WebGLRenderingContext | null;
    }

    if (!gl) {
      throw new WebGLContextError(
        'WebGL is not supported in this browser. Please use a modern browser with WebGL support.'
      );
    }

    // Add context lost event handler
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.error('WebGL context was lost. Attempting to restore...');
    }, false);

    canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context successfully restored');
    }, false);

    return gl;
  } catch (error) {
    if (error instanceof WebGLContextError) {
      throw error;
    }
    throw new WebGLContextError(
      `Failed to initialize WebGL context: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Safely fetches data from a network endpoint with comprehensive error handling
 * Useful for the debug mode network connections mentioned in the README
 *
 * @param url - The URL to fetch from
 * @param options - Fetch options
 * @param timeout - Request timeout in milliseconds (default: 10000)
 * @returns Promise with the fetched data
 * @throws NetworkError if the request fails
 */
export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit,
  timeout: number = 10000
): Promise<T> {
  if (!url || typeof url !== 'string') {
    throw new NetworkError('Invalid URL provided for fetch request');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new NetworkError(
        `Network request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    }

    return await response.text() as unknown as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof NetworkError) {
      throw error;
    }

    if ((error as Error).name === 'AbortError') {
      throw new NetworkError(
        `Network request timed out after ${timeout}ms for URL: ${url}`
      );
    }

    throw new NetworkError(
      `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Safely imports JSON files with proper error handling
 * Addresses the JSON import gotcha mentioned in the README
 *
 * @param path - Path to the JSON file
 * @returns Promise with parsed JSON data
 * @throws ResourceLoadError if JSON import or parsing fails
 */
export async function safeImportJSON<T = any>(path: string): Promise<T> {
  if (!path || typeof path !== 'string') {
    throw new ResourceLoadError('Invalid path provided for JSON import', path);
  }

  try {
    const module = await import(path);

    // Use default export as mentioned in the README gotcha
    const data = module.default || module;

    if (!data) {
      throw new ResourceLoadError(
        `JSON file is empty or has no default export: ${path}`,
        path
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ResourceLoadError) {
      throw error;
    }

    throw new ResourceLoadError(
      `Failed to import JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      path
    );
  }
}

/**
 * Safely loads an image with proper error handling and preloading
 * Addresses the image loading issues mentioned in the project gotchas
 *
 * @param src - Image source URL
 * @param timeout - Loading timeout in milliseconds (default: 5000)
 * @returns Promise with the loaded image element
 * @throws ResourceLoadError if image loading fails
 */
export function safeLoadImage(src: string, timeout: number = 5000): Promise<HTMLImageElement> {
  if (!src || typeof src !== 'string') {
    return Promise.reject(new ResourceLoadError('Invalid image source provided', src));
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    let timeoutId: number | undefined;

    const cleanup = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      cleanup();
      resolve(img);
    };

    img.onerror = () => {
      cleanup();
      reject(new ResourceLoadError(
        `Failed to load image from source: ${src}`,
        src
      ));
    };

    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new ResourceLoadError(
        `Image loading timed out after ${timeout}ms for source: ${src}`,
        src
      ));
    }, timeout);

    img.src = src;
  });
}

/**
 * Wraps a Pinia store action with error handling
 * Helps catch and handle errors in store actions properly
 *
 * @param action - The store action to execute
 * @param errorMessage - Custom error message prefix
 * @returns Promise with the action result
 */
export async function safeStoreAction<T>(
  action: () => Promise<T>,
  errorMessage: string = 'Store action failed'
): Promise<T> {
  if (!action || typeof action !== 'function') {
    throw new Error('Invalid action provided: action must be a function');
  }

  try {
    return await action();
  } catch (error) {
    const detailedMessage = `${errorMessage}: ${
      error instanceof Error ? error.message : 'Unknown error'
    }`;
    console.error(detailedMessage, error);
    throw new Error(detailedMessage);
  }
}

/**
 * Validates required environment configuration
 * Useful for validating Crowdin tokens and other env variables mentioned in README
 *
 * @param config - Configuration object to validate
 * @param requiredKeys - Array of required configuration keys
 * @throws ConfigurationError if required keys are missing
 */
export function validateConfiguration(
  config: Record<string, any>,
  requiredKeys: string[]
): void {
  if (!config || typeof config !== 'object') {
    throw new ConfigurationError('Invalid configuration object provided');
  }

  if (!Array.isArray(requiredKeys) || requiredKeys.length === 0) {
    throw new ConfigurationError('Required keys array must be a non-empty array');
  }

  const missingKeys = requiredKeys.filter(key => {
    const value = config[key];
    return value === undefined || value === null || value === '';
  });

  if (missingKeys.length > 0) {
    throw new ConfigurationError(
      `Missing required configuration keys: ${missingKeys.join(', ')}`
    );
  }
}

/**
 * Retry utility for operations that may fail temporarily
 * Useful for network requests or resource loading
 *
 * @param operation - The operation to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param delayMs - Delay between retries in milliseconds (default: 1000)
 * @param backoff - Whether to use exponential backoff (default: true)
 * @returns Promise with the operation result
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  backoff: boolean = true
): Promise<T> {
  if (!operation || typeof operation !== 'function') {
    throw new Error('Invalid operation provided: operation must be a function');
  }

  if (maxRetries < 0) {
    throw new Error('Max retries must be a non-negative number');
  }

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
        console.warn(
          `Operation failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`,
          lastError
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Operation failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Safely parses debug address from URL parameters
 * Useful for the debug mode mentioned in the README
 *
 * @param url - URL string or URL object to parse
 * @returns Debug address if present, null otherwise
 */
export function parseDebugAddress(url: string | URL): string | null {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    const debugParam = urlObj.searchParams.get('debug');

    if (!debugParam) {
      return null;
    }

    // Basic validation for IP address or hostname
    const addressPattern = /^[\w.-]+(:\d+)?$/;
    if (!addressPattern.test(debugParam)) {
      console.warn(`Invalid debug address format: ${debugParam}`);
      return null;
    }

    return debugParam;
  } catch (error) {
    console.error('Failed to parse debug address from URL:', error);
    return null;
  }
}

/**
 * Creates a safe error handler for async operations
 * Returns a tuple of [data, error] instead of throwing
 *
 * @param promise - Promise to handle
 * @returns Tuple of [data, error]
 */
export async function safeAsync<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
