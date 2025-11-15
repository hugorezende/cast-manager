import { useState, useEffect, useCallback, useRef } from "react";
import { CastManager } from "../CastManager";
import type {
  CastManagerConfig,
  CastState,
  SessionState,
  CastStateChangeEvent,
  SessionStateChangeEvent,
  MessageReceivedEvent,
} from "../types";

export interface UseCastManagerOptions extends CastManagerConfig {
  /** Whether to auto-initialize on mount (default: true) */
  autoInitialize?: boolean;
}

export interface UseCastManagerReturn {
  /** Current cast state */
  castState: CastState | null;
  /** Current session state */
  sessionState: SessionState | null;
  /** Whether connected to a Cast device */
  isConnected: boolean;
  /** Whether the Cast Manager is initialized */
  isInitialized: boolean;
  /** Last received message from receiver */
  lastMessage: any | null;
  /** Initialize the Cast Manager */
  initialize: () => Promise<void>;
  /** Send a message to the receiver */
  sendMessage: (message: any) => Promise<void>;
  /** Request a Cast session (show device picker) */
  requestSession: () => Promise<void>;
  /** End the current Cast session */
  endSession: () => Promise<void>;
  /** The underlying CastManager instance */
  castManager: CastManager | null;
}

/**
 * React hook for Google Cast integration
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     castState,
 *     isConnected,
 *     requestSession,
 *     sendMessage
 *   } = useCastManager({
 *     receiverApplicationId: 'YOUR_APP_ID'
 *   });
 *
 *   return (
 *     <div>
 *       {!isConnected && (
 *         <button onClick={requestSession}>Cast</button>
 *       )}
 *       {isConnected && (
 *         <button onClick={() => sendMessage({ action: 'play' })}>
 *           Play
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCastManager(
  options: UseCastManagerOptions
): UseCastManagerReturn {
  const castManagerRef = useRef<CastManager | null>(null);
  const [castState, setCastState] = useState<CastState | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);

  // Initialize CastManager once
  useEffect(() => {
    if (!castManagerRef.current) {
      castManagerRef.current = new CastManager({
        receiverApplicationId: options.receiverApplicationId,
        namespace: options.namespace,
        autoInitialize: false, // We'll manually initialize
      });
    }

    const manager = castManagerRef.current;

    // Set up event listeners
    const handleCastStateChanged = (event: CastStateChangeEvent) => {
      setCastState(event.castState);
    };

    const handleSessionStateChanged = (event: SessionStateChangeEvent) => {
      setSessionState(event.sessionState);
      setIsConnected(!!event.session);
    };

    const handleMessageReceived = (event: MessageReceivedEvent) => {
      setLastMessage(event.message);
    };

    manager.onCastStateChanged(handleCastStateChanged);
    manager.onSessionStateChanged(handleSessionStateChanged);
    manager.onMessageReceived(handleMessageReceived);

    // Auto-initialize if requested
    const autoInit = options.autoInitialize ?? true;
    if (autoInit && !manager.isInitialized) {
      manager
        .initialize()
        .then(() => {
          setIsInitialized(true);
          setCastState(manager.castState);
          setIsConnected(manager.isConnected);
        })
        .catch((error) => {
          console.error("Failed to initialize CastManager:", error);
        });
    }

    // Cleanup
    return () => {
      manager.offCastStateChanged(handleCastStateChanged);
      manager.offSessionStateChanged(handleSessionStateChanged);
      manager.offMessageReceived(handleMessageReceived);
    };
  }, [
    options.receiverApplicationId,
    options.namespace,
    options.autoInitialize,
  ]);

  const initialize = useCallback(async () => {
    if (!castManagerRef.current) return;
    await castManagerRef.current.initialize();
    setIsInitialized(true);
    setCastState(castManagerRef.current.castState);
    setIsConnected(castManagerRef.current.isConnected);
  }, []);

  const sendMessage = useCallback(async (message: any) => {
    if (!castManagerRef.current) {
      throw new Error("CastManager not initialized");
    }
    await castManagerRef.current.sendMessage(message);
  }, []);

  const requestSession = useCallback(async () => {
    if (!castManagerRef.current) {
      throw new Error("CastManager not initialized");
    }
    await castManagerRef.current.requestSession();
  }, []);

  const endSession = useCallback(async () => {
    if (!castManagerRef.current) {
      throw new Error("CastManager not initialized");
    }
    await castManagerRef.current.endSession();
  }, []);

  return {
    castState,
    sessionState,
    isConnected,
    isInitialized,
    lastMessage,
    initialize,
    sendMessage,
    requestSession,
    endSession,
    castManager: castManagerRef.current,
  };
}
