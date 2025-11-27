# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install        # Install dependencies
pnpm run build      # Compile TypeScript to dist/
pnpm run test       # Run Vitest tests
pnpm run lint       # ESLint with auto-fix
pnpm run format     # Prettier formatting
```

Run a single test file:
```bash
pnpm run test -- test/vmix.test.ts
```

Run tests matching a pattern:
```bash
pnpm run test -- -t "should get default vmix state"
```

## Architecture

This is an npm package that wraps the vMix HTTP API, converting XML responses to typed JSON objects and providing state manipulation utilities.

### Module Structure

| File | Purpose |
|------|---------|
| `src/vmix.ts` | `VMix` class - API client for connecting to vMix |
| `src/types.ts` | TypeScript interfaces (`VMixConfig`, `VMixState`, `VMixInput`, `FunctionOptions`, etc.) |
| `src/errors.ts` | Custom error classes (`VMixError`, `VMixConnectionError`, `VMixTimeoutError`, `VMixApiError`) |
| `src/project.ts` | `VMixProject` class - mutable state wrapper for dynamic manipulation |
| `src/index.ts` | Public exports |

### How it works

1. `VMix` class connects to vMix's HTTP API endpoint (default: `http://localhost:8088/api/`)
2. `getCurrentState()` fetches XML from vMix and parses it using `fast-xml-parser` with custom value processors for boolean conversion and HTML entity decoding
3. The parsed state is returned as typed `VMixState` interface
4. `executeFunction()` sends commands to vMix using `FunctionOptions` object:
   ```typescript
   vmix.executeFunction('Cut', { input: 1, duration: 1000 });
   ```

### Key Classes

**VMix** - API client
- `getCurrentState()` - Fetch and parse vMix state
- `getAllInputs()` - Get all inputs from current state
- `executeFunction(name, options?)` - Execute a vMix function

**VMixProject** - State manipulation (mutable wrapper around `VMixState`)
- `fromState(state)` - Create project from state snapshot
- `getInputs()`, `getInputByNumber()`, `getInputByKey()` - Query inputs
- `addInput()`, `removeInputByNumber()`, `updateInput()` - Modify inputs
- `isRecording()`, `isStreaming()`, `getMasterVolume()` - Status helpers

### Key Interfaces

- `VMixConfig` - Connection configuration (apiUrl, timeout, optional staticState for testing)
- `VMixState` - Full vMix state including inputs, overlays, recording/streaming status
- `VMixInput` - Individual input properties (key, number, type, title, state, etc.)
- `FunctionOptions` - Parameters for `executeFunction()` (input, value, selectedName, selectedIndex, duration)
- Type guards `isVMixStreamingNode()` and `isVMixRecordingNode()` handle polymorphic streaming/recording nodes

### Error Handling

Custom errors provide context for debugging:
- `VMixConnectionError` - Failed to connect (includes URL and cause)
- `VMixTimeoutError` - Request timed out (includes URL and timeout duration)
- `VMixApiError` - Non-OK HTTP response (includes URL, status, statusText)

### Testing Pattern

Tests use `staticState` config option or mock `fetch` to provide XML fixtures without requiring a live vMix instance.
