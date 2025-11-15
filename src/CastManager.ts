import {
  CastManagerConfig,
  CastState,
  SessionState,
  CastStateChangeListener,
  SessionStateChangeListener,
  MessageReceivedListener,
  CastEventType,
  CastStateChangeEvent,
  SessionStateChangeEvent,
  MessageReceivedEvent,
} from "./types";

declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    cast: any;
  }
}

/**
 * Simple event emitter for Cast events
 */
class EventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

/**
 * CastManager - A framework-agnostic Google Cast integration library
 *
 * @example
 * ```typescript
 * const castManager = new CastManager({
 *   receiverApplicationId: 'YOUR_APP_ID'
 * });
 *
 * await castManager.initialize();
 *
 * castManager.on('castStateChanged', (event) => {
 *   console.log('Cast state:', event.castState);
 * });
 * ```
 */
export class CastManager extends EventEmitter {
  private static instance: CastManager | null = null;
  private context: any = null;
  private session: any = null;
  private initialized = false;
  private config: Required<CastManagerConfig>;

  /**
   * Creates a new CastManager instance
   * @param config - Configuration options for the Cast Manager
   */
  constructor(config: CastManagerConfig) {
    super();
    this.config = {
      receiverApplicationId: config.receiverApplicationId,
      autoInitialize: config.autoInitialize ?? false,
      namespace: config.namespace ?? "urn:x-cast:com.custom",
    };

    if (this.config.autoInitialize) {
      this.initialize().catch((error) => {
        console.error("Failed to auto-initialize CastManager:", error);
      });
    }
  }

  /**
   * Get or create a singleton instance (optional pattern)
   * @param config - Configuration options (only used on first call)
   */
  static getInstance(config?: CastManagerConfig): CastManager {
    if (!CastManager.instance) {
      if (!config) {
        throw new Error("CastManager config required for first initialization");
      }
      CastManager.instance = new CastManager(config);
    }
    return CastManager.instance;
  }

  /**
   * Load the Google Cast Framework SDK
   */
  private async loadCastFramework(): Promise<void> {
    if (window.cast?.framework) return;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Cast SDK"));
      document.head.appendChild(script);
    });

    await new Promise<void>((resolve) => {
      window.__onGCastApiAvailable = (isAvailable: boolean) => {
        if (isAvailable) resolve();
      };
    });

    await this.waitForCastFramework();
  }

  /**
   * Wait for the Cast Framework to be available
   */
  private async waitForCastFramework(): Promise<void> {
    let attempts = 0;
    while (!window.cast?.framework && attempts < 20) {
      await new Promise((r) => setTimeout(r, 100));
      attempts++;
    }
    if (!window.cast?.framework) {
      throw new Error("Cast framework failed to initialize.");
    }
  }

  /**
   * Initialize the Cast Manager
   * Must be called before using other methods
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.loadCastFramework();

    this.context = window.cast.framework.CastContext.getInstance();
    this.context.setOptions({
      receiverApplicationId: this.config.receiverApplicationId,
      autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    });

    this.session = this.context.getCurrentSession();

    // Emit initial cast state
    const initialState = this.context.getCastState();
    this.emit(CastEventType.CAST_STATE_CHANGED, {
      castState: initialState as CastState,
    } as CastStateChangeEvent);

    // Listen for cast state changes
    this.context.addEventListener(
      window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
      (event: any) => {
        this.emit(CastEventType.CAST_STATE_CHANGED, {
          castState: event.castState as CastState,
        } as CastStateChangeEvent);
      }
    );

    // Listen for session state changes
    this.context.addEventListener(
      window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      (event: any) => {
        const sessionState = event.sessionState as SessionState;

        if (
          sessionState === SessionState.SESSION_STARTED ||
          sessionState === SessionState.SESSION_RESUMED
        ) {
          this.session = this.context.getCurrentSession();
          this.setupMessageListener();
        } else if (sessionState === SessionState.SESSION_ENDED) {
          this.session = null;
        }

        this.emit(CastEventType.SESSION_STATE_CHANGED, {
          sessionState,
          session: this.session,
        } as SessionStateChangeEvent);
      }
    );

    // Setup message listener if already connected
    if (this.session) {
      this.setupMessageListener();
    }

    this.initialized = true;
  }

  /**
   * Setup listener for custom messages from the receiver
   */
  private setupMessageListener(): void {
    if (!this.session) return;

    try {
      this.session.addMessageListener(
        this.config.namespace,
        (namespace: string, message: string) => {
          try {
            const parsedMessage =
              typeof message === "string" ? JSON.parse(message) : message;
            this.emit(CastEventType.MESSAGE_RECEIVED, {
              namespace,
              message: parsedMessage,
            } as MessageReceivedEvent);
          } catch (error) {
            console.error("Failed to parse receiver message:", error);
          }
        }
      );
    } catch (error) {
      console.error("Failed to add message listener:", error);
    }
  }

  /**
   * Send a message to the receiver application
   * @param message - The message object to send
   */
  async sendMessage(message: any): Promise<void> {
    if (!this.session) {
      this.session = this.context?.getCurrentSession();
    }

    if (!this.session) {
      throw new Error("No Cast session available");
    }

    try {
      await this.session.sendMessage(this.config.namespace, message);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Request a Cast session (show device picker)
   */
  async requestSession(): Promise<void> {
    if (!this.initialized) {
      throw new Error("CastManager not initialized. Call initialize() first.");
    }

    try {
      await this.context.requestSession();
    } catch (error) {
      console.error("Failed to request session:", error);
      throw error;
    }
  }

  /**
   * End the current Cast session
   */
  async endSession(): Promise<void> {
    if (!this.session) {
      throw new Error("No active Cast session");
    }

    try {
      await this.context.endCurrentSession(true);
    } catch (error) {
      console.error("Failed to end session:", error);
      throw error;
    }
  }

  /**
   * Check if currently connected to a Cast device
   */
  get isConnected(): boolean {
    return !!this.session;
  }

  /**
   * Get the current Cast state
   */
  get castState(): CastState | null {
    if (!this.context) return null;
    return this.context.getCastState() as CastState;
  }

  /**
   * Get the current session
   */
  get currentSession(): any {
    return this.session;
  }

  /**
   * Check if the Cast Manager is initialized
   */
  get isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Add event listener (typed convenience methods)
   */
  onCastStateChanged(listener: CastStateChangeListener): void {
    this.on(CastEventType.CAST_STATE_CHANGED, listener);
  }

  onSessionStateChanged(listener: SessionStateChangeListener): void {
    this.on(CastEventType.SESSION_STATE_CHANGED, listener);
  }

  onMessageReceived(listener: MessageReceivedListener): void {
    this.on(CastEventType.MESSAGE_RECEIVED, listener);
  }

  /**
   * Remove event listener (typed convenience methods)
   */
  offCastStateChanged(listener: CastStateChangeListener): void {
    this.off(CastEventType.CAST_STATE_CHANGED, listener);
  }

  offSessionStateChanged(listener: SessionStateChangeListener): void {
    this.off(CastEventType.SESSION_STATE_CHANGED, listener);
  }

  offMessageReceived(listener: MessageReceivedListener): void {
    this.off(CastEventType.MESSAGE_RECEIVED, listener);
  }

  /**
   * Cleanup and reset the Cast Manager
   */
  destroy(): void {
    this.removeAllListeners();
    this.session = null;
    this.context = null;
    this.initialized = false;
    if (CastManager.instance === this) {
      CastManager.instance = null;
    }
  }
}
