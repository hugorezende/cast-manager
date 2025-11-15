# Cast Manager

A framework-agnostic Google Cast (Chromecast) integration library for JavaScript/TypeScript applications. Works with vanilla JS, React, Angular, Vue, Svelte, and any other JavaScript framework.

## Features

- **Framework Agnostic** - Works with any JavaScript framework or vanilla JS
- **React Integration** - Ready-to-use React hook
- **Angular Integration** - Injectable Angular service with RxJS observables
- **TypeScript First** - Fully typed with comprehensive type definitions
- **Event-Driven** - Simple event emitter pattern for state management

## Installation

```bash
npm install hugorezende/cast-manager
```

## Usage

### Vanilla JavaScript/TypeScript

```typescript
import { CastManager, CastState } from "hugorezende/cast-manager";

// Create and initialize the Cast Manager
const castManager = new CastManager({
  receiverApplicationId: "YOUR_RECEIVER_APP_ID", // From Google Cast Console
  namespace: "urn:x-cast:com.yourapp", // Optional custom namespace
});

await castManager.initialize();

// Listen for cast state changes
castManager.onCastStateChanged((event) => {
  console.log("Cast state:", event.castState);

  if (event.castState === CastState.CONNECTED) {
    console.log("Connected to Cast device!");
  }
});

// Listen for session state changes
castManager.onSessionStateChanged((event) => {
  console.log("Session state:", event.sessionState);
  console.log("Session:", event.session);
});

// Listen for messages from the receiver
castManager.onMessageReceived((event) => {
  console.log("Received message:", event.message);
});

// Request a Cast session (shows device picker)
await castManager.requestSession();

// Send messages to the receiver
await castManager.sendMessage({
  action: "play",
  videoId: "12345",
});

// End the session
await castManager.endSession();
```

### React

```tsx
import { useCastManager } from "hugorezende/cast-manager/react";

function CastButton() {
  const {
    castState,
    isConnected,
    isInitialized,
    lastMessage,
    requestSession,
    sendMessage,
    endSession,
  } = useCastManager({
    receiverApplicationId: "YOUR_RECEIVER_APP_ID",
  });

  if (!isInitialized) {
    return <div>Loading Cast SDK...</div>;
  }

  return (
    <div>
      {!isConnected ? (
        <button onClick={requestSession}>Cast to Device</button>
      ) : (
        <>
          <button onClick={() => sendMessage({ action: "play" })}>Play</button>
          <button onClick={() => sendMessage({ action: "pause" })}>
            Pause
          </button>
          <button onClick={endSession}>Disconnect</button>
        </>
      )}

      {lastMessage && <div>Last message: {JSON.stringify(lastMessage)}</div>}
    </div>
  );
}
```

### Angular

First, initialize the service in your app initialization:

```typescript
// app.config.ts or app.module.ts
import { APP_INITIALIZER } from "@angular/core";
import { CastService } from "hugorezende/cast-manager/angular";

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

Then use it in your components:

```typescript
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CastService } from "hugorezende/cast-manager/angular";

@Component({
  selector: "app-cast-button",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <button
        *ngIf="!(castService.isConnected$ | async)"
        (click)="requestSession()"
      >
        Cast to Device
      </button>

      <div *ngIf="castService.isConnected$ | async">
        <button (click)="sendPlay()">Play</button>
        <button (click)="sendPause()">Pause</button>
        <button (click)="endSession()">Disconnect</button>
      </div>

      <div *ngIf="castService.lastMessage$ | async as message">
        Last message: {{ message | json }}
      </div>
    </div>
  `,
})
export class CastButtonComponent {
  constructor(public castService: CastService) {}

  requestSession() {
    this.castService.requestSession();
  }

  sendPlay() {
    this.castService.sendMessage({ action: "play" });
  }

  sendPause() {
    this.castService.sendMessage({ action: "pause" });
  }

  endSession() {
    this.castService.endSession();
  }
}
```

## API Reference

### CastManager

#### Constructor Options

```typescript
interface CastManagerConfig {
  receiverApplicationId: string; // Required: Your Cast receiver app ID
  autoInitialize?: boolean; // Optional: Auto-initialize on creation
  namespace?: string; // Optional: Custom message namespace
}
```

#### Methods

- `initialize()`: Promise<void> - Initialize the Cast SDK
- `sendMessage(message: any)`: Promise<void> - Send a message to the receiver
- `requestSession()`: Promise<void> - Show the Cast device picker
- `endSession()`: Promise<void> - End the current Cast session
- `onCastStateChanged(listener)` - Listen for cast state changes
- `onSessionStateChanged(listener)` - Listen for session state changes
- `onMessageReceived(listener)` - Listen for receiver messages
- `offCastStateChanged(listener)` - Remove cast state listener
- `offSessionStateChanged(listener)` - Remove session state listener
- `offMessageReceived(listener)` - Remove message listener
- `destroy()` - Cleanup and reset the manager

#### Properties

- `isConnected`: boolean - Whether connected to a Cast device
- `castState`: CastState | null - Current cast state
- `currentSession`: any - Current Cast session object
- `isInitialized`: boolean - Whether the manager is initialized

### React Hook: useCastManager

Returns an object with:

```typescript
interface UseCastManagerReturn {
  castState: CastState | null;
  sessionState: SessionState | null;
  isConnected: boolean;
  isInitialized: boolean;
  lastMessage: any | null;
  initialize: () => Promise<void>;
  sendMessage: (message: any) => Promise<void>;
  requestSession: () => Promise<void>;
  endSession: () => Promise<void>;
  castManager: CastManager | null;
}
```

### Angular Service: CastService

Observable properties:

- `castState$`: Observable<CastState | null>
- `sessionState$`: Observable<SessionState | null>
- `isConnected$`: Observable<boolean>
- `isInitialized$`: Observable<boolean>
- `lastMessage$`: Observable<any | null>

Synchronous properties:

- `castState`, `sessionState`, `isConnected`, `isInitialized`, `lastMessage`

Methods: Same as CastManager

## Cast States

```typescript
enum CastState {
  NO_DEVICES_AVAILABLE = "NO_DEVICES_AVAILABLE",
  NOT_CONNECTED = "NOT_CONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
}
```

## Session States

```typescript
enum SessionState {
  NO_SESSION = "NO_SESSION",
  SESSION_STARTING = "SESSION_STARTING",
  SESSION_STARTED = "SESSION_STARTED",
  SESSION_START_FAILED = "SESSION_START_FAILED",
  SESSION_ENDING = "SESSION_ENDING",
  SESSION_ENDED = "SESSION_ENDED",
  SESSION_RESUMED = "SESSION_RESUMED",
}
```

## Getting a Receiver Application ID

1. Go to [Google Cast SDK Developer Console](https://cast.google.com/publish/)
2. Register a new application
3. Choose "Custom Receiver" and provide your receiver app URL
4. Copy the Application ID (format: XXXXXXXX)

## Building from Source

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
