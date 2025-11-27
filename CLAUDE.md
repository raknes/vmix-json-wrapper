# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install        # Install dependencies
pnpm run build      # Compile TypeScript to dist/
pnpm run test       # Run Jest tests
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

This is a simple npm package that wraps the vMix HTTP API, converting XML responses to typed JSON objects.

**Core module:** `src/vmix.ts` contains the `VMix` class and all TypeScript interfaces.

**How it works:**
1. `VMix` class connects to vMix's HTTP API endpoint (default: `http://localhost:8088/api/`)
2. `getCurrentState()` fetches XML from vMix and parses it using `fast-xml-parser` with custom value processors for boolean conversion and HTML entity decoding
3. The parsed state is returned as typed `VMixState` interface
4. `executeFunction()` sends commands to vMix by constructing query string URLs

**Key interfaces:**
- `VMixConfig` - Connection configuration (apiUrl, timeout, optional staticState for testing)
- `VMixState` - Full vMix state including inputs, overlays, recording/streaming status
- `VMixInput` - Individual input properties (key, number, type, title, state, etc.)
- Type guards `isVMixStreamingNode()` and `isVMixRecordingNode()` handle polymorphic streaming/recording nodes

**Testing pattern:** Tests use `staticState` config option or mock axios to provide XML fixtures without requiring a live vMix instance.
