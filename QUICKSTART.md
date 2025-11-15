# Quick Start Guide

## Installation and Setup

1. **Install dependencies**

   ```bash
   cd cast-manager-lib
   npm install
   ```

2. **Build the library**

   ```bash
   npm run build
   ```

3. **Test locally before publishing**

   In your test project:

   ```bash
   npm link /path/to/cast-manager-lib
   ```

4. **Publish to NPM**

   First, update the package name in `package.json`:

   ```json
   "name": "@your-username/cast-manager"
   ```

   Then publish:

   ```bash
   npm login
   npm publish --access public
   ```

## Usage in Your Projects

### React Project

```bash
npm install @your-username/cast-manager
```

```tsx
import { useCastManager } from "@your-username/cast-manager/react";

function App() {
  const { isConnected, requestSession, sendMessage } = useCastManager({
    receiverApplicationId: "YOUR_RECEIVER_APP_ID",
  });

  return (
    <div>
      {!isConnected && (
        <button onClick={requestSession}>Connect to Cast</button>
      )}
      {isConnected && (
        <button onClick={() => sendMessage({ action: "play" })}>Play</button>
      )}
    </div>
  );
}
```

### Angular Project

1. Install the package:

```bash
npm install @your-username/cast-manager
```

2. Initialize in your app config:

```typescript
// app.config.ts
import { APP_INITIALIZER } from "@angular/core";
import { CastService } from "@your-username/cast-manager/angular";

export function initializeCast(castService: CastService) {
  return () =>
    castService.initialize({
      receiverApplicationId: "YOUR_RECEIVER_APP_ID",
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeCast,
      deps: [CastService],
      multi: true,
    },
  ],
};
```

3. Use in components:

```typescript
import { Component } from "@angular/core";
import { CastService } from "@your-username/cast-manager/angular";

@Component({
  selector: "app-root",
  template: `
    <button
      *ngIf="!(castService.isConnected$ | async)"
      (click)="castService.requestSession()"
    >
      Connect to Cast
    </button>
  `,
})
export class AppComponent {
  constructor(public castService: CastService) {}
}
```

### Vanilla JavaScript/TypeScript

```typescript
import { CastManager } from "@your-username/cast-manager";

const castManager = new CastManager({
  receiverApplicationId: "YOUR_RECEIVER_APP_ID",
});

await castManager.initialize();

castManager.onCastStateChanged((event) => {
  console.log("Cast state:", event.castState);
});

// Show device picker
await castManager.requestSession();

// Send message
await castManager.sendMessage({ action: "play" });
```

## Getting Your Receiver Application ID

1. Go to https://cast.google.com/publish/
2. Add a new application
3. Choose "Custom Receiver"
4. Enter your receiver application URL
5. Copy the Application ID (e.g., "ABCD1234")

## Development Workflow

```bash
# Watch mode for development
npm run dev

# Type check
npm run type-check

# Build for production
npm run build
```

## Next Steps

- Read the full [README.md](./README.md) for complete API documentation
- Check the [examples](./examples/) directory for more usage examples
- Build your Cast receiver application
- Implement custom message handling
