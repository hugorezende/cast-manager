import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CastManager } from "../CastManager";
import type {
  CastManagerConfig,
  CastState,
  SessionState,
  CastStateChangeEvent,
  SessionStateChangeEvent,
  MessageReceivedEvent,
} from "../types";

/**
 * Angular service for Google Cast integration
 *
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-cast-button',
 *   template: `
 *     <button *ngIf="!(castService.isConnected$ | async)"
 *             (click)="cast()">
 *       Cast
 *     </button>
 *     <button *ngIf="castService.isConnected$ | async"
 *             (click)="sendPlay()">
 *       Play
 *     </button>
 *   `
 * })
 * export class CastButtonComponent {
 *   constructor(public castService: CastService) {}
 *
 *   cast() {
 *     this.castService.requestSession();
 *   }
 *
 *   sendPlay() {
 *     this.castService.sendMessage({ action: 'play' });
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: "root",
})
export class CastService implements OnDestroy {
  private castManager: CastManager | null = null;
  private initialized = false;

  // Observables for reactive state management
  private castStateSubject = new BehaviorSubject<CastState | null>(null);
  private sessionStateSubject = new BehaviorSubject<SessionState | null>(null);
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  private lastMessageSubject = new BehaviorSubject<any | null>(null);

  public castState$: Observable<CastState | null> =
    this.castStateSubject.asObservable();
  public sessionState$: Observable<SessionState | null> =
    this.sessionStateSubject.asObservable();
  public isConnected$: Observable<boolean> =
    this.isConnectedSubject.asObservable();
  public isInitialized$: Observable<boolean> =
    this.isInitializedSubject.asObservable();
  public lastMessage$: Observable<any | null> =
    this.lastMessageSubject.asObservable();

  /**
   * Initialize the Cast Service
   * @param config - Cast Manager configuration
   */
  async initialize(config: CastManagerConfig): Promise<void> {
    if (this.initialized) {
      console.warn("CastService already initialized");
      return;
    }

    this.castManager = new CastManager({
      receiverApplicationId: config.receiverApplicationId,
      namespace: config.namespace,
      autoInitialize: false,
    });

    // Set up event listeners
    this.castManager.onCastStateChanged((event: CastStateChangeEvent) => {
      this.castStateSubject.next(event.castState);
    });

    this.castManager.onSessionStateChanged((event: SessionStateChangeEvent) => {
      this.sessionStateSubject.next(event.sessionState);
      this.isConnectedSubject.next(!!event.session);
    });

    this.castManager.onMessageReceived((event: MessageReceivedEvent) => {
      this.lastMessageSubject.next(event.message);
    });

    await this.castManager.initialize();
    this.initialized = true;
    this.isInitializedSubject.next(true);

    // Update initial state
    if (this.castManager.castState) {
      this.castStateSubject.next(this.castManager.castState);
    }
    this.isConnectedSubject.next(this.castManager.isConnected);
  }

  /**
   * Send a message to the receiver application
   * @param message - The message object to send
   */
  async sendMessage(message: any): Promise<void> {
    if (!this.castManager) {
      throw new Error("CastService not initialized. Call initialize() first.");
    }
    await this.castManager.sendMessage(message);
  }

  /**
   * Request a Cast session (show device picker)
   */
  async requestSession(): Promise<void> {
    if (!this.castManager) {
      throw new Error("CastService not initialized. Call initialize() first.");
    }
    await this.castManager.requestSession();
  }

  /**
   * End the current Cast session
   */
  async endSession(): Promise<void> {
    if (!this.castManager) {
      throw new Error("CastService not initialized. Call initialize() first.");
    }
    await this.castManager.endSession();
  }

  /**
   * Get the current cast state (synchronous)
   */
  get castState(): CastState | null {
    return this.castStateSubject.value;
  }

  /**
   * Get the current session state (synchronous)
   */
  get sessionState(): SessionState | null {
    return this.sessionStateSubject.value;
  }

  /**
   * Check if currently connected (synchronous)
   */
  get isConnected(): boolean {
    return this.isConnectedSubject.value;
  }

  /**
   * Check if initialized (synchronous)
   */
  get isInitialized(): boolean {
    return this.isInitializedSubject.value;
  }

  /**
   * Get the last received message (synchronous)
   */
  get lastMessage(): any | null {
    return this.lastMessageSubject.value;
  }

  /**
   * Get the underlying CastManager instance
   */
  getCastManager(): CastManager | null {
    return this.castManager;
  }

  ngOnDestroy(): void {
    if (this.castManager) {
      this.castManager.destroy();
    }
    this.castStateSubject.complete();
    this.sessionStateSubject.complete();
    this.isConnectedSubject.complete();
    this.isInitializedSubject.complete();
    this.lastMessageSubject.complete();
  }
}
