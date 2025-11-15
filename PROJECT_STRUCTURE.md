# Cast Manager Library - Project Structure

## 📁 Directory Structure

```
cast-manager-lib/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── types.ts                    # TypeScript type definitions
│   ├── CastManager.ts              # Core framework-agnostic class
│   ├── react/
│   │   ├── index.ts                # React exports
│   │   └── useCastManager.ts       # React hook
│   └── angular/
│       ├── index.ts                # Angular exports
│       └── cast.service.ts         # Angular service
├── examples/
│   └── README.md                   # Usage examples
├── package.json                    # NPM package config
├── tsconfig.json                   # TypeScript config
├── tsup.config.ts                  # Build config
├── README.md                       # Main documentation
├── QUICKSTART.md                   # Quick start guide
├── LICENSE                         # MIT license
└── .gitignore                      # Git ignore file
```

## 🚀 Key Features

### 1. **Core CastManager Class** (`src/CastManager.ts`)

- Framework-agnostic implementation
- Event emitter pattern for state management
- Promise-based async methods
- Full TypeScript support
- Singleton pattern support (optional)

### 2. **React Integration** (`src/react/useCastManager.ts`)

- Custom React hook: `useCastManager()`
- Automatic state management with React hooks
- Auto-initialization option
- Clean cleanup on unmount

### 3. **Angular Integration** (`src/angular/cast.service.ts`)

- Injectable service
- RxJS Observable streams for reactive programming
- APP_INITIALIZER integration
- Synchronous getters for imperative code

### 4. **TypeScript Types** (`src/types.ts`)

- Comprehensive type definitions
- Enums for Cast and Session states
- Event type interfaces
- Configuration interfaces

## 📦 Package Exports

The library provides multiple entry points:

```typescript
// Core library
import {
  CastManager,
  CastState,
  SessionState,
} from "@unitedfutsal/cast-manager";

// React integration
import { useCastManager } from "@unitedfutsal/cast-manager/react";

// Angular integration
import { CastService } from "@unitedfutsal/cast-manager/angular";
```

## 🔧 Build System

- **TypeScript Compiler**: Type checking and declaration files
- **tsup**: Fast bundler for ESM and CommonJS outputs
- **Peer Dependencies**: React and Angular are optional

Build outputs:

- `dist/index.js` - CommonJS format
- `dist/index.mjs` - ES Module format
- `dist/index.d.ts` - TypeScript declarations
- `dist/react/*` - React integration
- `dist/angular/*` - Angular integration

## 📝 Usage Patterns

### Vanilla JS/TS Pattern

```typescript
const manager = new CastManager({ receiverApplicationId: "XXX" });
await manager.initialize();
manager.onCastStateChanged((event) => {
  /* ... */
});
await manager.requestSession();
```

### React Pattern

```tsx
const { isConnected, requestSession } = useCastManager({
  receiverApplicationId: "XXX",
});
```

### Angular Pattern

```typescript
constructor(private castService: CastService) {
  this.castService.isConnected$.subscribe(isConnected => { /* ... */ });
}
```

## 🎯 Design Decisions

1. **Event-Driven Architecture**: Uses a simple event emitter to avoid framework dependencies
2. **Optional Peer Dependencies**: React and Angular are peer dependencies, making the core lightweight
3. **TypeScript First**: Full type safety and IntelliSense support
4. **Tree-Shakeable**: ESM builds allow unused code to be eliminated
5. **Multiple Entry Points**: Separate exports for different frameworks
6. **Promise-Based**: Modern async/await API

## 🔄 Migration from Svelte Version

Original code:

```typescript
// Svelte-specific state
export const castState = $state({ connected: false });
```

New framework-agnostic code:

```typescript
// Event emitter pattern
manager.onCastStateChanged((event) => {
  // Handle state change in any framework
});
```

## 📚 Next Steps

1. Install dependencies: `npm install`
2. Build the library: `npm run build`
3. Update package name in `package.json`
4. Test in your projects using `npm link`
5. Publish to NPM: `npm publish`

## 🤝 Contributing

The library is designed to be extensible. To add support for another framework:

1. Create a new directory in `src/` (e.g., `src/vue/`)
2. Import `CastManager` and wrap it with framework-specific patterns
3. Add export in `tsup.config.ts`
4. Add export path in `package.json`
5. Update documentation

## 📄 License

MIT - See LICENSE file for details
