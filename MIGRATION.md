# Migration Guide: v1.x to v2.x

This guide helps you upgrade from vmix-json-wrapper v1.x to v2.x.

## Quick Checklist

- [ ] Update `executeFunction` calls to use options object
- [ ] Update error handling to use typed errors (optional but recommended)
- [ ] Review any direct type imports

## Step-by-Step Migration

### 1. Update `executeFunction` calls

The most significant breaking change is the `executeFunction` signature.

#### Find and replace pattern

Search your codebase for `executeFunction` calls with multiple arguments:

```typescript
// Old pattern - positional arguments
vmix.executeFunction(functionName, input, value, selectedName, selectedIndex, duration);
```

Replace with options object:

```typescript
// New pattern - options object
vmix.executeFunction(functionName, {
  input,
  value,
  selectedName,
  selectedIndex,
  duration,
});
```

#### Examples

**Simple function call (no change needed):**

```typescript
// Works in both versions
await vmix.executeFunction('Cut');
```

**Function with input only:**

```typescript
// Before
await vmix.executeFunction('Cut', 1);

// After
await vmix.executeFunction('Cut', { input: 1 });
```

**Function with input and value:**

```typescript
// Before
await vmix.executeFunction('SetVolume', 1, '50');

// After
await vmix.executeFunction('SetVolume', { input: 1, value: '50' });
```

**Function with all parameters:**

```typescript
// Before
await vmix.executeFunction('SetText', 1, 'Hello', 'TextBlock1', 0, 500);

// After
await vmix.executeFunction('SetText', {
  input: 1,
  value: 'Hello',
  selectedName: 'TextBlock1',
  selectedIndex: 0,
  duration: 500,
});
```

**Skipping middle parameters (cleaner in v2):**

```typescript
// Before - had to pass undefined for unused params
await vmix.executeFunction('Fade', 1, undefined, undefined, undefined, 1000);

// After - just specify what you need
await vmix.executeFunction('Fade', { input: 1, duration: 1000 });
```

### 2. Update error handling (recommended)

v2 introduces typed errors for better debugging. This is optional but recommended.

#### Basic error handling

```typescript
import { VMixConnectionError, VMixTimeoutError, VMixApiError } from 'vmix-json-wrapper';

try {
  const state = await vmix.getCurrentState();
} catch (error) {
  if (error instanceof VMixTimeoutError) {
    // Request took too long
    console.error(`Timeout after ${error.timeoutMs}ms connecting to ${error.url}`);
  } else if (error instanceof VMixApiError) {
    // vMix returned an error status
    console.error(`API error ${error.status}: ${error.statusText}`);
  } else if (error instanceof VMixConnectionError) {
    // Network/connection issue
    console.error(`Failed to connect to ${error.url}`);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
  }
}
```

#### Catching all vMix errors

```typescript
import { VMixError } from 'vmix-json-wrapper';

try {
  await vmix.executeFunction('Cut');
} catch (error) {
  if (error instanceof VMixError) {
    // Handle any vMix-specific error
    console.error('vMix error:', error.message);
  } else {
    // Handle unexpected errors
    throw error;
  }
}
```

### 3. Using the new VMixProject class (optional)

v2 adds `VMixProject` for state manipulation:

```typescript
import { VMix, VMixProject } from 'vmix-json-wrapper';

// Fetch current state
const vmix = new VMix({ apiUrl: 'http://localhost:8088/api/' });
const state = await vmix.getCurrentState();

// Create mutable project from state
const project = new VMixProject(state);

// Query inputs
const allInputs = project.getInputs();
const input1 = project.getInputByNumber(1);
const inputByKey = project.getInputByKey('some-key');

// Modify inputs
project.addInput({
  key: 'new-key',
  number: 5,
  type: 'Video',
  title: 'New Input',
  state: 'Paused',
});
project.updateInput(1, { title: 'Updated Title' });
project.removeInputByNumber(2);

// Check status
if (project.isRecording()) {
  console.log('Recording is active');
}
if (project.isStreaming()) {
  console.log('Streaming is active');
}
console.log('Master volume:', project.getMasterVolume());
console.log('Master muted:', project.isMasterMuted());

// Get modified state
const modifiedState = project.getState();
```

## Import changes

All exports remain available from the main entry point:

```typescript
// These all work
import { VMix, VMixProject, VMixState, VMixInput, FunctionOptions } from 'vmix-json-wrapper';
import { VMixError, VMixConnectionError, VMixTimeoutError, VMixApiError } from 'vmix-json-wrapper';
import { isVMixStreamingNode, isVMixRecordingNode } from 'vmix-json-wrapper';
```

## Need help?

If you encounter issues during migration, please open an issue on GitHub.
