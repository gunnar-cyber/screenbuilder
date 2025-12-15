# Error Handling Utilities

Comprehensive error handling utilities for the Screen Builder application. These utilities provide robust error handling for common scenarios including WebGL operations, network requests, resource loading, and Vue component lifecycle management.

## Installation

```typescript
// Import specific utilities
import { safeFetch, initializeWebGLContext } from '@/lib/error-handling';

// Or import everything
import * from '@/lib/error-handling';
```

## Error Classes

### Custom Error Types

- `WebGLContextError` - Errors related to WebGL initialization and context
- `NetworkError` - Network request failures with optional status codes
- `ConfigurationError` - Configuration validation errors
- `ResourceLoadError` - Resource loading failures (images, JSON, etc.)

```typescript
try {
  await safeFetch('/api/data');
} catch (error) {
  if (error instanceof NetworkError) {
    console.log('Status code:', error.statusCode);
  }
}
```

## General Utilities

### `initializeWebGLContext(canvas, options?)`

Safely initializes WebGL context with proper error handling and automatic context loss recovery.

**Addresses:** WebGL context loss issues mentioned in project gotchas

```typescript
import { initializeWebGLContext, WebGLContextError } from '@/lib/error-handling';

try {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const gl = initializeWebGLContext(canvas, {
    antialias: true,
    preserveDrawingBuffer: true
  });

  // Use gl context...
} catch (error) {
  if (error instanceof WebGLContextError) {
    console.error('WebGL not supported:', error.message);
    // Show fallback UI
  }
}
```

### `safeFetch<T>(url, options?, timeout?)`

Fetches data with timeout and comprehensive error handling.

**Useful for:** Debug mode network connections

```typescript
import { safeFetch, NetworkError } from '@/lib/error-handling';

try {
  const data = await safeFetch<UserData>('/api/user', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, 5000); // 5 second timeout

  console.log('User data:', data);
} catch (error) {
  if (error instanceof NetworkError) {
    if (error.statusCode === 404) {
      console.log('User not found');
    } else if (error.statusCode === 500) {
      console.log('Server error');
    }
  }
}
```

### `safeImportJSON<T>(path)`

Safely imports JSON files with proper error handling.

**Addresses:** JSON import gotcha - always uses default export

```typescript
import { safeImportJSON, ResourceLoadError } from '@/lib/error-handling';

try {
  const config = await safeImportJSON<AppConfig>('./config.json');
  console.log('Config loaded:', config);
} catch (error) {
  if (error instanceof ResourceLoadError) {
    console.error('Failed to load config:', error.resourcePath);
  }
}
```

### `safeLoadImage(src, timeout?)`

Loads images with preloading and timeout handling.

**Addresses:** Image loading and cropping issues on viewport change

```typescript
import { safeLoadImage, ResourceLoadError } from '@/lib/error-handling';

try {
  const img = await safeLoadImage('/assets/background.png', 5000);
  console.log('Image loaded:', img.width, 'x', img.height);
} catch (error) {
  if (error instanceof ResourceLoadError) {
    console.error('Failed to load image:', error.resourcePath);
    // Show placeholder image
  }
}
```

### `validateConfiguration(config, requiredKeys)`

Validates required environment configuration.

**Useful for:** Validating Crowdin tokens and environment variables

```typescript
import { validateConfiguration, ConfigurationError } from '@/lib/error-handling';

try {
  const config = {
    CROWDIN_TOKEN: process.env.CROWDIN_TOKEN,
    CROWDIN_PROJECT_ID: process.env.CROWDIN_PROJECT_ID,
  };

  validateConfiguration(config, ['CROWDIN_TOKEN', 'CROWDIN_PROJECT_ID']);

  // Configuration is valid, proceed...
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('Missing configuration:', error.message);
  }
}
```

### `retryOperation<T>(operation, maxRetries?, delayMs?, backoff?)`

Retries operations with exponential backoff.

**Useful for:** Network requests, resource loading

```typescript
import { retryOperation } from '@/lib/error-handling';

const data = await retryOperation(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  3,      // Max 3 retries
  1000,   // Start with 1 second delay
  true    // Use exponential backoff
);
```

### `parseDebugAddress(url)`

Parses debug address from URL parameters with validation.

**Useful for:** Debug mode mentioned in README

```typescript
import { parseDebugAddress } from '@/lib/error-handling';

const debugAddress = parseDebugAddress(window.location.href);
if (debugAddress) {
  console.log('Connecting to debug device:', debugAddress);
  // Establish connection...
}
```

### `safeAsync<T>(promise)`

Returns `[data, error]` tuple instead of throwing.

**Useful for:** Avoiding try-catch blocks

```typescript
import { safeAsync } from '@/lib/error-handling';

const [data, error] = await safeAsync(fetch('/api/data'));
if (error) {
  console.error('Request failed:', error);
  return;
}

console.log('Data:', data);
```

## Vue-Specific Utilities

### `installGlobalErrorHandler(app, logger?)`

Installs global Vue error and warning handlers.

**Usage:** Call this in your main application setup

```typescript
import { createApp } from 'vue';
import { installGlobalErrorHandler, createErrorLogger } from '@/lib/error-handling';
import App from './App.vue';

const app = createApp(App);
const errorLogger = createErrorLogger(100); // Keep last 100 errors

installGlobalErrorHandler(app, errorLogger);

app.mount('#app');

// Access errors later
console.log('All errors:', errorLogger.getErrors());
```

### `safeLifecycleHook(hook, hookName, componentName?)`

Wraps lifecycle hooks with error handling.

