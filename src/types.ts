/**
 * Cast state as defined by Google Cast SDK
 */
export enum CastState {
  NO_DEVICES_AVAILABLE = "NO_DEVICES_AVAILABLE",
  NOT_CONNECTED = "NOT_CONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
}

/**
 * Session state as defined by Google Cast SDK
 */
export enum SessionState {
  NO_SESSION = "NO_SESSION",
  SESSION_STARTING = "SESSION_STARTING",
  SESSION_STARTED = "SESSION_STARTED",
  SESSION_START_FAILED = "SESSION_START_FAILED",
  SESSION_ENDING = "SESSION_ENDING",
  SESSION_ENDED = "SESSION_ENDED",
  SESSION_RESUMED = "SESSION_RESUMED",
}

/**
 * Cast manager configuration options
 */
export interface CastManagerConfig {
  /** The receiver application ID from Google Cast Console */
  receiverApplicationId: string;
  /** Whether to automatically initialize on construction (default: false) */
  autoInitialize?: boolean;
  /** Custom namespace for messages (default: 'urn:x-cast:com.custom') */
  namespace?: string;
}

/**
 * Cast state change event data
 */
export interface CastStateChangeEvent {
  castState: CastState;
}

/**
 * Session state change event data
 */
export interface SessionStateChangeEvent {
  sessionState: SessionState;
  session: any | null;
}

/**
 * Message received event data
 */
export interface MessageReceivedEvent {
  namespace: string;
  message: any;
}

/**
 * Event listener callback types
 */
export type CastStateChangeListener = (event: CastStateChangeEvent) => void;
export type SessionStateChangeListener = (
  event: SessionStateChangeEvent
) => void;
export type MessageReceivedListener = (event: MessageReceivedEvent) => void;

/**
 * Event types supported by the Cast Manager
 */
export enum CastEventType {
  CAST_STATE_CHANGED = "castStateChanged",
  SESSION_STATE_CHANGED = "sessionStateChanged",
  MESSAGE_RECEIVED = "messageReceived",
}
