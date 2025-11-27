# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - Unreleased

### Breaking Changes

#### `executeFunction` signature changed

The `executeFunction` method now uses an options object instead of positional parameters.

**Before (v1.x):**

```typescript
vmix.executeFunction('SetText', 1, 'Hello World', 'TextBlock1', 0, 1000);
```

**After (v2.x):**

```typescript
vmix.executeFunction('SetText', {
  input: 1,
  value: 'Hello World',
  selectedName: 'TextBlock1',
  selectedIndex: 0,
  duration: 1000,
});
```

#### Custom error types replace generic errors

API errors now throw typed error classes instead of generic `Error`. You may need to update error handling code.

**Before (v1.x):**

```typescript
try {
  await vmix.getCurrentState();
} catch (error) {
  console.error('Something went wrong');
}
```

**After (v2.x):**

```typescript
import { VMixApiError, VMixTimeoutError, VMixConnectionError } from 'vmix-json-wrapper';

try {
  await vmix.getCurrentState();
} catch (error) {
  if (error instanceof VMixTimeoutError) {
    console.error(`Request timed out after ${error.timeoutMs}ms`);
  } else if (error instanceof VMixApiError) {
    console.error(`API error: ${error.status} ${error.statusText}`);
  } else if (error instanceof VMixConnectionError) {
    console.error(`Connection failed: ${error.url}`);
  }
}
```

#### Types moved to separate module

TypeScript interfaces are now exported from `src/types.ts`. Direct imports still work via re-exports, but internal references have changed.

### New Features

#### VMixProject class for state manipulation

New `VMixProject` class provides a mutable wrapper around `VMixState` for dynamic manipulation:

```typescript
import { VMix, VMixProject } from 'vmix-json-wrapper';

const vmix = new VMix({ apiUrl: 'http://localhost:8088/api/' });
const state = await vmix.getCurrentState();

const project = new VMixProject(state);
project.addInput({ key: 'new-input', number: 3, type: 'Video', title: 'My Video', state: 'Paused' });
project.updateInput(1, { title: 'Updated Title' });
project.removeInputByNumber(2);

// Helper methods
const isLive = project.isStreaming();
const isRecording = project.isRecording();
const volume = project.getMasterVolume();
```

#### FunctionOptions interface

New `FunctionOptions` interface for `executeFunction`:

```typescript
interface FunctionOptions {
  input?: number;
  value?: string;
  selectedName?: string;
  selectedIndex?: number;
  duration?: number;
}
```

#### Custom error classes

New error hierarchy for better error handling:

- `VMixError` - Base error class
- `VMixConnectionError` - Network/connection failures (includes `url`, `cause`)
- `VMixTimeoutError` - Request timeouts (includes `url`, `timeoutMs`)
- `VMixApiError` - Non-OK HTTP responses (includes `url`, `status`, `statusText`)

### Internal Changes

- Replaced axios with native `fetch`
- Migrated from Jest to Vitest
- Modularized codebase into separate files (`types.ts`, `errors.ts`, `project.ts`)
- Uses `URLSearchParams` for building query strings

## [1.0.0] - Previous

Initial release with basic vMix HTTP API wrapper functionality.
