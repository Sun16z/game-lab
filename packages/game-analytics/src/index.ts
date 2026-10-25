import type { GameId } from "@game-lab/game-core";

export type GameEventName =
  | "game_page_view" | "game_loaded" | "game_start" | "game_end"
  | "retry_click" | "level_start" | "level_complete" | "game_error"
  | "ad_opportunity" | "ad_result";

export interface GameEvent {
  eventId: string;
  eventName: GameEventName;
  gameId: GameId;
  runId?: string;
  sessionId: string;
  timestamp: string;
  gameVersion: string;
  properties: Record<string, string | number | boolean | null>;
}

export interface EventSink {
  emit(event: GameEvent): void | Promise<void>;
}

export const noOpEventSink: EventSink = { emit: () => undefined };