```typescript
import { safeLifecycleHook } from '@/lib/error-handling';

export default {
  name: 'MyComponent',
  mounted: safeLifecycleHook(async function() {
    // If this throws, error is logged but component continues
    await this.loadData();
  }, 'mounted', 'MyComponent'),
};
```

### `safePiniaAction(action, actionName, storeName?, onError?)`

Wraps Pinia store actions with error handling.

**Addresses:** Pinia store getter reactivity issues mentioned in gotchas

```typescript
import { defineStore } from 'pinia';
import { safePiniaAction } from '@/lib/error-handling';

export const useUserStore = defineStore('user', {
  actions: {
    async fetchUser(userId: string) {
      return safePiniaAction(
        async () => {
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) throw new Error('Failed to fetch user');
          return response.json();
        },
        'fetchUser',
        'userStore',
        (error) => {
          // Custom error handling
          console.error('User fetch failed:', error);
        }
      )();
    },
  },
});
```

### `safeEventHandler(handler, eventName?)`

Wraps event handlers to prevent errors from breaking the app.

```typescript
import { safeEventHandler } from '@/lib/error-handling';

export default {
  methods: {
    handleClick: safeEventHandler((event: MouseEvent) => {
      // If this throws, error is logged but app continues
      this.processClick(event);
    }, 'click'),
  },
};
```

### `safeComputed(getter, fallbackValue, propertyName?)`

Wraps computed getters with fallback values.

```typescript
import { computed } from 'vue';
import { safeComputed } from '@/lib/error-handling';

const userName = computed(safeComputed(
  () => {
    // If this throws, fallback is returned
    return user.value.name.toUpperCase();
  },
  'Unknown User',
  'userName'
));
```

### `safeWatcher(watcher, watcherName?)`

Wraps watchers to prevent errors from breaking reactivity.

```typescript
import { watch } from 'vue';
import { safeWatcher } from '@/lib/error-handling';

watch(
  () => props.userId,
  safeWatcher(async (newId, oldId) => {
    // If this throws, error is logged but reactivity continues
    await loadUserData(newId);
  }, 'userIdWatcher')
);
```

### `validateProp(value, validator, propName, errorMessage?)`

Validates component props with detailed error messages.

**Addresses:** Custom prop validator type issues mentioned in gotchas

```typescript
import { validateProp } from '@/lib/error-handling';

export default {
  props: {
    userId: {
      type: String,
      validator: (value: string) => validateProp(
        value,
        (v) => v.length > 0 && !v.includes(' '),
        'userId',
        'User ID must be non-empty and contain no spaces'
      ),
    },
  },
};
```

### `safeAsyncComponent(loader, componentName?, fallbackComponent?)`

Safely loads async components with error handling.

```typescript
import { defineAsyncComponent } from 'vue';
import { safeAsyncComponent } from '@/lib/error-handling';
import ErrorComponent from './ErrorComponent.vue';

const AsyncComponent = defineAsyncComponent(
  safeAsyncComponent(
    () => import('./HeavyComponent.vue'),
    'HeavyComponent',
    ErrorComponent // Show this on error
  )
);
```

## Best Practices

1. **Always validate inputs** before processing
2. **Use specific error types** to make error handling more precise
3. **Provide clear error messages** that help debugging
4. **Log errors** in development but be cautious in production
5. **Use fallback values** when appropriate to maintain UX
6. **Wrap third-party code** with error handlers
7. **Test error paths** as thoroughly as success paths

## Examples

### Complete Component Example

```typescript
import { defineComponent, computed, watch, onMounted } from 'vue';
import {
  safeLifecycleHook,
  safeEventHandler,
  safeComputed,
  safeWatcher,
  safeFetch
} from '@/lib/error-handling';

export default defineComponent({
  name: 'UserProfile',

  setup() {
    const user = ref(null);
    const userId = ref('123');

    // Safe computed property
    const userName = computed(safeComputed(
      () => user.value?.name || '',
      'Anonymous',
      'userName'
    ));

    // Safe watcher
    watch(
      userId,
      safeWatcher(async (newId) => {
        const data = await safeFetch(`/api/users/${newId}`);
        user.value = data;
      }, 'userIdWatcher')
    );

    // Safe lifecycle hook
    onMounted(safeLifecycleHook(async () => {
      const data = await safeFetch(`/api/users/${userId.value}`);
      user.value = data;
    }, 'onMounted', 'UserProfile'));

    // Safe event handler
    const handleRefresh = safeEventHandler(async () => {
      const data = await safeFetch(`/api/users/${userId.value}`);
      user.value = data;
    }, 'refresh');

    return {
      userName,
      handleRefresh,
    };
  },
});
```

## Testing

All error handling utilities can be tested by simulating error conditions:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { safeFetch, NetworkError } from '@/lib/error-handling';

describe('safeFetch', () => {
  it('should handle network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(safeFetch('/api/test')).rejects.toThrow(NetworkError);
  });

  it('should handle timeouts', async () => {
    global.fetch = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 10000))
    );

    await expect(safeFetch('/api/test', {}, 100)).rejects.toThrow('timed out');
  });
});
```

## Migration Guide

To add error handling to existing code:

### Before
```typescript
async mounted() {
  const data = await fetch('/api/data').then(r => r.json());
  this.data = data;
}
```

### After
```typescript
import { safeFetch } from '@/lib/error-handling';

async mounted() {
  try {
    const data = await safeFetch('/api/data');
    this.data = data;
  } catch (error) {
    console.error('Failed to load data:', error);
    // Show error UI
  }
}
```

## Contributing

When adding new error handling utilities:

1. Add clear JSDoc comments
2. Include usage examples
3. Export from `index.ts`
4. Update this README
5. Add unit tests
